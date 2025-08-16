const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");   // ✅ Add CORS

const app = express();
app.use(bodyParser.json());
app.use(cors());   // ✅ Enable CORS for all requests

// --- SQLite setup ---
const db = new sqlite3.Database("payments.db");
db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_last4 TEXT,
    card_hash TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    cvv TEXT,
    cardholder_name TEXT
)`);

// --- Save payment route ---
app.post("/save", (req, res) => {
    const { card_number, expiry_month, expiry_year, cvv, cardholder_name } = req.body;

    if (!card_number || !expiry_month || !expiry_year || !cvv || !cardholder_name) {
        return res.status(400).send("Missing fields!");
    }

    const last4 = card_number.slice(-4);
    const hash = crypto.createHash("sha256").update(card_number).digest("hex");

    db.run(
        `INSERT INTO payments (card_last4, card_hash, expiry_month, expiry_year, cvv, cardholder_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [last4, hash, expiry_month, expiry_year, cvv, cardholder_name],
        (err) => {
            if (err) return res.status(500).send("Error saving payment");
            res.send("OK");
        }
    );
});

// --- Start server ---
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
