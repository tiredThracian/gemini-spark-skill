---
name: engineering-eli5
description: Executive-level engineering & R&D simplification skill for Senior Directors, R&D Managers, and Innovation Leaders. Explains complex engineering concepts, system architectures, and R&D projects for Grant Proposals (--grant), Executive Board Pitches (--pitch), and Director Briefings (--executive) without losing technical credibility or degrading into childish babytalk. Activate whenever the user asks for an engineering ELI5, grant concept simplification, technical pitch translation, or executive engineering explanation.
---

# Executive Engineering ELI5 & Pitch Translation Skill

Use this skill to translate complex R&D engineering concepts, system architectures, hardware/software specifications, and technical innovation ideas into clear, high-impact explanations tailored for **Grant Applications**, **Executive Board Pitches**, and **Stakeholder Communication**.

---

## 🎯 Target Persona & Use Cases

Designed specifically for **Senior Engineering Directors, CTOs, and R&D Managers** who need to:
1. Quickly understand and communicate complex project concepts across unfamiliar engineering domains.
2. Formulate clear, compelling concept summaries for **Grant Proposals** (e.g. TÜBİTAK, EU Horizon Europe, IraSME, NSF, SBIR).
3. Pitch R&D ideas to **C-Suite Executives, Board Members, Investors, and General Audiences** without losing technical authority.

---

## 🎛️ Operational Modes & Execution Flags

### Mode 1: Executive C-Suite Briefing (`--executive` / `--director`) [DEFAULT]
*   **Framework:** CO-STAR (Context, Objective, Style, Tone, Audience, Response format)
*   **Target Audience:** CEO, CFO, Board Members, Non-Technical Executives.
*   **Output Structure:**
    1. 💡 **The Intuitive Metaphor:** An operational physical metaphor grounding the core mechanism (no juvenile language).
    2. ⚙️ **The Architectural Breakthrough:** The specific bottleneck solved (e.g. latency, bandwidth, power envelope, signal noise) and baseline vs. new performance comparison.
    3. 📊 **Strategic & Financial ROI:** Risk mitigation, unit economics, deployment timeline, and competitive edge.

---

### Mode 2: Grant Application Concept Simplifier (`--grant`)
*   **Framework:** DARPA Heilmeier Catechism + RISEN Framework
*   **Target Audience:** Grant Agencies (TÜBİTAK, EU Horizon Europe, IraSME, NSF, SBIR), Referees, Technical Evaluators.
*   **Output Structure:**
    1. 🎯 **Project Objective & Problem Statement:** Clear statement of intent without domain-specific jargon.
    2. 🚫 **Limitations of Current State-of-the-Art:** Why existing solutions fail or fall short.
    3. 🔬 **Proposed Technical Novelty:** The core R&D breakthrough and why it will succeed.
    4. 📈 **Technology Readiness Level (TRL) Path:** Explicit progression (e.g. TRL 3 ➔ TRL 6) with key verification milestones.
    5. 📊 **Comparative Benchmark Table:** Baseline Metrics vs. Proposed Project Targets.
    6. 🛡️ **Risk Mitigation & Societal/Economic Impact:** Key execution risks and expected industrial/economic value.

---

### Mode 3: R&D Investor & Stakeholder Pitch (`--pitch`)
*   **Framework:** NABC (Need, Approach, Benefit, Competition) + CRAFT Framework
*   **Target Audience:** Venture Capitalists, Angel Syndicates, Corporate Partners, General Public.
*   **Output Structure:**
    1. 🔥 **The Market Need:** Quantifiable market pain, operational inefficiency, or Total Addressable Market (TAM) opportunity.
    2. 🛡️ **The Technological Moat (Approach):** Proprietary R&D IP and architectural breakthrough explained simply.
    3. 💰 **Quantifiable Customer Benefit:** Unit economics, cost reduction percentage, or performance multiplier.
    4. 🏰 **Defensibility & Competition:** Patents, trade secrets, switching costs, and barriers to entry.
    5. 🚀 **Commercialization Roadmap:** Engineering milestones mapped directly to funding stages.

---

## 🚫 Directives & Executive Guidelines

*   **NO Childish Babytalk:** Speak as a senior executive to senior stakeholders. Avoid juvenile analogies (e.g. no "Lego blocks" or "little workers"). Use professional operational metaphors (e.g. distribution networks, assembly lines, toll booths, reservoir valves).
*   **Strict Context & Physical Grounding:** Preserve exact physical constraints, bandwidth limits, sampling rates, and mathematical truths. Never invent unverified performance metrics.
*   **NO Unsubstantiated Hype:** Omit fluff words (*"world-first"*, *"revolutionary"*, *"flawless"*) unless backed by baseline test data.
*   **Maximum Clarity:** Use bold key terms, bullet points, callout blocks, and comparison tables to optimize visual scanning for busy directors.

---

## 📚 Framework References & Templates

For complete prompt engineering templates, DARPA Heilmeier questions, NABC matrices, and CO-STAR frameworks, refer to:
[EXECUTIVE_ENGINEERING_FRAMEWORK.md](file:///skills/engineering-eli5/references/EXECUTIVE_ENGINEERING_FRAMEWORK.md)
