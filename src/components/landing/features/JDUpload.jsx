import React, { useState } from 'react';
import { Search, Target, Briefcase, ArrowRight, CheckCircle2, BarChart3, Brain } from 'lucide-react';

const JDUpload = ({ onSubmit }) => { // <--- Receive Prop
  const [text, setTextLocal] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleAnalyze = () => {
    if (text.trim().length > 50) {
        onSubmit(text); // <--- Return text to Parent
    }
  };

  const analysisMetrics = [
    {
      title: "Keyword Matching",
      desc: "Checking resume vs job description...",
      icon: <Brain size={18} className="text-[#B9964A]" />,
      color: "border-[#B9964A]/25 bg-[#B9964A]/10 text-[#9A7628]"
    },
    {
      title: "Experience Gaps",
      desc: "Identifying missing seniority levels...",
      icon: <BarChart3 size={18} className="text-[#123B6D]" />,
      color: "border-[#123B6D]/20 bg-[#E8EEF7] text-[#123B6D]"
    },
    {
      title: "Tailoring Suggestions",
      desc: "Rewriting summary for the role...",
      icon: <Target size={18} className="text-[#B9964A]" />,
      color: "border-[#B9964A]/25 bg-[#B9964A]/10 text-[#9A7628]"
    }
  ];

  return (
    <div className="theme-app-shell min-h-[calc(100dvh-64px)] w-full flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#123B6D]/20">
      
      {/* BACKGROUND FX */}
      <div className="theme-grid-overlay absolute inset-0 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#123B6D]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#B9964A]/12 blur-[120px] rounded-full pointer-events-none" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-[1400px] px-6 md:px-12 py-12 grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        
        {/* LEFT COLUMN: CONTEXT */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-10">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#123B6D]/20 bg-[#E8EEF7] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#123B6D]">
              <Search size={12} /> Phase 2: Context Injection
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight text-[color:var(--theme-text-primary)]">
              Target the <br/>
              <span className="text-[#9A7628]">
                Perfect Role.
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[color:var(--theme-text-secondary)]">
              Paste the job description below. Our AI will rewrite your resume sections to align with the specific keywords and requirements of this role.
            </p>
          </div>

          <div className="space-y-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[color:var(--theme-text-muted)]">Optimization Targets</p>
            {analysisMetrics.map((metric, i) => (
                <div key={i} className="theme-section-surface flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.02]">
                    <div className="rounded-lg bg-[color:var(--theme-surface-subtle)] p-2">{metric.icon}</div>
                    <div>
                        <h4 className="text-sm font-bold text-[color:var(--theme-text-primary)]">{metric.title}</h4>
                        <p className="text-xs text-[color:var(--theme-text-secondary)]">{metric.desc}</p>
                    </div>
                    <div className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-[#B9964A] animate-pulse"></div>
                    </div>
                </div>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN: TEXT INPUT */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="theme-section-glass rounded-[32px] p-2 relative overflow-hidden group">
            
            <div className="absolute -inset-1 bg-[linear-gradient(135deg,rgba(18,59,109,0.20),rgba(185,150,74,0.18))] rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="theme-section-surface relative rounded-[24px] p-8 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="mb-1 text-2xl font-bold text-[color:var(--theme-text-primary)]">Job Description</h2>
                        <p className="text-xs text-[color:var(--theme-text-secondary)]">Paste the full JD text here.</p>
                    </div>
                    <div className="rounded-lg bg-[color:var(--theme-surface-subtle)] p-2 text-[color:var(--theme-text-secondary)]">
                        <Briefcase size={20} />
                    </div>
                </div>

                {/* Text Area Wrapper */}
                <div className={`
                    flex-1 relative rounded-xl transition-all duration-300 border-2
                    ${isFocused ? 'border-[#123B6D] bg-[#E8EEF7]/70' : 'border-[color:var(--theme-border-soft)] bg-[color:var(--theme-surface-subtle)]'}
                `}>
                    <textarea 
                        className="custom-scrollbar h-80 w-full resize-none bg-transparent p-4 text-sm leading-relaxed text-[color:var(--theme-text-primary)] placeholder:text-[color:var(--theme-text-muted)] focus:outline-none"
                        placeholder="Paste Job Description here (e.g. 'We are looking for a Senior React Developer...')"
                        value={text}
                        onChange={(e) => setTextLocal(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    ></textarea>
                    
                    <div className="absolute bottom-4 right-4 rounded border border-[color:var(--theme-border-soft)] bg-[color:var(--theme-surface-solid)] px-2 py-1 text-xs font-medium text-[color:var(--theme-text-secondary)]">
                        {text.length > 50 ? (
                            <span className="text-[#123B6D] flex items-center gap-1"><CheckCircle2 size={10} /> Valid Length</span>
                        ) : (
                            <span className="text-slate-500 flex items-center gap-1">Min 50 chars</span>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={text.trim().length < 50}
                    className={`
                        w-full mt-6 py-5 rounded-2xl font-bold text-lg uppercase tracking-wide flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden
                        ${text.trim().length >= 50 
                            ? 'theme-primary-button hover:-translate-y-1' 
                            : 'bg-[color:var(--theme-surface-subtle)] text-[color:var(--theme-text-muted)] cursor-not-allowed border border-[color:var(--theme-border-soft)]'}
                    `}
                >
                    {text.trim().length >= 50 && <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12 -translate-x-full"></div>}
                    <span className="relative flex items-center gap-2">
                        Start AI Tailoring <ArrowRight size={20} />
                    </span>
                </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JDUpload;
