import db from "../db.js";
import admin from "../firebase.js";

// Send push + save in DB
export async function sendNotificationToUser(userId, title, message) {
  try {
    // 1) Get user’s FCM token
    const [rows] = await db
      .promise()
      .query("SELECT fcm_token FROM users WHERE user_id = ?", [userId]);

    if (!rows || rows.length === 0 || !rows[0].fcm_token) {
      console.log("No FCM token for user", userId);
      return;
    }

    const fcmToken = rows[0].fcm_token;

    // 2) Save notification in your MySQL notifications table
    await db
      .promise()
      .query(
        "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
        [userId, title, message]
      );

    // 3) Send push notification using FIREBASE ADMIN
    const payload = {
      notification: {
        title,
        body: message,
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(payload);
    console.log("FCM sent:", response);

  } catch (err) {
    console.error("Error sending notification:", err);
  }
}

// Create notification + push it
export const createNotification = (receiverId, senderId, messageText) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Insert into DB
      await db
        .promise()
        .query(
          "INSERT INTO notifications (user_id, sender_id, message) VALUES (?, ?, ?)",
          [receiverId, senderId, messageText]
        );

      // Send push
      await sendNotificationToUser(receiverId, "New Message", messageText);

      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
};

// Route handler for frontend if needed
export const sendNotification = async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ message: "userId and message required" });
  }

  try {
    await sendNotificationToUser(userId, "New Message", message);
    res.status(200).json({ message: "Notification sent!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send notification" });
  }
};

// Get notifications list for app
export const getNotifications = (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT n.id, n.user_id, n.sender_id, n.message, n.created_at,
           u.name AS sender_name
    FROM notifications n
    JOIN users u ON n.sender_id = u.user_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ message: "Error fetching notifications" });
    }

    res.status(200).json(results);
  });
};
