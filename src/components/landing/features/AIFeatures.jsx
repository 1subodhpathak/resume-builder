import React, { useState, useEffect } from 'react';
import { 
  Bot,
  CheckCircle2,
  MessageSquare,
  ScanLine,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';

const AIFeatures = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through features
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 5000); // Switch every 5 seconds
    return () => clearInterval(interval);
  }, [isPaused]);

  const features = [
    {
      id: 0,
      title: "AI Import Options",
      desc: "Choose exact extraction or a stronger AI-enhanced draft.",
      icon: <Wand2 size={24} />,
      color: "from-[#071426] to-[#123B6D]",
      content: {
        badge: "Import Modes",
        heading: "Start from your current resume, not a blank page.",
        description: "Upload a PDF or DOCX, keep the wording exactly as written, or let CareerSense prepare an AI-improved draft before you review every field.",
        stats: [
          { label: "Modes", value: "Exact or AI" },
          { label: "Output", value: "Fully Editable" }
        ],
        visual: (
            <div className="relative w-full h-full flex flex-col justify-center">
                {/* Simulated Chat Interface */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl mb-4 transform translate-x-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><Bot size={16} className="text-slate-300" /></div>
                        <div className="text-xs text-slate-400">CareerSense import</div>
                    </div>
                    <div className="text-sm text-slate-300 bg-slate-800 p-3 rounded-lg rounded-tl-none border border-slate-700">
                        Exact import keeps your wording. AI import can strengthen it before review.
                    </div>
                </div>

                {/* The "Transformation" Card */}
                <div className="bg-white rounded-xl p-6 shadow-xl border-l-4 border-[#123B6D] relative z-10 transform hover:scale-105 transition-transform duration-500">
                    <div className="mb-4">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Uploaded Resume</div>
                        <div className="text-xs text-slate-500 line-through decoration-red-400 decoration-2 opacity-60">
                            "I managed a team of people and we sold a lot of software."
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase font-bold text-[#123B6D] mb-1 flex items-center gap-1">
                            <Sparkles size={10} /> AI Optimized Draft
                        </div>
                        <div className="text-sm font-medium text-slate-800 leading-relaxed">
                            "Spearheaded a high-performance sales team of 15, driving a <span className="bg-[#B9964A]/15 text-[#071426] px-1 rounded font-bold">40% YoY revenue increase</span> through strategic account management."
                        </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    </div>
                </div>
            </div>
        )
      }
    },
    {
      id: 1,
      title: "ATS Match Scan",
      desc: "Compare your draft against a job description and spot gaps.",
      icon: <ScanLine size={24} />,
      color: "from-[#123B6D] to-[#3B6FA6]",
      content: {
        badge: "ATS Match",
        heading: "See what the job description is asking for.",
        description: "When you add a job description, CareerSense can show matched keywords, missing terms, and a focused score inside the builder so you know what to strengthen.",
        stats: [
          { label: "View", value: "Matched + Missing" },
          { label: "Input", value: "Resume + JD" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Document */}
                <div className="w-48 h-64 bg-white rounded-lg shadow-2xl relative overflow-hidden flex flex-col items-center pt-6 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 mb-2"></div>
                    <div className="w-full h-2 bg-slate-200 rounded"></div>
                    <div className="w-2/3 h-2 bg-slate-200 rounded"></div>
                    <div className="w-full h-px bg-slate-100 my-2"></div>
                    <div className="w-full space-y-2">
                        {[1,2,3,4].map(i => <div key={i} className="w-full h-1.5 bg-slate-100 rounded"></div>)}
                    </div>
                    
                    {/* Scanning Beam */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent h-1/2 w-full animate-[scan_2s_ease-in-out_infinite] border-b-2 border-blue-400"></div>
                </div>

                {/* Score Bubble */}
                <div className="absolute -right-4 top-1/2 bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-700">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">ATS Match</div>
                    <div className="text-3xl font-black text-blue-400">Missing</div>
                    <div className="mt-1 text-xs text-slate-400">Keywords and phrasing</div>
                </div>
            </div>
        )
      }
    },
    {
      id: 2,
      title: "JD Tailoring",
      desc: "Create a role-focused draft before you start editing.",
      icon: <Target size={24} />,
      color: "from-[#B9964A] to-[#9A7628]",
      content: {
        badge: "Job Match",
        heading: "Speak the recruiter's language.",
        description: "Upload your resume, paste the job description, and generate a tailored version that aligns the summary, bullet points, and skills to the role you want.",
        stats: [
          { label: "Workflow", value: "Resume + JD" },
          { label: "Draft", value: "Role Focused" }
        ],
        visual: (
            <div className="relative w-full h-full flex flex-col justify-center gap-4">
                {/* Job Description Snippet */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 opacity-50 scale-95 blur-[1px]">
                    <div className="text-[10px] text-slate-400 uppercase mb-2">Job Description Requirement</div>
                    <div className="text-xs text-slate-300">
                        Looking for a candidate proficient in <span className="text-white font-bold">React</span>, <span className="text-white font-bold">AWS</span>, and <span className="text-white font-bold">System Design</span>...
                    </div>
                </div>

                {/* Matching Interface */}
                <div className="bg-white p-5 rounded-xl shadow-xl border-t-4 border-[#B9964A]">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-slate-800 text-sm">Suggested Skills</span>
                        <span className="text-[10px] bg-[#B9964A]/15 text-[#9A7628] px-2 py-0.5 rounded-full font-bold">3 Found</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['React.js', 'AWS Lambda', 'System Architecture'].map((skill, i) => (
                            <div key={i} className="group cursor-pointer flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-[#B9964A] hover:bg-[#B9964A]/10 transition-all">
                                <span className="text-xs font-bold text-slate-600 group-hover:text-[#9A7628]">{skill}</span>
                                <div className="w-4 h-4 rounded-full bg-white border border-slate-300 flex items-center justify-center group-hover:border-[#B9964A] group-hover:bg-[#B9964A]">
                                    <CheckCircle2 size={10} className="text-white opacity-0 group-hover:opacity-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
      }
    },
    {
      id: 3,
      title: "Interview Prep",
      desc: "Generate likely questions and answer strategies from your resume and JD.",
      icon: <MessageSquare size={24} />,
      color: "from-[#0B1F3A] to-[#B9964A]",
      content: {
        badge: "Interview Coach",
        heading: "Turn your resume into talking points.",
        description: "Once you have a role-focused draft, CareerSense can generate interview questions and STAR-style answer guidance so your resume and interview prep stay aligned.",
        stats: [
          { label: "Output", value: "Question Set" },
          { label: "Guidance", value: "Answer Strategy" }
        ],
        visual: (
            <div className="relative w-full h-full flex flex-col justify-center gap-4">
                <div className="self-start max-w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Likely Question</div>
                    <p className="text-sm font-semibold text-slate-800">
                        Tell me about a time you improved a process or outcome using the skills highlighted in this job description.
                    </p>
                </div>
                <div className="ml-auto max-w-[360px] rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-xl">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">Suggested Strategy</div>
                    <p className="text-sm font-medium leading-relaxed text-orange-950">
                        Use STAR. Describe the original process, the bottleneck you found, the tool or workflow you introduced, and the measurable result that followed.
                    </p>
                </div>
            </div>
        )
      }
    }
  ];

  return (
    <div className="py-32 bg-slate-50 text-slate-900 overflow-hidden relative border-b border-slate-200">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#123B6D]/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#B9964A]/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                AI support inside
                <span className="text-[#B9964A]">
                     {" "}the builder.
                </span>
            </h2>
            <p className="text-slate-500 max-w-1xl mx-auto text-lg leading-relaxed font-medium">
                Use AI where it actually helps: resume import, content improvement, job targeting, ATS checks, and interview prep. Every result stays reviewable and editable.
            </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
            
            {/* Left: Navigation Panel */}
            <div className="w-full lg:w-1/3 flex flex-col gap-3">
                {features.map((feature, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setActiveTab(idx); setIsPaused(true); }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        className={`text-left p-5 rounded-2xl transition-all duration-300 border relative overflow-hidden group ${
                            activeTab === idx 
                            ? 'bg-white border-slate-200 shadow-xl' 
                            : 'bg-transparent border-transparent hover:bg-white hover:shadow-md'
                        }`}
                    >
                        {/* Progress Bar for Auto-play */}
                        {activeTab === idx && !isPaused && (
                            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#071426] to-[#B9964A] animate-[progress_5s_linear]" style={{ width: '100%' }}></div>
                        )}

                        <div className="flex items-start gap-4 relative z-10">
                            <div className={`p-3 rounded-xl transition-colors duration-300 ${
                                activeTab === idx ? `bg-gradient-to-br ${feature.color} text-white shadow-md` : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                            }`}>
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg mb-1 transition-colors ${activeTab === idx ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                    {feature.title}
                                </h3>
                                <p className={`text-sm leading-snug transition-colors ${activeTab === idx ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-600'}`}>
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Right: Dynamic Visual Display */}
            <div className="w-full lg:w-2/3 h-[500px] lg:h-[600px] relative">
                
                {features.map((feature, idx) => (
                    <div 
                        key={idx}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                            activeTab === idx ? 'opacity-100 translate-y-0 scale-100 z-20' : 'opacity-0 translate-y-8 scale-95 z-10'
                        }`}
                    >
                        {/* Outer White Card Frame */}
                        <div className="h-full bg-white rounded-[2.5rem] border border-slate-200 p-2 shadow-xl relative overflow-hidden">
                            
                            {/* Inner Container (Slate to look like an app window) */}
                            <div className="h-full bg-slate-50 rounded-[2rem] relative overflow-hidden flex flex-col">
                                
                                {/* Header of the Card */}
                                <div className="p-8 md:p-12 pb-0 relative z-20">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm mb-4`}>
                                        <Sparkles size={12} className="text-[#B9964A]" />
                                        {feature.content.badge}
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                                        {feature.content.heading}
                                    </h3>
                                    <p className="text-slate-600 text-lg max-w-xl leading-relaxed mb-8 font-medium">
                                        {feature.content.description}
                                    </p>
                                    
                                    {/* Stats Row */}
                                    <div className="flex gap-8 border-t border-slate-200 pt-6">
                                        {feature.content.stats.map((stat, i) => (
                                            <div key={i}>
                                                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Visual Stage */}
                                <div className="flex-1 relative mt-8 md:mt-0 flex flex-col justify-end">
                                    <div className="w-full h-full bg-gradient-to-t from-slate-100 to-transparent absolute inset-0 z-10 pointer-events-none"></div>
                                    <div className="relative z-0 h-full w-full p-8 flex items-center justify-center">
                                        {/* Dynamic Visual Mockup */}
                                        {feature.content.visual}
                                    </div>
                                </div>

                                {/* Background Accents */}
                                <div className={`absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br ${feature.color} opacity-5 blur-[100px] rounded-full pointer-events-none`}></div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

        </div>
      </div>
      
      {/* Global CSS for scanning animation */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AIFeatures;
