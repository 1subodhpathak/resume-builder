// // import React, { useState, useEffect } from 'react';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { Layout, PenTool, MousePointer2, CheckCircle2, Wand2 } from 'lucide-react';

// // const ResumeBuilder = () => {
// //     const [step, setStep] = useState(0); 
// //     // 0: Select Template, 1: Typing Header, 2: Typing Experience, 3: Completed
// //     const [atsScore, setAtsScore] = useState(15);
// //     const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

// //     useEffect(() => {
// //         let timeout;
        
// //         const runSequence = async () => {
// //             // RESET
// //             setStep(0);
// //             setAtsScore(15);
// //             setCursorPos({ x: 50, y: 300 }); // Start pos

// //             // PHASE 1: SELECT TEMPLATE
// //             await wait(500);
// //             await moveCursor(320, 200); // Move to template
// //             await wait(300);
// //             // Click animation visual handled by state change
// //             setStep(1); // Switch to Editor
            
// //             // PHASE 2: TYPING HEADER
// //             await wait(1000);
// //             // Simulate score rising as "Name" is entered
// //             animateScore(15, 40);
            
// //             // PHASE 3: ADDING CONTENT (Experience)
// //             await wait(1500);
// //             setStep(2);
// //             animateScore(40, 75);

// //             // PHASE 4: OPTIMIZATION (AI Magic)
// //             await wait(2000);
// //             setStep(3);
// //             animateScore(75, 98);

// //             // LOOP
// //             timeout = setTimeout(runSequence, 4000);
// //         };

// //         runSequence();

// //         return () => clearTimeout(timeout);
// //     }, []);

// //     const moveCursor = (x, y) => new Promise(resolve => {
// //         setCursorPos({ x, y });
// //         setTimeout(resolve, 800);
// //     });

// //     const animateScore = (start, end) => {
// //         let current = start;
// //         const interval = setInterval(() => {
// //             if (current >= end) {
// //                 clearInterval(interval);
// //             } else {
// //                 current += 1;
// //                 setAtsScore(current);
// //             }
// //         }, 30);
// //     };

// //     const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// //     return (
// //         <div className="w-full h-[600px] bg-slate-50 rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-['Inter'] relative flex">
            
// //             {/* SIDEBAR: TOOLS & LIVE SCORE */}
// //             <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 z-10">
// //                 <div className="flex items-center gap-2 text-slate-800 font-bold">
// //                     <div className="bg-blue-600 p-1 rounded text-white"><Layout size={16}/></div>
// //                     <span className="text-sm tracking-tight">CareerSense AI</span>
// //                 </div>

// //                 <div className="space-y-2">
// //                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</div>
// //                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
// //                         <motion.div 
// //                             className="h-full bg-blue-500" 
// //                             initial={{ width: "10%" }}
// //                             animate={{ width: step === 0 ? "20%" : step === 1 ? "40%" : step === 2 ? "70%" : "100%" }}
// //                         />
// //                     </div>
// //                 </div>

// //                 {/* LIVE ATS GAUGE */}
// //                 <div className="bg-slate-900 rounded-xl p-4 text-center relative overflow-hidden">
// //                     <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Live ATS Score</div>
// //                     <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
// //                         <svg className="w-full h-full transform -rotate-90">
// //                             <circle cx="48" cy="48" r="40" stroke="#334155" strokeWidth="6" fill="transparent" />
// //                             <motion.circle 
// //                                 animate={{ strokeDashoffset: 251 - (251 * atsScore) / 100 }}
// //                                 transition={{ duration: 0.5 }}
// //                                 cx="48" cy="48" r="40" 
// //                                 stroke={atsScore > 80 ? "#10b981" : atsScore > 50 ? "#f59e0b" : "#ef4444"} 
// //                                 strokeWidth="6" 
// //                                 fill="transparent" 
// //                                 strokeDasharray="251" 
// //                                 strokeLinecap="round" 
// //                             />
// //                         </svg>
// //                         <span className="absolute text-2xl font-black text-white">{atsScore}</span>
// //                     </div>
// //                     {step === 3 && (
// //                         <motion.div 
// //                             initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
// //                             className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-white"
// //                         >
// //                             <CheckCircle2 size={24} className="mb-1" />
// //                             <span className="font-bold text-xs">Optimized</span>
// //                         </motion.div>
// //                     )}
// //                 </div>

