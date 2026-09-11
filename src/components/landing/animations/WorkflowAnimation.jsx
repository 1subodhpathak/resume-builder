// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     Moon, ChevronDown, CheckCircle2, Layout, User, Briefcase,
//     GraduationCap, Layers, Sparkles, SlidersHorizontal, Type,
//     AlignLeft, Loader2, Bot, Download, Wand2, Columns2, AlignJustify
// } from "lucide-react";

// export default function WorkflowAnimation() {
//     const [activeTab, setActiveTab] = useState("template");
//     const [currentTemplate, setCurrentTemplate] = useState("modern"); // 'modern' | 'classic'

//     // Centralized state to power the live preview updates
//     const [resumeData, setResumeData] = useState({
//         name: "POOJA BANSAL",
//         title: "Business Intelligence - Team Manager",
//         email: "bansal.Pooja@gmail.com",
//         phone: "+91989xxxxx99",
//         summary: "I am a data person who knows how to make reports and manage a team to do financial stuff.",
//         experienceRole: "Manager - Business Intelligence",
//         experienceCompany: "Conduent Business Services",
//         experienceDate: "03/2018 to Current",
//         experienceDesc: "• Managed the reporting team.\n• Did some supply chain analytics.\n• Fixed dashboards for different countries.",
//         educationDegree: "Master of Business Administration",
//         educationSchool: "Tarleton State University",
//         educationDate: "2009 - 2011",
//         skillsList: "Project Management, Process Development, Data Analytics, MIS Reporting, Process Automation, Cost Optimization, SQL, Tableau"
//     });

//     const [isGenerating, setIsGenerating] = useState({ summary: false, experience: false });

//     // Mock AI Generation Functions
//     const handleGenerateSummary = () => {
//         if (isGenerating.summary) return;
//         setIsGenerating(prev => ({ ...prev, summary: true }));
//         setTimeout(() => {
//             setResumeData(prev => ({
//                 ...prev,
//                 summary: "Results-driven Business Intelligence Team Manager with over 11 years of experience in financial transformation, process automation, and data analytics. Specializing in developing data-driven strategies that enhance operational efficiency."
//             }));
//             setIsGenerating(prev => ({ ...prev, summary: false }));
//         }, 2000);
//     };

//     const handleGenerateExperience = () => {
//         if (isGenerating.experience) return;
//         setIsGenerating(prev => ({ ...prev, experience: true }));
//         setTimeout(() => {
//             setResumeData(prev => ({
//                 ...prev,
//                 experienceDesc: "• Established a new Business Intelligence function leveraging SAS, Tableau, and SQL to enhance management reporting.\n• Analyzed sourcing and supply chain management processes using advanced analytics to identify budget variances.\n• Streamlined dashboard reporting for India, US, and Canada."
//             }));
//             setIsGenerating(prev => ({ ...prev, experience: false }));
//         }, 2000);
//     };

//     const tabs = [
//         { id: "template", label: "Change Template", icon: <Layout size={16} /> },
//         { id: "style", label: "Document Style", icon: <SlidersHorizontal size={16} /> },
//         { id: "personal", label: "Personal Details", icon: <User size={16} /> },
//         { id: "experience", label: "Experience", icon: <Briefcase size={16} /> },
//         { id: "education", label: "Education", icon: <GraduationCap size={16} /> },
//         { id: "skills", label: "Skills", icon: <Layers size={16} /> },
//     ];

//     const editorContent = {
//         template: {
//             title: "Choose Template",
//             desc: "Select a layout structure that best highlights your career journey.",
//             component: <TemplateEditor current={currentTemplate} onSelect={setCurrentTemplate} />
//         },
//         style: {
//             title: "Typography & Spacing",
//             desc: "Adjust the visual hierarchy and breathing room of your resume.",
//             component: <StyleEditor />
//         },
//         personal: {
//             title: "Refine the first impression",
//             desc: "Tighten your header and summary so the resume opens with clarity.",
//             component: <PersonalEditor data={resumeData} setData={setResumeData} isGenerating={isGenerating.summary} onGenerate={handleGenerateSummary} />
//         },
//         experience: {
//             title: "Highlight your impact",
//             desc: "Quantify your achievements and optimize for ATS scanners.",
//             component: <ExperienceEditor data={resumeData} setData={setResumeData} isGenerating={isGenerating.experience} onGenerate={handleGenerateExperience} />
//         },
//         education: {
//             title: "Academic Background",
//             desc: "List your degrees, certifications, and academic achievements.",
//             component: <EducationEditor data={resumeData} setData={setResumeData} />
//         },
//         skills: {
//             title: "Core Competencies",
//             desc: "Align your skills with the job description keywords.",
//             component: <SkillsEditor data={resumeData} setData={setResumeData} />
//         }
//     };

//     return (
//         <div className="relative w-full max-w-6xl mx-auto mt-10 group font-sans">
//             <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-blue-500/10 blur-3xl opacity-100 transition-opacity duration-1000" />

//             <div className="relative overflow-hidden rounded-2xl border-[8px] border-[color:var(--theme-border-strong)] bg-[color:var(--theme-section-muted-bg)] shadow-2xl">
//                 <div className="absolute top-0 left-1/2 z-50 flex h-6 w-32 -translate-x-1/2 items-center justify-center gap-2 rounded-b-xl bg-[color:var(--theme-section-muted-bg)]">
//                     <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--theme-border-strong)]"></div>
//                     <div className="w-1 h-1 rounded-full bg-teal-500/40"></div>
//                 </div>

//                 <div className="relative flex h-[680px] w-full overflow-hidden bg-[color:var(--theme-section-bg)] text-[color:var(--theme-text-primary)]">

//                     {/* Header */}
//                     <header className="landing-card absolute top-0 w-full h-14 border-x-0 border-t-0 flex items-center justify-between px-6 z-30 shadow-sm">
//                         <div className="flex items-center gap-4">
//                             <div className="landing-control flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer transition">
//                                 <ChevronDown size={14} className="rotate-90 text-[color:var(--theme-text-muted)]" />
//                                 <span className="font-bold text-[color:var(--theme-text-primary)] text-sm">My Workspace</span>
//                             </div>
//                             <div className="hidden lg:flex items-center gap-2">
//                                 <Badge label="BUSINESS ANALYST" color="landing-control text-[color:var(--theme-text-secondary)]" />
//                                 <Badge label="RECOMMENDED #3" color="theme-accent-panel" />
//                             </div>
//                         </div>
//                         <div className="flex items-center gap-3">
//                             <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
//                                 <Download size={14} /> Print / Save PDF
//                             </button>
//                         </div>
//                     </header>

//                     {/* Sidebar */}
//                     <aside className="landing-card w-60 border-y-0 border-l-0 pt-20 px-4 shrink-0 hidden md:block z-20 relative">
//                         <div className="mb-6">
//                             <div className="text-[10px] font-bold text-[color:var(--theme-text-muted)] uppercase tracking-widest mb-4">Sections</div>
//                             <div className="space-y-1 relative">
//                                 {tabs.map((tab) => (
//                                     <SidebarItem
//                                         key={tab.id}
//                                         icon={tab.icon}
//                                         label={tab.label}
//                                         active={activeTab === tab.id}
//                                         onClick={() => setActiveTab(tab.id)}
//                                     />
//                                 ))}
//                             </div>
//                         </div>

