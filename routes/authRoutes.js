import express from "express";
import { register, login, getCurrentUser, searchUsers, updateFcmToken, updateBio } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/current", getCurrentUser);
router.get("/search", searchUsers);
router.post("/updateFcmToken", updateFcmToken);
router.post("/updateBio", updateBio);



export default router;
