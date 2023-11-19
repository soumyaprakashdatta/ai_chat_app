import OpenAI from "openai";

let openaiClient = null;

const chatHistory = [];
const role = "user";

// init openai client
function initOpenAIClient() {
    openaiClient = new OpenAI({
        apiKey: process.env.API_KEY,
    });
}

// get chat completions from openai
async function getChatCompletion(prompt) {
    if (openaiClient == null)
        throw new Error("openai client is not initialized");

    chatHistory.push({ role, content: prompt });

    const chatCompletion = await openaiClient.chat.completions.create({
        // model: "gpt-3.5-turbo",
        model: "gpt-3.5-turbo-16k",
        // model: "text-davinci-003",
        messages: chatHistory,
    });

    console.log(JSON.stringify(chatCompletion));

    let completion = chatCompletion.choices[0].message.content;

    chatHistory.push({ role, content: completion });

    return completion;
}

async function getEmbeddings() {}

export { initOpenAIClient, getChatCompletion, getEmbeddings };