//                         {/* AI Status Indicator */}
//                         <AnimatePresence>
//                             {(isGenerating.summary || isGenerating.experience) && (
//                                 <motion.div
//                                     initial={{ opacity: 0, y: 10 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     exit={{ opacity: 0, y: 10 }}
//                                     className="theme-accent-panel absolute bottom-6 left-4 right-4 p-3 rounded-lg flex items-center gap-3 shadow-sm"
//                                 >
//                                     <Loader2 size={16} className="text-indigo-500 animate-spin" />
//                                     <span className="text-xs font-bold">AI is writing...</span>
//                                 </motion.div>
//                             )}
//                         </AnimatePresence>
//                     </aside>

//                     {/* Main Content Area */}
//                     <main className="flex-1 pt-14 flex overflow-hidden">

//                         {/* Dynamic Editor Panel */}
//                         <section className="w-[45%] p-8 border-r border-[color:var(--theme-border-soft)] overflow-y-auto bg-[color:var(--theme-surface-glass)] relative hide-scrollbar">
//                             <AnimatePresence mode="wait">
//                                 <motion.div
//                                     key={activeTab}
//                                     initial={{ opacity: 0, x: -10 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     exit={{ opacity: 0, x: 10 }}
//                                     transition={{ duration: 0.2 }}
//                                     className="h-full flex flex-col pb-10"
//                                 >
//                                     <div className="mb-6">
//                                         <div className="flex items-center gap-2 text-teal-600 mb-2">
//                                             <Layout size={16} />
//                                             <span className="text-xs font-bold uppercase tracking-wider">Active Section</span>
//                                         </div>
//                                         <h1 className="text-3xl font-bold text-[color:var(--theme-text-primary)] leading-tight">
//                                             {editorContent[activeTab].title}
//                                         </h1>
//                                         <p className="text-[color:var(--theme-text-secondary)] mt-2 text-sm">
//                                             {editorContent[activeTab].desc}
//                                         </p>
//                                     </div>

//                                     <div className="flex-1">
//                                         {editorContent[activeTab].component}
//                                     </div>
//                                 </motion.div>
//                             </AnimatePresence>
//                         </section>

//                         {/* Interactive Preview Panel */}
//                         <section className="flex-1 bg-[color:var(--theme-section-muted-bg)] p-6 flex justify-center items-start overflow-y-auto">
//                             <div className="w-full max-w-[420px] aspect-[1/1.41] bg-white shadow-xl rounded-sm border border-[color:var(--theme-card-border)] transform origin-top hover:scale-[1.02] transition-transform duration-300 overflow-hidden relative">
//                                 <AnimatePresence mode="wait">
//                                     <motion.div
//                                         key={currentTemplate}
//                                         initial={{ opacity: 0, scale: 0.98 }}
//                                         animate={{ opacity: 1, scale: 1 }}
//                                         exit={{ opacity: 0, scale: 1.02 }}
//                                         transition={{ duration: 0.3 }}
//                                         className="absolute inset-0 w-full h-full"
//                                     >
//                                         {currentTemplate === "modern" ? (
//                                             <ModernTemplate data={resumeData} activeTab={activeTab} isGenerating={isGenerating} />
//                                         ) : (
//                                             <ClassicTemplate data={resumeData} activeTab={activeTab} isGenerating={isGenerating} />
//                                         )}
//                                     </motion.div>
//                                 </AnimatePresence>
//                             </div>
//                         </section>
//                     </main>
//                 </div>
//             </div>
//             <div className="relative -left-[2.5%] mx-auto h-3 w-[105%] rounded-b-xl border-t border-[color:var(--theme-border-strong)] bg-[color:var(--theme-section-muted-bg)] shadow-xl" />
//         </div>
//     );
// }

// // --- TEMPLATES ---

// function ModernTemplate({ data, activeTab, isGenerating }) {
//     return (
//         <div className="flex h-full w-full text-[10px]">
//             {/* Left Green Column */}
//             <div className="w-[35%] bg-[#498654] text-white p-6 flex flex-col gap-6">
//                 <div>
//                     <h2 className="text-xl font-bold leading-tight">{data.name}</h2>
//                 </div>
//                 <div className="relative rounded-md transition-all">
//                     <div className="font-bold text-[8px] uppercase tracking-wider mb-2 text-emerald-100">Achievements</div>
//                     <div className="space-y-4">
//                         <div>
//                             <div className="font-bold text-[9px]">EIP Incentive Program</div>
//                             <div className="text-[7px] text-emerald-200/80">NTT Data</div>
//                         </div>
//                         <div>
//                             <div className="font-bold text-[9px]">Master Mind Tool</div>
//                             <div className="text-[7px] text-emerald-200/80">NTT Data</div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Right White Column */}
//             <div className="w-[65%] p-6 flex flex-col gap-4 text-slate-800">
//                 <PreviewBlock isActive={activeTab === "personal"} isGenerating={isGenerating.summary}>
//                     <div className="font-bold text-teal-700 text-[9px] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
//                         {data.title}
//                     </div>
//                     <div className="text-[7px] text-slate-500 mb-3">
//                         {data.email} | {data.phone} | Gurgaon
//                     </div>
//                     <div className="font-bold text-[8px] text-slate-400 uppercase tracking-wider mb-1">Summary</div>
//                     <motion.div key={data.summary} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[7px] leading-relaxed text-slate-600 rounded">
//                         {data.summary}
//                     </motion.div>
//                 </PreviewBlock>

//                 <PreviewBlock isActive={activeTab === "experience"} isGenerating={isGenerating.experience}>
//                     <div className="font-bold text-[8px] text-slate-400 uppercase tracking-wider mb-2">Experience</div>
//                     <div>
//                         <div className="flex justify-between items-center font-bold text-[9px]">
//                             <span>{data.experienceRole}</span>
//                             <span className="text-slate-400 text-[6px] font-normal">{data.experienceDate}</span>
//                         </div>
//                         <div className="text-teal-700 font-bold text-[7px] mb-1.5 uppercase">{data.experienceCompany}</div>
//                         <motion.div key={data.experienceDesc} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[7px] leading-relaxed text-slate-600 whitespace-pre-line pl-2">
//                             {data.experienceDesc}
//                         </motion.div>
//                     </div>
//                 </PreviewBlock>

//                 <PreviewBlock isActive={activeTab === "education"}>
//                     <div className="font-bold text-[8px] text-slate-400 uppercase tracking-wider mb-2">Education</div>
//                     <div>
//                         <div className="flex justify-between items-center font-bold text-[9px]">
//                             <span>{data.educationDegree}</span>
//                             <span className="text-slate-400 text-[6px] font-normal">{data.educationDate}</span>
//                         </div>
//                         <div className="text-teal-700 font-bold text-[7px] mb-1.5 uppercase">{data.educationSchool}</div>
//                     </div>
//                 </PreviewBlock>

