const express = require("express");
const path = require("path");
const { nanoid } = require("nanoid");

// In-memory storage (resets on cold start — fine for demo)
const messages = new Map();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Clean up expired messages
function cleanupOldMessages() {
  const now = Date.now();
  for (const [id, data] of messages.entries()) {
    if (now - data.createdAt > 24 * 60 * 60 * 1000) {
      messages.delete(id);
    }
  }
}

// POST /api/send → store message
app.post("/api/send", (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.length > 500) {
    return res.status(400).json({ error: "Invalid message" });
  }

  const id = nanoid(8);
  messages.set(id, {
    content: message,
    createdAt: Date.now(),
  });

  cleanupOldMessages();

  res.json({ id });
});

// GET /:id → return plain text message
app.get("/:id", (req, res) => {
  const { id } = req.params;
  const messageData = messages.get(id);

  if (!messageData) {
    return res.status(404).send("Message not found or expired");
  }

  if (Date.now() - messageData.createdAt > 24 * 60 * 60 * 1000) {
    messages.delete(id);
    return res.status(404).send("Message expired");
  }

  // Important: Set Content-Type to text/plain for curl
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(messageData.content);
});

// Handle all other routes with index.html (for SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ ONLY export the app — DO NOT call app.listen()
module.exports = app;
