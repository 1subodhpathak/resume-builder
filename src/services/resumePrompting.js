import { createPresentationPlan } from '../utils/presentationPlan';
import { getResumeInsights } from '../utils/resumeInsights';
import { mergeVolunteeringIntoExperience } from '../utils/volunteeringExperience';

const BASE_SCHEMA = `{
  "personal": { "name": "", "email": "", "phone": "", "location": "", "summary": "", "title": "", "linkedin": "", "github": "", "website": "", "portfolio": "" },
  "experience": [{ "id": 1, "role": "", "company": "", "location": "", "employmentType": "", "date": "", "desc": "" }],
  "education": [{ "id": 1, "degree": "", "specialization": "", "school": "", "grade": "", "date": "" }],
  "skills": { "technical": [], "soft": [], "core": [] },
  "projects": [{ "id": 1, "name": "", "desc": "", "url": "", "repositoryUrl": "" }],
  "certifications": [{ "id": 1, "name": "", "issuer": "", "date": "", "credentialId": "", "credentialUrl": "", "expiryDate": "" }],
  "languages": [{ "id": 1, "name": "", "level": "" }],
  "awards": [{ "id": 1, "name": "", "issuer": "", "date": "" }],
  "volunteering": [{ "id": 1, "role": "", "org": "", "date": "", "desc": "" }]
}`;

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const dedupeStrings = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const text = typeof item === 'string' ? item.trim() : '';
    if (!text) return false;

    const key = text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const splitLines = (value = '') =>
  String(value)
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

const trimSummaryToWords = (summary = '', maxWords = 65) => {
  const words = String(summary).trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return String(summary || '').trim();
  return `${words.slice(0, maxWords).join(' ').replace(/[,:;-\s]+$/, '')}.`;
};

const capSkills = (skills = {}, skillsLimit = 14) => {
  const technicalCap = Math.max(6, Math.round(skillsLimit * 0.6));
  const coreCap = Math.max(3, Math.round(skillsLimit * 0.25));
  const softCap = Math.max(2, skillsLimit - technicalCap - coreCap);

  const technical = dedupeStrings(skills.technical).slice(0, technicalCap);
  const used = new Set(technical.map((item) => item.toLowerCase()));

  const takeDistinct = (items = [], cap = 0) =>
    dedupeStrings(items).filter((item) => {
      const key = item.toLowerCase();
      if (used.has(key)) return false;
      used.add(key);
      return true;
    }).slice(0, cap);

  return {
    technical,
    core: takeDistinct(skills.core, coreCap),
    soft: takeDistinct(skills.soft, softCap),
  };
};

const capExperience = (experience = [], plan) =>
  normalizeArray(experience).map((item, index) => {
    const cap = index < plan.recentRolesFull
      ? plan.maxBulletsPerRecentRole
      : plan.maxBulletsPerOlderRole;

    const lines = splitLines(item?.desc).slice(0, cap);

    return {
      ...item,
      desc: lines.join('\n'),
    };
  });

const capEntryList = (items = [], cap = 0) => normalizeArray(items).slice(0, Math.max(0, cap));

const buildSharedPromptContext = (resumeData, mode) => {
  const insights = getResumeInsights(resumeData);
  const plan = createPresentationPlan({ resumeData, mode });

  return {
    insights,
    plan,
  };
};

export const normalizeResumeDataForDelivery = (resumeData = {}, options = {}) => {
  const mode = options.mode || 'upload';
  const experienceData = mergeVolunteeringIntoExperience(resumeData);
  const { plan } = buildSharedPromptContext(experienceData, mode);

  return {
    ...experienceData,
    personal: {
      ...experienceData.personal,
      summary: trimSummaryToWords(experienceData?.personal?.summary, plan.summaryTargetWords),
    },
    experience: options.preserveExperienceDetails
      ? normalizeArray(experienceData?.experience)
      : capExperience(experienceData?.experience, plan),
    skills: capSkills(experienceData?.skills, plan.skillsLimit),
    projects: capEntryList(experienceData?.projects, plan.maxProjects),
    certifications: capEntryList(experienceData?.certifications, plan.maxCertifications),
  };
};