// //                 <div className="space-y-3 mt-auto">
// //                     {['Structure', 'Keywords', 'Formatting'].map((item, i) => (
// //                         <div key={item} className="flex items-center justify-between text-xs">
// //                             <span className="text-slate-500">{item}</span>
// //                             {step >= i + 1 ? <CheckCircle2 size={14} className="text-emerald-500"/> : <div className="w-3 h-3 rounded-full border border-slate-300"/>}
// //                         </div>
// //                     ))}
// //                 </div>
// //             </div>

// //             {/* MAIN AREA: CANVAS */}
// //             <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center relative">
                
// //                 <AnimatePresence mode='wait'>
// //                     {step === 0 ? (
// //                         /* --- STEP 0: TEMPLATE SELECTION --- */
// //                         <motion.div 
// //                             key="templates"
// //                             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
// //                             className="grid grid-cols-2 gap-6 w-full max-w-lg"
// //                         >
// //                             {/* Template 1 */}
// //                             <div className="bg-white rounded-lg shadow-sm p-3 hover:ring-2 ring-blue-500 transition-all cursor-pointer opacity-50">
// //                                 <div className="space-y-2">
// //                                     <div className="h-2 bg-slate-200 w-1/3 rounded"/>
// //                                     <div className="h-32 bg-slate-50 rounded"/>
// //                                 </div>
// //                             </div>
// //                             {/* Template 2 (Target) */}
// //                             <motion.div 
// //                                 whileHover={{ scale: 1.02 }}
// //                                 className="bg-white rounded-lg shadow-lg p-4 border-2 border-transparent hover:border-blue-500 transition-all relative"
// //                             >
// //                                 <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded">Recommended</div>
// //                                 <div className="flex gap-2 mb-2 pb-2 border-b border-slate-100">
// //                                     <div className="w-8 h-8 rounded-full bg-slate-200"/>
// //                                     <div className="flex-1 space-y-1">
// //                                         <div className="h-1.5 bg-slate-800 w-1/2 rounded"/>
// //                                         <div className="h-1 bg-slate-400 w-1/3 rounded"/>
// //                                     </div>
// //                                 </div>
// //                                 <div className="space-y-2">
// //                                     <div className="h-1 bg-slate-200 w-full rounded"/>
// //                                     <div className="h-1 bg-slate-200 w-5/6 rounded"/>
// //                                     <div className="h-1 bg-slate-200 w-full rounded"/>
// //                                 </div>
// //                             </motion.div>
// //                         </motion.div>
// //                     ) : (
// //                         /* --- STEP 1-3: EDITOR VIEW --- */
// //                         <motion.div 
// //                             key="editor"
// //                             initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
// //                             className="bg-white w-[400px] h-[500px] shadow-2xl rounded px-8 py-10 relative overflow-hidden"
// //                         >
// //                             {/* Header Animation */}
// //                             <div className="border-b-2 border-slate-800 pb-6 mb-6">
// //                                 <motion.div 
// //                                     initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1 }}
// //                                     className="overflow-hidden whitespace-nowrap"
// //                                 >
// //                                     <h1 className="text-3xl font-black text-slate-900 uppercase">Pooja Bansal</h1>
// //                                 </motion.div>
// //                                 <motion.p 
// //                                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
// //                                     className="text-xs text-slate-500 mt-2 font-medium tracking-wide"
// //                                 >
// //                                     PRODUCT MANAGER • NEW YORK, NY
// //                                 </motion.p>
// //                             </div>

// //                             {/* Content appearing based on steps */}
// //                             <div className="space-y-6">
// //                                 {/* Experience */}
// //                                 <div>
// //                                     <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-3">Experience</h3>
                                    
