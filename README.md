# Gemini Spark & Deep Research Skills

This repository contains two automation skills for Google Antigravity to interact with Gemini Spark on the web:

1.  **gemini-spark:** General-purpose interaction with Gemini Spark (uploading files, continuing chats, automatically downloading generated Docs, Sheets, and Slides).
2.  **gemini-deep-research:** Automatically wraps the core script with the **Deep Research / Thinking** mode activated by default.

Both skills share the same underlying Playwright core automation engine, cookies, and local Chrome profiles to avoid duplicate logins or code duplication.

## Directory Structure

*   `gemini-spark/`: Core automation skill logic and scripts.
*   `gemini-deep-research/`: Thin wrapper skill targeting the core automation script with `--deep` mode forced.
*   `setup.bat`: One-click Windows installer to deploy both skills to your global Antigravity profile (`%USERPROFILE%\.gemini\config\skills\`).

## Installation

1.  Clone this repository to your computer.
2.  Double-click `setup.bat` (or run it via Command Prompt).
3.  When the Chrome browser window opens, log in to your Google Account on `gemini.google.com`.
4.  Close the Chrome window and press any key in the installer to complete the setup.

Both skills are now registered and ready to use in Antigravity!
