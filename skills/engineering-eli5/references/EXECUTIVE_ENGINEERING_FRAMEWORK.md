# Strategic Prompt Engineering Frameworks for Executive Engineering ELI5, Grant Simplification, and R&D Investor Pitches

Engineering leaders often face a fundamental communication challenge: translating complex R&D innovations—such as wideband channelizer architectures, visual-inertial navigation algorithms, or thermal vision super-resolution models—into clear, persuasive narratives for non-technical stakeholders, grant evaluators, and investment committees.

When relying on Large Language Models (LLMs) for technical translation, generic prompts like "explain this simply" frequently result in two failure modes: juvenile over-simplifications that strip out technical value, or dense jargon-laden summaries that fail to communicate commercial or strategic impact.

This guide provides research-backed prompt engineering frameworks, operational guidelines, production-ready templates, and a complete SKILL.md specification designed for Senior Engineering Directors.

---

## 1. Research & Analysis of Prompt Engineering Frameworks

```text
                       +-----------------------------------+
                       |    RAW R&D / ENGINEERING SPECS    |
                       +-----------------------------------+
                                         |
            +----------------------------+----------------------------+
            |                            |                            |
            v                            v                            v
   [EXECUTIVE ELI5]            [GRANT SIMPLIFICATION]        [INVESTOR PITCH]
  Framework: CO-STAR           Framework: HEILMEIER + RISEN   Framework: NABC + CRAFT
  Audience: C-Suite/Board      Audience: Evaluators/Referees  Audience: VCs/Angels
  Focus: Strategic ROI         Focus: Scientific Novelty,    Focus: Market Moat,
  & Risk Abstraction           TRL & Public Impact            Unit Economics
```

### Framework Comparison Matrix

| Framework | Core Elements | Best Fit Domain Use Case | Primary Advantage |
| :--- | :--- | :--- | :--- |
| **CO-STAR** | Context, Objective, Style, Tone, Audience, Response format | Executive Engineering ELI5 | Guarantees executive-level tone and audience alignment. |
| **HEILMEIER + RISEN** | Role, Instruction, Steps, End Goal, Narrowing / Heilmeier Questions | Grant Application Simplification | Prevents technical hallucinations and enforces strict compliance. |
| **NABC + CRAFT** | Need, Approach, Benefit, Competition / Context, Role, Action, Format, Target | R&D Investor Pitch Translation | Focuses output on action-oriented value propositions & tech moats. |

---

## 2. Domain-Specific Adaptation Strategies

### 2.1 Executive Engineering ELI5 (Explain Like I'm Executive)

#### Failure Mode of Standard "ELI5"
Standard ELI5 prompts use child-like metaphors (e.g., comparing field-programmable gate arrays to Lego blocks), which trivialize engineering efforts and omit critical performance tradeoffs, bandwidth metrics, and cost implications.

#### The 3-Tier Executive Simplification Model
1. **The Intuitive Analogy:** A functional operational metaphor that grounds the core mechanism without juvenile language.
2. **The Architectural Bottleneck & Solution:** The specific physical or algorithmic constraint solved (e.g., latency, power envelope, signal noise) and how it was overcome.
3. **Strategic & Financial ROI:** The business value—risk mitigation, unit economics, deployment speed, or competitive defense.

---

### 2.2 Grant Application Concept Simplification

#### Bridging Scientific Rigor and Evaluator Clarity
Grant agencies (e.g., TÜBİTAK, EU Horizon Europe, IraSME, NSF, SBIR) assign referees who possess technical backgrounds but may not be specialists in the exact niche. Proposals must convey scientific novelty while demonstrating low technical execution risk.

#### Integration of the DARPA Heilmeier Catechism
1. **Objectives:** What are you trying to do? (No jargon)
2. **Current State:** How is it done today, and what are the limitations of current practice?
3. **Novelty:** What is new in your approach, and why will it succeed?
4. **Significance:** Who cares? If successful, what difference does it make?
5. **TRL Progression & Risks:** What are the risks, Technology Readiness Level (TRL) transitions, and midterm checks?

---

### 2.3 R&D Investor Pitch Translation

#### Translating IP into Commercial Value
Investors evaluate market opportunity, defensibility, unit economics, and team capability. Prompts must translate engineering specifications (e.g., channel capacity, frame rates, power consumption) into market metrics (TAM/SAM, margin expansion, customer switching costs).

#### Integration of the NABC Framework
1. **Need:** The high-value market problem or operational inefficiency.
2. **Approach:** The proprietary R&D breakthrough (the technological moat).
3. **Benefit:** Quantifiable ROI, cost reduction, or performance multiplier for the customer.
4. **Competition:** The defensible moat (patents, trade secrets, data network effects).
