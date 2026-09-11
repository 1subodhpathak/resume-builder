import * as pdfjsLib from 'pdfjs-dist';

// Use a specific version for the worker to prevent version mismatch errors
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Add a space to separate words correctly
      const pageText = content.items.map(item => item.str).join(" ");
      text += pageText + "\n";
    }
    
    // Validation to prevent "Generic AI Response"
    if (text.length < 50) {
      throw new Error("PDF text could not be extracted. The file might be an image or encrypted.");
    }
    
    return text;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw error;
  }
};