// import Groq from "groq-sdk";

// // Initialize 3 separate Groq clients with 3 separate keys
// const groqExtract = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY_1, dangerouslyAllowBrowser: true });
// const groqAnalyzeJD = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY_2, dangerouslyAllowBrowser: true });
// const groqTailor = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY_3, dangerouslyAllowBrowser: true });

// const MODEL = "llama-3.3-70b-versatile";

// // PHASE 1: Extract Resume to JSON
// export const phase1_ExtractResume = async (rawText) => {
//   const prompt = `
//     You are an expert resume parser. Extract the info from the text below into this EXACT JSON schema.
//     {
//       "personal": { "name": "", "email": "", "phone": "", "location": "", "summary": "", "title": "" },
//       "experience": [{ "id": 1, "role": "", "company": "", "date": "", "desc": "bullet points here" }],
//       "education": [{ "id": 1, "degree": "", "school": "", "date": "" }],
//       "skills": { "technical": [], "soft": [], "core": [] },
//       "projects": [{ "id": 1, "name": "", "desc": "" }],
//       "certifications": [{ "id": 1, "name": "", "issuer": "", "date": "" }],
//       "languages": [{ "name": "", "level": "" }],
//       "awards": [{ "id": 1, "name": "", "issuer": "" }]
//     }
//     Resume Text: ${rawText.substring(0, 15000)}
//   `;

//   const completion = await groqExtract.chat.completions.create({
//     messages: [{ role: "user", content: prompt }],
//     model: MODEL,
//     temperature: 0,
//     response_format: { type: "json_object" }
//   });
//   return JSON.parse(completion.choices[0].message.content);
// };

// // PHASE 2: Analyze Job Description
// export const phase2_AnalyzeJD = async (jdText) => {
//   const prompt = `
//     Analyze this Job Description. Extract the core requirements, mandatory technical skills, required soft skills, and the tone/industry focus. Return ONLY valid JSON.
//     Schema:
//     {
//       "target_title": "",
//       "mandatory_technical_skills": [],
//       "mandatory_soft_skills": [],
//       "core_responsibilities": [],
//       "industry_keywords": []
//     }
//     Job Description: ${jdText.substring(0, 10000)}
//   `;

//   const completion = await groqAnalyzeJD.chat.completions.create({
//     messages: [{ role: "user", content: prompt }],
//     model: MODEL,
//     temperature: 0.1,
//     response_format: { type: "json_object" }
//   });
//   return JSON.parse(completion.choices[0].message.content);
// };

// // PHASE 3: Tailor Resume to JD
// export const phase3_TailorResume = async (resumeJson, jdAnalysisJson) => {
//   const prompt = `
//     You are an elite Executive Resume Writer. Your task is to rewrite the candidate's resume to perfectly align with the targeted Job Description analysis, while maintaining absolute truthfulness (do not invent jobs or degrees).

//     Instructions:
//     1. REWRITE the Professional Summary to directly target the "target_title" and include top "industry_keywords".
//     2. REWRITE the Experience "desc" bullet points. Inject "core_responsibilities" and "mandatory_technical_skills" naturally where applicable. Make them action-oriented. Return "desc" as a single string with "\\n" for line breaks.
//     3. ADD missing "mandatory_technical_skills" and "mandatory_soft_skills" to the Skills arrays IF they can be reasonably inferred from the user's past experience.

//     Keep the exact same JSON schema as the input Resume. Return ONLY valid JSON.

//     Job Description Analysis:
//     ${JSON.stringify(jdAnalysisJson)}

//     Candidate's Current Resume JSON:
//     ${JSON.stringify(resumeJson)}
//   `;

//   const completion = await groqTailor.chat.completions.create({
//     messages: [{ role: "user", content: prompt }],
//     model: MODEL,
//     temperature: 0.3,
//     response_format: { type: "json_object" }
//   });
  
//   const tailoredData = JSON.parse(completion.choices[0].message.content);

//   // Normalize bullet points safely
//   if (tailoredData.experience) {
//     tailoredData.experience = tailoredData.experience.map((exp) => ({
//       ...exp,
//       desc: Array.isArray(exp.desc) ? exp.desc.join("\n") : exp.desc || ""
//     }));
//   }
//   return tailoredData;
// };

import {
  getOpenAIClient,
  OPENAI_ENHANCEMENT_MODEL,
  OPENAI_MODEL,
} from "./openaiClient";
import {
  buildJobDescriptionAnalysisPrompt,
  buildResumeExtractionPrompt,
  buildTailorResumePrompt,
  normalizeResumeDataForDelivery,
} from "./resumePrompting";
import { recordAiTokenUsage } from "./resumeRepositoryService";

