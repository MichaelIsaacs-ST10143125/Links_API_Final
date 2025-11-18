import express from "express";
import { sendNotification } from "../controllers/notificationController.js";
import { getNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/send", sendNotification);
router.get("/:userId", getNotifications);

export default router;
