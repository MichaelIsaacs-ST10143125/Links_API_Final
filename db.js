import mysql from "mysql2";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const ca = fs.readFileSync("./certs/ca.pem");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    ca: ca,
    rejectUnauthorized: true
  }
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
});

export default db;