const buildEnhancementDirectives = ({ insights, plan, mode }) => `
Resume strategy:
- Treat this as a ${mode === 'tailor' ? 'targeted ATS-and-recruiter' : 'recruiter-first'} resume rewrite, not a raw extraction.
- Optimize for ${plan.targetPages} page(s) and keep content scoped to what fits naturally in that space.
- Candidate seniority: ${insights.seniorityLevel}; role family: ${insights.roleFamily}; content density: ${insights.contentDensity}.
- Keep the first 10 seconds strong: clear positioning, credible achievements, sharp specialization, no generic filler.

Content shaping rules:
- Never dump every extracted skill into the final resume. Curate only the strongest, most relevant, non-duplicate skills.
- Keep at most ${plan.skillsLimit} total skills across technical, core, and soft skills combined.
- Prefer concrete tools, platforms, methods, and domain skills over vague descriptors.
- Use up to ${plan.maxBulletsPerRecentRole} bullets for recent roles and up to ${plan.maxBulletsPerOlderRole} bullets for older roles.
- Keep only the most relevant ${plan.maxProjects} project(s) and ${plan.maxCertifications} certification(s).
- Summary target length: about ${plan.summaryTargetWords} words.

Writing quality rules:
- Replace broad, weak, repetitive language with precise, achievement-driven phrasing.
- Make each bullet feel intentional, credible, and interview-worthy.
- If metrics are missing, improve specificity and business relevance without inventing numbers.
- Do not invent employers, dates, titles, projects, degrees, or achievements.
- Deduplicate repeated ideas, overlapping skills, and near-identical bullets.
`;

const buildReviewerQualityBar = ({ mode, plan }) => `
Recruiter quality bar:
- Evaluate the resume the way a strong recruiter would during the first 10 seconds of scanning.
- Remove anything that feels generic, padded, repetitive, forgettable, outdated, or low-signal.
- Make the final result feel polished, modern, competitive, and credible at a professional level.
- Keep positioning sharp so the candidate sounds specialized instead of interchangeable.
- Make sure the content still fits naturally within about ${plan.targetPages} page(s); do not create layout overflow through unnecessary volume.
- ${mode === 'tailor'
    ? 'Blend ATS keywords in naturally so the resume performs better in screening without feeling stuffed or artificial.'
    : 'Optimize for recruiter clarity first, while still keeping ATS-friendly terminology where it is clearly relevant.'}
`;

const buildSectionStrategyGuidance = (plan) => {
  const strategies = Array.isArray(plan.sectionStrategies) ? plan.sectionStrategies : [];
  if (!strategies.length) return '';

  return `
Section strategy:
${strategies.map((item) => `- ${item.label}: ${String(item.action || 'keep').toUpperCase()} because ${item.reason}`).join('\n')}

Decision rules:
- If a section says KEEP, preserve the current scope unless light cleanup is needed.
- If a section says TRIM, reduce volume and keep only the highest-signal content that fits the page target.
- If a section says REWRITE, improve positioning and phrasing while keeping the same factual truth.
`;
};

const truncatePromptText = (value = '', maxChars = 4000) => String(value || '').slice(0, maxChars);

