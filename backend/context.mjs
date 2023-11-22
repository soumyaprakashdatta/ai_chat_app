import fs from 'fs'
import path from 'path'
import cos_similarity from 'compute-cosine-similarity'

const __dirname = path.resolve()
const basePath = 'embeddings'
const DEFAULT_CONTEXT = 'OpenAI-GPT'
const contexts = {}

const minThreshold = 0.5

async function loadContextsFromDisk() {
  let dirPath = path.join(__dirname, basePath)

  !fs.existsSync(dirPath) && fs.mkdirSync(dirPath, { recursive: true })

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

async function getMostSimilarChunk(promptEmbeddings, context) {
  if (context == DEFAULT_CONTEXT) {
    throw new Error('unable to compute similarity using default context')
  }

  let maxSimilarityVal = 0
  let mostSimilarChunk = null

  let matched = contexts[context]
  if (!matched) throw new Error(`context=${context} is not known`)

  matched.embeddings.forEach((e) => {
    let s = cos_similarity(promptEmbeddings, e.embedding)
    if (s > maxSimilarityVal) {
      maxSimilarityVal = s
      mostSimilarChunk = e.chunk
    }
  })

  return mostSimilarChunk || 'not found'
}

// gets topk most similar chunks
async function getSimilarChunks(promptEmbeddings, context, topk) {
  if (context == DEFAULT_CONTEXT) {
    throw new Error('unable to compute similarity using default context')
  }

  let similarChunks = []

  let matched = contexts[context]
  if (!matched) throw new Error(`context=${context} is not known`)

  matched.embeddings.forEach((e) => {
    let s = cos_similarity(promptEmbeddings, e.embedding)
    if (s > minThreshold) {
      similarChunks.push({
        similarity: s,
        chunk: e.chunk,
      })
    }
  })

  similarChunks.sort(function (a, b) {
    return parseFloat(b.similarity) - parseFloat(a.similarity)
  })

  if (topk > similarChunks.length) {
    return similarChunks.map((chunk) => chunk.chunk)
  }

  return similarChunks.slice(0, topk).map((chunk) => chunk.chunk)
}

export {
  loadContextsFromDisk,
  saveToDisk,
  doesContextExist,
  getAvailableContexts,
  DEFAULT_CONTEXT,
  getMostSimilarChunk,
  getSimilarChunks,
}
