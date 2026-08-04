# ⚡ Gemini Spark Automation Skill for Antigravity

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-%5E1.49.0-red.svg)](https://playwright.dev/)

An advanced, production-grade Playwright browser automation engine designed for **Google Antigravity (AGY)** agents to programmatically delegate research tasks, multi-turn conversations, file processing, and task management to **Google Gemini Spark** (`gemini.google.com/spark`).

---

## ✨ Core Features

*   💬 **Multi-Turn Context Retention**: Automatically tracks and continues the active conversation thread (`last-chat-url.txt`) across consecutive agent queries.
*   👤 **Multi-Account & Profile Isolation**: Natively manages multiple Google accounts (`--account work`, `--account personal`) with profile-isolated cookies, session states, and task memory.
*   ⚡ **CDP Parallel Execution**: Connects over Chrome DevTools Protocol (`--cdp 9222`) to run multiple agent queries **simultaneously in parallel tabs** under the exact same Google account.
*   📝 **Verbatim Response Copy**: Guarantees untruncated, verbatim response relaying when `--verbatim` or the `verbatim` subcommand is supplied.
*   ✏️ **Thread & Task Renaming**: Programmatically renames active or historical conversation threads and Spark task cards via `rename [id] "New Title"`.
*   🗑️ **Batch Multi-ID Deletion**: Supports batch deletion of task cards / sidebar threads (`delete id1, id2, id3`) with automatic post-delete task list return.
*   📁 **Native File Uploads**: Uploads PDF, Excel, Word, PPTX, images, audio, video, and source code files directly without local text extraction.
*   📥 **Google Workspace Exporter**: Automatically detects and downloads generated Google Docs (`.txt`), Sheets (`.xlsx`), Slides (`.pptx`), and AI images directly into your active working directory.

---

## 🛠️ CLI Syntax & Usage

```bash
node gemini-spark/scripts/index.js [ask|wait|list|login|delete|rename|verbatim|accounts] [--account <name>] [--cdp <port_or_url>] [--verbatim] [--new] [--continue <index_or_id>] [--no-wait] [--json] [--file "path/to/file"] "Your query here"
```

### 📋 Subcommands & Flags

| Subcommand / Flag | Description | Example |
| :--- | :--- | :--- |
| `ask` *(default)* | Submit a query or prompt to Gemini Spark. | `node index.js "Explain quantum mechanics"` |
| `verbatim` / `--verbatim` | Request exact, untruncated verbatim response copy. | `node index.js verbatim "Write quicksort in Python"` |
| `--account <name>` | Select specific Google account profile (e.g. `work`, `personal`). | `node index.js --account work "Check email summary"` |
| `accounts` / `profiles` | List all configured Google accounts and their session state. | `node index.js accounts` |
| `--cdp <port_or_url>` | Connect to running Chrome via CDP for parallel tab execution. | `node index.js --cdp 9222 --new "Query A"` |
| `rename` | Rename a thread/task card by ID, index, or active session. | `node index.js rename 3bef4808 "New Title"` |
| `delete` | Batch delete conversation threads/task cards & return list. | `node index.js delete id1, id2, id3` |
| `list` | Fetch and list all active Spark tasks & sidebar conversations live. | `node index.js list --json` |
| `login [account_name]` | Verify session login status or output Chrome login helper. | `node index.js login work` |
| `--new` | Start a brand new conversation thread (ignores active context). | `node index.js --new "Fresh topic"` |
| `--continue <id>` | Continue a specific conversation thread by 16-char ID or index. | `node index.js --continue 2 "More details"` |
| `--file <path>` | Upload a local document, spreadsheet, code, or image file. | `node index.js --file ./data.xlsx "Analyze this"` |
| `--no-wait` / `wait` | Dispatch query asynchronously and retrieve result later. | `node index.js --no-wait "Query"` ➔ `node index.js wait` |

---

## 🚀 One-Click Installation (Windows)

1. Clone this repository to your computer:
   ```bash
   git clone https://github.com/tiredThracian/gemini-spark-skill.git
   cd gemini-spark-skill
   ```
2. Run the one-click installer:
   ```cmd
   setup.bat
   ```
3. When the Chrome browser window opens, log into your Google Account on `gemini.google.com`.
4. Close the Chrome window and press any key in the terminal to complete setup.

The skill will be automatically deployed to `%USERPROFILE%\.gemini\config\skills\gemini-spark`.

---

## 🔒 Authentication & Account Management

### Checking & Logging into Accounts
To verify login status or log into a secondary Google account (e.g., `work`):
```bash
# Check accounts list
node gemini-spark/scripts/index.js accounts

# Authenticate a work account
node gemini-spark/scripts/index.js login work
```

If authentication expires:
1. Close all active Chrome processes:
   ```powershell
   Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
   ```
2. Launch Chrome with your skill profile:
   ```powershell
   Start-Process "chrome" -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=C:\Users\ibrah\.gemini\config\skills\gemini-spark\chrome-profile", "https://gemini.google.com/spark"
   ```
3. Sign in to your Google Account, close Chrome, and re-run your prompt.

---

## 📄 License

MIT License. Developed for Google Antigravity Agentic Workflows.
