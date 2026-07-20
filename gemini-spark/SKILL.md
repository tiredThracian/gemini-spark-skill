---
name: gemini-spark
description: Automate asking prompts to Gemini Spark and retrieving its otonom answers via a headless browser script. Activate this skill whenever the user asks to query Gemini Spark, ask Spark a question, or delegate a research task to Gemini Spark.
---

# Gemini Spark Automation Skill

Use this skill to programmatically delegate research tasks or prompts to Gemini Spark on the web, bypassing the lack of an official API.

## Implementation Details

The automation is implemented via a Playwright script located at:
[index.js](file:///C:/Users/ibrah/.gemini/config/skills/gemini-spark/scripts/index.js)

The script runs Chrome in headless mode using the user's local Chrome installation. This ensures session state (cookies, login) is preserved and prevents bot-detection blocks.

## How to Run a Query

To interact with Gemini Spark, run the script from the directory `C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts` (or execute it with the absolute path):

```bash
node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js [--file "path/to/file"] [--continue <index_or_id>] [--list] "Your query here"
```

### Examples
*   **Simple Prompt (New Chat):**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js "What is the capital of France?"
    ```
*   **List Existing Conversations:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --list
    ```
*   **Continue Last Conversation:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --continue "Tell me more about it"
    ```
*   **Continue Specific Conversation by Index:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --continue 1 "Explain this in detail"
    ```
*   **Continue Specific Conversation by ID:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --continue 11c9923185decc44 "Summarize our chat"
    ```

## Automatic Google Workspace Exporter & Downloader

The script automatically detects if Gemini Spark generates or references Google Workspace items in its response:
*   **Google Docs:** Automatically exported as plain text `.txt` files (e.g. `downloaded-doc-[id].txt`).
*   **Google Sheets:** Automatically exported as Excel `.xlsx` files (e.g. `downloaded-sheet-[id].xlsx`).
*   **Google Slides:** Automatically exported as PowerPoint `.pptx` files (e.g. `downloaded-slides-[id].pptx`).

These files are automatically downloaded and copied directly into your active working directory (where you executed the `node` command).

## Troubleshooting & Authentication

If the session expires or is not authenticated, the script will print an error containing `[ERROR] Oturum açılmamış!` or exit with code 1.

When this happens, you MUST automatically:
1. State the situation to the user (e.g., "Oturumunuz kapanmış veya giriş yapılmamış. Giriş ekranını açıyorum...").
2. Proactively run the following command on the user's system to launch the browser:
   ```cmd
   start chrome --remote-debugging-port=9222 --user-data-dir="C:\Users\ibrah\.gemini\config\skills\gemini-spark\chrome-profile"
   ```
3. Inform the user that Chrome has been launched on their desktop, and they should complete the login in that window.
4. Stop calling tools and wait for the user to confirm they have logged in (e.g., "giriş yaptım").
5. Once they confirm, rerun the original script query.
