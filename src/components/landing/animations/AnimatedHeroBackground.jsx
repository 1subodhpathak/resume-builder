// import React, { useMemo } from "react";
// import {
//   motion,
//   useReducedMotion,
//   useScroll,
//   useTransform,
// } from "framer-motion";

// const AnimatedHeroBackground = () => {
//   const reduceMotion = useReducedMotion();

//   const { scrollY } = useScroll();
//   const scrollRange = [0, 800];

//   const bgLight1 = useTransform(scrollY, scrollRange, ["#d5f8f1ff", "#ccfbf1"]);
//   const bgLight2 = useTransform(scrollY, scrollRange, ["#acfff3ff", "#a7f3d0"]);
//   const bgLight3 = useTransform(scrollY, scrollRange, ["#e0f2f1", "#b2f5ea"]);

//   const bgDark1 = useTransform(scrollY, scrollRange, ["#0f766e", "#134e4a"]);
//   const bgDark2 = useTransform(scrollY, scrollRange, ["#115e59", "#0f766e"]);
//   const bgDark3 = useTransform(scrollY, scrollRange, ["#0d9488", "#2dd4bf"]);

//   const sparks = useMemo(() => {
//     return [...Array(15)].map((_, i) => ({
//       id: i,
//       left: `${Math.random() * 100}%`,
//       delay: Math.random() * 1,
//       duration: Math.random() * 5 + 8,
//       height: Math.random() * 40 + 20,
//       opacity: Math.random() * 2 + 1.5,
//     }));
//   }, []);

//   return (
//     <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[color:var(--theme-app-bg)]">
//       {/* 1. STRUCTURAL GRID */}
//       <div
//         className="absolute inset-0 opacity-70"
//         style={{
//           backgroundImage: `
//             linear-gradient(to right, var(--theme-grid-line) 1px, transparent 1px),
//             linear-gradient(to bottom, var(--theme-grid-line) 1px, transparent 1px)
//           `,
//           backgroundSize: "32px 32px",
//           maskImage:
//             "radial-gradient(ellipse 95% 95% at 50% 50%, black 30%, transparent 100%)",
//           WebkitMaskImage:
//             "radial-gradient(ellipse 95% 95% at 50% 50%, black 30%, transparent 100%)",
//         }}
//       />

//       {/* 2. SCROLL-DRIVEN AURORA BLOOMS */}
//       <div className="absolute inset-0 opacity-60 mix-blend-multiply dark:mix-blend-screen saturate-150">
//         {/* LIGHT MODE ORBS */}
//         <div className="block dark:hidden absolute inset-0">
//           <motion.div
//             style={{ backgroundColor: bgLight1 }}
//             animate={
//               reduceMotion
//                 ? undefined
//                 : {
//                     x: ["0%", "40%", "-10%", "0%"],
//                     y: ["0%", "30%", "-10%", "0%"],
//                   }
//             }
//             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
//             className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px]"
//           />

//           <motion.div
//             style={{ backgroundColor: bgLight2 }}
//             animate={
//               reduceMotion
//                 ? undefined
//                 : {
//                     x: ["0%", "-50%", "20%", "0%"],
//                     y: ["0%", "-40%", "30%", "0%"],
//                   }
//             }
//             transition={{
//               duration: 24,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 2,
//             }}
//             className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] rounded-full blur-[130px]"
//           />

//           <motion.div
//             style={{ backgroundColor: bgLight3 }}
//             animate={
//               reduceMotion
//                 ? undefined
//                 : {
//                     x: ["0%", "60%", "-20%", "0%"],
//                     y: ["0%", "-50%", "10%", "0%"],
//                   }
//             }
//             transition={{
//               duration: 28,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 1,
//             }}
//             className="absolute -bottom-[20%] left-[10%] w-[60vw] h-[40vw] rounded-full blur-[140px]"
//           />
//         </div>

