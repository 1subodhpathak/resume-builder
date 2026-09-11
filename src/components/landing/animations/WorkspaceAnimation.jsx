// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CheckCircle2, ShieldCheck, Search, Users,
//   Brain, FileText, Send, PieChart, BarChart3,
//   Mail, Settings, BotMessageSquare, Mailbox, User,
//   PenTool, Layout, Zap, Eye, UploadCloud, Cpu, Layers, Sparkles, Briefcase, Target, Rocket
// } from "lucide-react";

// // --- GLOABAL STYLES AND UTILS ---

// const bgGradientBase = "bg-slate-50 dark:bg-slate-950";
// const richBgStyle = `relative overflow-hidden ${bgGradientBase} border border-slate-200 dark:border-slate-800 shadow-inner`;

// // Soft, blurred background gradients for a premium feel
// function BackgroundBlurs({ color1, color2 }) {
//   return (
//     <>
//       <div className={`absolute -top-32 -left-32 w-[300px] h-[300px] rounded-full ${color1} blur-[120px] pointer-events-none`}></div>
//       <div className={`absolute -bottom-32 -right-32 w-[300px] h-[300px] rounded-full ${color2} blur-[120px] pointer-events-none`}></div>
//     </>
//   );
// }

// // Staggered entry for list items
// const staggerContainer = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.15,
//     }
//   }
// };

// const staggerItem = {
//   hidden: { y: 20, opacity: 0 },
//   show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
// };


// // --- WORKSPACE ANIMATION COMPONENT ---

// export default function WorkspaceAnimation({ roleId, tone }) {
//   const [step, setStep] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setStep((prev) => (prev + 1) % 3);
//     }, 3500); // Slightly longer to allow reading the text
//     return () => clearInterval(interval);
//   }, [roleId]);

//   // From Scratch Animation (Blue Theme)
//   if (roleId === "from-scratch") {
//     return (
//       <div className={`w-full h-[340px] sm:h-[360px] ${richBgStyle} rounded-3xl p-5 sm:p-7 relative flex flex-col justify-center`}>
//         <BackgroundBlurs color1="bg-blue-100 dark:bg-blue-950/20" color2="bg-slate-100 dark:bg-slate-900/10" />

//         <div className="absolute top-5 left-6 right-6 flex justify-between items-center z-10">
//           <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
//             <Layout className="w-3.5 h-3.5 text-blue-500" />
//             Resume Builder
//           </div>
//           <div className="flex gap-1.5">
//             <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
//             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//           </div>
//         </div>

//         <AnimatePresence mode="wait">
//           {step === 0 && (
//             <motion.div key="template" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }} className="flex flex-col items-center relative z-10">
//               <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="relative mb-6">
//                 <Layout className="w-16 h-16 text-slate-400 dark:text-slate-600 shadow-xl" />
//                 <motion.div animate={{ opacity: [1, 0.72, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-white">
//                   <PenTool className="w-3.5 h-3.5" />
//                 </motion.div>
//               </motion.div>
//               <div className="relative h-2.5 w-48 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
//                 <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2.2, ease: "easeInOut" }} className="h-full w-full origin-left bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></motion.div>
//               </div>
//               <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-5">Selecting Professional Template...</p>
//             </motion.div>
//           )}
//           {step === 1 && (
//             <motion.div key="ai-write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full relative z-10 mt-4">
//               <div className="flex items-center gap-3 mb-6">
//                 <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
//                   <Zap className="w-6 h-6 text-blue-500" />
//                 </motion.div>
//                 <div className="flex-1 space-y-2">
//                   <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }} className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></motion.div>
//                   <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ duration: 1.5, delay: 0.2 }} className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></motion.div>
//                   <motion.div initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ duration: 1.5, delay: 0.4 }} className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></motion.div>
//                 </div>
//               </div>
//               <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Smart AI Content Suggestions</p>
//             </motion.div>
//           )}
//           {step === 2 && (
//             <motion.div key="preview" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -25 }} className="flex flex-col items-center w-full relative z-10">
//               <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="mb-6">
//                 <Eye className="w-16 h-16 text-blue-500 shadow-lg" />
//                 <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-blue-400/30 blur-[20px] rounded-full"></motion.div>
//               </motion.div>
//               <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Live Real-time Preview</h4>
//               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">Your standout resume is ready</p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // Resume Import Animation (Indigo Theme)
//   if (roleId === "resume-import") {
//     return (
//       <div className={`w-full h-[340px] sm:h-[360px] ${richBgStyle} rounded-3xl p-5 sm:p-6 relative flex flex-col justify-center`}>
//         <BackgroundBlurs color1="bg-indigo-100 dark:bg-indigo-950/20" color2="bg-slate-100 dark:bg-slate-900/10" />