// //                                     <AnimatePresence>
// //                                         {step >= 2 && (
// //                                             <motion.div 
// //                                                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
// //                                                 className="space-y-2"
// //                                             >
// //                                                 <div className="flex justify-between text-[10px] font-bold">
// //                                                     <span>Product Lead</span><span>2020 - Present</span>
// //                                                 </div>
// //                                                 <div className="text-[10px] text-blue-600 font-bold">TechSpace Inc.</div>
// //                                                 <motion.ul className="list-disc pl-3 text-[9px] text-slate-600 space-y-1">
// //                                                     <motion.li initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}>Led cross-functional team of 15 engineers.</motion.li>
// //                                                     <motion.li initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>Increased user retention by <span className="bg-yellow-100 font-bold">25%</span> via new UX.</motion.li>
// //                                                     {step === 3 && (
// //                                                         <motion.li 
// //                                                             initial={{opacity:0, x: -10}} animate={{opacity:1, x:0}} 
// //                                                             className="text-emerald-600 font-medium"
// //                                                         >
// //                                                             <Wand2 size={8} className="inline mr-1"/>
// //                                                             AI Optimized: Spearheaded $2M revenue growth Q3.
// //                                                         </motion.li>
// //                                                     )}
// //                                                 </motion.ul>
// //                                             </motion.div>
// //                                         )}
// //                                     </AnimatePresence>
// //                                 </div>

// //                                 {/* Skills */}
// //                                 {step >= 2 && (
// //                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
// //                                         <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">Skills</h3>
// //                                         <div className="flex flex-wrap gap-1">
// //                                             {['Product Strategy', 'Agile', 'Jira', 'Figma', 'SQL'].map((s, i) => (
// //                                                 <motion.span 
// //                                                     key={s}
// //                                                     initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 + (i*0.1) }}
// //                                                     className="bg-slate-100 px-2 py-0.5 rounded text-[9px] text-slate-700 font-medium"
// //                                                 >
// //                                                     {s}
// //                                                 </motion.span>
// //                                             ))}
// //                                         </div>
// //                                     </motion.div>
// //                                 )}
// //                             </div>
// //                         </motion.div>
// //                     )}
// //                 </AnimatePresence>

// //                 {/* CURSOR OVERLAY */}
// //                 {step === 0 && (
// //                     <motion.div 
// //                         className="absolute z-50 pointer-events-none"
// //                         animate={{ left: cursorPos.x, top: cursorPos.y }}
// //                         transition={{ type: "spring", stiffness: 80, damping: 20 }}
// //                     >
// //                         <MousePointer2 className="text-slate-900 fill-white drop-shadow-xl" size={32} />
// //                     </motion.div>
// //                 )}

// //             </div>
// //         </div>
// //     );
// // };

// // export default ResumeBuilder;



// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Layout, MousePointer2, CheckCircle2, Wand2 } from 'lucide-react';

// const ResumeBuilder = () => {
//     const [step, setStep] = useState(0); 
//     // 0: Select Template, 1: Typing Header, 2: Typing Experience, 3: Completed
//     const [atsScore, setAtsScore] = useState(15);
//     const [cursorPos, setCursorPos] = useState({ x: 35, y: 35 });

//     useEffect(() => {
//         let timeout;
        
//         const runSequence = async () => {
//             // RESET
//             setStep(0);
//             setAtsScore(15);
//             setCursorPos({ x: 35, y: 210 }); // Scaled down start pos

//             // PHASE 1: SELECT TEMPLATE
//             await wait(500);
//             await moveCursor(224, 140); // Scaled down move target
//             await wait(300);
//             setStep(1); 
            
//             // PHASE 2: TYPING HEADER
//             await wait(1000);
//             animateScore(15, 40);
            
//             // PHASE 3: ADDING CONTENT (Experience)
//             await wait(1500);
//             setStep(2);
//             animateScore(40, 75);

//             // PHASE 4: OPTIMIZATION (AI Magic)
//             await wait(2000);
//             setStep(3);
//             animateScore(75, 98);

//             // LOOP
//             timeout = setTimeout(runSequence, 4000);
//         };

//         runSequence();

//         return () => clearTimeout(timeout);
//     }, []);

//     const moveCursor = (x, y) => new Promise(resolve => {
//         setCursorPos({ x, y });
//         setTimeout(resolve, 800);
//     });

//     const animateScore = (start, end) => {
//         let current = start;
//         const interval = setInterval(() => {
//             if (current >= end) {
//                 clearInterval(interval);
//             } else {
//                 current += 1;
//                 setAtsScore(current);
//             }
//         }, 30);
//     };

//     const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//     return (
//         /* Reduced height from 600px to 420px */
//         <div className="h-[420px] w-full min-w-full max-w-full flex-none bg-slate-50 rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-['Inter'] relative flex">
            
