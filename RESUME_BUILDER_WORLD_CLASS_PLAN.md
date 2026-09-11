# Resume Builder World-Class Plan

This document turns the product strategy into a build-ready plan for making this the strongest possible AI resume builder.

It is written against the current codebase, especially:

- `src/services/groqService.js`
- `src/services/jobTailorService.js`
- `src/utils/resumeInsights.js`
- `src/components/builder/Editor.jsx`
- `src/components/resume/templates/*`

## Goals

We want the builder to do all of the following well:

1. Preserve full resume information when users want an editable import
2. Create polished, page-fit resumes when users want a market-ready output
3. Tailor resumes to job descriptions without overstuffing content
4. Recommend the best template based on content density, career level, and use case
5. Produce outputs that feel strong to both ATS systems and human recruiters

## Core Problem

The current system extracts and enhances content, but it still assumes that more extracted content is better visible content.

That causes bad outcomes for dense resumes:

- too many skills shown
- too many bullets
- repeated information
- poor template fit
- long-career resumes overflowing compact layouts

The fix is to separate:

1. `Master Resume`
2. `Presentation Resume`
3. `Presentation Plan`

The system should extract broadly, then decide what to show based on scenario, template capacity, and page target.

---

## Product Modes

### 1. Resume Build from Scratch

User intent:

- manually provide the information
- get writing help, formatting help, and template guidance

System behavior:

- do not aggressively invent or expand content
- rewrite summary and bullets for stronger impact
- lightly suggest skills and missing sections
- recommend templates based on entered content and role family

Best output:

- user-controlled
- polished but not over-generated

### 2. Resume Build Using Existing Resume

This mode should remain split into two submodes.

#### 2A. Extract Full Content

User intent:

- create an editable digital version of the original resume
- preserve almost everything

System behavior:

- parse faithfully
- normalize structure
- dedupe obvious skills
- do not try to fit all content into a compact template immediately

Best output:

- `masterResume`
- editable import layer

#### 2B. Analyze and Enhance Content Using AI

User intent:

- produce a strong final resume, not just a transcript of the original

System behavior:

- improve wording
- reduce clutter
- compress older roles
- cap visible skills
- select the best content for the chosen template and page budget

Best output:

- `presentationResume`
- page-fit polished output

### 3. Build Resume Using Job Description + Existing Resume

User intent:

- optimize for a specific role

System behavior:

- rank all experience, projects, and skills by relevance
- show the strongest matching evidence
- rewrite summary and bullets around the target
- prioritize ATS-safe wording and recruiter clarity

Best output:

- targeted, selective, role-matched resume

---

## Data Model

## 1. Master Resume

Purpose:

- full extracted source of truth
- broad and mostly complete

Suggested shape:

```json
{
  "personal": {
    "name": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "summary": ""
  },
  "experience": [
    {
      "id": "exp_1",
      "role": "",
      "company": "",
      "date": "",
      "startDate": "",
      "endDate": "",
      "isCurrent": false,
      "desc": "",
      "bullets": [],
      "keywords": [],
      "seniorityWeight": 0,
      "relevanceScore": 0
    }
  ],
  "education": [],
  "projects": [],
  "certifications": [],
  "awards": [],
  "languages": [],
  "volunteering": [],
  "skills": {
    "technical": [],
    "core": [],
    "soft": [],
    "rawExtracted": []
  },
  "metadata": {
    "sourceMode": "scratch | extract_full | ai_enhanced | tailor",
    "importConfidence": 0,
    "yearsExperienceEstimate": 0,
    "contentDensity": "light | medium | heavy | executive-heavy",
    "roleFamily": "tech | analyst | design | ops | finance | marketing | sales | leadership | academic | healthcare | general"
  }
}
```

## 2. Presentation Plan

Purpose:

- controls what gets shown and how much

Suggested shape:

```json
{
  "scenario": "scratch | extract_full | ai_enhanced | tailor",
  "targetPages": 1,
  "templateId": "",
  "templateDensity": "compact | balanced | spacious",
  "showSections": [
    "summary",
    "experience",
    "skills",
    "education",
    "projects"
  ],
  "skillsLimit": 12,
  "skillsStrategy": "strict_cap | grouped_cap | jd_weighted",
  "recentRolesFull": 3,
  "olderRolesCompression": "none | moderate | aggressive",
  "maxBulletsPerRecentRole": 4,
  "maxBulletsPerOlderRole": 2,
  "maxProjects": 2,
  "maxCertifications": 3,
  "summaryTargetWords": 85,
  "atsPriority": "low | medium | high",
  "toneProfile": "neutral | recruiter-strong | executive | industry-specific",
  "templateFitReason": "",
  "warnings": []
}
```

