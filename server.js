import dotenv from "dotenv"
dotenv.config()
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import chatsRoutes from "./routes/chatsRoutes.js"

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatsRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