export const buildTextVariationPrompt = (currentText, contextType, options = {}) => {
  const jobTitle = options.jobTitle || 'Professional';
  const jdText = truncatePromptText(options.jdText || '', 3000);
  const focusLabel = options.focusLabel || '';
  const focusReason = options.focusReason || '';
  const targetTemplate = options.targetTemplate || '';
  const roleFamily = options.roleFamily || '';
  const seniorityLevel = options.seniorityLevel || '';
  const targetPages = options.targetPages || '';

  return `
You are an elite resume writer doing a high-judgment improvement pass on one part of a resume.

Context:
- Resume section: ${contextType}
- Candidate target role: ${jobTitle}
${roleFamily ? `- Role family: ${roleFamily}` : ''}
${seniorityLevel ? `- Seniority level: ${seniorityLevel}` : ''}
${targetTemplate ? `- Current template: ${targetTemplate}` : ''}
${targetPages ? `- Target layout: about ${targetPages} page(s)` : ''}
${focusLabel ? `- Specific focus: ${focusLabel}` : ''}
${focusReason ? `- Why this text was selected: ${focusReason}` : ''}
${jdText ? `- A target job description is available and should shape wording where truthfully supported.` : ''}

Your job:
- Provide exactly 3 distinct, highly professional, ATS-aware variations of the text.
- Strengthen clarity, credibility, specificity, and recruiter impact.
- Replace responsibility-heavy phrasing with stronger ownership and achievement framing when the source supports it.
- Remove filler, repetition, weak transitions, and low-value corporate wording.
- If metrics are missing, improve specificity and business relevance without inventing numbers.
- Preserve truthfulness. Do not invent companies, tools, responsibilities, achievements, or qualifications.
- If the original text contains multiple bullets or separate lines, preserve them as separate bullets. Do not collapse them into one paragraph.
- Format bullet lists with a bullet symbol (•) and newline separators.
- Do not use markdown outside the JSON structure.
${jdText ? '- Where appropriate, naturally incorporate relevant role terminology from the job description without keyword stuffing.' : ''}

Return ONLY a valid JSON object matching this schema:
{
  "variations": [
    "Variation 1 text here...",
    "Variation 2 text here...",
    "Variation 3 text here..."
  ]
}

${jdText ? `Target Job Description:
"${jdText}"` : ''}

Original Text:
"${currentText}"
`;
};

export const buildResumeExtractionPrompt = (rawText, { verbatim = false } = {}) => {
  if (verbatim) {
    return `
You are an expert resume parser performing STRUCTURE-ONLY extraction.

Your job is to map the resume into the JSON schema WITHOUT rewriting, improving, summarizing, correcting, or adding anything.

Critical rules:
- Preserve the candidate's original wording as closely as possible.
- Do NOT strengthen bullet points.
- Do NOT improve grammar.
- Do NOT add inferred skills, projects, companies, degrees, achievements, or missing details.
- Do NOT split one role into multiple roles unless the source clearly shows multiple separate jobs.
- Do NOT create extra company entries from bullet points.
- If one experience entry has many bullet points, keep them together in the SAME "desc" string separated by "\\n".
- Keep capitalization and phrasing from the source wherever possible.
- Only populate fields that are clearly present in the source.
- If a field is missing, use "" or [].

Extra extraction guidance:
- "summary" should contain only the summary/objective/profile text from the resume, not invented text.
- If the resume has a separate "FUNCTIONAL AREAS" or expertise section, map it into skills/core rather than summary.
- If the resume contains a later "Professional Summary" heading that is actually career highlights or achievement bullets, do not let it swallow unrelated sections or duplicate later work experience entries.
- "skills" arrays should only contain skills literally present in the source text.
- Prefer grouping generic competency words into "core" and interpersonal skills into "soft" only when clearly listed that way; otherwise keep concrete tools/technologies in "technical" and place remaining listed skills in "core".
- For experience and projects, preserve bullet order.
- For awards, certifications, education, and volunteering, create one object per real entry from the source and do not duplicate lines across multiple objects.
- Process the full resume text, including later pages and the final education section.

Return ONLY valid JSON matching this schema:
${BASE_SCHEMA}

Resume Text:
${rawText}
`;
  }

  return `
You are an expert resume parser. Extract the following information from the text below and return it as a VALID JSON object matching this schema exactly.

Do not add markdown formatting.
Process the full resume text, including later pages and final education sections.

Important parsing guidance:
- Section headings may appear as SUMMARY, PROFESSIONAL SUMMARY, FUNCTIONAL AREAS, TECHNICAL SKILLS, WORK EXPERIENCE, and EDUCATION.
- "FUNCTIONAL AREAS" should be treated as skill/expertise content, not summary text.
- Keep each work experience entry grouped correctly with its own company, title, dates, and bullets.
- Do not drop entries from later pages.
- Do not merge multiple jobs into one.
- Extract skills faithfully, but do not duplicate the same skill across multiple arrays.

Return ONLY valid JSON matching this schema:
${BASE_SCHEMA}

Resume Text:
${rawText}
`;
};

