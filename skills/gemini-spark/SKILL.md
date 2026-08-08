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
node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js [ask|wait|list|login|delete|rename|verbatim|accounts] [--account <name>] [--cdp <port_or_url>] [--verbatim] [--new] [--continue <index_or_id>] [--no-wait] [--json] [--file "path/to/file"] "Your query here"
```

### Architectural Features & Options
*   **Rename Subcommand (`rename [index_or_id] "New Title"`)**: Renames a specified conversation thread or Spark task card in the Gemini web interface (e.g. `node index.js rename 3bef48082feba09d "New Project Title"` or `node index.js rename 1 "New Title"`). If no ID is specified, it renames the currently active thread.
*   **CDP Parallel Execution (`--cdp <port_or_url>`)**: Connects over Chrome DevTools Protocol to a running Chrome instance (e.g. port `9222`). This allows multiple Playwright scripts to query the **same Google account simultaneously in parallel tabs** without profile file-locking.
*   **Multi-Account Support (`--account <name>` / `--profile <name>`)**: Connects to specific Google accounts (e.g. `work`, `personal`, `research`). Each account maintains isolated login cookies, session memory, and thread state.
*   **Accounts Subcommand (`accounts` or `profiles`)**: Lists all configured Google account profiles, active context state, and profile directories.
*   **Account Login Subcommand (`login [account_name]`)**: Verifies login status or outputs step-by-step Chrome launch instructions for authenticating a specific Google account (e.g. `node index.js login work`).
*   **Structured JSON Output (`--json`)**: Emits clean machine-readable JSON payload containing `status`, `thread_id`, `url`, `response`, and `downloaded_files`.
*   **Verbatim Response Copy (`--verbatim` or `-v` or `verbatim`)**: Specifies that the response must be returned as an exact, untruncated verbatim copy of Gemini Spark's answer.
*   **Async Dispatch (`--no-wait`)**: Submits prompt, captures thread ID immediately, and exits returning `{"status": "pending"}` without waiting for full text generation.
*   **Delete Subcommand (`delete [active|all|<id_1>,<id_2>...]`)**: Deletes one or multiple conversation threads / Spark tasks from Gemini and automatically returns the updated remaining tasks list.

### Examples
*   **Multi-Account Query Execution:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --account default "Personal query"
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --account work "Work query"
    ```
*   **List All Configured Accounts:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js accounts
    ```
*   **Log Into a Second Google Account:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js login work
    ```
*   **Verbatim Exact Response Copy:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js verbatim "Write a 50-word summary of quantum mechanics."
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --verbatim --json "Write a Python function for quicksort."
    ```
*   **Delete Multiple Threads & Auto-List Remaining:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js delete fb6b127394a556fd, dc2661effcee1f7b, 8f165d09e48a0a2b
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
