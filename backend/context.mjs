import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()
const basePath = 'embeddings'
const DEFAULT_CONTEXT = 'OpenAI-GPT'
const contexts = {}

async function loadContextsFromDisk() {
  let dirPath = path.join(__dirname, basePath)

  await new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err != null) {
        reject(err)
        return
      }

      files.forEach((file) => {
        if (file.endsWith('.json')) {
          let content = fs.readFileSync(path.join(__dirname, basePath, file))
          let parsed = JSON.parse(content)
          contexts[parsed.name] = parsed
        }
      })

      console.log(`loaded contexts: ${Object.keys(contexts)}`)

      resolve('successfully loaded contexts')
    })
  })
}

async function saveToDisk(name, files, chunks, embeddings) {
  let mergedEmbeddings = []

  embeddings.data.forEach((entry, idx) => {
    mergedEmbeddings.push({
      chunk: chunks[idx],
      embedding: entry.embedding,
    })
  })

  let content = {
    name,
    files,
    embeddings: mergedEmbeddings,
  }

  fs.writeFileSync(`embeddings/${name}.json`, JSON.stringify(content))

  contexts[name] = content
  console.log(`saved context=${name}`)
}

function doesContextExist(name) {
  if (!contexts[name]) return false
  return true
}

function getAvailableContexts() {
  return Object.keys(contexts)
}

export {
  loadContextsFromDisk,
  saveToDisk,
  doesContextExist,
  getAvailableContexts,
  DEFAULT_CONTEXT,
}
