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

// ASCII Art Themes
const ASCII_THEMES = {
  classic: {
    name: "Classic Terminal",
    color: "32", // Green
    art: [
      "╔══════════════════════════════════════════════════════════╗",
      "║                                                          ║",
      "║                  📨 TERMINAL MESSENGER                  ║",
      "║               Your secure message delivery               ║",
      "║                                                          ║",
      "║                         {message}                        ║",
      "║                                                          ║",
      "║  🔑 ID: {id}                                             ║",
      "║  🕐 {timestamp}                                          ║",
      "║                                                          ║",
      "║  🌐 https://terminal-messenger.in                        ║",
      "║  💫 Powered by Node.js & Express                         ║",
      "║                                                          ║",
      "╚══════════════════════════════════════════════════════════╝",
    ],
  },
  heart: {
    name: "Heart Love",
    color: "31", // Red
    art: [
      "    .:::.   .:::.    ",
      " .:::::::::.::::::::. ",
      ":::::::::::::::::::::",
      ":::::::::::::::::::::",
      " ::::::::::::::::::: ",
      "  ':::::::::::::::'  ",
      "    ':::::::::::'    ",
      "      ':::::::'      ",
      "        ':::'        ",
      "         ':'         ",
      "                     ",
      "    💌 MESSAGE 💌    ",
      "                     ",
      "    {message}        ",
      "                     ",
      "    🔑 ID: {id}      ",
      "    🕐 {timestamp}   ",
      "                     ",
      "  Made with 💖       ",
    ],
  },
  code: {
    name: "Code Master",
    color: "36", // Cyan
    art: [
      "┌──────────────────────────────────────────────────────────┐",
      "│ // ==================================================== // │",
      "│ //                   CODE MESSAGE                      // │",
      "│ // ==================================================== // │",
      "│                                                          │",
      "│   function receiveMessage() {                            │",
      "│     return `{message}`;                                  │",
      "│   }                                                      │",
      "│                                                          │",
      "│   // Message Metadata:                                   │",
      "│   const messageId = '{id}';                              │",
      "│   const timestamp = '{timestamp}';                       │",
      "│                                                          │",
      "│   console.log('📦 Message delivered successfully!');     │",
      "│                                                          │",
      "└──────────────────────────────────────────────────────────┘",
    ],
  },
  hacker: {
    name: "Hacker Style",
    color: "32", // Green
    art: [
      "▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄",
      "█                                                         █",
      "█  ██████ ██████  ██████  ██████ ██████ ██████ ██████     █",
      "█  ██████ ██████ ███████ ███████ ██████ ██████ ██████     █",
      "█     ███ ██  ██ ██  ███ ██  ███    ███ ██        ███     █",
      "█  ██████ ██████ ██   ██ ██   ██ ██████ ██████ ██████     █",
      "█  ██████ ██████ ███████ ███████ ██████ ██████ ██████     █",
      "█                                                         █",
      "█  [>] MESSAGE: {message}                                █",
      "█                                                         █",
      "█  [*] ID: {id}                                           █",
      "█  [*] TIME: {timestamp}                                  █",
      "█                                                         █",
      "█  [✓] MESSAGE DECRYPTED SUCCESSFULLY                     █",
      "█                                                         █",
      "▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀",
    ],
  },
  star: {
    name: "Starry Night",
    color: "33", // Yellow
    art: [
      "    ✦    ✦     ✦    ✦     ✦    ✦     ✦    ✦     ✦    ✦   ",
      "  ✦                                                       ✦",
      "✦                     STARRY MESSAGE                       ✦",
      "  ✦                                                       ✦",
      "    ✦    ✦     ✦    ✦     ✦    ✦     ✦    ✦     ✦    ✦   ",
      "                                                          ",
      "           ✦     {message}     ✦            ",
      "                                                          ",
      "    ✦    ✦     ✦    ✦     ✦    ✦     ✦    ✦     ✦    ✦   ",
      "  ✦                                                       ✦",
      "✦      ID: {id}                             ✦",
      "  ✦     TIME: {timestamp}                    ✦",
      "    ✦    ✦     ✦    ✦     ✦    ✦     ✦    ✦     ✦    ✦   ",
      "                                                          ",
      "                 Make a wish upon a star!                 ",
    ],
  },
  banner: {
    name: "Big Banner",
    color: "35", // Magenta
    art: [
      "▗▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▖",
      "▐                                                          ▌",
      "▐    ██████  ███████ ██████  ███████ ██████  ███████       ▌",
      "▐    ██   ██ ██      ██   ██ ██      ██   ██ ██            ▌",
      "▐    ██████  ███████ ██████  ███████ ██████  ███████       ▌",
      "▐    ██   ██      ██ ██   ██      ██ ██   ██      ██       ▌",
      "▐    ██████  ███████ ██   ██ ███████ ██   ██ ███████       ▌",
      "▐                                                          ▌",
      "▐    {message}                                              ▌",
      "▐                                                          ▌",
      "▐    📍 ID: {id}                                           ▌",
      "▐    🕒 {timestamp}                                        ▌",
      "▐                                                          ▌",
      "▐    🎉 MESSAGE DELIVERED IN STYLE!                        ▌",
      "▐                                                          ▌",
      "▝▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▘",
    ],
  },
  dragon: {
    name: "Dragon Fire",
    color: "31", // Red
    art: [
      "                    __====-_  _-====___            ",
      "                  _(                 _)           ",
      "             OO( dragons_message_ )/             ",
      "             0  (_                 _)              ",
      "           o0     (_==========__)                 ",
      "          o         {message}                     ",
      "        o    ,      ID: {id}                      ",
      "      o      |      TIME: {timestamp}             ",
      "    o        .                                    ",
      "   o   )\\     }                                   ",
      '  8=====""   ===""                                  ',
      "                                                  ",
      "        A message carried by dragons!             ",
    ],
  },
  robot: {
    name: "Robot AI",
    color: "36", // Cyan
    art: [
      "    ╔══════════════════════════════════════════╗    ",
      "    ║                 ROBOT AI                 ║    ",
      "    ║      ┌──────────────────────────┐        ║    ",
      "    ║      │      MESSAGE MODULE      │        ║    ",
      "    ║      └──────────────────────────┘        ║    ",
      "    ║                                          ║    ",
      "    ║   🤖 PROCESSING: {message}               ║    ",
      "    ║                                          ║    ",
      "    ║   📊 METADATA:                           ║    ",
      "    ║     • ID: {id}                           ║    ",
      "    ║     • TIME: {timestamp}                  ║    ",
      "    ║                                          ║    ",
      "    ║   ✅ MESSAGE TRANSMISSION COMPLETE        ║    ",
      "    ║   🎯 ACCURACY: 100%                      ║    ",
      "    ╚══════════════════════════════════════════╝    ",
      "            ║    ║                                 ",
      "            ║    ║                                 ",
      "           ▁▁▁▁▁▁▁▁▁▁                              ",
      "          /         /|                              ",
      "         /_________/ |                              ",
      "         |         | |                              ",
      "         |    🤖   | /                              ",
      "         |         |/                               ",
      "         ───────────                                ",
    ],
  },
};

