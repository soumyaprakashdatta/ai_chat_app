import OpenAI from "openai";

let openaiClient = null;

// init openai client
function initOpenAIClient() {
    openaiClient = new OpenAI({
        apiKey: process.env.API_KEY,
    });
}

// get chat completions from openai
async function getChatCompletion(chatHistory) {
    if (openaiClient == null)
        throw new Error("openai client is not initialized");

    const chatCompletion = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: chatHistory,
    });

    console.log(JSON.stringify(chatCompletion));
    return chatCompletion.choices[0].message.content;
}

export { initOpenAIClient, getChatCompletion };