//             {/* SIDEBAR: Reduced width from w-64 (256px) to w-44 (176px) */}
//             <div className="w-44 min-w-44 max-w-44 shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 z-10">
//                 <div className="flex items-center gap-1.5 text-slate-800 font-bold">
//                     <div className="bg-teal-600 p-1 rounded text-white"><Layout size={12}/></div>
//                     <span className="text-xs tracking-tight">CareerSense AI</span>
//                 </div>

//                 <div className="space-y-1.5">
//                     <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Progress</div>
//                     <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
//                         <motion.div 
//                             className="h-full bg-teal-500" 
//                             initial={{ width: "10%" }}
//                             animate={{ width: step === 0 ? "20%" : step === 1 ? "40%" : step === 2 ? "70%" : "100%" }}
//                         />
//                     </div>
//                 </div>

//                 {/* LIVE ATS GAUGE: Scaled from w-24 to w-16, circle radius from 40 to 28 */}
//                 <div className="bg-slate-900 rounded-xl p-3 text-center relative overflow-hidden">
//                     <div className="text-[8px] font-bold text-slate-400 uppercase mb-2">Live ATS Score</div>
//                     <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
//                         <svg className="w-full h-full transform -rotate-90">
//                             <circle cx="32" cy="32" r="28" stroke="#334155" strokeWidth="4" fill="transparent" />
//                             <motion.circle 
//                                 animate={{ strokeDashoffset: 176 - (176 * atsScore) / 100 }}
//                                 transition={{ duration: 0.5 }}
//                                 cx="32" cy="32" r="28" 
//                                 stroke={atsScore > 80 ? "#10b981" : atsScore > 50 ? "#f59e0b" : "#ef4444"} 
//                                 strokeWidth="4" 
//                                 fill="transparent" 
//                                 strokeDasharray="176" 
//                                 strokeLinecap="round" 
//                             />
//                         </svg>
//                         <span className="absolute text-lg font-black text-white">{atsScore}</span>
//                     </div>
//                     {step === 3 && (
//                         <motion.div 
//                             initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
//                             className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center text-white"
//                         >
//                             <CheckCircle2 size={16} className="mb-1" />
//                             <span className="font-bold text-[10px]">Optimized</span>
//                         </motion.div>
//                     )}
//                 </div>

//                 <div className="space-y-2 mt-auto">
//                     {['Structure', 'Keywords', 'Formatting'].map((item, i) => (
//                         <div key={item} className="flex items-center justify-between text-[10px]">
//                             <span className="text-slate-500">{item}</span>
//                             {step >= i + 1 ? <CheckCircle2 size={10} className="text-emerald-500"/> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300"/>}
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* MAIN AREA: CANVAS */}
//             <div className="min-w-0 flex-1 bg-slate-100 p-5 flex items-center justify-center relative">
                
//                 <AnimatePresence mode='wait'>
//                     {step === 0 ? (
//                         /* --- STEP 0: TEMPLATE SELECTION: w-[390px] to w-[270px] --- */
//                         <motion.div 
//                             key="templates"
//                             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                             className="grid w-[270px] grid-cols-2 gap-4"
//                         >
//                             {/* Template 1 */}
//                             <div className="bg-white rounded-md shadow-sm p-2 hover:ring-2 ring-teal-500 transition-all cursor-pointer opacity-50">
//                                 <div className="space-y-1.5">
//                                     <div className="h-1.5 bg-slate-200 w-1/3 rounded"/>
//                                     <div className="h-24 bg-slate-50 rounded"/>
//                                 </div>
//                             </div>
//                             {/* Template 2 (Target) */}
//                             <motion.div 
//                                 whileHover={{ scale: 1.02 }}
//                                 className="bg-white rounded-md shadow-lg p-2.5 border-2 border-transparent hover:border-teal-500 transition-all relative"
//                             >
//                                 <div className="absolute top-1.5 right-1.5 bg-teal-100 text-teal-700 text-[7px] font-bold px-1.5 py-0.5 rounded">Recommended</div>
//                                 <div className="flex gap-1.5 mb-1.5 pb-1.5 border-b border-slate-100">
//                                     <div className="w-6 h-6 rounded-full bg-slate-200"/>
//                                     <div className="flex-1 space-y-1">
//                                         <div className="h-1 bg-slate-800 w-1/2 rounded"/>
//                                         <div className="h-0.5 bg-slate-400 w-1/3 rounded"/>
//                                     </div>
//                                 </div>
//                                 <div className="space-y-1.5">
//                                     <div className="h-0.5 bg-slate-200 w-full rounded"/>
//                                     <div className="h-0.5 bg-slate-200 w-5/6 rounded"/>
//                                     <div className="h-0.5 bg-slate-200 w-full rounded"/>
//                                 </div>
//                             </motion.div>
//                         </motion.div>
//                     ) : (
//                         /* --- STEP 1-3: EDITOR VIEW: Scaled 400x500 to 280x350 --- */
//                         <motion.div 
//                             key="editor"
//                             initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
//                             className="bg-white w-[280px] h-[350px] shrink-0 shadow-2xl rounded px-6 py-7 relative overflow-hidden"
//                         >
//                             {/* Header Animation */}
//                             <div className="border-b-2 border-slate-800 pb-4 mb-4">
//                                 <motion.div 
//                                     initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1 }}
//                                     className="overflow-hidden whitespace-nowrap"
//                                 >
//                                     <h1 className="text-xl font-black text-slate-900 uppercase">Pooja Bansal</h1>
//                                 </motion.div>
//                                 <motion.p 
//                                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
//                                     className="text-[9px] text-slate-500 mt-1.5 font-medium tracking-wide"
//                                 >
//                                     PRODUCT MANAGER • NEW YORK, NY
//                                 </motion.p>
//                             </div>

