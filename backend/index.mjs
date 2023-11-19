import express from 'express'
import cors from 'cors'
import path from 'path'
import multer from 'multer'
import 'dotenv/config'
import * as openai from './openai.mjs'

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
  await new Promise((resolve) => {
    setTimeout(resolve, 5000)
  })
  res.json({ message: 'successfully uploaded files' })
})

app.post('/chat_completion', async (req, res) => {
  let prompt = req.body?.prompt

  console.log(req.body)

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
    const completion = await openai.getChatCompletion(prompt.message)
    console.log(completion)

    res.statusCode = 200
    res.send(completion)
  } catch (ex) {
    console.error(`error while fetching chat completions, err=${ex}`)
    res.statusCode = 500
    res.send(ex)
  }
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