//                 <PreviewBlock isActive={activeTab === "skills"}>
//                     <div className="font-bold text-[8px] text-slate-400 uppercase tracking-wider mb-1">Technical Skills</div>
//                     <div className="text-[7.5px] leading-relaxed text-slate-600 pr-2">
//                         {data.skillsList}
//                     </div>
//                 </PreviewBlock>
//             </div>
//         </div>
//     );
// }

// function ClassicTemplate({ data, activeTab, isGenerating }) {
//     return (
//         <div className="flex flex-col h-full w-full text-[10px] p-8 text-slate-800 bg-white">
//             <PreviewBlock isActive={activeTab === "personal"} isGenerating={isGenerating.summary}>
//                 <div className="text-center mb-5">
//                     <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">{data.name}</h2>
//                     <div className="font-bold text-teal-700 text-[10px] uppercase tracking-wider mb-1">
//                         {data.title}
//                     </div>
//                     <div className="text-[7px] text-slate-500 flex justify-center gap-2 divider-x">
//                         <span>{data.email}</span>
//                         <span>•</span>
//                         <span>{data.phone}</span>
//                         <span>•</span>
//                         <span>Gurgaon, India</span>
//                     </div>
//                 </div>
//                 <div className="mb-4">
//                     <div className="font-bold text-[8px] text-slate-900 border-b-2 border-slate-900 uppercase tracking-wider mb-2 pb-1">Professional Summary</div>
//                     <motion.div key={data.summary} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[7.5px] leading-relaxed text-slate-600">
//                         {data.summary}
//                     </motion.div>
//                 </div>
//             </PreviewBlock>

//             <PreviewBlock isActive={activeTab === "experience"} isGenerating={isGenerating.experience}>
//                 <div className="mb-4">
//                     <div className="font-bold text-[8px] text-slate-900 border-b-2 border-slate-900 uppercase tracking-wider mb-2 pb-1">Professional Experience</div>
//                     <div>
//                         <div className="flex justify-between items-end mb-0.5">
//                             <span className="font-bold text-[10px] text-slate-800">{data.experienceRole}</span>
//                             <span className="text-slate-500 text-[7px] font-bold">{data.experienceDate}</span>
//                         </div>
//                         <div className="text-teal-700 font-bold text-[8px] mb-2">{data.experienceCompany}</div>
//                         <motion.div key={data.experienceDesc} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[7.5px] leading-relaxed text-slate-600 whitespace-pre-line pl-3">
//                             {data.experienceDesc}
//                         </motion.div>
//                     </div>
//                 </div>
//             </PreviewBlock>

//             <div className="flex gap-6 mt-2">
//                 <div className="w-1/2">
//                     <PreviewBlock isActive={activeTab === "skills"}>
//                         <div className="font-bold text-[8px] text-slate-900 border-b-2 border-slate-900 uppercase tracking-wider mb-2 pb-1">Core Competencies</div>
//                         <div className="text-[7.5px] leading-relaxed text-slate-600">
//                             {data.skillsList}
//                         </div>
//                     </PreviewBlock>
//                 </div>
//                 <div className="w-1/2">
//                     <PreviewBlock isActive={activeTab === "education"}>
//                         <div className="font-bold text-[8px] text-slate-900 border-b-2 border-slate-900 uppercase tracking-wider mb-2 pb-1">Education</div>
//                         <div>
//                             <div className="font-bold text-[8px] text-slate-800">{data.educationDegree}</div>
//                             <div className="text-slate-600 text-[7px] mb-1">{data.educationSchool}</div>
//                             <div className="text-slate-400 text-[6px] font-bold">{data.educationDate}</div>
//                         </div>
//                     </PreviewBlock>
//                 </div>
//             </div>
//         </div>
//     );
// }


// // --- SUB-COMPONENTS ---

// function TemplateEditor({ current, onSelect }) {
//     return (
//         <div className="space-y-4">
//             <button
//                 onClick={() => onSelect("modern")}
//                 className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${current === "modern" ? 'theme-accent-panel border-[color:var(--theme-accent)] shadow-md' : 'landing-control hover:border-[color:var(--theme-border-strong)]'}`}
//             >
//                 <div className={`p-3 rounded-lg ${current === "modern" ? 'bg-[color:var(--theme-accent)] text-white' : 'landing-icon-tile'}`}>
//                     <Columns2 size={24} />
//                 </div>
//                 <div>
//                     <div className="font-bold text-[color:var(--theme-text-primary)] text-sm mb-1">Modern (Two-Column)</div>
//                     <div className="text-xs text-[color:var(--theme-text-secondary)]">Perfect for skill-heavy profiles. Maximizes page space with a dedicated sidebar.</div>
//                 </div>
//                 {current === "modern" && <CheckCircle2 className="ml-auto text-teal-500" size={20} />}
//             </button>

//             <button
//                 onClick={() => onSelect("classic")}
//                 className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${current === "classic" ? 'theme-accent-panel border-[color:var(--theme-accent)] shadow-md' : 'landing-control hover:border-[color:var(--theme-border-strong)]'}`}
//             >
//                 <div className={`p-3 rounded-lg ${current === "classic" ? 'bg-[color:var(--theme-accent)] text-white' : 'landing-icon-tile'}`}>
//                     <AlignJustify size={24} />
//                 </div>
//                 <div>
//                     <div className="font-bold text-[color:var(--theme-text-primary)] text-sm mb-1">Classic (Single-Column)</div>
//                     <div className="text-xs text-[color:var(--theme-text-secondary)]">Traditional top-down flow. Best for ATS readability and executive roles.</div>
//                 </div>
//                 {current === "classic" && <CheckCircle2 className="ml-auto text-teal-500" size={20} />}
//             </button>
//         </div>
//     );
// }


// function SidebarItem({ icon, label, active, onClick }) {
//     return (
//         <button
//             onClick={onClick}
//             className={`w-full flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all relative z-10 ${active ? 'text-[color:var(--theme-accent-strong)]' : 'text-[color:var(--theme-text-secondary)] hover:bg-[color:var(--theme-control-hover)]'}`}
//         >
//             {active && (
//                 <motion.div
//                     layoutId="active-sidebar-bg"
//                     className="absolute inset-0 bg-[color:var(--theme-accent-soft)] rounded-lg -z-10 border border-[color:var(--theme-accent-panel-border)]"
//                     initial={false}
//                     transition={{ type: "spring", stiffness: 400, damping: 30 }}
//                 />
//             )}
//             <div className="flex items-center gap-3">
//                 <span className={active ? 'text-[color:var(--theme-accent-strong)]' : 'text-[color:var(--theme-text-muted)]'}>{icon}</span>
//                 <span className="text-xs font-bold">{label}</span>
//             </div>
//             {label !== "Change Template" && <div className="text-[8px] font-black text-emerald-500 uppercase">Ready</div>}
//         </button>
//     );
// }