//         <div className="absolute top-5 left-6 right-6 flex justify-between items-center z-10">
//           <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
//             <UploadCloud className="w-4 h-4 text-indigo-500" />
//             Resume Import
//           </div>
//           <FileText className="w-4 h-4 text-slate-400 dark:text-slate-600" />
//         </div>

//         <AnimatePresence mode="wait">
//           {step === 0 && (
//             <motion.div key="upload" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }} className="flex flex-col items-center relative z-10 mt-5">
//                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl flex items-center justify-center mb-6 relative">
//                  <UploadCloud className="w-10 h-10 text-indigo-500" />
//                  <motion.div initial={{ height: "0%" }} animate={{ height: "100%" }} transition={{ duration: 2.5 }} className="absolute bottom-0 left-0 right-0 bg-indigo-500/20 rounded-2xl" />
//                </motion.div>
//                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Extracting Resume Data...</p>
//             </motion.div>
//           )}
//           {step === 1 && (
//             <motion.div key="parse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative z-10">
//               <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
//                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
//                   <Cpu className="w-6 h-6 text-indigo-500" />
//                 </motion.div>
//                 <span className="text-[15px] font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">AI Mapping Work History</span>
//               </div>
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                   <div className="h-2 flex-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" />
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                   <div className="h-2 flex-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" />
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                   <div className="h-2 w-3/4 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" />
//                 </div>
//               </div>
//             </motion.div>
//           )}
//           {step === 2 && (
//             <motion.div key="complete" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -25 }} className="flex flex-col items-center relative z-10">
//               <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 bg-white dark:bg-slate-900 border-[4px] border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 shadow-xl relative transform rotate-3">
//                 <Layers className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
//                 <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-2 -right-2 text-yellow-400">
//                   <Sparkles className="w-6 h-6 fill-current" />
//                 </motion.div>
//               </motion.div>
//               <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Flawless Extraction</h4>
//               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">Modern ATS-friendly format applied</p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     );
//   }

//   // JD Tailoring Animation (Violet Theme)
//   if (roleId === "jd-tailoring") {
//     return (
//       <div className={`w-full h-[340px] sm:h-[360px] ${richBgStyle} rounded-3xl p-5 sm:p-7 relative flex flex-col justify-center`}>
//         <BackgroundBlurs color1="bg-violet-100 dark:bg-violet-950/20" color2="bg-slate-100 dark:bg-slate-900/10" />

//         <div className="absolute top-5 left-6 right-6 flex justify-between items-center z-10">
//           <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
//             <Target className="w-4 h-4 text-violet-500" />
//             JD Tailoring
//           </div>
//           <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-600" />
//         </div>

//         <AnimatePresence mode="wait">
//           {step === 0 && (
//             <motion.div key="match" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative z-10 mt-4">
//               <div className="flex justify-between items-center mb-6">
//                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
//                    <FileText className="w-6 h-6 text-slate-500" />
//                  </div>
//                  <motion.div animate={{ x: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }} className="px-3">
//                    <Search className="w-5 h-5 text-violet-500" />
//                  </motion.div>
//                  <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center border border-violet-200 dark:border-violet-800">
//                    <Briefcase className="w-6 h-6 text-violet-600" />
//                  </div>
//               </div>
//               <p className="text-center text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Aligning Experience to Job...</p>
//             </motion.div>
//           )}
//           {step === 1 && (
//             <motion.div key="optimize" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center relative z-10 mt-6">
//               <motion.div
//                 animate={{ rotate: [0, 5, -5, 0] }}
//                 transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
//                 className="relative mb-6 w-24 h-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-[6px] border-violet-100 dark:border-violet-900/50 shadow-xl"
//               >
//                 <motion.svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
//                   <motion.circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-violet-500" strokeDasharray="289" initial={{ strokeDashoffset: 289 }} animate={{ strokeDashoffset: 50 }} transition={{ duration: 1.4, ease: "easeOut" }} />
//                 </motion.svg>
//                 <BarChart3 className="w-8 h-8 text-violet-500 relative z-10" />
//               </motion.div>
//               <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight text-center">Optimizing Keywords &<br/>ATS Match Score</p>
//             </motion.div>
//           )}
//           {step === 2 && (
//             <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 text-center shadow-xl relative z-10 mt-6">
//               <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-full mx-auto flex items-center justify-center mb-5 shadow-md">
//                 <Rocket className="w-8 h-8 text-violet-600 dark:text-violet-400" />
//               </motion.div>
//               <h4 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">High-Impact Resume Ready!</h4>
//               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">Bullet points tailored to the role</p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     );
//   }

