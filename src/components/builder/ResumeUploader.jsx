import React, { useState } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { extractTextFromFile } from '../../utils/fileParser';
import { extractResumeData } from '../../services/groqService';

const ResumeUploader = ({ onUploadComplete, onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, parsing, extracting, done, error

  const processFile = async (uploadedFile) => {
    setFile(uploadedFile);
    setStatus('parsing');
    
    try {
      // 1. Extract Text
      const rawText = await extractTextFromFile(uploadedFile);
      
      // 2. AI Extraction
      setStatus('extracting');
      const extractedJson = await extractResumeData(rawText);
      
      // 3. Complete
      setStatus('done');
      setTimeout(() => onUploadComplete(extractedJson), 1000); // Small delay for UX
      
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-12 text-center relative border border-slate-100">
        
        <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest">
            Cancel
        </button>

        <h2 className="text-3xl font-black text-slate-900 mb-2">Upload Your Resume</h2>
        <p className="text-slate-500 mb-10">We support PDF and DOCX formats. Max 10MB.</p>

        {/* Dropzone */}
        <div 
            className={`border-4 border-dashed rounded-[2rem] h-80 flex flex-col items-center justify-center transition-all duration-300 ${isDragging ? 'border-[#123B6D] bg-[#E8EEF7]' : 'border-slate-200 hover:border-[#123B6D] hover:bg-slate-50'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            {status === 'idle' && (
                <>
                    <div className="w-20 h-20 bg-[#E8EEF7] text-[#123B6D] rounded-full flex items-center justify-center mb-6">
                        <UploadCloud size={40} />
                    </div>
                    <p className="text-slate-900 font-bold text-lg mb-2">Drag & Drop or <label htmlFor="file-upload" className="text-[#123B6D] cursor-pointer hover:underline">Choose File</label></p>
                    <p className="text-slate-400 text-sm">PDF, DOC, DOCX</p>
                    <input id="file-upload" type="file" className="hidden" accept=".pdf,.docx,.doc" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                </>
            )}

            {(status === 'parsing' || status === 'extracting') && (
                <div className="animate-in fade-in zoom-in duration-500">
                    <Loader2 size={50} className="text-[#123B6D] animate-spin mb-4 mx-auto" />
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {status === 'parsing' ? 'Reading File...' : 'AI Extracting Data...'}
                    </h3>
                    <p className="text-slate-400 text-sm">This may take a few seconds.</p>
                </div>
            )}

            {status === 'done' && (
                <div className="animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-[#E8EEF7] text-[#123B6D] rounded-full flex items-center justify-center mb-6 mx-auto">
                        <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-[#123B6D]">Extraction Complete!</h3>
                </div>
            )}

            {status === 'error' && (
                <div className="text-rose-500">
                    <X size={50} className="mb-4 mx-auto" />
                    <p className="font-bold">Something went wrong.</p>
                    <button onClick={() => setStatus('idle')} className="mt-4 text-sm underline">Try Again</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;
