# Master Guide: ELI5 Prompt Engineering Patterns, Simplification Frameworks, and AI Skill Architecture

This guide synthesizes theoretical frameworks, prompt engineering patterns, system prompt templates, visual formatting standards, and a complete SKILL.md specification for building an Explain Like I'm 5 (ELI5) AI skill.

---

## 1. Conceptual & Theoretical Foundations of AI Simplification

To effectively reduce complex technical, scientific, or abstract topics into accessible explanations, AI prompt engineering relies on established principles from cognitive science, educational psychology, and computational linguistics.

### Cognitive Load Theory (CLT)
Developed by John Sweller, Cognitive Load Theory divides working memory capacity into three types of load:
- **Intrinsic Load:** The inherent difficulty of the topic (e.g., quantum mechanics or distributed consensus algorithms).
- **Extraneous Load:** The mental effort wasted processing poor structure, jargon, or unnecessary background information.
- **Germane Load:** The productive cognitive processing dedicated to constructing mental schemas and deep understanding.

*ELI5 Engineering Principle:* Effective ELI5 prompt design minimizes extraneous load by stripping away non-essential jargon and strictly regulates intrinsic load by presenting concepts sequentially rather than simultaneously.

### Structure-Mapping Theory (SMT)
Formulated by Dedre Gentner, Structure-Mapping Theory models analogical reasoning as a structural alignment between a familiar source domain and an unfamiliar target domain.

```text
  +-----------------------+              +-----------------------+
  |     Source Domain     |  Structural  |     Target Domain     |
  |  (Familiar / Physical)|   Mapping    | (Abstract / Technical)|
  +-----------------------+ ------------>+-----------------------+
  | e.g., Toy Postal Box  | Relational   | e.g., Public Key      |
  |       & Padlocks      | Correspondence|      Cryptography     |
  +-----------------------+              +-----------------------+
```

Rather than matching individual surface attributes (e.g., "a computer is shiny like a window"), structure-mapping transfers relational networks (e.g., "a router directs packages based on addresses just like a mail distribution center").

### The Feynman Technique
Named after Nobel laureate Richard Feynman, The Feynman Technique is a 4-stage learning and simplification model:
1. **Target Selection:** Identify the precise concept to be explained.
2. **Child-Level Explanation:** Explain the concept using simple language that a 5-year-old or layperson can grasp without referencing technical jargon.
3. **Gap Identification:** Locate areas where the explanation breaks down, relies on hand-waving, or uses hidden assumptions.
4. **Refinement & Analogy Simplification:** Re-consult core principles to eliminate remaining complexities and construct a clean mental model.

### Vygotsky’s Zone of Proximal Development (ZPD) & Scaffolding
Lev Vygotsky's Zone of Proximal Development defines the distance between what a learner can understand independently and what they can achieve with guidance. ELI5 prompts use instructional scaffolding—building step-by-step conceptual ramps—to move the user from everyday knowledge to complex understanding.

### Lexical Complexity & Readability Control
Traditional readability formulas, such as Flesch-Kincaid Grade Level, Dale-Chall, and Gunning Fog, measure sentence length and syllable counts. While LLMs do not inherently calculate syllable indexes token-by-token, prompt constraints enforcing lexical and syntactic boundaries effectively lower readability scores down to elementary school grade levels (Grades 1–3).

---

## 2. Taxonomy of ELI5 Prompt Engineering Patterns

Prompt engineering for simplification leverages several distinct structural patterns cataloged in AI prompt design literature.

| Pattern Name | Core Mechanism | Primary Target Audience | Example Use Case |
| :--- | :--- | :--- | :--- |
| **Domain-Mapping Analogy** | Maps abstract relational networks to everyday physical objects. | General Public / Children | Explaining Public/Private Key Encryption using padlocks and drop-boxes. |
| **Progressive Simplification** | Generates multi-tiered outputs across age/expertise levels. | Students / Self-Learners | Explaining Machine Learning at 5yo, 15yo, and 25yo depth tiers. |
| **De-Jargonization & Substitution** | Bans specialized vocabulary and enforces a mandatory glossary. | Non-technical Business Leaders | Translating Kubernetes documentation into executive summaries. |
| **Storytelling & Narrative Scaffolding** | Embeds technical mechanics inside character-driven plots. | Young Students / Visual Learners | Explaining CPU vs. GPU architecture using factory workers and assembly lines. |
| **Interactive Socratic Gut-Check** | Uses interactive hooks and end-of-explanation reflection prompts. | Active Learners / Classroom | Explaining Inflation with a lemonade stand scenario and follow-up questions. |

---

## 3. Production-Ready ELI5 Skill Specification (SKILL.md)

### Directives & Rule Set
- **NO Unexplained Jargon:** Never use technical terms without an immediate, simple translation.
- **NO Condescending Tone:** Avoid childish babytalk ("Hello little friend!"). Speak as an intelligent adult who prefers clear language.
- **NO Wall of Text:** Paragraphs MUST NOT exceed 3 sentences. Use whitespace, bold keywords, and bullet points.
- **NO Fluff:** Omit introductory filler like "Great question!". Start directly with the explanation.

---

## 4. Specialized Prompt Templates

### System Prompt Template
```text
You are an expert educator specializing in Cognitive Load Reduction and Analogy-Based Instruction. Your objective is to explain any input topic using the "Explain Like I'm 5" (ELI5) framework.

When given a concept, document, code snippet, or question, follow these guidelines:
1. REASONING & METAPHOR MAPPING: Identify core mechanical process and map to everyday physical scenario.
2. STYLISTIC CONSTRAINTS: Target Readability Grade 4-6, Max Paragraph 3 sentences, Max Sentence 18 words. Omit unexplained jargon.
3. RESPONSE STRUCTURE:
   - 💡 Single-sentence metaphor.
   - 📖 2-paragraph narrative story.
   - ⚙️ 3-bullet real-world connection.
   - 🚀 2-sentence significance statement.
   - ❓ Quick Check reflection question.
```

---

## 5. Visual Formatting & UI/UX Guidelines

Adhere to these visual formatting rules when presenting simplified explanations:
- **Emoji Anchoring:** Use icons (💡 Metaphor, 📖 Story, ⚙️ Mechanics, 🚀 Significance, ❓ Quick Check, ⚠️ Limitation) to anchor visual scan paths.
- **Paragraph Length:** Cap paragraphs at 2–3 sentences. Ensure ample vertical whitespace.
- **Bold Keyword Emphasis:** Bold foundational terms and core actions on first mention.
- **Callout Blocks:** Highlight central metaphors or key takeaways using blockquotes.
- **Markdown Tables:** Use structured tables to display cross-domain mapping and comparisons.
