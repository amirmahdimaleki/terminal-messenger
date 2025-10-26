// const express = require("express");
// const path = require("path");
// const { nanoid } = require("nanoid");

// // In-memory storage (resets on cold start — fine for demo)
// const messages = new Map();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));

// // Clean up expired messages
// function cleanupOldMessages() {
//   const now = Date.now();
//   for (const [id, data] of messages.entries()) {
//     if (now - data.createdAt > 24 * 60 * 60 * 1000) {
//       messages.delete(id);
//     }
//   }
// }

// // POST /api/send → store message
// app.post("/api/send", (req, res) => {
//   const { message } = req.body;

//   if (!message || typeof message !== "string" || message.length > 500) {
//     return res.status(400).json({ error: "Invalid message" });
//   }

//   const id = nanoid(8);
//   messages.set(id, {
//     content: message,
//     createdAt: Date.now(),
//   });

//   cleanupOldMessages();

//   res.json({ id });
// });

// // GET /:id → return plain text message
// app.get("/:id", (req, res) => {
//   const { id } = req.params;
//   const messageData = messages.get(id);

//   if (!messageData) {
//     return res.status(404).send("Message not found or expired");
//   }

//   if (Date.now() - messageData.createdAt > 24 * 60 * 60 * 1000) {
//     messages.delete(id);
//     return res.status(404).send("Message expired");
//   }

//   // Important: Set Content-Type to text/plain for curl
//   res.set("Content-Type", "text/plain; charset=utf-8");
//   res.send(messageData.content);
// });

// // Handle all other routes with index.html (for SPA support)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// // ✅ ONLY export the app — DO NOT call app.listen()
// module.exports = app;

const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const MESSAGES_FILE = path.join(__dirname, "messages.json");

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Ensure messages file exists
async function ensureMessagesFile() {
  try {
    await fs.access(MESSAGES_FILE);
  } catch (error) {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify({}));
  }
}

// Read messages from file
async function readMessages() {
  try {
    const data = await fs.readFile(MESSAGES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Write messages to file
async function writeMessages(messages) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Generate short ID (first 8 characters of UUID)
function generateShortId() {
  return uuidv4().split("-")[0];
}

// API Routes

// Create new message
app.post("/api/messages", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: "Message too long" });
    }

    await ensureMessagesFile();
    const messages = await readMessages();

    let messageId;
    do {
      messageId = generateShortId();
    } while (messages[messageId]);

    messages[messageId] = {
      id: messageId,
      message: message,
      createdAt: new Date().toISOString(),
    };

    await writeMessages(messages);

    res.json({
      id: messageId,
      url: `${req.protocol}://${req.get("host")}/${messageId}`,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get message by ID (for curl)
app.get("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    await ensureMessagesFile();
    const messages = await readMessages();
    const messageData = messages[messageId];

    if (!messageData) {
      // For curl requests, return plain text
      if (req.get("user-agent")?.includes("curl")) {
        return res.type("text").send("Message not found\n");
      }
      return res.status(404).send("Message not found");
    }

    // If request is from curl, return plain text
    if (req.get("user-agent")?.includes("curl")) {
      res.type("text").send(messageData.message + "\n");
    } else {
      // For browser, show a simple page
      res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Terminal Messenger</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                            max-width: 600px; 
                            margin: 100px auto; 
                            padding: 20px; 
                            text-align: center; 
                        }
                        .message-box { 
                            background: #f8f9fa; 
                            padding: 30px; 
                            border-radius: 12px; 
                            border-left: 4px solid #667eea; 
                        }
                    </style>
                </head>
                <body>
                    <div class="message-box">
                        <h2>📨 Terminal Message</h2>
                        <p>${messageData.message}</p>
                        <small>Created: ${new Date(messageData.createdAt).toLocaleString()}</small>
                    </div>
                </body>
                </html>
            `);
    }
  } catch (error) {
    console.error("Error retrieving message:", error);
    if (req.get("user-agent")?.includes("curl")) {
      res.type("text").status(500).send("Internal server error\n");
    } else {
      res.status(500).send("Internal server error");
    }
  }
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Terminal Messenger server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app;
