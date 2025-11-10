import db from "../db.js";

const User = {
  create: (name, email, password, callback) => {
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, password], callback);
  },

  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], callback);
  },

  findById: (id, callback) => {
    const sql = "SELECT * FROM users WHERE user_id = ?";
    db.query(sql, [id], callback);
  },

  search: (query, callback) => {
    const sql = "SELECT user_id, name, email FROM users WHERE name LIKE ? OR email LIKE ?";
    const searchValue = `%${query}%`;
    db.query(sql, [searchValue, searchValue], callback);
  },
};

export default User;
