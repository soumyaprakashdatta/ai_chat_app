import express from 'express'
import cors from 'cors'
import path from 'path'
import multer from 'multer'
import 'dotenv/config'
import * as openai from './openai.mjs'
import * as pdf from './pdf.mjs'
import * as embedding from './embedding.mjs'
import * as context from './context.mjs'

// load context from disk
context.loadContextsFromDisk()

// initialize open ai client
openai.initOpenAIClient()

// configure file upload
const upload = multer({ dest: 'uploads/' })

const port = 8000

const __dirname = path.resolve()
const staticPath = path.join(__dirname, 'dist')

// setup express server and serve ui
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(staticPath))

app.post('/upload_files', upload.array('files'), async (req, res) => {
  console.log(req.body)
  console.log(req.files)

  let { name, files } = req.body

  if (context.doesContextExist(name)) {
    res.statusCode = 400
    res.send('context with the same name already exists')
    return
  }

  let mergedChunks = []

  // read files
  let promises = req.files.map((file) => pdf.loadPdfPages(file.path))
  let pages = await Promise.all([...promises])

  // create chunks and merge them
  promises = pages.map((page) => embedding.getChunks(page))
  let chunks = await Promise.all([...promises])
  chunks.forEach((chunkPerFile) => mergedChunks.push(...chunkPerFile))

  // create embeddings
  let embeddings = await openai.getEmbeddings(mergedChunks)

  // persist embeddings on disk
  context.saveToDisk(name, files, mergedChunks, embeddings)

  res.json({ message: 'successfully uploaded files' })
})

app.post('/chat_completion', async (req, res) => {
  let prompt = req.body?.prompt
  let context = req.body?.context

  if (prompt == null) {
    res.statusCode = 400
    res.send('prompt must not be empty')
    return
  }

  if (prompt.message == null) {
    res.statusCode = 400
    res.send('prompt message must not be empty')
    return
  }

  try {
    const completion = await openai.getChatCompletionWithContext(
      prompt.message,
      context
    )
    // console.log(completion)

    res.statusCode = 200
    res.json({
      completion,
      context,
    })
  } catch (ex) {
    console.error(
      `error while fetching chat completions, prompt=${JSON.stringify(
        prompt
      )}, context=${JSON.stringify(context)} err=${ex}`
    )
    res.statusCode = 500
    res.send(ex)
  }
})

app.get('/available_contexts', async (req, res) => {
  res.statusCode = 200
  res.json({
    contexts: context.getAvailableContexts(),
  })
})

app.get('/embeddings', async (req, res) => {
  try {
    const embeddings = await openai.getEmbeddings()
    console.log(embeddings)

    res.statusCode = 200
    res.json(embeddings)
  } catch (ex) {
    console.error(`error while fetching embeddings, err=${ex}`)
    res.statusCode = 500
    res.send(ex)
  }
})

// start express server
app.listen(port, () => {
  console.log(`express server started on port ${port}`)
})
