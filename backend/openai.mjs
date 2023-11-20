import OpenAI from 'openai'

let openaiClient = null

const chatHistory = []
const role = 'user'

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

async function getChatCompletionWithContext(prompt, context) {}

async function getEmbeddings(chunks) {
  if (openaiClient == null) throw new Error('openai client is not initialized')

  const embeddings = await openaiClient.embeddings.create({
    model: 'text-embedding-ada-002',
    input: chunks,
    encoding_format: 'float',
  })

  return embeddings
}

export { initOpenAIClient, getChatCompletion, getEmbeddings }
