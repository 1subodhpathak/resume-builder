import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { generateTextVariations } from '../../services/groqService'; // Adjust path if needed

const AIEnhanceModal = ({ isOpen, onClose, onSelect, currentText, contextType, jobTitle, contextMeta = {} }) => {
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch variations automatically when the modal opens
  useEffect(() => {
    if (isOpen && currentText) {
      fetchVariations();
    }
  }, [isOpen]);

  const fetchVariations = async () => {
    setLoading(true);
    setError('');
    setVariations([]);
    
    try {
      const results = await generateTextVariations(currentText, contextType, {
        jobTitle,
        ...contextMeta,
      });
      setVariations(results);
    } catch (err) {
      setError('Failed to generate AI variations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const templateLabel = contextMeta.targetTemplate || '';
  const focusLabel = contextMeta.focusLabel || '';
  const focusReason = contextMeta.focusReason || '';
  const hasJd = Boolean(contextMeta.jdText);
  const targetPages = contextMeta.targetPages;
  const roleFamily = contextMeta.roleFamily || '';

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight text-lg">AI Text Enhancer</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a variation to replace your text</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {(focusLabel || focusReason || hasJd || templateLabel || roleFamily) ? (
            <div className="mb-6 rounded-2xl border border-[#E7ECF3] bg-[#F8FAFC] p-4">
              <div className="flex flex-wrap gap-2">
                {focusLabel ? (
                  <span className="rounded-full bg-[#E7F8F4] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">
                    {focusLabel}
                  </span>
                ) : null}
                {roleFamily ? (
                  <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-700">
                    {roleFamily}
                  </span>
                ) : null}
                {templateLabel ? (
                  <span className="rounded-full bg-[#FFF7E8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                    {templateLabel}
                  </span>
                ) : null}
                {targetPages ? (
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                    {targetPages} page target
                  </span>
                ) : null}
                {hasJd ? (
                  <span className="rounded-full bg-[#E0F2FE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
                    JD-aware
                  </span>
                ) : null}
              </div>
              {focusReason ? (
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                  {focusReason}
                </p>
              ) : null}
            </div>
          ) : null}
          
          {/* Original Text Reference */}
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Original Text</h4>
            <p className="text-sm text-slate-600 italic leading-relaxed">"{currentText}"</p>
          </div>

          {loading ? (
             <div className="py-12 flex flex-col items-center justify-center text-teal-600">
                <Loader2 size={40} className="animate-spin mb-4" />
                <p className="font-bold text-sm uppercase tracking-widest text-slate-500">Generating professional variations...</p>
             </div>
          ) : error ? (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
                <AlertCircle size={18} /> {error}
             </div>
          ) : (
            <div className="space-y-4">
               {variations.map((text, idx) => (
                  <div 
                    key={idx} 
                    className="group border-2 border-slate-100 hover:border-teal-500 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 relative overflow-hidden bg-white"
                    onClick={() => {
                        onSelect(text);
                        onClose();
                    }}
                  >
                     <div className="absolute top-0 left-0 w-1 h-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <h4 className="text-[10px] font-black uppercase text-teal-600 tracking-widest mb-2 flex justify-between items-center">
                        Option {idx + 1}
                        <span className="opacity-0 group-hover:opacity-100 text-teal-500 bg-teal-50 px-2 py-1 rounded-md flex items-center gap-1 transition-opacity">
                            <Check size={12}/> Click to apply
                        </span>
                     </h4>
                     <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{text}</p>
                  </div>
               ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <button 
              onClick={fetchVariations} 
              disabled={loading}
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-teal-600 transition-colors disabled:opacity-50"
            >
              ⟳ Regenerate Options
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-md"
            >
              Cancel
            </button>
        </div>

      </div>
    </div>
  );
};

export default AIEnhanceModal;
