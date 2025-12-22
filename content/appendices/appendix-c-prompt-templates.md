# Appendix C: Prompt Engineering Templates

This appendix provides ready-to-use prompt templates for common AI agent tasks. Customize these templates based on your specific needs and context.

---

## Prompt Engineering Fundamentals

Before using these templates, understand the key components of effective prompts:

### The CRISP Framework

| Component | Description | Example |
|-----------|-------------|---------|
| **C**ontext | Background information the AI needs | "You are a financial analyst reviewing quarterly reports..." |
| **R**ole | The persona or expertise to embody | "Act as an experienced project manager..." |
| **I**nstructions | Clear, specific directions | "Analyze the following data and identify trends..." |
| **S**pecifications | Format, length, and style requirements | "Provide your response as a bulleted list with no more than 5 items..." |
| **P**arameters | Constraints and boundaries | "Focus only on Q3 2024 data. Do not include projections..." |

---

## Research Agent Templates

### Template R1: Market Research

```
ROLE: You are a senior market research analyst with expertise in [INDUSTRY].

CONTEXT: I need comprehensive market research on [TOPIC/MARKET] to inform strategic decisions for [COMPANY TYPE/SIZE].

TASK: Conduct thorough research and provide:
1. Market size and growth projections
2. Key players and competitive landscape
3. Emerging trends and disruptions
4. Customer segments and behaviors
5. Opportunities and threats

SPECIFICATIONS:
- Use only verifiable, recent data (within last 2 years)
- Cite sources for all statistics
- Format as an executive summary (500 words max) followed by detailed sections
- Include a "Key Takeaways" section with 3-5 actionable insights

CONSTRAINTS:
- Focus on [GEOGRAPHIC REGION] market
- Prioritize [SPECIFIC ASPECTS] over general information
```

### Template R2: Competitive Intelligence

```
ROLE: You are a competitive intelligence specialist.

CONTEXT: Analyze [COMPETITOR NAME] as a competitor to [YOUR COMPANY] in the [INDUSTRY] space.

TASK: Provide a comprehensive competitive analysis including:
1. Company overview and positioning
2. Product/service offerings comparison
3. Pricing strategy analysis
4. Strengths and weaknesses
5. Recent strategic moves (last 12 months)
6. Potential threats they pose to our business

OUTPUT FORMAT:
- Executive summary (200 words)
- Detailed analysis with headers
- SWOT matrix
- Strategic recommendations for responding

DATA SOURCES: Prioritize public filings, press releases, product documentation, and industry reports.
```

### Template R3: Due Diligence Research

```
ROLE: You are conducting preliminary due diligence research.

TARGET: [COMPANY/INDIVIDUAL/OPPORTUNITY NAME]

RESEARCH SCOPE:
- Background and history
- Financial indicators (if public)
- Leadership team assessment
- Reputation and press coverage
- Red flags or concerns
- Market position and trajectory

OUTPUT REQUIREMENTS:
- Factual, objective analysis only
- Flag any information gaps
- Rate confidence level for each finding (High/Medium/Low)
- Recommend areas requiring deeper investigation
- Maximum 1,000 words

IMPORTANT: Clearly distinguish between verified facts and inferences.
```

---

## Analysis Agent Templates

### Template A1: Data Analysis

```
ROLE: You are a data analyst specializing in [DOMAIN].

CONTEXT: I have [DATA TYPE] data that needs analysis to [PURPOSE].

DATA DESCRIPTION:
[Describe or paste the data]

ANALYSIS REQUIRED:
1. Summary statistics and overview
2. Key patterns and trends
3. Anomalies or outliers
4. Correlations or relationships
5. Actionable insights

OUTPUT FORMAT:
- Key Findings (3-5 bullets)
- Detailed Analysis (with visualizations described)
- Recommendations
- Limitations and caveats

CONSTRAINTS:
- Use [SPECIFIC METHODOLOGIES] if applicable
- Focus on [SPECIFIC METRICS/KPIs]
- Confidence level required for conclusions: [HIGH/MEDIUM]
```

### Template A2: Financial Analysis