//         {/* DARK MODE ORBS */}
//         <div className="hidden dark:block absolute inset-0">
//           <motion.div
//             style={{ backgroundColor: bgDark1 }}
//             animate={
//               reduceMotion
//                 ? undefined
//                 : {
//                     x: ["0%", "40%", "-10%", "0%"],
//                     y: ["0%", "30%", "-10%", "0%"],
//                   }
//             }
//             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
//             className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40"
//           />

//           <motion.div
//             style={{ backgroundColor: bgDark2 }}
//             animate={
//               reduceMotion
//                 ? undefined
//                 : {
//                     x: ["0%", "-50%", "20%", "0%"],
//                     y: ["0%", "-40%", "30%", "0%"],
//                   }
//             }
//             transition={{
//               duration: 24,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 2,
//             }}
//             className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] rounded-full blur-[130px] opacity-40"
//           />

//           <motion.div
//             style={{ backgroundColor: bgDark3 }}
//             animate={
//               reduceMotion
//                 ? undefined
//                 : {
//                     x: ["0%", "60%", "-20%", "0%"],
//                     y: ["0%", "-50%", "10%", "0%"],
//                   }
//             }
//             transition={{
//               duration: 28,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 1,
//             }}
//             className="absolute -bottom-[20%] left-[10%] w-[60vw] h-[40vw] rounded-full blur-[140px] opacity-30"
//           />
//         </div>
//       </div>

//       {/* 3. AI DATA SPARKS */}
//       {sparks.map((spark) => (
//         <motion.div
//           key={spark.id}
//           initial={{ y: "100vh", opacity: 0 }}
//           animate={
//             reduceMotion
//               ? undefined
//               : {
//                   y: "-20vh",
//                   opacity: [0, spark.opacity, 0],
//                 }
//           }
//           transition={{
//             duration: spark.duration,
//             repeat: Infinity,
//             ease: "linear",
//             delay: spark.delay,
//           }}
//           className="absolute w-[1px] rounded-full bg-gradient-to-t from-transparent via-teal-500 to-transparent dark:via-teal-400"
//           style={{
//             left: spark.left,
//             height: `${spark.height}px`,
//             boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
//           }}
//         />
//       ))}

//       {/* 3.5 INTELLIGENT FLOW LINES */}
//       <svg className="absolute inset-0 w-full h-full opacity-40 dark:opacity-30">
//         <defs>
//           <linearGradient id="flowLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#00b7b7ff" stopOpacity="0" />
//             <stop offset="40%" stopColor="#00a99eff" stopOpacity="0.7" />
//             <stop offset="70%" stopColor="#22ffe9ff" stopOpacity="0.4" />
//             <stop offset="100%" stopColor="#00746eff" stopOpacity="0" />
//           </linearGradient>

//           <filter id="flowGlow">
//             <feGaussianBlur stdDeviation="2" result="blur" />
//             <feMerge>
//               <feMergeNode in="blur" />
//               <feMergeNode in="SourceGraphic" />
//             </feMerge>
//           </filter>
//         </defs>

//         {[
//           "M -100 600 C 200 420, 420 260, 720 420 S 1100 620, 1500 300",
//           "M -120 250 C 220 120, 420 280, 700 350 S 1100 300, 1500 100",
//           "M -100 800 C 260 650, 520 560, 780 690 S 1100 780, 1500 500",
//         ].map((path, i) => (
//           <motion.path
//             key={i}
//             d={path}
//             fill="none"
//             stroke="url(#flowLineGrad)"
//             strokeWidth={i === 0 ? 2.2 : 1.6}
//             strokeDasharray="420 800"
//             filter="url(#flowGlow)"
//             animate={
//               reduceMotion ? {} : { strokeDashoffset: [0, -1200] }
//             }
//             transition={{
//               duration: 10 + i * 2,
//               repeat: Infinity,
//               ease: "linear",
//               delay: i * 0.5,
//             }}
//           />
//         ))}