//   return null;
// }


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Search,
  FileText,
  BarChart3,
  PenTool,
  Layout,
  Zap,
  Eye,
  UploadCloud,
  Cpu,
  Layers,
  Sparkles,
  Briefcase,
  Target,
  Rocket,
} from "lucide-react";

const richBgStyle =
  "relative overflow-hidden border border-[#E1E7EF] bg-[#F7F8FA] shadow-inner";

function BackgroundBlurs() {
  return (
    <>
      <div className="pointer-events-none absolute -left-32 -top-32 h-[300px] w-[300px] rounded-full bg-[#B9964A]/16 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[300px] w-[300px] rounded-full bg-[#071426]/10 blur-[120px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(203, 213, 225, 0.42) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.32) 1px, transparent 1px)
          `,
          backgroundSize: "34px 34px",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 18% 18%, rgba(185, 150, 74, 0.12), transparent 32%),
            radial-gradient(circle at 86% 16%, rgba(11, 18, 32, 0.08), transparent 34%),
            linear-gradient(135deg, rgba(247, 248, 250, 0.94), rgba(255, 255, 255, 0.78))
          `,
        }}
      />
    </>
  );
}

export default function WorkspaceAnimation({ roleId }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3500);

    return () => clearInterval(interval);
  }, [roleId]);

  if (roleId === "from-scratch") {
    return (
      <div
        className={`flex h-[340px] w-full flex-col justify-center rounded-3xl p-5 sm:h-[360px] sm:p-7 ${richBgStyle}`}
      >
        <BackgroundBlurs />

        <div className="absolute left-6 right-6 top-5 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#64748B]">
            <Layout className="h-3.5 w-3.5 text-[#9A7628]" />
            Resume Builder
          </div>

          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#CBD5E1]" />
            <div className="h-2 w-2 rounded-full bg-[#B9964A]" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-6"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[#E1E7EF] bg-white shadow-xl">
                  <Layout className="h-14 w-14 text-[#64748B]" />
                </div>

                <motion.div
                  animate={{ opacity: [1, 0.72, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#071426] text-[#B9964A] shadow-md"
                >
                  <PenTool className="h-3.5 w-3.5" />
                </motion.div>
              </motion.div>

              <div className="relative h-2.5 w-48 overflow-hidden rounded-full bg-[#E1E7EF] shadow-inner">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#071426] to-[#B9964A]"
                />
              </div>

              <p className="mt-5 text-sm font-bold text-[#475569]">
                Selecting Professional Template...
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="ai-write"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 mt-4 flex w-full flex-col items-center"
            >
              <div className="mb-6 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#B9964A]/30 bg-[#B9964A]/10"
                >
                  <Zap className="h-6 w-6 text-[#9A7628]" />
                </motion.div>

                <div className="flex-1 space-y-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5 }}
                    className="h-2 rounded-full bg-[#CBD5E1]"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "80%" }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="h-2 rounded-full bg-[#CBD5E1]"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                    className="h-2 rounded-full bg-[#CBD5E1]"
                  />
                </div>
              </div>

              <p className="text-sm font-extrabold tracking-tight text-[#071426]">
                Smart AI Content Suggestions
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              className="relative z-10 flex w-full flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#B9964A]/30 bg-white shadow-xl"
              >
                <Eye className="h-14 w-14 text-[#9A7628]" />

                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-[#B9964A]/20 blur-[20px]"
                />
              </motion.div>

              <h4 className="text-xl font-extrabold tracking-tight text-[#071426]">
                Live Real-time Preview
              </h4>

              <p className="mt-1.5 text-sm font-medium text-[#64748B]">
                Your standout resume is ready
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (roleId === "resume-import") {
    return (
      <div
        className={`flex h-[340px] w-full flex-col justify-center rounded-3xl p-5 sm:h-[360px] sm:p-6 ${richBgStyle}`}
      >
        <BackgroundBlurs />

        <div className="absolute left-6 right-6 top-5 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#64748B]">
            <UploadCloud className="h-4 w-4 text-[#9A7628]" />
            Resume Import
          </div>

          <FileText className="h-4 w-4 text-[#64748B]" />
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              className="relative z-10 mt-5 flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#B9964A]/45 bg-[#B9964A]/10"
              >
                <UploadCloud className="z-10 h-10 w-10 text-[#9A7628]" />

                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 2.5 }}
                  className="absolute bottom-0 left-0 right-0 rounded-2xl bg-[#B9964A]/20"
                />
              </motion.div>

              <p className="text-sm font-extrabold tracking-tight text-[#071426]">
                Extracting Resume Data...
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="parse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 w-full rounded-3xl border border-[#E1E7EF] bg-white p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center gap-3 border-b border-[#E1E7EF] pb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Cpu className="h-6 w-6 text-[#9A7628]" />
                </motion.div>

                <span className="text-[15px] font-extrabold tracking-tight text-[#071426]">
                  AI Mapping Work History
                </span>
              </div>

              <div className="space-y-4">
                {[100, 100, 75].map((width, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#123B6D]" />
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#071426] to-[#B9964A]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-6 flex h-24 w-24 rotate-3 transform items-center justify-center rounded-2xl border-[4px] border-[#B9964A]/20 bg-white shadow-xl"
              >
                <Layers className="h-12 w-12 text-[#9A7628]" />

                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -right-2 -top-2 text-[#B9964A]"
                >
                  <Sparkles className="h-6 w-6 fill-current" />
                </motion.div>
              </motion.div>

              <h4 className="text-xl font-extrabold tracking-tight text-[#071426]">
                Flawless Extraction
              </h4>

              <p className="mt-1.5 text-sm font-medium text-[#64748B]">
                Modern ATS-friendly format applied
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (roleId === "jd-tailoring") {
    return (
      <div
        className={`flex h-[340px] w-full flex-col justify-center rounded-3xl p-5 sm:h-[360px] sm:p-7 ${richBgStyle}`}
      >
        <BackgroundBlurs />

        <div className="absolute left-6 right-6 top-5 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#64748B]">
            <Target className="h-4 w-4 text-[#9A7628]" />
            JD Tailoring
          </div>

          <Briefcase className="h-4 w-4 text-[#64748B]" />
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="match"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="relative z-10 mt-4 w-full rounded-3xl border border-[#E1E7EF] bg-white p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F8FA] ring-1 ring-[#E1E7EF]">
                  <FileText className="h-6 w-6 text-[#64748B]" />
                </div>

                <motion.div
                  animate={{ x: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-3"
                >
                  <Search className="h-5 w-5 text-[#9A7628]" />
                </motion.div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#B9964A]/30 bg-[#B9964A]/10">
                  <Briefcase className="h-6 w-6 text-[#9A7628]" />
                </div>
              </div>

              <p className="text-center text-sm font-extrabold tracking-tight text-[#071426]">
                Aligning Experience to Job...
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="optimize"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 mt-6 flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-[#B9964A]/20 bg-white shadow-xl"
              >
                <motion.svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-[#B9964A]"
                    strokeDasharray="289"
                    initial={{ strokeDashoffset: 289 }}
                    animate={{ strokeDashoffset: 50 }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                  />
                </motion.svg>

                <BarChart3 className="relative z-10 h-8 w-8 text-[#9A7628]" />
              </motion.div>

              <p className="text-center text-sm font-extrabold tracking-tight text-[#071426]">
                Optimizing Keywords &
                <br />
                ATS Match Score
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 mt-6 w-full rounded-3xl border border-[#E1E7EF] bg-white p-7 text-center shadow-xl"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#B9964A]/30 bg-[#B9964A]/10 shadow-md"
              >
                <Rocket className="h-8 w-8 text-[#9A7628]" />
              </motion.div>

              <h4 className="text-xl font-extrabold tracking-tight text-[#071426]">
                High-Impact Resume Ready!
              </h4>

              <p className="mt-1.5 text-sm font-medium text-[#64748B]">
                Bullet points tailored to the role
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
