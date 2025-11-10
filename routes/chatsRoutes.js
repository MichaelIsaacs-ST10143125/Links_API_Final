import express from "express";
import {
  createChat,
  getUserChats,
  sendMessage,
  getChatMessages
} from "../controllers/chatsController.js";

const router = express.Router();

router.post("/create", createChat);
router.get("/user/:userId", getUserChats);
router.post("/sendMessage", sendMessage);
router.get("/messages/:chatId", getChatMessages);

export default router;