// Utility functions
async function ensureMessagesFile() {
  try {
    await fs.access(MESSAGES_FILE);
  } catch (error) {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify({}));
  }
}

async function readMessages() {
  try {
    const data = await fs.readFile(MESSAGES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function writeMessages(messages) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

function generateShortId() {
  return uuidv4().split("-")[0];
}

function formatMessageForTheme(message, theme, messageData) {
  const { id, createdAt } = messageData;
  const timestamp = new Date(createdAt).toLocaleString();

  // Word wrap the message to fit within the theme
  const words = message.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + " " + word).length <= 50) {
      currentLine = currentLine ? currentLine + " " + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  // Format the theme art with the message and metadata
  let formattedArt = theme.art.map((line) => {
    return line
      .replace(/{message}/g, lines[0] || "")
      .replace(/{id}/g, id)
      .replace(/{timestamp}/g, timestamp);
  });

  // If message has multiple lines, insert them
  if (lines.length > 1) {
    const messageInsertIndex = formattedArt.findIndex((line) => line.includes(lines[0]));
    if (messageInsertIndex !== -1) {
      for (let i = 1; i < lines.length; i++) {
        formattedArt.splice(messageInsertIndex + i, 0, formattedArt[messageInsertIndex].replace(lines[0], lines[i]));
      }
    }
  }

  return formattedArt;
}

function generateTerminalResponse(messageData) {
  const { message, id, createdAt, theme = "classic" } = messageData;
  const selectedTheme = ASCII_THEMES[theme] || ASCII_THEMES.classic;

  const formattedArt = formatMessageForTheme(message, selectedTheme, {
    id,
    createdAt,
    theme,
  });

  // Add ANSI color codes for terminal
  const colorCode = selectedTheme.color;
  const coloredArt = formattedArt.map((line) => `\x1b[${colorCode}m${line}\x1b[0m`);

  return coloredArt.join("\n") + "\n\n✨ Message styled with " + selectedTheme.name + " theme!\n";
}

// API Routes
app.post("/api/messages", async (req, res) => {
  try {
    const { message, theme = "classic" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: "Message too long" });
    }

    if (!ASCII_THEMES[theme]) {
      return res.status(400).json({ error: "Invalid theme" });
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
      theme: theme,
      createdAt: new Date().toISOString(),
    };

    await writeMessages(messages);

    res.json({
      id: messageId,
      url: `${req.protocol}://${req.get("host")}/${messageId}`,
      theme: theme,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    await ensureMessagesFile();
    const messages = await readMessages();
    const messageData = messages[messageId];

    if (!messageData) {
      if (req.get("user-agent")?.includes("curl")) {
        const errorResponse = [
          "\x1b[31m╔══════════════════════════════════════════════════════════════════╗",
          "║                                                                      ║",
          "║                         ❌ MESSAGE NOT FOUND                         ║",
          "║                                                                      ║",
          "║              The requested message could not be located.             ║",
          "║                                                                      ║",
          "║                         🔍 ID: " + messageId.padEnd(36) + " ║",
          "║                                                                      ║",
          "║              💡 Check the ID or create a new message.               ║",
          "║                                                                      ║",
          "╚══════════════════════════════════════════════════════════════════╝\x1b[0m",
          "",
        ].join("\n");
        return res.type("text").send(errorResponse);
      }
      return res.status(404).send("Message not found");
    }

    if (req.get("user-agent")?.includes("curl")) {
      const terminalResponse = generateTerminalResponse(messageData);
      res.type("text").send(terminalResponse);
    } else {
      // Enhanced browser view
      const theme = ASCII_THEMES[messageData.theme];
      res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Terminal Messenger - ${messageData.id}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: 'Monaco', 'Menlo', monospace;
                            background: #0a0a0a;
                            color: #${
                              theme.color === "32"
                                ? "00ff00"
                                : theme.color === "31"
                                ? "ff4444"
                                : theme.color === "36"
                                ? "00ffff"
                                : theme.color === "33"
                                ? "ffff00"
                                : theme.color === "35"
                                ? "ff00ff"
                                : "00ff00"
                            };
                            margin: 0;
                            padding: 20px;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .terminal {
                            background: #111;
                            padding: 30px;
                            border-radius: 10px;
                            border: 1px solid #333;
                            max-width: 800px;
                            width: 100%;
                            white-space: pre;
                            font-size: 14px;
                            line-height: 1.4;
                            box-shadow: 0 0 30px rgba(255,255,255,0.1);
                        }
                        .message-info {
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #333;
                            font-size: 12px;
                            color: #888;
                        }
                    </style>
                </head>
                <body>
                    <div class="terminal">
${formatMessageForTheme(messageData.message, theme, messageData).join("\n")}
                        <div class="message-info">
                            Theme: ${theme.name} | ID: ${messageData.id} | Created: ${new Date(messageData.createdAt).toLocaleString()}
                        </div>
                    </div>
                </body>
                </html>
            `);
    }
  } catch (error) {
    console.error("Error retrieving message:", error);
    if (req.get("user-agent")?.includes("curl")) {
      res.type("text").status(500).send("\x1b[31mError: Internal server error\x1b[0m\n");
    } else {
      res.status(500).send("Internal server error");
    }
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`
    🎨 Terminal Messenger Server Started!
    
    📍 Port: ${PORT}
    🌐 URL: http://localhost:${PORT}
    
    🎭 Available Themes:
    ${Object.entries(ASCII_THEMES)
      .map(([id, theme]) => `    • ${theme.name} (${id})`)
      .join("\n")}
    
    ⚡ Ready to create beautiful terminal messages!
    `);
});

module.exports = app;
