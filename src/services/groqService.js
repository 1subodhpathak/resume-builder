import { applyResumeSourceCorrections } from "../utils/resumeSourceCorrections";
import {
  buildTextVariationPrompt,
  buildResumeEnhancementPrompt,
  buildResumeExtractionPrompt,
  normalizeResumeDataForDelivery,
} from "./resumePrompting";
import {
  getOpenAIClient,
  OPENAI_ENHANCEMENT_MODEL,
  OPENAI_MODEL,
} from "./openaiClient";
import { recordAiTokenUsage } from "./resumeRepositoryService";

const MAX_RESUME_TEXT_CHARS = 50000;
const EXACT_IMPORT_CHUNK_CHARS = 30000;
const prepareResumeTextForModel = (rawText = "") => rawText.slice(0, MAX_RESUME_TEXT_CHARS);

const splitExactImportText = (rawText = "") => {
  const text = String(rawText || "");
  if (text.length <= EXACT_IMPORT_CHUNK_CHARS) return [text];

  const chunks = [];
  let cursor = 0;

  while (cursor < text.length) {
    let end = Math.min(cursor + EXACT_IMPORT_CHUNK_CHARS, text.length);

    if (end < text.length) {
      const paragraphBreak = text.lastIndexOf("\n\n", end);
      const lineBreak = text.lastIndexOf("\n", end);
      const safeBreak = paragraphBreak > cursor + EXACT_IMPORT_CHUNK_CHARS * 0.6
        ? paragraphBreak + 2
        : lineBreak > cursor + EXACT_IMPORT_CHUNK_CHARS * 0.6
          ? lineBreak + 1
          : end;
      end = safeBreak;
    }

    chunks.push(text.slice(cursor, end));
    cursor = end;
  }

  return chunks;
};

const EXACT_IMPORT_LIST_FIELDS = [
  'experience',
  'education',
  'projects',
  'certifications',
  'languages',
  'awards',
  'volunteering',
];

const hasEntryContent = (item) => item && Object.entries(item).some(
  ([key, value]) => key !== 'id' && (
    Array.isArray(value) ? value.length > 0 : String(value ?? '').length > 0
  )
);

const normalizeExactImportEntry = (item, index) => ({
  ...item,
  id: index + 1,
  ...(Object.prototype.hasOwnProperty.call(item || {}, 'desc')
    ? { desc: Array.isArray(item.desc) ? item.desc.join("\n") : (item.desc || "") }
    : {}),
});

const mergeExactImportChunks = (chunkResults = [], rawText = "") => {
  const merged = {
    personal: {},
    experience: [],
    education: [],
    skills: { technical: [], soft: [], core: [] },
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    volunteering: [],
  };

  chunkResults.forEach((chunk) => {
    const personal = chunk?.personal || {};
    Object.entries(personal).forEach(([field, value]) => {
      if (!value) return;
      if (field === 'summary' && merged.personal.summary && merged.personal.summary !== value) {
        merged.personal.summary = `${merged.personal.summary}\n${value}`;
      } else if (!merged.personal[field]) {
        merged.personal[field] = value;
      }
    });

    ['technical', 'soft', 'core'].forEach((field) => {
      if (Array.isArray(chunk?.skills?.[field])) {
        merged.skills[field].push(...chunk.skills[field]);
      }
    });

    EXACT_IMPORT_LIST_FIELDS.forEach((field) => {
      if (Array.isArray(chunk?.[field])) {
        merged[field].push(...chunk[field].filter(hasEntryContent));
      }
    });
  });

  EXACT_IMPORT_LIST_FIELDS.forEach((field) => {
    merged[field] = merged[field].map(normalizeExactImportEntry);
  });

  // Keep the complete parsed source alongside the mapped fields. This is a
  // lossless fallback for content that does not fit a known resume field.
  merged.exactImportSourceText = rawText;
  return merged;
};
const preserveEntryMetadata = (sourceItems = [], enhancedItems = [], fields = []) =>
  (Array.isArray(enhancedItems) ? enhancedItems : []).map((item, index) => {
    const sourceItem = (Array.isArray(sourceItems) ? sourceItems : [])[index] || {};
    return fields.reduce(
      (nextItem, field) => ({
        ...nextItem,
        [field]: sourceItem[field] || nextItem[field] || '',
      }),
      { ...item }
    );
  });

const recordOpenAICompletionUsage = (operation, completion, metadata = {}) => {
  recordAiTokenUsage({
    provider: 'openai',
    source: 'openaiService',
    operation,
    model: completion?.model || OPENAI_MODEL,
    usage: completion?.usage,
    metadata,
  });
};

// ===============================
// 1. EXTRACT DATA
// ===============================
export const extractResumeData = async (rawText, options = {}) => {
  const openai = getOpenAIClient();
  const prompt = buildResumeExtractionPrompt(prepareResumeTextForModel(rawText));

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: OPENAI_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    operation: 'Resume Extraction',
  });

  recordOpenAICompletionUsage('extract_resume_data', completion, {
    variant: 'standard',
  });

  const parsedData = JSON.parse(completion.choices[0].message.content);
  const correctedData = applyResumeSourceCorrections(parsedData, rawText);

  if (options.preserveFullContent) {
    return correctedData;
  }

  return normalizeResumeDataForDelivery(correctedData, { mode: 'upload' });
};