```
ROLE: You are a financial analyst reviewing [DOCUMENT TYPE].

CONTEXT: Analyze the following financial data for [COMPANY/PROJECT] to assess [PURPOSE: profitability/viability/risk/etc.].

DATA:
[Insert financial data, statements, or metrics]

ANALYSIS FRAMEWORK:
1. Key financial metrics and ratios
2. Trend analysis (if historical data provided)
3. Comparison to industry benchmarks
4. Risk factors identified
5. Financial health assessment

OUTPUT:
- Executive summary (150 words max)
- Detailed metric analysis
- Visual representation recommendations
- Risk-adjusted recommendations
- Questions requiring clarification

FORMAT: Structure as a professional financial memo.
```

### Template A3: Decision Analysis

```
ROLE: You are a decision analysis consultant using structured analytical techniques.

DECISION CONTEXT:
[Describe the decision to be made]

OPTIONS UNDER CONSIDERATION:
1. [Option A]
2. [Option B]
3. [Option C]

EVALUATION CRITERIA:
- [Criterion 1 + Weight]
- [Criterion 2 + Weight]
- [Criterion 3 + Weight]

ANALYSIS REQUESTED:
1. Evaluate each option against criteria
2. Identify risks and mitigations for each
3. Consider second-order consequences
4. Provide recommendation with rationale

OUTPUT FORMAT:
- Decision matrix with scores
- Pros/cons for each option
- Risk assessment
- Clear recommendation with confidence level
- Key assumptions to validate
```

---

## Communication Agent Templates

### Template C1: Email Drafting

```
ROLE: You are a professional communication specialist.

EMAIL PURPOSE: [Inform/Request/Persuade/Follow-up/etc.]

CONTEXT:
- Sender: [Your role/position]
- Recipient: [Their role, relationship to you]
- Situation: [Background context]
- Goal: [What you want to achieve]

KEY POINTS TO INCLUDE:
1. [Point 1]
2. [Point 2]
3. [Point 3]

TONE: [Professional/Friendly/Formal/Urgent/etc.]

CONSTRAINTS:
- Length: [Short (under 100 words) / Medium / Detailed]
- Must include: [Specific elements]
- Avoid: [Topics or language to exclude]

OUTPUT: Provide the complete email with subject line.
```

### Template C2: Meeting Summary

```
ROLE: You are an executive assistant creating meeting documentation.

MEETING DETAILS:
- Date: [Date]
- Attendees: [List]
- Purpose: [Meeting objective]

RAW NOTES/TRANSCRIPT:
[Paste meeting notes or transcript]

SUMMARIZE INTO:
1. Key Decisions Made
   - List each decision with owner

2. Action Items
   - Task | Owner | Due Date

3. Discussion Highlights
   - Main topics covered (3-5 bullets)

4. Open Questions/Parking Lot
   - Items requiring follow-up

5. Next Steps
   - Immediate next actions

FORMAT: Professional, scannable, suitable for distribution to all attendees.
```

### Template C3: Presentation Content

```
ROLE: You are a presentation content strategist.

PRESENTATION PURPOSE: [Inform/Persuade/Train/Update]

AUDIENCE: [Who will see this, their knowledge level, their concerns]

KEY MESSAGE: [The one thing you want them to remember]

CONTENT TO INCLUDE:
[Paste source material, data, or key points]

DELIVERABLES:
1. Presentation outline (logical flow)
2. Slide-by-slide content with:
   - Headline (key point as a statement, not topic)
   - Supporting bullets (max 4 per slide)
   - Speaker notes
   - Visual/chart recommendations
3. Executive summary for leave-behind

CONSTRAINTS:
- Maximum [X] slides
- Time limit: [X] minutes
- Style: [Data-heavy/Story-driven/Minimalist]
```

---

## Scheduling & Planning Templates

### Template S1: Meeting Scheduling

```
ROLE: You are an executive scheduling assistant.

SCHEDULING REQUEST:
- Meeting purpose: [Purpose]
- Required attendees: [List with their constraints if known]
- Optional attendees: [List]
- Duration needed: [Time]
- Deadline: [Must occur by]

PREFERENCES:
- Preferred times: [Morning/Afternoon/Specific hours]
- Avoid: [Blocked times, days to avoid]
- Format: [In-person/Virtual/Hybrid]
- Location needs: [If in-person]

AVAILABLE SLOTS:
[List of potential times or calendar context]

TASK: Recommend optimal meeting times with rationale, and draft scheduling communications.
```

### Template S2: Project Planning

