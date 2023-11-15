import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import cors from "cors";

app.use(cors());

import 'dotenv/config'

import { Server } from "socket.io";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.API_KEY
});

const io = new Server(server, {
    path: "/api/socket.io",
    cookie: false,
    cors: { credentials: true, origin: true },
  });
  
  const chatHistory = [];
  io.on("connection", (socket) => {
    socket.on("sendMessage", async (data) => {
      console.log(`received: ${JSON.stringify(data)}`)
      chatHistory.push({ role: "user", content: data.message });
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: chatHistory,
      });

      console.log(JSON.stringify(chatCompletion))
  
      socket.emit("receiveMessage", {
        message: `${chatCompletion.choices[0].message.content}`,
      });
      chatHistory.push(chatCompletion.choices[0].message.content);
    });
  
    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
  });
  
  server.listen(5000, () => {
    console.log("Server listening on port 5000");
  });