//                             {/* Content appearing based on steps */}
//                             <div className="space-y-4">
//                                 {/* Experience */}
//                                 <div>
//                                     <h3 className="text-[10px] font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">Experience</h3>
                                    
//                                     <AnimatePresence>
//                                         {step >= 2 && (
//                                             <motion.div 
//                                                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
//                                                 className="space-y-1.5"
//                                             >
//                                                 <div className="flex justify-between text-[8px] font-bold">
//                                                     <span>Product Lead</span><span>2020 - Present</span>
//                                                 </div>
//                                                 <div className="text-[8px] text-teal-600 font-bold">TechSpace Inc.</div>
//                                                 <motion.ul className="list-disc pl-3 text-[7px] text-slate-600 space-y-1">
//                                                     <motion.li initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}>Led cross-functional team of 15 engineers.</motion.li>
//                                                     <motion.li initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>Increased user retention by <span className="bg-yellow-100 font-bold">25%</span> via new UX.</motion.li>
//                                                     {step === 3 && (
//                                                         <motion.li 
//                                                             initial={{opacity:0, x: -10}} animate={{opacity:1, x:0}} 
//                                                             className="text-emerald-600 font-medium"
//                                                         >
//                                                             <Wand2 size={6} className="inline mr-1"/>
//                                                             AI Optimized: Spearheaded $2M revenue growth Q3.
//                                                         </motion.li>
//                                                     )}
//                                                 </motion.ul>
//                                             </motion.div>
//                                         )}
//                                     </AnimatePresence>
//                                 </div>

//                                 {/* Skills */}
//                                 {step >= 2 && (
//                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
//                                         <h3 className="text-[10px] font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-1.5">Skills</h3>
//                                         <div className="flex flex-wrap gap-1">
//                                             {['Product Strategy', 'Agile', 'Jira', 'Figma', 'SQL'].map((s, i) => (
//                                                 <motion.span 
//                                                     key={s}
//                                                     initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 + (i*0.1) }}
//                                                     className="bg-slate-100 px-1.5 py-0.5 rounded text-[7px] text-slate-700 font-medium"
//                                                 >
//                                                     {s}
//                                                 </motion.span>
//                                             ))}
//                                         </div>
//                                     </motion.div>
//                                 )}
//                             </div>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 {/* CURSOR OVERLAY */}
//                 {step === 0 && (
//                     <motion.div 
//                         className="absolute z-50 pointer-events-none"
//                         animate={{ left: cursorPos.x, top: cursorPos.y }}
//                         transition={{ type: "spring", stiffness: 80, damping: 20 }}
//                     >
//                         {/* Cursor size scaled down to 22 */}
//                         <MousePointer2 className="text-slate-900 fill-white drop-shadow-xl" size={22} />
//                     </motion.div>
//                 )}

//             </div>
//         </div>
//     );
// };

// export default ResumeBuilder;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, MousePointer2, CheckCircle2, Wand2 } from 'lucide-react';

const checklist = [
  { label: 'Structure', done: true },
  { label: 'Keywords', done: false },
  { label: 'Formatting', done: false },
];