## 3. Presentation Resume

Purpose:

- final renderable content layer for templates

Suggested shape:

```json
{
  "personal": {},
  "experience": [],
  "education": [],
  "projects": [],
  "certifications": [],
  "awards": [],
  "languages": [],
  "volunteering": [],
  "skills": {
    "technical": [],
    "core": [],
    "soft": []
  },
  "generationNotes": {
    "wasCondensed": true,
    "fitTargetPages": 2,
    "excludedSections": [],
    "excludedSkillsCount": 0,
    "excludedExperienceCount": 0
  }
}
```

---

## Template Metadata

Current recommendation logic in `resumeInsights.js` is heuristic-driven. We should enrich templates with real metadata.

Each template should eventually have:

```json
{
  "id": "ats",
  "name": "ATS",
  "columns": "1",
  "graphics": "Low",
  "hasHeadshot": false,
  "recommended": true,
  "contentDensity": "compact | balanced | spacious",
  "experienceCapacity": "low | medium | high",
  "skillsCapacity": "low | medium | high",
  "summaryCapacity": "low | medium | high",
  "multiPageTolerance": "low | medium | high",
  "atsSafety": "high | medium",
  "bestForSeniority": ["entry", "mid", "senior", "executive"],
  "bestForRoles": ["tech", "analyst", "finance"],
  "styleFamily": "classic | modern | creative | executive"
}
```

### Template recommendation rules

#### For scratch mode

- default to `compact` or `balanced`
- recommend ATS-safe first
- keep visual templates lower unless content is sparse

#### For extract full content

- if content is heavy, recommend `spacious` and `high multiPageTolerance`
- warn when user selects a low-capacity template

#### For AI enhanced mode

- recommend based on target page count plus role family

#### For JD tailor mode

- ATS-safe and recruiter-clear templates should be primary
- visual creativity should be secondary to relevance and fit

---

## Prompt System

We should stop relying on one large enhancement prompt. Instead we should use prompt roles.

## Prompt Layer 1: Parser Prompt

Use for:

- `Extract Full Content`

Source:

- current `extractResumeDataVerbatim`

Purpose:

- preserve content
- create `masterResume`

### Draft Prompt

```text
You are an expert resume parser performing structure-only extraction.

Your job is to convert the resume into the requested JSON schema without rewriting, strengthening, summarizing, condensing, or inventing content.

Rules:
- Preserve original wording as closely as possible
- Keep role boundaries intact
- Keep later-page content
- Keep skills literal to the source
- Do not infer missing achievements
- Do not optimize for ATS in this step
- Do not remove content because it feels too long

Return valid JSON only.
```

## Prompt Layer 2: Resume Strategist Prompt

Use for:

- all non-verbatim generation flows

Purpose:

- create a `presentationPlan`

### Draft Prompt

```text
You are a senior resume strategist.

You are given:
- a structured master resume
- a generation scenario
- optional job description analysis
- a list of template metadata

Your task is to create a presentation plan that decides:
- target page count
- best template category
- visible skills limit
- number of recent roles to show fully
- how older roles should be compressed
- whether projects, certifications, and awards should be included

Optimize for:
- recruiter readability
- page fit
- clarity
- ATS alignment when relevant
- seniority-appropriate density

Never optimize for completeness alone.
Return JSON only.
```

## Prompt Layer 3: Summary Writer Prompt

Use for:

- scratch
- ai_enhanced
- tailor

Prompt source influence:

- image 1
- image 2

### Draft Prompt

```text
Rewrite the resume summary so it sounds precise, high-value, and professionally differentiated.

Inputs:
- master resume
- presentation plan
- optional job description analysis
- optional industry alignment target

Rules:
- target 60 to 110 words unless instructed otherwise
- avoid generic adjectives and broad filler
- emphasize specialization, credibility, and business value
- reflect the industry tone when requested
- do not invent facts
- do not repeat detailed tool lists already shown in skills

Return only the summary string.
```

## Prompt Layer 4: Experience Bullet Writer Prompt

Use for:

- ai_enhanced
- tailor

Prompt source influence:

- image 3

### Draft Prompt

```text
Transform the selected experience bullets into high-value achievement statements.

Rules:
- focus on impact, ownership, and clear contribution
- prefer action + scope + result
- use measurable outcomes when present
- if a metric is unknown, keep the bullet credible and specific without inventing numbers
- avoid responsibility-only phrasing
- avoid repeating the same opening verbs
- keep the output within the bullet limits in the presentation plan
- do not rewrite roles that are marked for compression into long bullets

Return JSON with the updated experience list only.
```

