// // // import * as pdfjsLib from 'pdfjs-dist';
// // // import mammoth from 'mammoth';

// // // // Initialize PDF.js worker
// // // pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// // // export const extractTextFromFile = async (file) => {
// // //   const fileType = file.type;

// // //   if (fileType === "application/pdf") {
// // //     return await extractPdfText(file);
// // //   } else if (
// // //     fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
// // //     fileType === "application/msword"
// // //   ) {
// // //     return await extractDocxText(file);
// // //   } else {
// // //     throw new Error("Unsupported file type. Please upload PDF or DOCX.");
// // //   }
// // // };

// // // const extractPdfText = async (file) => {
// // //   const arrayBuffer = await file.arrayBuffer();
// // //   const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
// // //   let text = "";

// // //   for (let i = 1; i <= pdf.numPages; i++) {
// // //     const page = await pdf.getPage(i);
// // //     const content = await page.getTextContent();
// // //     const strings = content.items.map((item) => item.str);
// // //     text += strings.join(" ") + "\n";
// // //   }
// // //   return text;
// // // };

// // // const extractDocxText = async (file) => {
// // //   const arrayBuffer = await file.arrayBuffer();
// // //   const result = await mammoth.extractRawText({ arrayBuffer });
// // //   return result.value;
// // // };

// // import * as pdfjsLib from 'pdfjs-dist';
// // import mammoth from 'mammoth';

// // // Set worker explicitly for Vite
// // pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// // export const extractTextFromFile = async (file) => {
// //   console.log("Starting extraction for:", file.name); // Debug Log

// //   try {
// //     const fileType = file.type;

// //     if (fileType === "application/pdf") {
// //       return await extractPdfText(file);
// //     } else if (
// //       fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
// //       fileType === "application/msword"
// //     ) {
// //       return await extractDocxText(file);
// //     } else {
// //       // Fallback based on extension if mime-type fails
// //       if (file.name.endsWith('.pdf')) return await extractPdfText(file);
// //       if (file.name.endsWith('.docx')) return await extractDocxText(file);

// //       throw new Error("Unsupported file type. Please upload PDF or DOCX.");
// //     }
// //   } catch (error) {
// //     console.error("Extraction Error:", error);
// //     throw error;
// //   }
// // };

// // const extractPdfText = async (file) => {
// //   const arrayBuffer = await file.arrayBuffer();
// //   const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
// //   let text = "";

// //   // Extract text from all pages
// //   for (let i = 1; i <= pdf.numPages; i++) {
// //     const page = await pdf.getPage(i);
// //     const content = await page.getTextContent();
// //     const strings = content.items.map((item) => item.str);
// //     text += strings.join(" ") + "\n";
// //   }
// //   return text;
// // };

// // const extractDocxText = async (file) => {
// //   const arrayBuffer = await file.arrayBuffer();
// //   const result = await mammoth.extractRawText({ arrayBuffer });
// //   return result.value;
// // };

// import * as pdfjsLib from 'pdfjs-dist';
// import mammoth from 'mammoth';

// // Standard worker setup for Vite
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// export const extractTextFromFile = async (file) => {
//   if (!file) throw new Error("No file provided");

//   try {
//     const fileType = file.type;
    
//     // Handle PDF
//     if (fileType === "application/pdf") {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
//       let text = "";
//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const content = await page.getTextContent();
//         text += content.items.map((item) => item.str).join(" ") + "\n";
//       }
//       return text;
//     } 
//     // Handle Word (DOCX)
//     else if (
//       fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
//       file.name.endsWith('.docx')
//     ) {
//       const arrayBuffer = await file.arrayBuffer();
//       const result = await mammoth.extractRawText({ arrayBuffer });
//       return result.value;
//     } 
//     else {
//       throw new Error("Unsupported format. Please use PDF or DOCX.");
//     }
//   } catch (err) {
//     console.error("File parsing error:", err);
//     throw new Error("Failed to read file content.");
//   }
// };



import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const MIN_EXTRACTED_TEXT_LENGTH = 50;
const MIN_PAGE_TEXT_LENGTH = 20;
const OCR_RENDER_SCALE = 2;

const normalizeExtractedText = (text = "") =>
  text
    .replace(/-\n/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([a-z])\n([a-z])/gi, "$1 $2")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const getPageTextFromTextLayer = async (page) => {
  const content = await page.getTextContent();

  const items = content.items
    .filter((item) => typeof item?.str === "string" && item.str.trim())
    .map((item) => ({
      text: item.str,
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
    }));

  if (!items.length) return "";

  items.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 5) return b.y - a.y;
    return a.x - b.x;
  });

  let pageText = "";
  let lastY = null;

  for (const item of items) {
    if (lastY !== null && Math.abs(item.y - lastY) > 8) {
      pageText += "\n";
    }

    pageText += `${item.text} `;
    lastY = item.y;
  }

  return normalizeExtractedText(pageText);
};

const renderPdfPageToCanvas = async (page) => {
  const viewport = page.getViewport({ scale: OCR_RENDER_SCALE });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({
    canvasContext: context,
    viewport,
    background: "white",
  }).promise;

  return canvas;
};

const performPageOcr = async (page) => {
  const canvas = await renderPdfPageToCanvas(page);

  try {
    const { data } = await Tesseract.recognize(canvas, "eng");
    return normalizeExtractedText(data?.text || "");
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
};

const extractPdfText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts = [];

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      try {
        let pageText = await getPageTextFromTextLayer(page);

        if (pageText.replace(/\s/g, "").length < MIN_PAGE_TEXT_LENGTH) {
          console.log(`Using OCR fallback for PDF page ${i}...`);
          pageText = await performPageOcr(page);
        }

        if (pageText) {
          pageTexts.push(pageText);
        }
      } finally {
        page.cleanup();
      }
    }
  } finally {
    pdf.cleanup();
    await pdf.destroy();
  }

  const text = normalizeExtractedText(pageTexts.join("\n\n"));

  if (text.replace(/\s/g, "").length < MIN_EXTRACTED_TEXT_LENGTH) {
    throw new Error("We couldn't extract enough readable text from that PDF.");
  }

  return text;
};

const extractDocxText = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return normalizeExtractedText(result.value);
};

const extractPlainText = async (file) => normalizeExtractedText(await file.text());

export const extractTextFromFile = async (file) => {
  if (!file) throw new Error("No file provided");

  try {
    const fileType = file.type;
    const fileName = file.name?.toLowerCase() || "";

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return await extractPdfText(file);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      return await extractDocxText(file);
    } else if (fileType.startsWith("text/") || fileName.endsWith(".txt")) {
      return await extractPlainText(file);
    } else {
      throw new Error("Unsupported format. Please upload PDF, DOCX, or TXT.");
    }
  } catch (err) {
    console.error("File parsing error:", err);
    throw new Error(err?.message || "Failed to read file content.");
  }
};
