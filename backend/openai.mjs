import OpenAI from 'openai'
import * as contextProvider from './context.mjs'

let openaiClient = null

const chatHistory = []
const role = 'user'

import { Document } from 'langchain/document'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

// init text splitter
const langchainTextSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
  separators: ['•', '\n', '.'],
})

// init openai client
function initOpenAIClient() {
  openaiClient = new OpenAI({})
}

// get chat completions from openai
async function getChatCompletion(prompt) {
  if (openaiClient == null) throw new Error('openai client is not initialized')

  chatHistory.push({ role, content: prompt })

  const chatCompletion = await openaiClient.chat.completions.create({
    model: 'gpt-3.5-turbo',
    // model: "text-davinci-003",
    messages: chatHistory,
  })

  console.log(JSON.stringify(chatCompletion))

  let completion = chatCompletion.choices[0].message.content

  chatHistory.push({ role, content: completion })

  return completion
}

// get completion based on context
// this will either use openai for completion
// or will use local embedding data
async function getChatCompletionWithContext(prompt, context) {
  if (!context) {
    console.log(
      `no context specified, getting completion from open ai, prompt=${JSON.stringify(
        prompt
      )}`
    )

    return getChatCompletion(prompt)
  } else if (context == contextProvider.DEFAULT_CONTEXT) {
    console.log(
      `default context specified, getting completion from open ai, prompt=${JSON.stringify(
        prompt
      )}`
    )

    return getChatCompletion(prompt)
  }

  let promptEmbeddings = await getEmbeddings([prompt])
  return contextProvider.getMostSimilarChunk(
    promptEmbeddings.data[0].embedding,
    context
  )
}

async function getEmbeddings(chunks) {
  if (openaiClient == null) throw new Error('openai client is not initialized')

  const embeddings = await openaiClient.embeddings.create({
    model: 'text-embedding-ada-002',
    input: chunks,
    encoding_format: 'float',
  })

  return embeddings
}

// get chunks for pages using langchain RecursiveCharacterTextSplitter
async function getChunksLangchain(pages) {
  let mergedChunks = []
  let promises = pages.map((page) =>
    langchainTextSplitter.splitDocuments([
      new Document({ pageContent: page.text }),
    ])
  )
  let chunks = await Promise.all([...promises])
  chunks.forEach((chunkPerFile) => mergedChunks.push(...chunkPerFile))

  return mergedChunks.map((chunk) => chunk.pageContent)
}

export {
  initOpenAIClient,
  getChatCompletion,
  getEmbeddings,
  getChatCompletionWithContext,
  getChunksLangchain,
}