export const buildResumeEnhancementPrompt = (jsonData, options = {}) => {
  const mode = options.mode || 'upload';
  const { insights, plan } = buildSharedPromptContext(jsonData, mode);

  return `
You are an elite resume strategist specializing in recruiter-quality, ATS-aware resumes.

Enhance the resume content while keeping the EXACT JSON schema unchanged.

${buildEnhancementDirectives({ insights, plan, mode })}
${buildReviewerQualityBar({ mode, plan })}
${buildSectionStrategyGuidance(plan)}

Section-by-section instructions:
1. Professional Summary
- Rewrite the summary so it sounds specialized, modern, and high-value.
- Reflect the candidate's strongest niche and level of experience.
- Avoid generic phrases that could describe anyone.
- Derive positioning from the strongest repeated evidence across the candidate's roles, projects, skills, and achievements rather than merely polishing the existing summary.
- If the original summary is weak or generic, rebuild it around the candidate's supported specialization, scope, and professional value.

2. Experience
- Rewrite each role's bullet points using strong action, ownership, specificity, and outcome.
- Return bullet points as ONE STRING separated by "\\n".
- Prioritize the most valuable and role-relevant bullets instead of preserving every original bullet.
- Older or less relevant roles may be condensed.
- Materially improve weak bullets. Do not return the source sentence with only synonyms, capitalization changes, or reordered fragments.
- Build each bullet from the strongest supported combination of action, scope, stakeholder, method, purpose, and outcome.
- When a source bullet is sparse, sharpen its ownership, purpose, and professional relevance using facts elsewhere in the same role; do not invent metrics, tools, responsibilities, or results.
- Consolidate overlapping responsibility statements into a stronger contribution-oriented bullet when doing so preserves all important evidence.
- Use vocabulary appropriate to the candidate's demonstrated role family and seniority, even when the source uses weak or informal wording.

3. Projects
- Keep only the strongest, resume-worthy projects.
- Explain technologies, scope, and outcome succinctly.

4. Skills
- Curate, deduplicate, and prioritize.
- Add missing skills only when they are strongly supported by the existing resume content.
- Do not create inflated laundry lists.

5. ATS and recruiter quality
- Use relevant industry terminology naturally.
- Improve clarity, professionalism, credibility, and first-impression strength.
- Make the profile feel competitive for the candidate's likely target role.
- Infer the most credible likely role direction from the resume evidence and optimize consistently for that direction; do not produce a collection of disconnected generic rewrites.

6. Truthfulness
- Do not invent companies, dates, degrees, tools, or quantified achievements.
- Improve language, structure, and prioritization only.

Output Rules:
- Return ONLY valid JSON.
- No explanation.
- No markdown.
- Keep the schema exactly the same.
- Before returning JSON, silently compare the draft with the source. Rewrite any weak summary or bullet that remains substantially unchanged when the available evidence supports a more strategic presentation.

Candidate Resume JSON:
${JSON.stringify(jsonData, null, 2)}
`;
};

export const buildJobDescriptionAnalysisPrompt = (jdText) => `
Analyze this job description for resume tailoring. Return ONLY valid JSON.

Schema:
{
  "target_title": "",
  "mandatory_technical_skills": [],
  "mandatory_soft_skills": [],
  "core_responsibilities": [],
  "required_qualifications": [],
  "preferred_qualifications": [],
  "tools_and_platforms": [],
  "business_outcomes": [],
  "industry_keywords": [],
  "tone_profile": "",
  "seniority_hint": "",
  "must_have_signals": []
}

Instructions:
- Read the complete job description and extract the strongest technical requirements, business themes, repeated terminology, expected outcomes, tools, and qualifications.
- Clearly separate required qualifications from preferred or nice-to-have qualifications.
- Keep responsibilities specific enough to map them against individual jobs in the candidate's work history.
- Capture tone and seniority signals that should shape the summary and bullet style.
- Keep keywords distinct and deduplicated.

Job Description:
${jdText}
`;