## Prompt Layer 5: Skills Curator Prompt

Purpose:

- solve the “100 skills” problem

### Draft Prompt

```text
You are curating the visible skills section of a resume.

You are given:
- the full extracted skills inventory
- the candidate's experience and projects
- the presentation plan
- optional job description analysis

Your task is to choose the visible skills that should appear in the final resume.

Rules:
- do not show all extracted skills
- respect the visible skills limit exactly
- merge overlapping skills into stronger grouped labels when appropriate
- prioritize:
  1. job-description relevance
  2. repeated evidence in experience
  3. recency
  4. specialization value
- remove weak, outdated, duplicate, or low-signal skills
- do not invent skills unless confidence is extremely high and they are strongly evidenced

Return JSON with technical/core/soft arrays only.
```

## Prompt Layer 6: ATS Tailor Prompt

Prompt source influence:

- image 4

### Draft Prompt

```text
You are optimizing a resume for both ATS systems and human recruiters.

You are given:
- the presentation resume draft
- the job description analysis
- the presentation plan

Your task is to strengthen alignment without making the resume feel stuffed, repetitive, or artificial.

Rules:
- integrate underrepresented keywords naturally
- prefer evidence-backed keywords
- improve summary, bullet wording, and skill ordering
- do not dump all JD keywords into the skills section
- do not create artificial phrasing
- preserve recruiter readability

Return JSON with only the updated fields.
```

## Prompt Layer 7: Recruiter Critic Prompt

Prompt source influence:

- image 5

Purpose:

- final quality gate

### Draft Prompt

```text
Review this resume as if you are evaluating many candidates for a competitive role.

Identify:
- weak positioning
- generic or forgettable wording
- weak achievement statements
- section clutter
- credibility concerns
- weak first-impression elements
- parts that reduce shortlist potential

Be direct and realistic.

Return JSON:
{
  "verdict": "",
  "top_issues": [],
  "section_issues": {},
  "recommended_fixes": []
}
```

## Prompt Layer 8: Recruiter Attention Test Prompt

Prompt source influence:

- image 6

Purpose:

- test the first 10 seconds

### Draft Prompt

```text
Evaluate the resume the way a recruiter would during the first 10 seconds of scanning.

Tell us:
- what stands out first
- what feels forgettable
- whether value is communicated fast enough
- whether the candidate appears credible, differentiated, and interview-worthy

Return JSON:
{
  "first_impression_score": 0,
  "what_stands_out": [],
  "what_feels_generic": [],
  "speed_of_value_assessment": "",
  "fixes_for_fast_impact": []
}
```

---

## Prompt Routing by Scenario

### Scratch

Pipeline:

1. strategist
2. summary writer
3. experience writer
4. skills curator
5. recruiter critic
6. attention test

### Extract Full Content

Pipeline:

1. parser
2. insight analyzer
3. template recommender

No aggressive rewriting by default.

### AI Enhanced

Pipeline:

1. parser
2. strategist
3. summary writer
4. experience writer
5. skills curator
6. recruiter critic
7. attention test

### JD + Existing Resume

Pipeline:

1. parser
2. JD analyzer
3. strategist
4. summary writer
5. experience writer
6. skills curator
7. ATS tailor
8. recruiter critic
9. attention test

---

## Resume Fit Rules

These rules should be hard system constraints.

## Skills

- compact template: `8 to 12`
- balanced template: `10 to 16`
- spacious template: `14 to 24`

## Experience

- recent roles: `3 to 5 bullets`
- old roles: `1 to 2 bullets` or compressed summary
- very senior resumes: allow `selected experience` + `additional experience`

## Summary

- target `60 to 110 words`

## Projects

- compact: `0 to 2`
- balanced: `1 to 3`
- spacious: `2 to 4`

## Page target

- default to `1 page` for entry and many scratch flows
- default to `2 pages` for `8+ years` or heavy imported content
- allow user override

---

## Template Recommendation Engine

Extend `getResumeInsights()` to produce:

```json
{
  "yearsExperienceEstimate": 0,
  "contentDensity": "light | medium | heavy | executive-heavy",
  "roleFamily": "",
  "projectDepth": "low | medium | high",
  "seniorityLevel": "entry | mid | senior | executive",
  "predictedPagePressure": "low | medium | high",
  "duplicateSkillCount": 0,
  "skillsOverflowRisk": "low | medium | high"
}
```

Then score templates by:

- ATS safety
- content capacity
- seniority fit
- role-family fit
- page-pressure fit
- visual style match

Also show user-facing guidance like:

- `Best for 1-page ATS resumes`
- `Best for 10+ years of experience`
- `Best for project-heavy portfolios`
- `Too compact for your current content`

---

## UX Changes

## 1. Import Intent Selection

After upload, ask:

1. `Full editable import`
2. `Polished 1-page resume`
3. `Polished 2-page resume`
4. `Tailor to job description`

## 2. Template Fit Messaging

When a user picks a template, show:

- fit score
- expected page count
- density match
- warning if content is too heavy

## 3. AI Presets

Offer:

- `Conservative`
- `Balanced`
- `Aggressive ATS`
- `Executive Polish`

## 4. Final Review Modes

Offer:

- `Recruiter Review`
- `ATS Review`
- `10-Second Scan Test`
- `Executive Polish Pass`

---

## Engineering Phases

## Phase 1: Foundation

Goal:

- separate full extraction from presentation generation

Tasks:

1. Add `masterResume` and `presentationResume` concept
2. Add `presentationPlan` schema
3. Extend `resumeInsights.js` with:
   - seniority estimate
   - content density
   - page pressure
   - duplicate-skill risk
4. Add template metadata fields

Deliverable:

- analysis layer is ready

## Phase 2: Prompt Split

Goal:

- replace one broad enhancement pass with section-specific prompt routing

Tasks:

1. keep current parser path for faithful import
2. add strategist prompt
3. add summary writer prompt
4. add experience writer prompt
5. add skills curator prompt
6. add recruiter critic prompt
7. add attention-test prompt
8. add ATS tailor prompt

Deliverable:

- prompts are modular and scenario-aware

## Phase 3: Fitting and Compression

Goal:

- make long resumes fit well

Tasks:

1. add skills caps by template density
2. add role compression rules
3. add section limits
4. add page-target fit pass
5. trim or compress automatically when overflow is predicted

Deliverable:

- dense resumes stop overloading templates

## Phase 4: Template Intelligence

Goal:

- recommend the right template automatically

Tasks:

1. add template scoring
2. add fit warnings
3. add scenario-specific template suggestions
4. connect recommendation engine to UI

Deliverable:

- better first template selection

## Phase 5: Final QA Layer

Goal:

- make output feel recruiter-tested

Tasks:

1. add recruiter critic pass
2. add first-impression pass
3. surface actionable issues to the user
4. allow one-click refinement pass

Deliverable:

- stronger final quality

---

## Concrete Ticket Backlog

### Data / Analysis

1. Create `presentationPlan` model and helpers
2. Extend `getResumeInsights()` with density and seniority signals
3. Add visible-skill-limit recommendation helper
4. Add page-pressure prediction helper

### AI / Services

5. Replace `enhanceResumeData()` with multi-pass generation flow
6. Create `buildPresentationPlan()` AI service
7. Create `curateVisibleSkills()` AI service
8. Create `rewriteSummary()` AI service
9. Create `rewriteExperienceBullets()` AI service
10. Create `critiqueResume()` AI service
11. Create `runAttentionTest()` AI service
12. Refactor JD tailoring into plan-aware flow

### Templates / Recommendation

13. Add metadata to all templates
14. Build template fit scoring engine
15. Add “recommended templates” UI after import
16. Add “too dense for this template” warning state

### UX / Editor

17. Add import-intent selector
18. Add one-page vs two-page target selection
19. Add AI strategy presets
20. Add final review panel

### QA / Metrics

21. Track visible skill count after AI generation
22. Track template switch rate after import
23. Track overflow rate by scenario
24. Track manual edits after AI generation

---

## Recommended Immediate Code Changes

Start here first:

1. Remove “add missing inferred skills” as a default rule from enhancement prompts
2. Add visible skill caps before render
3. Build `presentationPlan`
4. Add template metadata
5. Split AI enhancement into:
   - summary
   - bullets
   - skills curation
   - final critique

These five changes will create the biggest quality jump fastest.

---

## Success Criteria

We should consider this system successful when:

1. Long imported resumes no longer overflow compact templates by default
2. Visible skills are curated instead of dumped
3. JD-tailored resumes feel relevant without sounding stuffed
4. Template recommendations feel obviously smarter
5. Final resumes pass both ATS readability and recruiter scan quality

---

## Summary

The winning strategy is:

- extract everything
- understand the content
- decide what belongs
- fit it to the chosen page and template
- tailor it to scenario and JD
- critique the final output like a recruiter

That is how this becomes a world-class resume builder instead of just a resume parser with templates.