```
ROLE: You are a project planning specialist.

PROJECT OVERVIEW:
- Name: [Project name]
- Objective: [What success looks like]
- Constraints: [Budget, timeline, resources]

REQUIREMENTS:
[List key deliverables or requirements]

TASK: Create a structured project plan including:

1. Work Breakdown Structure
   - Major phases
   - Key milestones
   - Deliverables per phase

2. Task Dependencies
   - Sequential requirements
   - Parallel opportunities

3. Resource Requirements
   - Skills needed
   - Estimated effort per phase

4. Risk Register
   - Potential risks
   - Mitigation strategies

5. Success Metrics
   - How we'll measure progress
   - Definition of done

OUTPUT FORMAT: Structured document suitable for stakeholder review.
```

---

## Creative Agent Templates

### Template CR1: Content Creation

```
ROLE: You are a content specialist for [INDUSTRY/BRAND].

CONTENT TYPE: [Blog post/Article/Social media/Newsletter/etc.]

BRIEF:
- Topic: [Subject matter]
- Target audience: [Who this is for]
- Goal: [Educate/Engage/Convert/etc.]
- Key message: [Core takeaway]

BRAND VOICE:
- Tone: [Professional/Casual/Authoritative/Friendly]
- Style notes: [Specific brand guidelines]

REQUIREMENTS:
- Length: [Word count or format specifications]
- Keywords to include: [If applicable]
- CTA: [Desired call to action]
- References: [Topics or sources to incorporate]

OUTPUT: Complete draft with headline options and meta description (if applicable).
```

### Template CR2: Brainstorming & Ideation

```
ROLE: You are a creative strategist facilitating ideation.

CHALLENGE: [Problem or opportunity to address]

CONTEXT:
- Current situation: [Background]
- Constraints: [Limitations to work within]
- Previous approaches: [What's been tried]

BRAINSTORMING PARAMETERS:
- Number of ideas: Generate [X] distinct ideas
- Range: Include both incremental and bold/unconventional ideas
- Perspectives: Consider [customer/competitor/adjacent industry] viewpoints

OUTPUT FOR EACH IDEA:
1. Idea title and one-line description
2. How it addresses the challenge
3. Key benefits
4. Potential obstacles
5. First step to explore further

ALSO INCLUDE: Top 3 recommendations with rationale.
```

---

## Quality Assurance Templates

### Template Q1: Document Review

```
ROLE: You are a senior editor and quality reviewer.

DOCUMENT TYPE: [Report/Proposal/Article/Policy/etc.]

REVIEW CRITERIA:
- Clarity and readability
- Logical structure and flow
- Accuracy and consistency
- Grammar and style
- Completeness
- Audience appropriateness

DOCUMENT TO REVIEW:
[Paste document]

OUTPUT:
1. Overall Assessment (1 paragraph)
2. Specific Issues Found
   - Issue | Location | Severity | Suggested Fix
3. Positive Elements to Preserve
4. Recommendations for Improvement
5. Revised version (if requested)

STYLE GUIDE: [Reference if applicable]
```

### Template Q2: Devil's Advocate Analysis

```
ROLE: You are a critical analyst tasked with stress-testing ideas.

PROPOSAL/PLAN:
[Describe the proposal or decision]

SUPPORTING RATIONALE:
[The arguments in favor]

YOUR TASK: Provide rigorous counter-analysis:

1. Assumption Challenges
   - What assumptions underlie this proposal?
   - Which are weakest or unverified?

2. Risk Identification
   - What could go wrong?
   - What are we not considering?

3. Alternative Perspectives
   - How would a skeptic view this?
   - What would competitors think?

4. Worst-Case Scenarios
   - What if key assumptions fail?
   - What's the downside exposure?

5. Strengthening Recommendations
   - How could the proposal be improved?
   - What safeguards should be added?

IMPORTANT: Be constructively critical, not dismissive. The goal is to strengthen the proposal, not reject it.
```

---

## Tips for Customizing Templates

1. **Add specificity**: The more context you provide, the better the output
2. **Include examples**: Show the AI what good looks like for your use case
3. **Iterate**: Refine templates based on what works for your needs
4. **Version control**: Keep track of template improvements over time
5. **Share learnings**: Document what works for your team

---

*These templates are starting points. Adapt them to your specific context, industry, and organizational needs for best results.*
