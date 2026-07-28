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
node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js [--new] [--continue <index_or_id>] [--file "path/to/file"] [--list] "Your query here"
```

### Examples
*   **Default Multi-Turn Query (Continues Active Conversation):**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js "What is the capital of France?"
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js "What is its population?"  # Automatically continues previous context!
    ```
*   **Start a Fresh Conversation Task (`--new`):**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --new "Let's start a brand new topic on quantum mechanics."
    ```
*   **List Existing Conversations:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --list
    ```
*   **Switch to / Continue Specific Conversation by Index:**
    ```bash
    node C:\Users\ibrah\.gemini\config\skills\gemini-spark\scripts\index.js --continue 1 "Explain this in detail"
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

If the session expires or is not authenticated, the script will print an error containing `[ERROR] Oturum açılmamış!` or exit with code 1.