// ===============================
// 1B. EXACT / VERBATIM EXTRACTION
// ===============================
export const extractResumeDataVerbatim = async (rawText) => {
  const openai = getOpenAIClient();
  const chunks = splitExactImportText(rawText);
  const chunkResults = [];

  for (const [index, chunkText] of chunks.entries()) {
    const prompt = buildResumeExtractionPrompt(chunkText, { verbatim: true });
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: OPENAI_MODEL,
      temperature: 0,
      max_completion_tokens: 16000,
      response_format: { type: "json_object" },
      operation: 'Resume Exact Import',
    });

    recordOpenAICompletionUsage('extract_resume_data_verbatim', completion, {
      variant: 'verbatim',
      chunk: index + 1,
      chunkCount: chunks.length,
    });

    chunkResults.push(JSON.parse(completion.choices[0].message.content));
  }

  // Exact Import intentionally bypasses normalizeResumeDataForDelivery: that
  // function is for presentation shaping and caps summaries, bullets, skills,
  // projects, and certifications.
  return mergeExactImportChunks(chunkResults, rawText);
};

// ===============================
// 2. ENHANCE RESUME DATA
// ===============================
export const enhanceResumeData = async (jsonData, options = {}) => {
  try {
    const openai = getOpenAIClient();
    const prompt = buildResumeEnhancementPrompt(jsonData, options);
    const operationName = options.mode === 'tailor' ? 'Resume + JD Tailoring' : 'Resume Enhancement';

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: OPENAI_ENHANCEMENT_MODEL,
      reasoning_effort: "low",
      max_completion_tokens: 8000,
      response_format: { type: "json_object" },
      operation: operationName,
    });

    recordOpenAICompletionUsage('enhance_resume_data', completion, {
      fullSourceContentPreserved: true,
    });

    const enhancedData = JSON.parse(completion.choices[0].message.content);
    enhancedData.personal = {
      ...(jsonData.personal || {}),
      ...(enhancedData.personal || {}),
    };
    enhancedData.experience = preserveEntryMetadata(
      jsonData.experience,
      enhancedData.experience,
      ['location', 'employmentType']
    );
    enhancedData.projects = preserveEntryMetadata(
      jsonData.projects,
      enhancedData.projects,
      ['url', 'repositoryUrl']
    );
    enhancedData.education = preserveEntryMetadata(
      jsonData.education,
      enhancedData.education,
      ['specialization', 'grade']
    );
    enhancedData.certifications = preserveEntryMetadata(
      jsonData.certifications,
      enhancedData.certifications,
      ['credentialId', 'credentialUrl', 'expiryDate']
    );

    if (enhancedData.experience) {
      enhancedData.experience = enhancedData.experience.map((exp) => ({
        ...exp,
        desc: Array.isArray(exp.desc)
          ? exp.desc.join("\n")
          : exp.desc || ""
      }));
    }

    return normalizeResumeDataForDelivery(enhancedData, {
      mode: options.mode || 'upload',
    });

  } catch (error) {
    console.error("Resume enhancement failed:", error);
    throw error;
  }
};

// ===============================
// 3. ENHANCE SPECIFIC TEXT (Variations)
// ===============================
export const generateTextVariations = async (currentText, contextType, jobTitleOrOptions = "Professional") => {
  try {
    const openai = getOpenAIClient();
    const options =
      typeof jobTitleOrOptions === 'object' && jobTitleOrOptions !== null
        ? jobTitleOrOptions
        : { jobTitle: jobTitleOrOptions };
    const prompt = buildTextVariationPrompt(currentText, contextType, options);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: OPENAI_MODEL,
      temperature: 0.5,
      response_format: { type: "json_object" },
      operation: 'Section AI Rewrite',
    });

    recordOpenAICompletionUsage('generate_text_variations', completion, {
      contextType,
      jobTitle: options.jobTitle || 'Professional',
      hasJobDescription: Boolean(options.jdText),
      focusLabel: options.focusLabel || '',
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return parsed.variations || [];

  } catch (error) {
    console.error("Text variation generation failed:", error);
    throw error;
  }
};

// ===============================
// 4. LIVE ATS SCORE & KEYWORD CHECKER
// ===============================
export const calculateATSScore = async (resumeData, jdText) => {
  try {
    const openai = getOpenAIClient();
    const prompt = `
You are an expert Applicant Tracking System (ATS) algorithm.
Compare the Candidate's Resume to the Target Job Description.

Analyze the match and return exactly this JSON structure:
{
  "score": 0,
  "feedback": "",
  "matched_keywords": [],
  "missing_keywords": []
}

Target Job Description:
"${jdText}"

Candidate Resume:
${JSON.stringify(resumeData)}
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: OPENAI_MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      operation: 'ATS Score Analysis',
    });

    recordOpenAICompletionUsage('calculate_ats_score', completion);

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("ATS Scoring failed:", error);
    throw error;
  }
};

// ===============================
// 5. TARGETED INTERVIEW PREP
// ===============================
export const generateInterviewPrep = async (resumeData, jdText) => {
  try {
    const openai = getOpenAIClient();
    const prompt = `
You are an elite Executive Interview Coach.
Based on the Candidate's Resume and the Target Job Description, predict the 5 most difficult or likely interview questions they will be asked.

Return exactly this JSON structure:
{
  "questions": [
    {
      "question": "The predicted interview question...",
      "why_they_ask_this": "Brief explanation of what the interviewer is actually looking for...",
      "suggested_strategy": "How the candidate should answer this using the STAR method based on their specific resume experience..."
    }
  ]
}

Target Job Description:
"${jdText}"

Candidate Resume:
${JSON.stringify(resumeData)}
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      operation: 'Interview Prep Generation',
    });

    recordOpenAICompletionUsage('generate_interview_prep', completion);

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Interview Prep generation failed:", error);
    throw error;
  }
};