const ResumeBuilder = () => {
  const [step, setStep] = useState(0);
  const [atsScore, setAtsScore] = useState(15);
  const [cursorPos, setCursorPos] = useState({ x: 35, y: 35 });

  useEffect(() => {
    let timeout;

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const moveCursor = (x, y) =>
      new Promise((resolve) => {
        setCursorPos({ x, y });
        setTimeout(resolve, 800);
      });

    const animateScore = (start, end) => {
      let current = start;

      const interval = setInterval(() => {
        if (current >= end) {
          clearInterval(interval);
        } else {
          current += 1;
          setAtsScore(current);
        }
      }, 30);
    };

    const runSequence = async () => {
      setStep(0);
      setAtsScore(15);
      setCursorPos({ x: 35, y: 210 });

      await wait(500);
      await moveCursor(224, 140);
      await wait(300);
      setStep(1);

      await wait(1000);
      animateScore(15, 40);

      await wait(1500);
      setStep(2);
      animateScore(40, 75);

      await wait(2000);
      setStep(3);
      animateScore(75, 98);

      timeout = setTimeout(runSequence, 4000);
    };

    runSequence();

    return () => clearTimeout(timeout);
  }, []);

  const scoreColor =
    atsScore > 80 ? '#123B6D' : atsScore > 50 ? '#B9964A' : '#B91C1C';

  return (
    <div className="relative flex h-[420px] w-full min-w-full max-w-full flex-none overflow-hidden rounded-2xl border border-[#E1E7EF] bg-[#F7F8FA] font-['Inter'] shadow-[0_24px_70px_rgba(11,18,32,0.14)]">
      {/* SIDEBAR */}
      <div className="z-10 flex w-44 min-w-44 max-w-44 shrink-0 flex-col gap-4 border-r border-[#E1E7EF] bg-white p-4">
        <div className="flex items-center gap-1.5 font-bold text-[#071426]">
          <div className="rounded bg-[#071426] p-1 text-white shadow-sm">
            <Layout size={12} />
          </div>
          <span className="text-xs tracking-tight">CareerSense AI</span>
        </div>

        <div className="space-y-1.5">
          <div className="text-[8px] font-bold uppercase tracking-widest text-[#64748B]">
            Progress
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-[#E1E7EF]">
            <motion.div
              className="h-full bg-[#B9964A]"
              initial={{ width: '10%' }}
              animate={{
                width:
                  step === 0
                    ? '20%'
                    : step === 1
                      ? '40%'
                      : step === 2
                        ? '70%'
                        : '100%',
              }}
            />
          </div>
        </div>

        {/* LIVE ATS GAUGE */}
        <div className="relative overflow-hidden rounded-xl border border-[#0B1F3A] bg-[#071426] p-3 text-center shadow-[0_18px_45px_rgba(11,18,32,0.22)]">
          <div className="mb-2 text-[8px] font-bold uppercase text-[#CBD5E1]">
            Live ATS Score
          </div>

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#0B1F3A"
                strokeWidth="4"
                fill="transparent"
              />

              <motion.circle
                animate={{
                  strokeDashoffset: 176 - (176 * atsScore) / 100,
                }}
                transition={{ duration: 0.5 }}
                cx="32"
                cy="32"
                r="28"
                stroke={scoreColor}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="176"
                strokeLinecap="round"
              />
            </svg>

            <span className="absolute text-lg font-black text-white">
              {atsScore}
            </span>
          </div>

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#123B6D]/95 text-white"
            >
              <CheckCircle2 size={16} className="mb-1" />
              <span className="text-[10px] font-bold">Optimized</span>
            </motion.div>
          )}
        </div>

        <div className="mt-auto space-y-2">
          {checklist.map((item, i) => (
            <div key={item.label} className="flex items-center justify-between text-[10px]">
              <span className="text-[#475569]">{item.label}</span>

              {step >= i + 1 ? (
                <CheckCircle2 size={10} className="text-[#123B6D]" />
              ) : (
                <div className="h-2.5 w-2.5 rounded-full border border-[#CBD5E1]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#F7F8FA] p-5">
        {/* Subtle institutional grid */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(203, 213, 225, 0.38) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(203, 213, 225, 0.32) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Soft finance gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 18% 18%, rgba(185, 150, 74, 0.14), transparent 28%),
              radial-gradient(circle at 82% 12%, rgba(11, 18, 32, 0.08), transparent 32%),
              linear-gradient(135deg, rgba(247,248,250,0.96), rgba(255,255,255,0.82))
            `,
          }}
        />

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="templates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 grid w-[270px] grid-cols-2 gap-4"
            >
              {/* Template 1 */}
              <div className="cursor-pointer rounded-md border border-[#E1E7EF] bg-white p-2 opacity-60 shadow-sm transition-all hover:ring-2 hover:ring-[#B9964A]">
                <div className="space-y-1.5">
                  <div className="h-1.5 w-1/3 rounded bg-[#CBD5E1]" />
                  <div className="h-24 rounded bg-[#F7F8FA]" />
                </div>
              </div>

              {/* Template 2 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative rounded-md border-2 border-transparent bg-white p-2.5 shadow-lg transition-all hover:border-[#B9964A]"
              >
                <div className="absolute right-1.5 top-1.5 rounded bg-[#B9964A]/15 px-1.5 py-0.5 text-[7px] font-bold text-[#9A7628]">
                  Recommended
                </div>

                <div className="mb-1.5 flex gap-1.5 border-b border-[#E1E7EF] pb-1.5">
                  <div className="h-6 w-6 rounded-full bg-[#E1E7EF]" />

                  <div className="flex-1 space-y-1">
                    <div className="h-1 w-1/2 rounded bg-[#071426]" />
                    <div className="h-0.5 w-1/3 rounded bg-[#64748B]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="h-0.5 w-full rounded bg-[#CBD5E1]" />
                  <div className="h-0.5 w-5/6 rounded bg-[#CBD5E1]" />
                  <div className="h-0.5 w-full rounded bg-[#CBD5E1]" />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 h-[350px] w-[280px] shrink-0 overflow-hidden rounded border border-[#E1E7EF] bg-white px-6 py-7 shadow-[0_24px_60px_rgba(11,18,32,0.16)]"
            >
              {/* Header */}
              <div className="mb-4 border-b-2 border-[#071426] pb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-xl font-black uppercase text-[#071426]">
                    Pooja Bansal
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-1.5 text-[9px] font-medium tracking-wide text-[#64748B]"
                >
                  PRODUCT MANAGER • NEW YORK, NY
                </motion.p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 border-b border-[#E1E7EF] pb-1 text-[10px] font-bold uppercase text-[#071426]">
                    Experience
                  </h3>

                  <AnimatePresence>
                    {step >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5"
                      >
                        <div className="flex justify-between text-[8px] font-bold text-[#071426]">
                          <span>Product Lead</span>
                          <span>2020 - Present</span>
                        </div>

                        <div className="text-[8px] font-bold text-[#9A7628]">
                          TechSpace Inc.
                        </div>

                        <motion.ul className="list-disc space-y-1 pl-3 text-[7px] text-[#475569]">
                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            Led cross-functional team of 15 engineers.
                          </motion.li>

                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            Increased user retention by{' '}
                            <span className="bg-[#B9964A]/20 font-bold text-[#071426]">
                              25%
                            </span>{' '}
                            via new UX.
                          </motion.li>

                          {step === 3 && (
                            <motion.li
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="font-medium text-[#123B6D]"
                            >
                              <Wand2 size={6} className="mr-1 inline" />
                              AI Optimized: Spearheaded $2M revenue growth Q3.
                            </motion.li>
                          )}
                        </motion.ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {step >= 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <h3 className="mb-1.5 border-b border-[#E1E7EF] pb-1 text-[10px] font-bold uppercase text-[#071426]">
                      Skills
                    </h3>

                    <div className="flex flex-wrap gap-1">
                      {['Product Strategy', 'Agile', 'Jira', 'Figma', 'SQL'].map((skill, i) => (
                        <motion.span
                          key={skill}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.2 + i * 0.1 }}
                          className="rounded bg-[#F7F8FA] px-1.5 py-0.5 text-[7px] font-medium text-[#475569] ring-1 ring-[#E1E7EF]"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CURSOR OVERLAY */}
        {step === 0 && (
          <motion.div
            className="pointer-events-none absolute z-50"
            animate={{ left: cursorPos.x, top: cursorPos.y }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          >
            <MousePointer2 className="fill-white text-[#071426] drop-shadow-xl" size={22} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;
