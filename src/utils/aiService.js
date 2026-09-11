import Groq from "groq-sdk";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Initialize Groq
// ⚠️ IMPORTANT: Replace 'YOUR_API_KEY' with your actual Groq API Key,
// or use import.meta.env.VITE_GROQ_API_KEY if you set it in .env
const groq = new Groq({
  apiKey: "gsk_yO...", // <--- PASTE YOUR GROQ API KEY HERE
  dangerouslyAllowBrowser: true 
});

// --- 1. FILE PARSING LOGIC ---

// Extract text from PDF
export const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Set worker (required for pdf.js to work in browser)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
};

// Extract text from DOCX
export const extractTextFromDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

// Master function to handle upload (Exported)
export const parseResumeFile = async (file) => {
  if (file.type === "application/pdf") {
    return await extractTextFromPDF(file);
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await extractTextFromDocx(file);
  } else {
    // Basic text fallback
    if (file.type === "text/plain") {
        return await file.text();
    }
    throw new Error("Unsupported file type. Please upload PDF or DOCX.");
  }
};

// --- 2. AI EXTRACTION LOGIC (Exported) ---

export const analyzeResumeWithGroq = async (resumeText) => {
  const systemPrompt = `
    You are an expert Resume Parser. 
    Extract data from the provided resume text and return it in the following STRICT JSON format.
    Do not add any markdown, comments, or explanations. Just the JSON object.
    
    Structure:
    {
      "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "", "summary": "", "linkedin": "" },
      "experience": [ { "id": 1, "role": "", "company": "", "date": "", "desc": "" } ],
      "education": [ { "id": 1, "degree": "", "school": "", "date": "" } ],
      "skills": { "technical": [], "core": [], "soft": [] },
      "projects": [ { "id": 1, "name": "", "desc": "" } ],
      "certifications": [ { "id": 1, "name": "", "issuer": "", "date": "" } ],
      "languages": [ { "id": 1, "name": "", "level": "" } ],
      "awards": [ { "id": 1, "name": "", "issuer": "" } ],
      "volunteering": [ { "id": 1, "role": "", "org": "", "date": "", "desc": "" } ]
    }
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the resume text:\n${resumeText}` },
      ],
      model: "mixtral-8x7b-32768", 
      temperature: 0.1,
      response_format: { type: "json_object" }, 
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("AI Parse Error:", error);
    return null;
  }
};