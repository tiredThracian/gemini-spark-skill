---
name: eli5
description: Explains complex technical, scientific, financial, or academic topics in crystal-clear "Explain Like I'm 5" terms using cross-domain analogies, cognitive load reduction, progressive depth tiers, and zero jargon. Activate whenever the user asks to explain something simply, explain like I'm 5, ELI5, make a topic easy to understand, or simplify a complex concept.
---

# ELI5 (Explain Like I'm 5) Skill

Use this skill to transform complex, technical, academic, financial, or abstract concepts into intuitive, accessible explanations that anyone can understand instantly.

---

## 🎯 Core Operating Principles

1. **Cognitive Load Reduction:** Strip away extraneous technical jargon and present concepts sequentially.
2. **Structure-Mapping Theory (SMT):** Map relational networks from everyday physical domains (e.g. playgrounds, kitchen recipes, post offices, toy blocks) to abstract target concepts.
3. **Feynman Technique Alignment:** Eliminate hand-waving and hidden assumptions, speaking with respectful clarity without resorting to condescending baby talk.

---

## 📋 5-Stage Output Formatting Layout

Structure every ELI5 response using this clean 5-part visual layout:

1. 💡 **The One-Sentence Metaphor:** A single, vivid sentence framing the entire concept through a familiar physical scenario.
2. 📖 **The Story/Analogy:** A 2 to 3 paragraph narrative explaining how the mechanics operate in the metaphor. (Max 3 sentences per paragraph).
3. ⚙️ **How It Actually Works (The Bridge):** Connect the analogy back to the real-world concept in 3 to 4 bullet points, translating essential terms.
4. 🚀 **Why It Matters:** A short 2-sentence summary highlighting the real-world significance or practical application.
5. ❓ **Quick Check:** A single, friendly reflection question allowing the reader to verify their mental model.

---

## 🚫 Directives & Strict Constraints

*   **NO Unexplained Jargon:** Never use technical terms (*latency*, *epigenetics*, *hash function*, *derivative*) without an immediate plain-language translation.
*   **NO Condescending Tone:** Avoid childish greetings ("Hello little friend!"). Address the user as an intelligent person who prefers simple language.
*   **NO Wall of Text:** Paragraphs MUST NOT exceed 3 sentences. Use whitespace, bold keywords, and emoji anchors.
*   **NO Conversational Fluff:** Omit filler like *"Great question!"* or *"I'd love to explain that to you!"*. Start directly with the 💡 metaphor.
*   **Max Sentence Length:** Keep sentences under 18 words. Target Grade 4–6 readability.

---

## 🎛️ Execution Flags & Modes

Support the following flags if specified or implied by the prompt:

*   **`--child`** *(Default ELI5)*: Focus purely on physical analogies and simple stories (Ages 5–8 level).
*   **`--beginner`**: Explain at a High School level (Ages 14–16), introducing 2–3 foundational terms with plain-English definitions in parentheses.
*   **`--progressive` / `--expert`**: Output a 3-tier breakdown:
    1. *Level 1 (5-Year-Old Playground Level)*
    2. *Level 2 (High School Beginner Level)*
    3. *Level 3 (Practitioner / College Mechanical Level)*
*   **`--analogy-only`**: Provide a Structure-Mapping comparison table and a single story without extra background text.

---

## 📚 Deep Research & Theoretical References

For comprehensive theoretical foundations (Cognitive Load Theory, Structure-Mapping Theory, Feynman Framework), system prompt templates, and specialized code/math simplification guides, refer to:
[ELI5_RESEARCH_GUIDE.md](file:///skills/eli5/references/ELI5_RESEARCH_GUIDE.md)
