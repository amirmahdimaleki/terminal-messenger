class TerminalMessenger {
  constructor() {
    this.messageInput = document.getElementById("messageInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.result = document.getElementById("result");
    this.terminalCommand = document.getElementById("terminalCommand");
    this.copyBtn = document.getElementById("copyBtn");
    this.charCount = document.getElementById("charCount");
    this.themeGrid = document.getElementById("themeGrid");
    this.creditsBtn = document.getElementById("creditsBtn");

    this.selectedTheme = "classic";
    this.themes = {};

    this.init();
  }

  init() {
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    this.copyBtn.addEventListener("click", () => this.copyCommand());
    this.messageInput.addEventListener("input", () => this.updateCharCount());
    this.creditsBtn.addEventListener("click", () => this.openCredits());

    this.loadThemes();
    this.renderThemeOptions();

    // Allow Enter key with Shift, but prevent form submission
    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  loadThemes() {
    this.themes = {
      classic: {
        name: "Classic Terminal",
        preview: `┌─ MESSAGE ─┐\n│  Hello!   │\n└───────────┘`,
        color: "32", // Green
      },
      heart: {
        name: "Heart Love",
        preview: ` 💖 \nHello!\n 💖 `,
        color: "31", // Red
      },
      code: {
        name: "Code Master",
        preview: `{ /* Hello! */ }`,
        color: "36", // Cyan
      },
      hacker: {
        name: "Hacker Style",
        preview: `[>] Hello! [<]`,
        color: "32", // Green
      },
      star: {
        name: "Starry Night",
        preview: `✦ Hello! ✦`,
        color: "33", // Yellow
      },
      banner: {
        name: "Big Banner",
        preview: `▄▄▄▄ Hello! ▄▄▄▄`,
        color: "35", // Magenta
      },
      dragon: {
        name: "Dragon Fire",
        preview: `🐉 Hello! 🐉`,
        color: "31", // Red
      },
      robot: {
        name: "Robot AI",
        preview: `🤖 Hello! 🤖`,
        color: "36", // Cyan
      },
    };
  }

  renderThemeOptions() {
    this.themeGrid.innerHTML = "";

    Object.entries(this.themes).forEach(([id, theme]) => {
      const themeElement = document.createElement("div");
      themeElement.className = `theme-option ${id === this.selectedTheme ? "selected" : ""}`;
      themeElement.innerHTML = `
                <div class="theme-preview">${theme.preview}</div>
                <div class="theme-name">${theme.name}</div>
            `;

      themeElement.addEventListener("click", () => this.selectTheme(id));
      this.themeGrid.appendChild(themeElement);
    });
  }

  selectTheme(themeId) {
    this.selectedTheme = themeId;
    this.renderThemeOptions();
  }

  updateCharCount() {
    const count = this.messageInput.value.length;
    this.charCount.textContent = count;

    if (count > 450) {
      this.charCount.style.color = "#e74c3c";
    } else if (count > 300) {
      this.charCount.style.color = "#f39c12";
    } else {
      this.charCount.style.color = "#888";
    }
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();

    if (!message) {
      alert("Please enter a message");
      return;
    }

    if (message.length > 500) {
      alert("Message must be 500 characters or less");
      return;
    }

    this.setLoading(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          theme: this.selectedTheme,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        this.showResult(data.id);
      } else {
        throw new Error(data.error || "Failed to create message");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      this.setLoading(false);
    }
  }

  showResult(messageId) {
    const baseUrl = window.location.origin;
    const command = `curl ${baseUrl}/${messageId}`;

    this.terminalCommand.textContent = command;
    this.result.classList.remove("hidden");

    // Scroll to result
    this.result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  copyCommand() {
    const command = this.terminalCommand.textContent;
    navigator.clipboard
      .writeText(command)
      .then(() => {
        const originalText = this.copyBtn.textContent;
        this.copyBtn.textContent = "✅ Copied!";

        setTimeout(() => {
          this.copyBtn.textContent = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy command to clipboard");
      });
  }

  openCredits() {
    // Open GitHub profile in new tab
    window.open("https://github.com/amirmahdimaleki", "_blank");
  }

  setLoading(loading) {
    this.sendBtn.disabled = loading;
    this.sendBtn.textContent = loading ? "🎨 Creating Beautiful Link..." : "🚀 Generate Terminal Link";
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TerminalMessenger();
});
