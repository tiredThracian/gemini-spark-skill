# 🏛️ Thracian Skills — Antigravity Agent Skills Collection

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Antigravity Ready](https://img.shields.io/badge/Antigravity-Thracian%20Skills-purple.svg)](https://github.com/tiredThracian/thracian-skills)

**Thracian Skills** is a general-purpose monorepo collection of modular, production-ready agent skills for **Google Antigravity (AGY)** agents. You can install **all skills** at once or select **individual skills** on demand.

---

## 📂 Repository Structure

```text
thracian-skills/
├── skills/
│   ├── eli5/                      <-- General Explain Like I'm 5 Skill
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── ELI5_RESEARCH_GUIDE.md
│   ├── engineering-eli5/          <-- Executive Engineering & Grant ELI5 Skill
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── EXECUTIVE_ENGINEERING_FRAMEWORK.md
│   ├── gemini-spark/              <-- Gemini Spark Automation Skill
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       ├── index.js
│   │       └── package.json
│   └── [future-skills...]/        <-- Additional skills added over time
├── setup.bat                      <-- Installer (All skills vs Single skill)
├── DEVELOPMENT_REPORT.md
└── README.md
```

---

## 📦 Available Skills

| Skill Name | Description | Path |
| :--- | :--- | :--- |
| **`engineering-eli5`** | Executive-level engineering simplification skill for Senior Directors, R&D Managers, and Innovation Leaders. Translates complex R&D projects for **Grant Proposals** (`--grant`), **Executive Board Pitches** (`--pitch`), and **C-Suite Briefings** (`--executive`). | [`skills/engineering-eli5/SKILL.md`](file:///skills/engineering-eli5/SKILL.md) |
| **`eli5`** | Explains complex technical, scientific, financial, or academic topics in crystal-clear "Explain Like I'm 5" terms using cross-domain analogies, cognitive load reduction, progressive depth tiers (`--child`, `--beginner`, `--progressive`), and zero jargon. | [`skills/eli5/SKILL.md`](file:///skills/eli5/SKILL.md) |
| **`gemini-spark`** | Advanced Playwright automation engine for Google Gemini Spark (multi-turn context, multi-account support, CDP parallel execution, verbatim responses, batch deletion, workspace file exports). | [`skills/gemini-spark/SKILL.md`](file:///skills/gemini-spark/SKILL.md) |

---

## ⚡ Installation Options

### 1. One-Click Windows Installer (`setup.bat`)

Clone the repository and run `setup.bat`:

```cmd
git clone https://github.com/tiredThracian/thracian-skills.git
cd thracian-skills
```

*   **Install ALL Skills**:
    ```cmd
    setup.bat
    ```
*   **Install a SINGLE Skill (e.g., `engineering-eli5`, `eli5`, or `gemini-spark`)**:
    ```cmd
    setup.bat engineering-eli5
    setup.bat eli5
    setup.bat gemini-spark
    ```
*   **List All Available Skills**:
    ```cmd
    setup.bat list
    ```

---

### 2. Manual / Selective Installation

To install only a specific skill manually, copy its folder from `skills/<skill_name>` to your local Antigravity config directory:

```powershell
# Copy Executive Engineering ELI5 skill
Copy-Item -Path "skills/engineering-eli5" -Destination "$env:USERPROFILE\.gemini\config\skills\engineering-eli5" -Recurse -Force

# Copy General ELI5 skill
Copy-Item -Path "skills/eli5" -Destination "$env:USERPROFILE\.gemini\config\skills\eli5" -Recurse -Force

# Copy Gemini Spark skill
Copy-Item -Path "skills/gemini-spark" -Destination "$env:USERPROFILE\.gemini\config\skills\gemini-spark" -Recurse -Force
```

---

## ➕ Adding New Skills

To contribute or add a new skill to **Thracian Skills**:
1. Create a new directory under `skills/<your-skill-name>/`.
2. Add a `SKILL.md` file containing instructions and metadata.
3. If helper scripts or Node packages are required, place them inside `skills/<your-skill-name>/scripts/`.
4. Run `setup.bat <your-skill-name>` to verify local deployment.

---

## 📄 License

MIT License. Developed for Google Antigravity Agentic Workflows.
