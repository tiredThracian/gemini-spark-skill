---
name: gemini-spark
description: Automate asking prompts to Gemini Spark and retrieving its otonom answers via a headless browser script. Activate this skill whenever the user asks to query Gemini Spark, ask Spark a question, or delegate a research task to Gemini Spark.
---

# Gemini Spark Automation Skill

Use this skill to programmatically delegate research tasks or prompts to Gemini Spark on the web, preserving full multi-turn conversation context across queries.

## Implementation Details

The automation is implemented via a Playwright script located at:
[index.js](file:///C:/Users/ibrah/.gemini/config/skills/gemini-spark/scripts/index.js)

The script runs Chrome in headless mode using the user's local Chrome installation. This ensures session state (cookies, login) is preserved and prevents bot-detection blocks.

## Conversation Context & How to Run a Query

By default, **every query automatically continues the active Spark conversation**, preserving context across multiple turns.

To interact with Gemini Spark, run the script:

```bash
node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js [ask|wait|list|login|delete] [--new] [--continue <index_or_id>] [--profile <name>] [--no-wait] [--json] [--file "path/to/file"] "Your query here"
```

### Architectural Features & Options
*   **Structured JSON Output (`--json`)**: Emits clean machine-readable JSON payload containing `status`, `thread_id`, `url`, `response`, and `downloaded_files`.
*   **Profile Isolation (`--profile <name>`)**: Launches an isolated Chrome user-data profile (`chrome-profile-<name>`), preventing file-lock collisions when running parallel AGY agents. Each profile maintains its own isolated conversation memory.
*   **Async Dispatch (`--no-wait`)**: Submits prompt, captures thread ID immediately, and exits returning `{"status": "pending"}` without waiting for full text generation.
*   **Wait Subcommand (`wait [thread_id]`)**: Polls and waits for thread text generation to complete, returning `{"status": "completed", "response": "..."}`.
*   **Login Subcommand (`login` or `--login`)**: Checks session login state and outputs exact commands to open Chrome with profile debugging for authentication.
*   **Delete Subcommand (`delete [active|all|<id_or_index>]`)**: Clears local session context or deletes a conversation thread directly from Gemini servers.

### Examples
*   **Default Multi-Turn Query (Continues Active Conversation):**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js "What is the capital of France?"
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js "What is its population?"  # Automatically continues previous context!
    ```
*   **Session Login Verification:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js login
    ```
*   **Clear Active Conversation Memory / Delete Thread:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js delete active     # Clears local session state for next query
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js delete 3bef48082feba09d  # Deletes thread from Gemini web UI
    ```
*   **Structured JSON API Mode:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --json "Explain quantum entanglement"
    ```
*   **Parallel Agent Execution (Isolated Profile):**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --profile worker-1 --json "Query A"
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --profile worker-2 --json "Query B"
    ```
*   **Async Dispatch & Background Wait:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --no-wait --json "Perform deep research on solar power"
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js wait --json
    ```
*   **Start a Fresh Conversation Task (`--new`):**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --new "Let's start a brand new topic on quantum mechanics."
    ```
*   **List Existing Conversations:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js list --json
    ```
*   **Switch to / Continue Specific Conversation by ID:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --continue 11c9923185decc44 "Summarize our chat"
    ```

## Rules for File Uploads & Native Types

When using this skill to process files, do NOT extract the text/data of the files locally. Instead, upload the file directly using the `--file` parameter.

Gemini natively supports:
*   **Documents:** `.pdf`, `.docx`, `.doc`, `.txt`, `.rtf`, `.odt`, `.pages`
*   **Spreadsheets:** `.xlsx`, `.xls`, `.csv`, `.tsv`, `.ods`, `.numbers`
*   **Presentations:** `.pptx`, `.ppt`, `.odp`, `.key`
*   **Code & Data:** `.py`, `.js`, `.ts`, `.html`, `.css`, `.json`, `.xml`, `.sql`, `.java`, `.cpp`, `.c`, `.h`, `.sh`, `.yaml`, `.md`
*   **Images:** `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`
*   **Audio & Video:** `.mp3`, `.wav`, `.aac`, `.m4a`, `.mp4`, `.mov`, `.avi`, `.webm`, `.mkv`

Always leverage native uploading for these formats.

## Automatic Google Workspace Exporter & Downloader

The script automatically detects if Gemini Spark generates or references Google Workspace items in its response:

*   **Google Docs:** Automatically exported as plain text `.txt` files (e.g. `downloaded-doc-[id].txt`).
*   **Google Sheets:** Automatically exported as Excel `.xlsx` files (e.g. `downloaded-sheet-[id].xlsx`).
*   **Google Slides:** Automatically exported as PowerPoint `.pptx` files (e.g. `downloaded-slides-[id].pptx`).

These files are automatically downloaded and copied directly into your active working directory (where you executed the `node` command).

## Troubleshooting & Authentication

If the session requires authentication or is not logged in:
1. Close all active Chrome processes:
   ```powershell
   Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
   ```
2. Launch Chrome with your skill profile:
   ```powershell
   Start-Process "chrome" -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=C:\Users\ibrah\.gemini\config\skills\gemini-spark\chrome-profile", "https://gemini.google.com/spark"
   ```
3. Log into your Google Account in the opened Chrome browser window, then close Chrome and re-run your `index.js` command.
