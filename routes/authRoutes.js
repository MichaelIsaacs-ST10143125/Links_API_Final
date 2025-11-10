import express from "express";
import { register, login, getCurrentUser, searchUsers } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/current", getCurrentUser);
router.get("/search", searchUsers);

export default router;
