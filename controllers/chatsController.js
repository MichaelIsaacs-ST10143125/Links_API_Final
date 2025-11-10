import db from "../db.js";

export const createChat = (req, res) => {
  const { user1_id, user2_id } = req.body;

  if (!user1_id || !user2_id) {
    return res.status(400).json({ message: "Both user IDs are required" });
  }

  const checkQuery = `
    SELECT * FROM chats
    WHERE (user1_id = ? AND user2_id = ?) 
       OR (user1_id = ? AND user2_id = ?)
  `;

  db.query(checkQuery, [user1_id, user2_id, user2_id, user1_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length > 0) {
      return res.status(200).json({ message: "Chat already exists", chat: results[0] });
    }

    const insertQuery = "INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)";
    db.query(insertQuery, [user1_id, user2_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Error creating chat", error: err });

      res.status(201).json({
        message: "Chat created successfully",
        chat: {
          chat_id: result.insertId,
          user1_id,
          user2_id,
          created_at: new Date()
        }
      });
    });
  });
};

export const getUserChats = (req, res) => {
  const { userId } = req.params;

  if (!userId) return res.status(400).json({ message: "User ID is required" });

  const query = `
    SELECT c.chat_id, c.user1_id, c.user2_id, c.created_at,
           u1.name AS user1_name, u2.name AS user2_name
    FROM chats c
    JOIN users u1 ON c.user1_id = u1.user_id
    JOIN users u2 ON c.user2_id = u2.user_id
    WHERE c.user1_id = ? OR c.user2_id = ?
    ORDER BY c.created_at DESC
  `;

  db.query(query, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(200).json(results);
  });
};

export const sendMessage = (req, res) => {
  const { chat_id, sender_id, message_text } = req.body;

  if (!chat_id || !sender_id || !message_text) {
    return res.status(400).json({ message: "chat_id, sender_id, and message_text are required" });
  }

  const insertQuery = `
    INSERT INTO messages (chat_id, sender_id, message_text)
    VALUES (?, ?, ?)
  `;

  db.query(insertQuery, [chat_id, sender_id, message_text], (err, result) => {
    if (err) return res.status(500).json({ message: "Error sending message", error: err });

    res.status(201).json({
      message: "Message sent successfully",
      data: {
        message_id: result.insertId,
        chat_id,
        sender_id,
        message_text,
        created_at: new Date()
      }
    });
  });
};

export const getChatMessages = (req, res) => {
  const { chatId } = req.params;

  if (!chatId) return res.status(400).json({ message: "Chat ID is required" });

  const query = `
    SELECT m.message_id, m.chat_id, m.sender_id, u.name AS sender_name,
           m.message_text, m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.user_id
    WHERE m.chat_id = ?
    ORDER BY m.created_at ASC
  `;

  db.query(query, [chatId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error retrieving messages", error: err });
    res.status(200).json(results);
  });
};
