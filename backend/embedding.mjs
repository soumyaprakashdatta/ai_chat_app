import {
  OpenAITextEmbeddingModel,
  MemoryVectorIndex,
  splitTextChunks,
  splitAtToken,
  throttleMaxConcurrency,
} from 'modelfusion'

const vectorIndex = new MemoryVectorIndex()

const embeddingModel = new OpenAITextEmbeddingModel({
  model: 'text-embedding-ada-002',
  throttle: throttleMaxConcurrency({ maxConcurrentCalls: 5 }),
})

// todo: need to improve this
async function getChunks(pages) {
  const chunkTokens = await splitTextChunks(
    splitAtToken({
      maxTokensPerChunk: 80,
      tokenizer: embeddingModel.tokenizer,
    }),
    pages
  )

  return chunkTokens.map((chunk) => chunk.text)
}

export { getChunks }
