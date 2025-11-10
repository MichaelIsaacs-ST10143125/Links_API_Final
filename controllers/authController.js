import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

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
      user: { id: user.user_id, name: user.name, email: user.email }
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

