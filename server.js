const express = require("express");
const path = require("path");
const { nanoid } = require("nanoid");

// In-memory storage (for demo purposes - use a database in production)
const messages = new Map();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API endpoint to store messages
app.post("/api/send", (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.length > 500) {
    return res.status(400).json({ error: "Invalid message" });
  }

  // Generate unique ID
  const id = nanoid(8);

  // Store message with timestamp (for expiration)
  messages.set(id, {
    content: message,
    createdAt: Date.now(),
  });

  // Clean up old messages (every time a new message is added)
  cleanupOldMessages();

  res.json({ id });
});

// Endpoint to retrieve messages
app.get("/:id", (req, res) => {
  const { id } = req.params;
  const messageData = messages.get(id);

  if (!messageData) {
    return res.status(404).send("Message not found or expired");
  }

  // Check if message is expired (24 hours)
  if (Date.now() - messageData.createdAt > 24 * 60 * 60 * 1000) {
    messages.delete(id);
    return res.status(404).send("Message expired");
  }

  // Send as plain text for terminal
  res.type("txt").send(messageData.content);
});

// Cleanup function to remove expired messages
function cleanupOldMessages() {
  const now = Date.now();
  for (const [id, data] of messages.entries()) {
    if (now - data.createdAt > 24 * 60 * 60 * 1000) {
      messages.delete(id);
    }
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
