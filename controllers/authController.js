import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import db from "../db.js";


const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";
let currentUser = null;

// Register
export const register = (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  User.create(name, email, hashedPassword, (err, result) => {
    if (err) return res.status(500).json({ message: "Error registering user", error: err });
    res.status(201).json({ message: "User registered successfully" });
  });
};

// Login
export const login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error", error: err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.user_id }, SECRET_KEY, { expiresIn: "1h" });
    currentUser = user;

    res.json({
      message: "Login successful",
      token,
      user: { id: user.user_id, name: user.name, email: user.email, bio: user.bio}
    });
  });
};

// Get Current User
export const getCurrentUser = (req, res) => {
  if (!currentUser) return res.status(401).json({ message: "No user logged in" });
  res.json(currentUser);
};

// Search Users
export const searchUsers = (req, res) => {
  const { query } = req.query;

  if (!query) return res.status(400).json({ message: "Search query is required" });

  User.search(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error searching users", error: err });
    if (results.length === 0) return res.status(404).json({ message: "No users found" });
    res.json(results);
  });
};

// Token
export const updateFcmToken = (req, res) => {
  const { userId, fcmToken } = req.body;

  if (!userId || !fcmToken) {
    return res.status(400).json({ message: "userId and fcmToken are required" });
  }

  const sql = "UPDATE users SET fcm_token = ? WHERE user_id = ?";
  db.query(sql, [fcmToken, userId], (err, result) => {
    if (err) {
      console.error("Error updating FCM token:", err);
      return res.status(500).json({ message: "Error updating FCM token", error: err });
    }

    return res.status(200).json({ message: "FCM token updated successfully" });
  });
};

// Update Bio
export const updateBio = (req, res) => {
  const { userId, bio } = req.body;

  if (!userId || bio === undefined) {
    return res.status(400).json({ message: "userId and bio required" });
  }

  db.query(
    "UPDATE users SET bio = ? WHERE user_id = ?",
    [bio, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(200).json({ message: "Bio updated!" });
    }
  );
};