// function PreviewBlock({ children, isActive, isGenerating }) {
//     return (
//         <motion.div
//             animate={{ opacity: isActive ? 1 : 0.4 }}
//             transition={{ duration: 0.3 }}
//             className={`relative rounded-md p-1.5 -m-1.5 transition-all ${isActive ? 'bg-[color:var(--theme-card-subtle-bg)] ring-1 ring-[color:var(--theme-card-border)]' : ''}`}
//         >
//             {isGenerating && (
//                 <div className="absolute inset-0 z-10 overflow-hidden rounded-md pointer-events-none">
//                     <motion.div
//                         initial={{ x: '-100%' }}
//                         animate={{ x: '100%' }}
//                         transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
//                         className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent"
//                     />
//                 </div>
//             )}
//             {children}
//             {isActive && !isGenerating && (
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="absolute -left-3 top-2 bg-teal-500 text-white rounded-full p-0.5 shadow-sm z-10"
//                 >
//                     <CheckCircle2 size={10} />
//                 </motion.div>
//             )}
//         </motion.div>
//     );
// }

// // ... [PersonalEditor, ExperienceEditor, EducationEditor, SkillsEditor, StyleEditor, InputField, SliderField, Badge remain unchanged]

// function PersonalEditor({ data, setData, isGenerating, onGenerate }) {
//     return (
//         <div className="space-y-4">
//             <InputField label="Full Name" value={data.name} onChange={(val) => setData({ ...data, name: val })} />
//             <InputField label="Job Title" value={data.title} onChange={(val) => setData({ ...data, title: val })} />

//             <div className="flex gap-3">
//                 <div className="flex-1"><InputField label="Email" value={data.email} onChange={(val) => setData({ ...data, email: val })} /></div>
//                 <div className="flex-1"><InputField label="Phone" value={data.phone} onChange={(val) => setData({ ...data, phone: val })} /></div>
//             </div>

//             <div className={`landing-card mt-6 rounded-xl transition-all duration-300 overflow-hidden ${isGenerating ? 'border-indigo-300 shadow-md shadow-indigo-100' : 'shadow-sm'}`}>
//                 <div className="landing-card-subtle px-4 py-2.5 border-x-0 border-t-0 flex justify-between items-center">
//                     <label className="text-[10px] font-bold text-[color:var(--theme-text-muted)] uppercase tracking-widest flex items-center gap-1.5">
//                         <Type size={12} /> Professional Summary
//                     </label>
//                     <button
//                         onClick={onGenerate}
//                         disabled={isGenerating}
//                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isGenerating
//                                 ? 'bg-indigo-50 text-indigo-400 cursor-not-allowed'
//                                 : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-md hover:from-indigo-600 hover:to-purple-600'
//                             }`}
//                     >
//                         {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
//                         {isGenerating ? 'Writing...' : 'Rewrite with AI'}
//                     </button>
//                 </div>
//                 <div className="p-1 relative">
//                     <textarea
//                         value={data.summary}
//                         onChange={(e) => setData({ ...data, summary: e.target.value })}
//                         className={`w-full h-28 p-3 text-xs bg-transparent text-[color:var(--theme-text-primary)] outline-none resize-none transition-opacity ${isGenerating ? 'opacity-40' : 'opacity-100'}`}
//                     />
//                     {isGenerating && (
//                         <div className="absolute inset-0 flex items-center justify-center">
//                             <Bot size={32} className="text-indigo-300 animate-pulse" />
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// function ExperienceEditor({ data, setData, isGenerating, onGenerate }) {
//     return (
//         <div className="space-y-4">
//             <div className={`landing-card shadow-sm rounded-xl p-5 relative overflow-hidden transition-all duration-300 ${isGenerating ? 'border-indigo-300 shadow-md shadow-indigo-100' : ''}`}>
//                 <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isGenerating ? 'bg-indigo-500' : 'bg-teal-500'}`} />
//                 <InputField label="Role" value={data.experienceRole} onChange={(val) => setData({ ...data, experienceRole: val })} />
//                 <InputField label="Company" value={data.experienceCompany} onChange={(val) => setData({ ...data, experienceCompany: val })} />
//                 <InputField label="Date" value={data.experienceDate} onChange={(val) => setData({ ...data, experienceDate: val })} />

//                 <div className="mt-5 relative">
//                     <div className="flex justify-between items-end mb-2">
//                         <label className="text-[10px] font-bold text-[color:var(--theme-text-muted)] uppercase tracking-widest block">Job Description</label>
//                         <button
//                             onClick={onGenerate}
//                             disabled={isGenerating}
//                             className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all ${isGenerating ? 'bg-indigo-50 text-indigo-400' : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
//                                 }`}
//                         >
//                             {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
//                             {isGenerating ? 'Enhancing...' : 'Enhance AI'}
//                         </button>
//                     </div>
//                     <div className="relative">
//                         <textarea
//                             value={data.experienceDesc}
//                             onChange={(e) => setData({ ...data, experienceDesc: e.target.value })}
//                             className={`landing-control w-full rounded-lg p-3 text-xs h-32 outline-none focus:border-indigo-400 transition-all resize-none ${isGenerating ? 'opacity-40' : 'opacity-100'}`}
//                         />
//                         {isGenerating && (
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
//                                     <Sparkles size={20} />
//                                 </motion.div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// function EducationEditor({ data, setData }) {
//     return (
//         <div className="space-y-4">
//             <div className="landing-card shadow-sm rounded-xl p-5 relative overflow-hidden">
//                 <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
//                 <InputField label="Degree" value={data.educationDegree} onChange={(val) => setData({ ...data, educationDegree: val })} />
//                 <InputField label="School / University" value={data.educationSchool} onChange={(val) => setData({ ...data, educationSchool: val })} />
//                 <InputField label="Years Attended" value={data.educationDate} onChange={(val) => setData({ ...data, educationDate: val })} />
//             </div>
//         </div>
//     );
// }

// function SkillsEditor({ data, setData }) {
//     return (
//         <div className="space-y-4">
//             <div className="landing-card shadow-sm rounded-xl p-5 relative overflow-hidden">
//                 <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
//                 <label className="text-[10px] font-bold text-[color:var(--theme-text-muted)] uppercase tracking-widest block mb-1.5 pl-1">Comma Separated Skills</label>
//                 <textarea
//                     value={data.skillsList}
//                     onChange={(e) => setData({ ...data, skillsList: e.target.value })}
//                     className="landing-control w-full rounded-lg p-3 text-xs h-32 outline-none focus:border-teal-400 transition-all resize-none"
//                 />
//             </div>
//         </div>
//     );
// }