const recordOpenAIUsage = (operation, completion, metadata = {}) => {
  recordAiTokenUsage({
    provider: 'openai',
    source: 'openaiJobTailorService',
    operation,
    model: completion?.model || OPENAI_MODEL,
    usage: completion?.usage,
    metadata,
  });
};

const normalizeDescription = (value) =>
  (Array.isArray(value) ? value : String(value || '').split(/\r?\n/))
    .map((line) => String(line || '').replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .join('\n');

const preserveSourceExperienceFacts = (sourceResume = {}, tailoredResume = {}) => {
  const sourceExperience = Array.isArray(sourceResume.experience) ? sourceResume.experience : [];
  const tailoredExperience = Array.isArray(tailoredResume.experience) ? tailoredResume.experience : [];

  return sourceExperience.map((sourceRole, index) => {
    const tailoredRole = tailoredExperience[index] || {};
    const tailoredDescription = normalizeDescription(tailoredRole.desc);

    return {
      ...tailoredRole,
      id: sourceRole.id,
      role: sourceRole.role || '',
      company: sourceRole.company || '',
      date: sourceRole.date || '',
      location: sourceRole.location || tailoredRole.location || '',
      employmentType: sourceRole.employmentType || tailoredRole.employmentType || '',
      desc: tailoredDescription || normalizeDescription(sourceRole.desc),
    };
  });
};

// PHASE 1: Extract Resume to JSON
export const phase1_ExtractResume = async (rawText) => {
  const openai = getOpenAIClient();
  const prompt = buildResumeExtractionPrompt(rawText.substring(0, 30000), { verbatim: true });

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: OPENAI_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    operation: 'Resume Extraction',
  });
  recordOpenAIUsage('tailor_phase_extract_resume', completion);
  const extractedResume = JSON.parse(completion.choices[0].message.content);

  return {
    ...extractedResume,
    experience: (Array.isArray(extractedResume.experience) ? extractedResume.experience : []).map((item) => ({
      ...item,
      desc: normalizeDescription(item?.desc),
    })),
  };
};

// PHASE 2: Analyze Job Description
export const phase2_AnalyzeJD = async (jdText) => {
  const openai = getOpenAIClient();
  const prompt = buildJobDescriptionAnalysisPrompt(jdText.substring(0, 10000));

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: OPENAI_ENHANCEMENT_MODEL,
    reasoning_effort: "low",
    max_completion_tokens: 4000,
    response_format: { type: "json_object" },
    operation: 'Job Description Analysis',
  });
  recordOpenAIUsage('tailor_phase_analyze_jd', completion, {
    jdLedOptimization: true,
  });
  return JSON.parse(completion.choices[0].message.content);
};

// PHASE 3: Tailor Resume to JD
export const phase3_TailorResume = async (resumeJson, jdAnalysisJson, rawJobDescription = '') => {
  const openai = getOpenAIClient();
  const prompt = buildTailorResumePrompt(resumeJson, jdAnalysisJson, rawJobDescription);

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: OPENAI_ENHANCEMENT_MODEL,
    reasoning_effort: "low",
    max_completion_tokens: 10000,
    response_format: { type: "json_object" },
    operation: 'Resume + JD Tailoring',
  });
  recordOpenAIUsage('tailor_phase_rewrite_resume', completion, {
    jdLedOptimization: true,
  });
  
  const tailoredData = JSON.parse(completion.choices[0].message.content);

  const factSafeTailoredData = {
    ...resumeJson,
    ...tailoredData,
    personal: {
      ...resumeJson.personal,
      ...tailoredData.personal,
      name: resumeJson.personal?.name || '',
      email: resumeJson.personal?.email || '',
      phone: resumeJson.personal?.phone || '',
      location: resumeJson.personal?.location || '',
      linkedin: resumeJson.personal?.linkedin || '',
    },
    experience: preserveSourceExperienceFacts(resumeJson, tailoredData),
    education: resumeJson.education || [],
    projects: (tailoredData.projects || resumeJson.projects || []).map((project, index) => ({
      ...project,
      url: resumeJson.projects?.[index]?.url || project.url || '',
      repositoryUrl: resumeJson.projects?.[index]?.repositoryUrl || project.repositoryUrl || '',
    })),
    certifications: resumeJson.certifications || [],
    languages: resumeJson.languages || [],
    awards: resumeJson.awards || [],
    volunteering: resumeJson.volunteering || [],
  };

  return normalizeResumeDataForDelivery(factSafeTailoredData, {
    mode: 'tailor',
    preserveExperienceDetails: true,
  });
};