//         {[
//           "M 100 -100 C 300 200, 600 250, 900 200 S 1200 300, 1500 700",
//         ].map((path, i) => (
//           <motion.path
//             key={`secondary-${i}`}
//             d={path}
//             fill="none"
//             stroke="url(#flowLineGrad)"
//             strokeWidth="1.2"
//             strokeDasharray="300 700"
//             opacity="0.5"
//             animate={
//               reduceMotion ? {} : { strokeDashoffset: [0, -1000] }
//             }
//             transition={{
//               duration: 14,
//               repeat: Infinity,
//               ease: "linear",
//             }}
//           />
//         ))}
//       </svg>

//       {/* 4. SEAMLESS BLEND MASKS */}
//       <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--theme-app-bg),transparent)] z-10" />
//       <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,var(--theme-app-bg),transparent)] z-10" />
//     </div>
//   );
// };

// export default AnimatedHeroBackground;

import React, { useMemo } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const AnimatedHeroBackground = () => {
  const reduceMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const scrollRange = [0, 800];

  // Professional institutional finance theme
  const bgLight1 = useTransform(scrollY, scrollRange, ["#B9964A", "#F7F8FA"]);
  const bgLight2 = useTransform(scrollY, scrollRange, ["#E8EEF7", "#FFFFFF"]);
  const bgLight3 = useTransform(scrollY, scrollRange, ["#123B6D", "#E1E7EF"]);

  // Dark mode: deep navy with restrained gold accents
  const bgDark1 = useTransform(scrollY, scrollRange, ["#071426", "#0B1F3A"]);
  const bgDark2 = useTransform(scrollY, scrollRange, ["#123B6D", "#071426"]);
  const bgDark3 = useTransform(scrollY, scrollRange, ["#B9964A", "#9A7628"]);

  const sparks = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 1,
      duration: Math.random() * 5 + 9,
      height: Math.random() * 34 + 18,
      opacity: Math.random() * 0.28 + 0.16,
    }));
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        backgroundColor: "var(--theme-app-bg, #F7F8FA)",
        backgroundImage: `
          radial-gradient(circle at 12% 18%, rgba(185, 150, 74, 0.15), transparent 28%),
          radial-gradient(circle at 82% 12%, rgba(18, 59, 109, 0.30), transparent 34%),
          radial-gradient(circle at 72% 85%, rgba(11, 31, 58, 0.18), transparent 36%),
          linear-gradient(135deg, #F7F8FA 0%, #FFFFFF 42%, #E8EEF7 70%, #0B1F3A 100%)
        `,
      }}
    >
      {/* 1. STRUCTURAL GRID */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--theme-grid-line, rgba(203, 213, 225, 0.42)) 1px, transparent 1px),
            linear-gradient(to bottom, var(--theme-grid-line, rgba(203, 213, 225, 0.42)) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 95% 95% at 50% 50%, black 22%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 95% at 50% 50%, black 22%, transparent 100%)",
        }}
      />

      {/* 2. SCROLL-DRIVEN INSTITUTIONAL GRADIENT BLOOMS */}
      <div className="absolute inset-0 opacity-50 mix-blend-multiply dark:mix-blend-screen saturate-100">
        {/* LIGHT MODE ORBS */}
        <div className="block dark:hidden absolute inset-0">
          <motion.div
            style={{ backgroundColor: bgLight1 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: ["0%", "35%", "-8%", "0%"],
                    y: ["0%", "24%", "-8%", "0%"],
                  }
            }
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[14%] -left-[12%] w-[44vw] h-[44vw] rounded-full blur-[145px] opacity-18"
          />

          <motion.div
            style={{ backgroundColor: bgLight2 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: ["0%", "-38%", "16%", "0%"],
                    y: ["0%", "-30%", "22%", "0%"],
                  }
            }
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-[12%] -right-[12%] w-[48vw] h-[48vw] rounded-full blur-[150px] opacity-70"
          />

          <motion.div
            style={{ backgroundColor: bgLight3 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: ["0%", "44%", "-16%", "0%"],
                    y: ["0%", "-34%", "8%", "0%"],
                  }
            }
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-[24%] left-[8%] w-[62vw] h-[42vw] rounded-full blur-[160px] opacity-32"
          />
        </div>

        {/* DARK MODE ORBS */}
        <div className="hidden dark:block absolute inset-0">
          <motion.div
            style={{ backgroundColor: bgDark1 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: ["0%", "35%", "-8%", "0%"],
                    y: ["0%", "24%", "-8%", "0%"],
                  }
            }
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[12%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[130px] opacity-50"
          />

          <motion.div
            style={{ backgroundColor: bgDark2 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: ["0%", "-38%", "16%", "0%"],
                    y: ["0%", "-30%", "22%", "0%"],
                  }
            }
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-[16%] -right-[10%] w-[46vw] h-[46vw] rounded-full blur-[140px] opacity-45"
          />

          <motion.div
            style={{ backgroundColor: bgDark3 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    x: ["0%", "44%", "-16%", "0%"],
                    y: ["0%", "-34%", "8%", "0%"],
                  }
            }
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-[20%] left-[10%] w-[58vw] h-[38vw] rounded-full blur-[150px] opacity-16"
          />
        </div>
      </div>

      {/* 3. SUBTLE MARKET DATA SPARKS */}
      {sparks.map((spark) => (
        <motion.div
          key={spark.id}
          initial={{ y: "100vh", opacity: 0 }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: "-20vh",
                  opacity: [0, spark.opacity, 0],
                }
          }
          transition={{
            duration: spark.duration,
            repeat: Infinity,
            ease: "linear",
            delay: spark.delay,
          }}
          className="absolute w-[1px] rounded-full bg-gradient-to-t from-transparent via-[#B9964A] to-transparent dark:via-[#B9964A]"
          style={{
            left: spark.left,
            height: `${spark.height}px`,
            boxShadow: "0 0 10px rgba(185, 150, 74, 0.22)",
          }}
        />
      ))}

      {/* 3.5 INSTITUTIONAL FLOW LINES */}
      <svg className="absolute inset-0 w-full h-full opacity-24 dark:opacity-22">
        <defs>
          <linearGradient id="flowLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#071426" stopOpacity="0" />
            <stop offset="34%" stopColor="#123B6D" stopOpacity="0.34" />
            <stop offset="66%" stopColor="#B9964A" stopOpacity="0.44" />
            <stop offset="100%" stopColor="#B9964A" stopOpacity="0" />
          </linearGradient>

          <filter id="flowGlow">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[
          "M -100 600 C 200 420, 420 260, 720 420 S 1100 620, 1500 300",
          "M -120 250 C 220 120, 420 280, 700 350 S 1100 300, 1500 100",
          "M -100 800 C 260 650, 520 560, 780 690 S 1100 780, 1500 500",
        ].map((path, i) => (
          <motion.path
            key={i}
            d={path}
            fill="none"
            stroke="url(#flowLineGrad)"
            strokeWidth={i === 0 ? 2 : 1.4}
            strokeDasharray="420 800"
            filter="url(#flowGlow)"
            animate={reduceMotion ? {} : { strokeDashoffset: [0, -1200] }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}

        {[
          "M 100 -100 C 300 200, 600 250, 900 200 S 1200 300, 1500 700",
        ].map((path, i) => (
          <motion.path
            key={`secondary-${i}`}
            d={path}
            fill="none"
            stroke="url(#flowLineGrad)"
            strokeWidth="1.1"
            strokeDasharray="300 700"
            opacity="0.35"
            animate={reduceMotion ? {} : { strokeDashoffset: [0, -1000] }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>

      {/* 4. SOFT NAVY EDGE VIGNETTE */}
      <div
        className="absolute inset-0 z-[1] opacity-70"
        style={{
          background:
            "linear-gradient(90deg, rgba(247,248,250,0.92) 0%, rgba(255,255,255,0.42) 45%, rgba(7,20,38,0.16) 100%)",
        }}
      />

      {/* 5. SEAMLESS BLEND MASKS */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--theme-app-bg,#F7F8FA),transparent)] z-10" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,var(--theme-app-bg,#F7F8FA),transparent)] z-10" />
    </div>
  );
};

export default AnimatedHeroBackground;