// function StyleEditor() {
//     return (
//         <div className="landing-card-subtle space-y-6 p-6 rounded-xl">
//             <div>
//                 <label className="text-[10px] font-bold text-[color:var(--theme-text-muted)] uppercase tracking-widest flex items-center gap-2 mb-3">
//                     <Type size={12} /> Font Family
//                 </label>
//                 <select className="landing-control w-full rounded-lg p-2.5 text-xs font-bold outline-none focus:border-teal-500 cursor-pointer shadow-sm">
//                     <option>Modern Sans</option>
//                     <option>Classic Serif</option>
//                 </select>
//             </div>
//             <hr className="border-[color:var(--theme-border-soft)]" />
//             <SliderField icon={<AlignLeft size={12} />} label="Page Margin" leftLabel="NARROW" rightLabel="WIDE" percent={20} />
//             <SliderField icon={<SlidersHorizontal size={12} />} label="Section Spacing" leftLabel="COMPACT" rightLabel="AIRY" percent={45} />
//             <SliderField icon={<Type size={12} />} label="Font Size" leftLabel="SMALL" rightLabel="LARGE" percent={80} />
//         </div>
//     );
// }

// function InputField({ label, value, onChange }) {
//     return (
//         <div className="mb-3">
//             <label className="text-[10px] font-bold text-[color:var(--theme-text-muted)] uppercase tracking-widest block mb-1.5 pl-1">{label}</label>
//             <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="landing-control w-full rounded-lg p-2.5 text-xs font-bold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm" />
//         </div>
//     );
// }

// function SliderField({ icon, label, leftLabel, rightLabel, percent }) {
//     return (
//         <div className="mb-5">
//             <div className="flex justify-between items-center mb-2">
//                 <label className="text-[10px] font-bold text-[color:var(--theme-text-secondary)] uppercase flex items-center gap-1.5">{icon} {label}</label>
//             </div>
//             <div className="relative h-1.5 bg-[color:var(--theme-control-bg)] rounded-full w-full">
//                 <div className="absolute top-0 left-0 h-full bg-teal-500 rounded-full" style={{ width: `${percent}%` }} />
//                 <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[color:var(--theme-card-bg)] border-2 border-teal-500 rounded-full shadow cursor-pointer hover:scale-110 transition-transform" style={{ left: `calc(${percent}% - 8px)` }} />
//             </div>
//             <div className="flex justify-between mt-2 text-[8px] font-bold text-[color:var(--theme-text-muted)] tracking-wider">
//                 <span>{leftLabel}</span>
//                 <span>{rightLabel}</span>
//             </div>
//         </div>
//     );
// }

// function Badge({ label, color }) {
//     return <div className={`px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap ${color}`}>{label}</div>;
// }


import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CheckCircle2,
  Layout,
  User,
  Briefcase,
  GraduationCap,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Type,
  AlignLeft,
  Loader2,
  Bot,
  Download,
  Wand2,
  Columns2,
  AlignJustify,
} from "lucide-react";

const THEME = {
  bg: "#F7F8FA",
  surface: "#FFFFFF",
  text: "#071426",
  secondary: "#475569",
  muted: "#64748B",
  primary: "#071426",
  primaryHover: "#0B1F3A",
  gold: "#B9964A",
  goldDark: "#9A7628",
  border: "#E1E7EF",
  borderStrong: "#CBD5E1",
  success: "#123B6D",
  danger: "#B91C1C",
};