export const buildTailorResumePrompt = (resumeJson, jdAnalysisJson, rawJobDescription = '') => {
  const { insights, plan } = buildSharedPromptContext(resumeJson, 'tailor');

  return `
You are an elite executive resume writer optimizing a resume for both ATS systems and real recruiters.

Your task is to rewrite the candidate's resume to align with the target role while remaining completely truthful.

${buildEnhancementDirectives({ insights, plan, mode: 'tailor' })}
${buildReviewerQualityBar({ mode: 'tailor', plan })}
${buildSectionStrategyGuidance(plan)}

Tailoring instructions:
0. Make the job description the optimization target
- Treat the candidate resume as the factual evidence boundary and the job description as the positioning, prioritization, and vocabulary target.
- First identify the JD's highest-value outcomes, responsibilities, capabilities, tools, and recurring terminology. Then map each supported signal to the strongest evidence in the resume.
- Optimize for the target role, not merely for improved grammar. The final draft should clearly answer why this candidate is relevant to this specific job.

1. Rewrite the Professional Summary
- Target the role in "target_title".
- Reflect the tone, seniority, and terminology in the job description.
- Position the candidate as naturally aligned, not artificially stuffed with keywords.
- Lead with the candidate's strongest supported overlap with the JD and remove positioning that is generic or irrelevant to the target role.

2. Rewrite Experience
- Process EVERY experience entry independently and preserve the original order and exact number of jobs.
- For each job, first identify the evidence contained in that job's original bullets, then rewrite only that evidence into sharper achievement-driven statements.
- Give every job meaningful detail: retain its distinct scope, responsibilities, tools, stakeholders, domain, and outcomes when present in the source.
- Recent and strongly relevant jobs should normally contain 3-5 concise bullets. Older or less relevant jobs should normally contain 1-3 concise bullets, but never return a blank description when the source contains details.
- Weave in JD responsibilities, tools, and terminology only when that SAME job's source description supports them. Do not transfer evidence from one employer or job to another.
- Preserve useful factual details even when they are not JD keywords; tailoring means prioritizing evidence, not replacing the candidate's history with generic JD language.
- Materially rewrite weak bullets. Do not return the source sentence with only synonyms, capitalization changes, or reordered fragments.
- Build each rewritten bullet from the strongest available combination of: action, scope, stakeholder, method, purpose, and outcome. Include only elements supported by that job's source text.
- When a source bullet is sparse, sharpen its ownership, purpose, and relevance using supported facts; never compensate by inventing metrics, tools, scale, or outcomes.
- Front-load the JD-relevant contribution and use the JD's terminology when the resume provides evidence for the same concept, even if the original resume used weaker wording.
- Keep "desc" as a single string with "\\n" between bullets.
- Each bullet should communicate a distinct contribution. Avoid repeating the same JD phrase across multiple jobs.

3. Curate Skills
- Prioritize technical and role-specific skills that strengthen ATS match.
- Add missing keywords only when they can be reasonably supported by the candidate's actual background.
- Keep the final skills section selective and clean.

4. Final quality bar
- The resume should feel polished, credible, specialized, and interview-worthy.
- Remove generic language, repetition, and broad corporate filler.
- Improve recruiter first impression in the first 10 seconds of scanning.
- Before returning JSON, silently compare the tailored draft with the source. If a sentence is substantially unchanged despite supported JD overlap, rewrite it more strategically.

Hard constraints:
- Keep the same JSON schema as the input resume.
- Return exactly one experience object for every input experience object, in the same order.
- Preserve every experience object's id, role, company, and date exactly as supplied.
- Do not invent or infer jobs, employers, dates, degrees, tools, metrics, clients, team sizes, responsibilities, or outcomes.
- Never claim a mandatory JD requirement unless it is explicitly supported somewhere in the candidate resume; otherwise omit it from the resume.
- Never copy a JD responsibility into a bullet as though the candidate performed it without supporting resume evidence.
- Preserve personal contact details and all factual education, certification, project, award, language, and volunteering data.
- Return ONLY valid JSON.

Job Description Analysis:
${JSON.stringify(jdAnalysisJson, null, 2)}

Full Target Job Description:
${truncatePromptText(rawJobDescription, 12000)}

Candidate Resume JSON:
${JSON.stringify(resumeJson, null, 2)}
`;
};
