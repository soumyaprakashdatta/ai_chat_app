import fs from 'fs'
import path from 'path'
import cos_similarity from 'compute-cosine-similarity'
import xlsx from 'node-xlsx'

const __dirname = path.resolve()

const basePath = 'embeddings'
const DEFAULT_CONTEXT = 'OpenAI-GPT'
const contexts = {}

const minThreshold = 0.5

// supported modes are 'json' and 'xslx'
// depending on the mode either json or excel file will be created to store the embeddings on disk
const mode = 'xslx'

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
        let content = fs.readFileSync(path.join(__dirname, basePath, file))

        if (file.endsWith('.json')) {
          let parsed = JSON.parse(content)
          contexts[parsed.name] = parsed
        } else if (file.endsWith('.xlsx')) {
          let parsed = xlsx.parse(content)
          if (parsed.length != 2) {
            console.error(
              `error while loading context from file=${file}, err=invalid format`
            )
            return
          }
          let contextName
          let docEmbeddings = []
          let errors = []

          parsed.forEach((p) => {
            // load context name
            if (p.name == 'context_details') {
              try {
                contextName = p.data[0][0]
                files = JSON.parse(p.data[0][1])
              } catch (ex) {
                errors.push(ex)
              }
              if (contextName.trim().length == 0) {
                errors.push('empty context name')
                return
              }
            } else if (p.name == 'embeddings') {
              // load embeddings data
              if (p.data.length == 0) {
                errors.push('embeddings data missing')
                return
              }

              // load chunk and embeddings
              p.data.forEach((d) => {
                if (d.length != 2) {
                  errors.push(`embedding data format is incorrect`)
                  return
                }
                try {
                  docEmbeddings.push({
                    chunk: d[0],
                    embedding: JSON.parse(d[1]),
                  })
                } catch (ex) {
                  errors.push(ex)
                }
              })
            }
          })

          if (errors.length > 0) {
            console.error(
              `error while loading context from file=${file}, err=${JSON.stringify(
                errors
              )}`
            )
            return
          }

          contexts[contextName] = {
            name: contextName,
            embeddings: docEmbeddings,
          }
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

  if (mode == 'json') {
    fs.writeFileSync(`embeddings/${name}.json`, JSON.stringify(content))
  } else if (mode == 'xslx') {
    let embeddingPageData = [
      ...mergedEmbeddings.map((em) => [em.chunk, JSON.stringify(em.embedding)]),
    ]
    let contextDetailsPageData = [[name, JSON.stringify(files)]]
    var buffer = xlsx.build([
      { name: 'embeddings', data: embeddingPageData },
      { name: 'context_details', data: contextDetailsPageData },
    ])
    fs.writeFileSync(`embeddings/${name}.xlsx`, buffer)
  }

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