export default function WorkflowAnimation() {
  const [activeTab, setActiveTab] = useState("template");
  const [currentTemplate, setCurrentTemplate] = useState("modern");

  const [resumeData, setResumeData] = useState({
    name: "POOJA BANSAL",
    title: "Business Intelligence - Team Manager",
    email: "bansal.Pooja@gmail.com",
    phone: "+91989xxxxx99",
    summary:
      "I am a data person who knows how to make reports and manage a team to do financial stuff.",
    experienceRole: "Manager - Business Intelligence",
    experienceCompany: "Conduent Business Services",
    experienceDate: "03/2018 to Current",
    experienceDesc:
      "• Managed the reporting team.\n• Did some supply chain analytics.\n• Fixed dashboards for different countries.",
    educationDegree: "Master of Business Administration",
    educationSchool: "Tarleton State University",
    educationDate: "2009 - 2011",
    skillsList:
      "Project Management, Process Development, Data Analytics, MIS Reporting, Process Automation, Cost Optimization, SQL, Tableau",
  });

  const [isGenerating, setIsGenerating] = useState({
    summary: false,
    experience: false,
  });

  const handleGenerateSummary = () => {
    if (isGenerating.summary) return;

    setIsGenerating((prev) => ({ ...prev, summary: true }));

    setTimeout(() => {
      setResumeData((prev) => ({
        ...prev,
        summary:
          "Results-driven Business Intelligence Team Manager with over 11 years of experience in financial transformation, process automation, and data analytics. Specializing in developing data-driven strategies that enhance operational efficiency.",
      }));

      setIsGenerating((prev) => ({ ...prev, summary: false }));
    }, 2000);
  };

  const handleGenerateExperience = () => {
    if (isGenerating.experience) return;

    setIsGenerating((prev) => ({ ...prev, experience: true }));

    setTimeout(() => {
      setResumeData((prev) => ({
        ...prev,
        experienceDesc:
          "• Established a new Business Intelligence function leveraging SAS, Tableau, and SQL to enhance management reporting.\n• Analyzed sourcing and supply chain management processes using advanced analytics to identify budget variances.\n• Streamlined dashboard reporting for India, US, and Canada.",
      }));

      setIsGenerating((prev) => ({ ...prev, experience: false }));
    }, 2000);
  };

  const tabs = [
    { id: "template", label: "Change Template", icon: <Layout size={16} /> },
    { id: "style", label: "Document Style", icon: <SlidersHorizontal size={16} /> },
    { id: "personal", label: "Personal Details", icon: <User size={16} /> },
    { id: "experience", label: "Experience", icon: <Briefcase size={16} /> },
    { id: "education", label: "Education", icon: <GraduationCap size={16} /> },
    { id: "skills", label: "Skills", icon: <Layers size={16} /> },
  ];

  const editorContent = {
    template: {
      title: "Choose Template",
      desc: "Select a layout structure that best highlights your career journey.",
      component: (
        <TemplateEditor current={currentTemplate} onSelect={setCurrentTemplate} />
      ),
    },
    style: {
      title: "Typography & Spacing",
      desc: "Adjust the visual hierarchy and breathing room of your resume.",
      component: <StyleEditor />,
    },
    personal: {
      title: "Refine the first impression",
      desc: "Tighten your header and summary so the resume opens with clarity.",
      component: (
        <PersonalEditor
          data={resumeData}
          setData={setResumeData}
          isGenerating={isGenerating.summary}
          onGenerate={handleGenerateSummary}
        />
      ),
    },
    experience: {
      title: "Highlight your impact",
      desc: "Quantify your achievements and optimize for ATS scanners.",
      component: (
        <ExperienceEditor
          data={resumeData}
          setData={setResumeData}
          isGenerating={isGenerating.experience}
          onGenerate={handleGenerateExperience}
        />
      ),
    },
    education: {
      title: "Academic Background",
      desc: "List your degrees, certifications, and academic achievements.",
      component: <EducationEditor data={resumeData} setData={setResumeData} />,
    },
    skills: {
      title: "Core Competencies",
      desc: "Align your skills with the job description keywords.",
      component: <SkillsEditor data={resumeData} setData={setResumeData} />,
    },
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl font-sans">
      <div
        className="pointer-events-none absolute -inset-4 rounded-[2rem] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(185,150,74,0.18), transparent 34%), radial-gradient(circle at 88% 10%, rgba(11,18,32,0.12), transparent 36%)",
        }}
      />

      <div className="relative overflow-hidden rounded-2xl border border-[#E1E7EF] bg-[#F7F8FA] shadow-[0_28px_80px_rgba(11,18,32,0.18)]">
        <div className="relative flex h-[680px] w-full overflow-hidden bg-[#FFFFFF] text-[#071426]">
          {/* Header */}
          <header className="absolute top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#E1E7EF] bg-white/95 px-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E1E7EF] bg-[#F7F8FA] px-3 py-1.5 transition hover:bg-white">
                <ChevronDown size={14} className="rotate-90 text-[#64748B]" />
                <span className="text-sm font-bold text-[#071426]">
                  My Workspace
                </span>
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                <Badge label="BUSINESS ANALYST" />
                <Badge label="RECOMMENDED #3" accent />
              </div>
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-[#071426] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#0B1F3A]">
              <Download size={14} />
              Print / Save PDF
            </button>
          </header>

          {/* Sidebar */}
          <aside className="relative z-20 hidden w-60 shrink-0 border-r border-[#E1E7EF] bg-white px-4 pt-20 md:block">
            <div className="mb-6">
              <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                Sections
              </div>

              <div className="relative space-y-1">
                {tabs.map((tab) => (
                  <SidebarItem
                    key={tab.id}
                    icon={tab.icon}
                    label={tab.label}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence>
              {(isGenerating.summary || isGenerating.experience) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-6 left-4 right-4 flex items-center gap-3 rounded-lg border border-[#B9964A]/30 bg-[#B9964A]/10 p-3 shadow-sm"
                >
                  <Loader2 size={16} className="animate-spin text-[#9A7628]" />
                  <span className="text-xs font-bold text-[#071426]">
                    AI is writing...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          {/* Main Content */}
          <main className="flex flex-1 overflow-hidden pt-14">
            {/* Editor */}
            <section className="relative w-[45%] overflow-y-auto border-r border-[#E1E7EF] bg-[#F7F8FA] p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-45"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(203,213,225,0.28) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(203,213,225,0.22) 1px, transparent 1px)
                  `,
                  backgroundSize: "30px 30px",
                }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 flex h-full flex-col pb-10"
                >
                  <div className="mb-6">
                    <div className="mb-2 flex items-center gap-2 text-[#9A7628]">
                      <Layout size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Active Section
                      </span>
                    </div>

                    <h1 className="text-3xl font-bold leading-tight text-[#071426]">
                      {editorContent[activeTab].title}
                    </h1>

                    <p className="mt-2 text-sm text-[#475569]">
                      {editorContent[activeTab].desc}
                    </p>
                  </div>

                  <div className="flex-1">
                    {editorContent[activeTab].component}
                  </div>
                </motion.div>
              </AnimatePresence>
            </section>

            {/* Preview */}
            <section className="flex flex-1 items-start justify-center overflow-y-auto bg-[#EEF2F7] p-6">
              <div className="relative aspect-[1/1.41] w-full max-w-[420px] overflow-hidden rounded-sm border border-[#E1E7EF] bg-white shadow-[0_24px_70px_rgba(11,18,32,0.16)] transition-transform duration-300 hover:scale-[1.02]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTemplate}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 h-full w-full"
                  >
                    {currentTemplate === "modern" ? (
                      <ModernTemplate
                        data={resumeData}
                        activeTab={activeTab}
                        isGenerating={isGenerating}
                      />
                    ) : (
                      <ClassicTemplate
                        data={resumeData}
                        activeTab={activeTab}
                        isGenerating={isGenerating}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

/* Templates */

function ModernTemplate({ data, activeTab, isGenerating }) {
  return (
    <div className="flex h-full w-full text-[10px]">
      <div className="flex w-[35%] flex-col gap-6 bg-[#071426] p-6 text-white">
        <div>
          <h2 className="text-xl font-bold leading-tight">{data.name}</h2>
        </div>

        <div className="relative rounded-md transition-all">
          <div className="mb-2 text-[8px] font-bold uppercase tracking-wider text-[#B9964A]">
            Achievements
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[9px] font-bold">EIP Incentive Program</div>
              <div className="text-[7px] text-[#CBD5E1]">NTT Data</div>
            </div>

            <div>
              <div className="text-[9px] font-bold">Master Mind Tool</div>
              <div className="text-[7px] text-[#CBD5E1]">NTT Data</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-[65%] flex-col gap-4 p-6 text-[#071426]">
        <PreviewBlock isActive={activeTab === "personal"} isGenerating={isGenerating.summary}>
          <div className="mb-2 border-b border-[#E1E7EF] pb-1 text-[9px] font-bold uppercase tracking-wider text-[#9A7628]">
            {data.title}
          </div>

          <div className="mb-3 text-[7px] text-[#64748B]">
            {data.email} | {data.phone} | Gurgaon
          </div>

          <div className="mb-1 text-[8px] font-bold uppercase tracking-wider text-[#64748B]">
            Summary
          </div>

          <motion.div
            key={data.summary}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded text-[7px] leading-relaxed text-[#475569]"
          >
            {data.summary}
          </motion.div>
        </PreviewBlock>

        <PreviewBlock isActive={activeTab === "experience"} isGenerating={isGenerating.experience}>
          <div className="mb-2 text-[8px] font-bold uppercase tracking-wider text-[#64748B]">
            Experience
          </div>

          <div>
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span>{data.experienceRole}</span>
              <span className="text-[6px] font-normal text-[#64748B]">
                {data.experienceDate}
              </span>
            </div>

            <div className="mb-1.5 text-[7px] font-bold uppercase text-[#9A7628]">
              {data.experienceCompany}
            </div>

            <motion.div
              key={data.experienceDesc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whitespace-pre-line pl-2 text-[7px] leading-relaxed text-[#475569]"
            >
              {data.experienceDesc}
            </motion.div>
          </div>
        </PreviewBlock>

        <PreviewBlock isActive={activeTab === "education"}>
          <div className="mb-2 text-[8px] font-bold uppercase tracking-wider text-[#64748B]">
            Education
          </div>

          <div>
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span>{data.educationDegree}</span>
              <span className="text-[6px] font-normal text-[#64748B]">
                {data.educationDate}
              </span>
            </div>

            <div className="mb-1.5 text-[7px] font-bold uppercase text-[#9A7628]">
              {data.educationSchool}
            </div>
          </div>
        </PreviewBlock>

        <PreviewBlock isActive={activeTab === "skills"}>
          <div className="mb-1 text-[8px] font-bold uppercase tracking-wider text-[#64748B]">
            Technical Skills
          </div>

          <div className="pr-2 text-[7.5px] leading-relaxed text-[#475569]">
            {data.skillsList}
          </div>
        </PreviewBlock>
      </div>
    </div>
  );
}

function ClassicTemplate({ data, activeTab, isGenerating }) {
  return (
    <div className="flex h-full w-full flex-col bg-white p-8 text-[10px] text-[#071426]">
      <PreviewBlock isActive={activeTab === "personal"} isGenerating={isGenerating.summary}>
        <div className="mb-5 text-center">
          <h2 className="mb-1 text-2xl font-black uppercase tracking-tight text-[#071426]">
            {data.name}
          </h2>

          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9A7628]">
            {data.title}
          </div>

          <div className="flex justify-center gap-2 text-[7px] text-[#64748B]">
            <span>{data.email}</span>
            <span>•</span>
            <span>{data.phone}</span>
            <span>•</span>
            <span>Gurgaon, India</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 border-b-2 border-[#071426] pb-1 text-[8px] font-bold uppercase tracking-wider text-[#071426]">
            Professional Summary
          </div>

          <motion.div
            key={data.summary}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[7.5px] leading-relaxed text-[#475569]"
          >
            {data.summary}
          </motion.div>
        </div>
      </PreviewBlock>

      <PreviewBlock isActive={activeTab === "experience"} isGenerating={isGenerating.experience}>
        <div className="mb-4">
          <div className="mb-2 border-b-2 border-[#071426] pb-1 text-[8px] font-bold uppercase tracking-wider text-[#071426]">
            Professional Experience
          </div>

          <div>
            <div className="mb-0.5 flex items-end justify-between">
              <span className="text-[10px] font-bold text-[#071426]">
                {data.experienceRole}
              </span>
              <span className="text-[7px] font-bold text-[#64748B]">
                {data.experienceDate}
              </span>
            </div>

            <div className="mb-2 text-[8px] font-bold text-[#9A7628]">
              {data.experienceCompany}
            </div>

            <motion.div
              key={data.experienceDesc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whitespace-pre-line pl-3 text-[7.5px] leading-relaxed text-[#475569]"
            >
              {data.experienceDesc}
            </motion.div>
          </div>
        </div>
      </PreviewBlock>

      <div className="mt-2 flex gap-6">
        <div className="w-1/2">
          <PreviewBlock isActive={activeTab === "skills"}>
            <div className="mb-2 border-b-2 border-[#071426] pb-1 text-[8px] font-bold uppercase tracking-wider text-[#071426]">
              Core Competencies
            </div>

            <div className="text-[7.5px] leading-relaxed text-[#475569]">
              {data.skillsList}
            </div>
          </PreviewBlock>
        </div>

        <div className="w-1/2">
          <PreviewBlock isActive={activeTab === "education"}>
            <div className="mb-2 border-b-2 border-[#071426] pb-1 text-[8px] font-bold uppercase tracking-wider text-[#071426]">
              Education
            </div>

            <div>
              <div className="text-[8px] font-bold text-[#071426]">
                {data.educationDegree}
              </div>
              <div className="mb-1 text-[7px] text-[#475569]">
                {data.educationSchool}
              </div>
              <div className="text-[6px] font-bold text-[#64748B]">
                {data.educationDate}
              </div>
            </div>
          </PreviewBlock>
        </div>
      </div>
    </div>
  );
}

/* Sub components */

function TemplateEditor({ current, onSelect }) {
  return (
    <div className="space-y-4">
      <button
        onClick={() => onSelect("modern")}
        className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
          current === "modern"
            ? "border-[#B9964A] bg-[#B9964A]/10 shadow-md"
            : "border-[#E1E7EF] bg-white hover:border-[#CBD5E1] hover:shadow-sm"
        }`}
      >
        <div
          className={`rounded-lg p-3 ${
            current === "modern"
              ? "bg-[#071426] text-[#B9964A]"
              : "bg-[#F7F8FA] text-[#64748B]"
          }`}
        >
          <Columns2 size={24} />
        </div>

        <div>
          <div className="mb-1 text-sm font-bold text-[#071426]">
            Modern Two-Column
          </div>
          <div className="text-xs text-[#475569]">
            Perfect for skill-heavy profiles. Maximizes page space with a dedicated sidebar.
          </div>
        </div>

        {current === "modern" && (
          <CheckCircle2 className="ml-auto text-[#123B6D]" size={20} />
        )}
      </button>

      <button
        onClick={() => onSelect("classic")}
        className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
          current === "classic"
            ? "border-[#B9964A] bg-[#B9964A]/10 shadow-md"
            : "border-[#E1E7EF] bg-white hover:border-[#CBD5E1] hover:shadow-sm"
        }`}
      >
        <div
          className={`rounded-lg p-3 ${
            current === "classic"
              ? "bg-[#071426] text-[#B9964A]"
              : "bg-[#F7F8FA] text-[#64748B]"
          }`}
        >
          <AlignJustify size={24} />
        </div>

        <div>
          <div className="mb-1 text-sm font-bold text-[#071426]">
            Classic Single-Column
          </div>
          <div className="text-xs text-[#475569]">
            Traditional top-down flow. Best for ATS readability and executive roles.
          </div>
        </div>

        {current === "classic" && (
          <CheckCircle2 className="ml-auto text-[#123B6D]" size={20} />
        )}
      </button>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative z-10 flex w-full cursor-pointer items-center justify-between rounded-lg p-2.5 transition-all ${
        active
          ? "text-[#9A7628]"
          : "text-[#475569] hover:bg-[#F7F8FA] hover:text-[#071426]"
      }`}
    >
      {active && (
        <motion.div
          layoutId="active-sidebar-bg"
          className="absolute inset-0 -z-10 rounded-lg border border-[#B9964A]/30 bg-[#B9964A]/10"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <div className="flex items-center gap-3">
        <span className={active ? "text-[#9A7628]" : "text-[#64748B]"}>
          {icon}
        </span>
        <span className="text-xs font-bold">{label}</span>
      </div>

      {label !== "Change Template" && (
        <div className="text-[8px] font-black uppercase text-[#123B6D]">
          Ready
        </div>
      )}
    </button>
  );
}

function PreviewBlock({ children, isActive, isGenerating }) {
  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0.48 }}
      transition={{ duration: 0.3 }}
      className={`relative -m-1.5 rounded-md p-1.5 transition-all ${
        isActive ? "bg-[#F7F8FA] ring-1 ring-[#E1E7EF]" : ""
      }`}
    >
      {isGenerating && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-md">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#B9964A]/16 to-transparent"
          />
        </div>
      )}

      {children}

      {isActive && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -left-3 top-2 z-10 rounded-full bg-[#123B6D] p-0.5 text-white shadow-sm"
        >
          <CheckCircle2 size={10} />
        </motion.div>
      )}
    </motion.div>
  );
}

