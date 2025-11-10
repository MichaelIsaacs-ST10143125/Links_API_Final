import db from "../db.js";

const Chat = {

  createChat: (user1_id, user2_id, callback) => {
    const [firstUser, secondUser] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];

    const sql = `
      INSERT INTO chats (user1_id, user2_id)
      SELECT ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM chats
        WHERE (user1_id = ? AND user2_id = ?)
           OR (user1_id = ? AND user2_id = ?)
      )
    `;

    db.query(sql, [firstUser, secondUser, firstUser, secondUser, secondUser, firstUser], callback);
  },

  getUserChats: (userId, callback) => {
    const sql = `
      SELECT c.chat_id, c.user1_id, c.user2_id, c.created_at,
             u1.name AS user1_name, u2.name AS user2_name
      FROM chats c
      JOIN users u1 ON c.user1_id = u1.user_id
      JOIN users u2 ON c.user2_id = u2.user_id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.created_at DESC
    `;

    db.query(sql, [userId, userId], callback);
  },

  sendMessage: (chat_id, sender_id, message_text, callback) => {
    const sql = `
      INSERT INTO messages (chat_id, sender_id, message_text)
      VALUES (?, ?, ?)
    `;
    db.query(sql, [chat_id, sender_id, message_text], callback);
  },

  getMessagesForChat: (chat_id, callback) => {
    const sql = `
      SELECT m.message_id, m.chat_id, m.sender_id, u.name AS sender_name, 
             m.message_text, m.created_at
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.chat_id = ?
      ORDER BY m.created_at ASC
    `;
    db.query(sql, [chat_id], callback);
  }
};

export default Chat;
