import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { Server } from "socket.io";
import "dotenv/config";

import * as openai from "./openai.mjs";

// initialize open ai client
openai.initOpenAIClient();

const port = 8000;
const socketPort = 8001;

const __dirname = path.resolve();
const staticPath = path.join(__dirname, "dist");

// setup express server and serve ui
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(staticPath));

app.get("/chat_completion", async (req, res) => {
    let prompt = req.body?.prompt;

    console.log(req.body);

    if (prompt == null) {
        res.statusCode = 400;
        res.send("prompt must not be empty");
        return;
    }

    if (prompt.message == null) {
        res.statusCode = 400;
        res.send("prompt message must not be empty");
        return;
    }

    try {
        const completion = await openai.getChatCompletion(prompt.message);
        console.log(completion);

        res.statusCode = 200;
        res.send(completion);
    } catch (ex) {
        console.error(`error while fetching chat completions, err=${ex}`);
        res.statusCode = 500;
        res.send(ex);
    }
});

app.get("/embeddings", async (req, res) => {
    try {
        const embeddings = await openai.getEmbeddings();
        console.log(embeddings);

        res.statusCode = 200;
        res.json(embeddings);
    } catch (ex) {
        console.error(`error while fetching embeddings, err=${ex}`);
        res.statusCode = 500;
        res.send(ex);
    }
});

// setup socket server to receive requests
const chatHistory = [];

const server = http.createServer(app);

const io = new Server(server, {
    path: "/api/socket.io",
    cookie: false,
    cors: { credentials: true, origin: true },
});

io.on("connection", (socket) => {
    socket.on("sendMessage", async (data) => {
        console.log(`received: ${JSON.stringify(data)}`);
        chatHistory.push({ role: "user", content: data.message });

        try {
            const completion = await openai.getChatCompletion(chatHistory);
            console.log(completion);

            socket.emit("receiveMessage", {
                message: completion,
            });
            chatHistory.push(completion);
        } catch (ex) {
            console.error(
                `error while fetching chat completions, err=${JSON.stringify(
                    ex
                )}`
            );

            socket.emit("receiveMessage", {
                message: `error while fetching completion from OpenAI, err=${ex}`,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    });
});

// start socket server
server.listen(socketPort, () => {
    console.log(`socket server listening on port ${socketPort}`);
});

// start express server
app.listen(port, () => {
    console.log(`express server started on port ${port}`);
});