function PersonalEditor({ data, setData, isGenerating, onGenerate }) {
  return (
    <div className="space-y-4">
      <InputField
        label="Full Name"
        value={data.name}
        onChange={(val) => setData({ ...data, name: val })}
      />
      <InputField
        label="Job Title"
        value={data.title}
        onChange={(val) => setData({ ...data, title: val })}
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <InputField
            label="Email"
            value={data.email}
            onChange={(val) => setData({ ...data, email: val })}
          />
        </div>
        <div className="flex-1">
          <InputField
            label="Phone"
            value={data.phone}
            onChange={(val) => setData({ ...data, phone: val })}
          />
        </div>
      </div>

      <div
        className={`mt-6 overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 ${
          isGenerating
            ? "border-[#B9964A] shadow-[0_16px_36px_rgba(185,150,74,0.15)]"
            : "border-[#E1E7EF]"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#E1E7EF] bg-[#F7F8FA] px-4 py-2.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
            <Type size={12} />
            Professional Summary
          </label>

          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${
              isGenerating
                ? "cursor-not-allowed bg-[#B9964A]/10 text-[#9A7628]"
                : "bg-[#071426] text-white hover:bg-[#0B1F3A]"
            }`}
          >
            {isGenerating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {isGenerating ? "Writing..." : "Rewrite with AI"}
          </button>
        </div>

        <div className="relative p-1">
          <textarea
            value={data.summary}
            onChange={(e) => setData({ ...data, summary: e.target.value })}
            className={`h-28 w-full resize-none bg-transparent p-3 text-xs text-[#071426] outline-none transition-opacity ${
              isGenerating ? "opacity-40" : "opacity-100"
            }`}
          />

          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot size={32} className="animate-pulse text-[#B9964A]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperienceEditor({ data, setData, isGenerating, onGenerate }) {
  return (
    <div className="space-y-4">
      <div
        className={`relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all duration-300 ${
          isGenerating
            ? "border-[#B9964A] shadow-[0_16px_36px_rgba(185,150,74,0.15)]"
            : "border-[#E1E7EF]"
        }`}
      >
        <div
          className={`absolute left-0 top-0 h-full w-1 ${
            isGenerating ? "bg-[#B9964A]" : "bg-[#071426]"
          }`}
        />

        <InputField
          label="Role"
          value={data.experienceRole}
          onChange={(val) => setData({ ...data, experienceRole: val })}
        />
        <InputField
          label="Company"
          value={data.experienceCompany}
          onChange={(val) => setData({ ...data, experienceCompany: val })}
        />
        <InputField
          label="Date"
          value={data.experienceDate}
          onChange={(val) => setData({ ...data, experienceDate: val })}
        />

        <div className="relative mt-5">
          <div className="mb-2 flex items-end justify-between">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
              Job Description
            </label>

            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-bold transition-all ${
                isGenerating
                  ? "bg-[#B9964A]/10 text-[#9A7628]"
                  : "border border-[#B9964A]/30 bg-[#B9964A]/10 text-[#9A7628] hover:bg-[#B9964A]/18"
              }`}
            >
              {isGenerating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Wand2 size={12} />
              )}
              {isGenerating ? "Enhancing..." : "Enhance AI"}
            </button>
          </div>

          <div className="relative">
            <textarea
              value={data.experienceDesc}
              onChange={(e) =>
                setData({ ...data, experienceDesc: e.target.value })
              }
              className={`h-32 w-full resize-none rounded-lg border border-[#E1E7EF] bg-white p-3 text-xs text-[#071426] shadow-sm outline-none transition-all focus:border-[#B9964A] focus:ring-2 focus:ring-[#B9964A]/15 ${
                isGenerating ? "opacity-40" : "opacity-100"
              }`}
            />

            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="rounded-full bg-[#B9964A]/15 p-3 text-[#9A7628]"
                >
                  <Sparkles size={20} />
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EducationEditor({ data, setData }) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-[#E1E7EF] bg-white p-5 shadow-sm">
        <div className="absolute left-0 top-0 h-full w-1 bg-[#071426]" />
        <InputField
          label="Degree"
          value={data.educationDegree}
          onChange={(val) => setData({ ...data, educationDegree: val })}
        />
        <InputField
          label="School / University"
          value={data.educationSchool}
          onChange={(val) => setData({ ...data, educationSchool: val })}
        />
        <InputField
          label="Years Attended"
          value={data.educationDate}
          onChange={(val) => setData({ ...data, educationDate: val })}
        />
      </div>
    </div>
  );
}

function SkillsEditor({ data, setData }) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-[#E1E7EF] bg-white p-5 shadow-sm">
        <div className="absolute left-0 top-0 h-full w-1 bg-[#071426]" />

        <label className="mb-1.5 block pl-1 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
          Comma Separated Skills
        </label>

        <textarea
          value={data.skillsList}
          onChange={(e) => setData({ ...data, skillsList: e.target.value })}
          className="h-32 w-full resize-none rounded-lg border border-[#E1E7EF] bg-white p-3 text-xs text-[#071426] shadow-sm outline-none transition-all focus:border-[#B9964A] focus:ring-2 focus:ring-[#B9964A]/15"
        />
      </div>
    </div>
  );
}

function StyleEditor() {
  return (
    <div className="space-y-6 rounded-xl border border-[#E1E7EF] bg-white p-6 shadow-sm">
      <div>
        <label className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
          <Type size={12} />
          Font Family
        </label>

        <select className="w-full cursor-pointer rounded-lg border border-[#E1E7EF] bg-white p-2.5 text-xs font-bold text-[#071426] shadow-sm outline-none transition-all focus:border-[#B9964A] focus:ring-2 focus:ring-[#B9964A]/15">
          <option>Modern Sans</option>
          <option>Classic Serif</option>
        </select>
      </div>

      <hr className="border-[#E1E7EF]" />

      <SliderField
        icon={<AlignLeft size={12} />}
        label="Page Margin"
        leftLabel="NARROW"
        rightLabel="WIDE"
        percent={20}
      />

      <SliderField
        icon={<SlidersHorizontal size={12} />}
        label="Section Spacing"
        leftLabel="COMPACT"
        rightLabel="AIRY"
        percent={45}
      />

      <SliderField
        icon={<Type size={12} />}
        label="Font Size"
        leftLabel="SMALL"
        rightLabel="LARGE"
        percent={80}
      />
    </div>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block pl-1 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E1E7EF] bg-white p-2.5 text-xs font-bold text-[#071426] shadow-sm outline-none transition-all focus:border-[#B9964A] focus:ring-2 focus:ring-[#B9964A]/15"
      />
    </div>
  );
}

function SliderField({ icon, label, leftLabel, rightLabel, percent }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#475569]">
          {icon}
          {label}
        </label>
      </div>

      <div className="relative h-1.5 w-full rounded-full bg-[#E1E7EF]">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#B9964A]"
          style={{ width: `${percent}%` }}
        />

        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer rounded-full border-2 border-[#B9964A] bg-white shadow transition-transform hover:scale-110"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[8px] font-bold tracking-wider text-[#64748B]">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function Badge({ label, accent = false }) {
  return (
    <div
      className={`whitespace-nowrap rounded px-2 py-0.5 text-[9px] font-bold ${
        accent
          ? "border border-[#B9964A]/30 bg-[#B9964A]/10 text-[#9A7628]"
          : "border border-[#E1E7EF] bg-[#F7F8FA] text-[#475569]"
      }`}
    >
      {label}
    </div>
  );
}
