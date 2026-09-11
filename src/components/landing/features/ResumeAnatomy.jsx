// // import React, { useState } from 'react';

// // const ResumeAnatomy = () => {
// //   const [activePoint, setActivePoint] = useState(null);

// //   // Resume-specific hotspots
// //   const points = [
// //     {
// //       id: 1,
// //       top: '4%',
// //       left: '-20px',
// //       title: 'Professional Header',
// //       content: 'Clear name, title, and clickable contact links (LinkedIn/Portfolio). No full address needed, just City/State.'
// //     },
// //     {
// //       id: 2,
// //       top: '15%',
// //       left: '-20px',
// //       title: 'The "Hook" Summary',
// //       content: '3-4 lines summarizing your years of experience, key industries, and top 2 achievements. Ditch the "Objective".'
// //     },
// //     {
// //       id: 3,
// //       top: '26%',
// //       left: '-20px',
// //       title: 'Skills Section',
// //       content: 'ATS scanners look here first. List hard skills (tools, languages) relevant to the job description.'
// //     },
// //     {
// //       id: 4,
// //       top: '40%',
// //       left: '-20px',
// //       title: 'Action-Oriented Bullets',
// //       content: 'Start with strong verbs (Led, Built). Use the "X-Y-Z formula": Achieved [X] measured by [Y], by doing [Z].'
// //     },
// //     {
// //       id: 5,
// //       top: '55%',
// //       left: '-20px',
// //       title: 'Quantifiable Results',
// //       content: 'Numbers pop. "Increased revenue by 20%" is far stronger than "Responsible for sales".'
// //     },
// //     {
// //       id: 6,
// //       top: '70%',
// //       left: '-20px',
// //       title: 'Strategic Projects',
// //       content: 'Highlight specific initiatives where you applied your skills. This proves you can solve complex problems.'
// //     },
// //     {
// //       id: 7,
// //       top: '82%',
// //       left: '-20px',
// //       title: 'Education',
// //       content: 'Keep it brief. Degree, School, and Date. If you are experienced, move this to the bottom.'
// //     },
// //     {
// //       id: 8,
// //       top: '92%',
// //       left: '-20px',
// //       title: 'Awards & Certifications',
// //       content: 'External validation creates trust. List relevant certifications (PMP, AWS) and honors.'
// //     }
// //   ];

// //   // Helper to apply highlight styles
// //   const getHighlightClass = (id) => {
// //     if (activePoint === id) {
// //       // Highlight: Active
// //       return "bg-teal-50 ring-2 ring-teal-200 rounded-lg px-2 -mx-2 transition-all duration-300 shadow-sm relative z-10";
// //     }
// //     if (activePoint !== null && activePoint !== id) {
// //       // Blur: Inactive
// //       return "opacity-30 blur-[1px] transition-all duration-300";
// //     }
// //     // Default
// //     return "transition-all duration-300";
// //   };

// //   return (
// //     <div className="w-full">
// //       <div className="max-w-7xl mx-auto px-6">
        
// //         {/* Section Header */}
// //         <div className="text-center mb-16">
// //           <h2 className="landing-eyebrow mb-3">Expert Advice</h2>
// //           <h3 className="landing-heading text-4xl font-black mb-4">The Anatomy of a Winning Resume</h3>
// //           <p className="landing-copy text-lg max-w-2xl mx-auto font-medium">
// //             Hover over the numbers to unlock the secrets of an ATS-friendly resume. Our builder ensures you hit every one of these points automatically.
// //           </p>
// //         </div>

// //         <div className="flex justify-center">
// //           {/* Document Container (A4 Aspect Ratio) */}
// //           <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-sm border border-slate-200 aspect-[210/297] p-8 md:p-12 transform transition-all duration-500 hover:shadow-teal-100/50 font-sans text-slate-800 text-[10px] md:text-xs leading-relaxed">
            
// //             {/* Background Texture */}
// //             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-[0.03] pointer-events-none"></div>
// //             {/* Rest of content... */}

// //             {/* --- ACTUAL RESUME CONTENT --- */}
            
// //             {/* 1. Header Area */}
// //             <div className={`mb-5 text-center ${getHighlightClass(1)}`}>
// //               <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-1">POOJA BANSAL</h1>
// //               <p className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-2">Senior Product Manager</p>
// //               <div className="flex justify-center gap-3 text-slate-400 font-medium">
// //                 <span>(555) 123-4567</span> • <span>POOJA@careerSENSE.com</span> • <span>linkedin.com/in/POOJA</span> • <span>New York, NY</span>
// //               </div>
// //               <div className="h-1 w-full bg-slate-100 mt-4 rounded-full"></div>
// //             </div>

// //             {/* 2. Summary */}
// //             <div className={`mb-5 ${getHighlightClass(2)}`}>
// //               <h4 className="text-teal-700 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 pb-1 mb-2">Professional Summary</h4>
// //               <p className="text-slate-600 text-justify">
// //                 Results-oriented Product Manager with <strong>7+ years of experience</strong> driving product strategy for SaaS platforms. Proven track record of increasing user retention by <strong>25%</strong> through data-driven feature optimization. Expert in Agile methodologies, cross-functional leadership, and go-to-market execution.
// //               </p>
// //             </div>

// //             {/* 3. Skills */}
// //             <div className={`mb-5 ${getHighlightClass(3)}`}>
// //               <h4 className="text-teal-700 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 pb-1 mb-2">Core Competencies</h4>
// //               <div className="flex flex-wrap gap-2">
// //                 {['Product Strategy', 'Agile/Scrum', 'Jira & Confluence', 'Data Analysis (SQL)', 'A/B Testing', 'Stakeholder Management', 'Roadmapping'].map(skill => (
// //                     <span key={skill} className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-bold text-[9px]">{skill}</span>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* 4. Experience (Highlights Bullets) */}
// //             <div className={`mb-5 ${getHighlightClass(4)}`}>
// //               <h4 className="text-teal-700 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 pb-1 mb-3">Professional Experience</h4>
              
// //               {/* Role 1 */}
// //               <div className="mb-4">
// //                 <div className="flex justify-between font-bold text-slate-900 mb-1">
// //                     <span>Senior Product Manager</span>
// //                     <span>2020 - Present</span>
// //                 </div>
// //                 <div className="text-slate-500 italic mb-2">TechFlow Solutions</div>
// //                 <ul className="list-disc ml-4 space-y-1 text-slate-600">
// //                     <li><strong>Spearheaded</strong> the launch of the "Analytics V2" module, resulting in a <strong>$1.5M increase</strong> in ARR within Q1.</li>
// //                     <li>Led a cross-functional team of 15 engineers and designers to reduce technical debt by 40%.</li>
// //                     {/* 5. Quantifiable Results Highlight */}
// //                     <li className={`${activePoint === 5 ? 'bg-yellow-100 ring-2 ring-yellow-200 rounded px-1' : ''} ${getHighlightClass(5)}`}>
// //                         Implemented new user onboarding flow, boosting activation rates by <strong>22%</strong> year-over-year.
// //                     </li>
// //                 </ul>
// //               </div>

// //               {/* Role 2 */}
// //               <div>
// //                 <div className="flex justify-between font-bold text-slate-900 mb-1">
// //                     <span>Product Owner</span>
// //                     <span>2017 - 2020</span>
// //                 </div>
// //                 <div className="text-slate-500 italic mb-2">CreativePulse Inc.</div>
// //                 <ul className="list-disc ml-4 space-y-1 text-slate-600">
// //                     <li>Managed product roadmap for 3 enterprise clients valued at $500k+.</li>
// //                     <li>Reduced churn by 15% through proactive customer feedback loops.</li>
// //                 </ul>
// //               </div>
// //             </div>

// //             {/* 6. Key Projects */}
// //             <div className={`mb-5 ${getHighlightClass(6)}`}>
// //               <h4 className="text-teal-700 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 pb-1 mb-2">Key Projects</h4>
// //               <div className="mb-2">
// //                 <div className="flex justify-between font-bold text-slate-900 text-[10px]">
// //                     <span>AI-Driven Recommendation Engine</span>
// //                     <span className="italic font-normal text-slate-400">2023</span>
// //                 </div>
// //                 <p className="text-slate-600 mt-1">
// //                    Led the development of a machine learning model to suggest personalized content, increasing daily active users (DAU) by 18%.
// //                 </p>
// //               </div>
// //             </div>

// //             {/* 7. Education */}
// //             <div className={`mb-5 ${getHighlightClass(7)}`}>
// //               <h4 className="text-teal-700 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 pb-1 mb-2">Education</h4>
// //               <div className="flex justify-between font-bold text-slate-900">
// //                   <span>MBA, Business Administration</span>
// //                   <span>2016</span>
// //               </div>
// //               <div className="text-slate-500 mb-1">Stern School of Business, NY</div>
// //             </div>

// //             {/* 8. Awards & Certifications */}
// //             <div className={`${getHighlightClass(8)}`}>
// //               <h4 className="text-teal-700 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 pb-1 mb-2">Awards & Certifications</h4>
// //               <div className="grid grid-cols-2 gap-4">
// //                   <div>
// //                       <div className="font-bold text-slate-900">Certified Scrum Product Owner (CSPO)</div>
// //                       <div className="text-slate-500 text-[9px]">Scrum Alliance • 2018</div>
// //                   </div>
// //                   <div>
// //                       <div className="font-bold text-slate-900">Innovator of the Year</div>
// //                       <div className="text-slate-500 text-[9px]">TechFlow Internal Awards • 2022</div>
// //                   </div>
// //               </div>
// //             </div>


// //             {/* --- INTERACTIVE HOTSPOTS --- */}
// //             {points.map((p) => (
// //               <div
// //                 key={p.id}
// //                 className="absolute z-20 group"
// //                 style={{ top: p.top, left: p.left }}
// //                 onMouseEnter={() => setActivePoint(p.id)}
// //                 onMouseLeave={() => setActivePoint(null)}
// //               >
// //                 {/* Number Circle */}
// //                 <div className={`
// //                   w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center 
// //                   text-sm md:text-base font-bold shadow-lg cursor-pointer transition-all duration-300
// //                   ${activePoint === p.id 
// //                     ? 'bg-teal-600 text-white scale-110 ring-4 ring-teal-100' 
// //                     : 'landing-control text-[color:var(--theme-accent-strong)] border-2 hover:border-[color:var(--theme-accent)] hover:scale-105'}
// //                 `}>
// //                   {p.id}
// //                 </div>

// //                 {/* Tooltip Content */}
// //                 <div className={`
// //                   landing-card absolute left-14 top-1/2 -translate-y-1/2 w-64 md:w-80 p-5 rounded-xl shadow-2xl
// //                   transition-all duration-300 origin-left z-30 pointer-events-none font-sans
// //                   ${activePoint === p.id ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-4 hidden'}
// //                 `}>
// //                   {/* Tooltip Arrow */}
// //                   <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[color:var(--theme-card-bg)] border-l border-b border-[color:var(--theme-card-border)] transform rotate-45 -translate-y-1/2"></div>
                  
// //                   <h4 className="text-sm font-bold text-[color:var(--theme-text-primary)] mb-2 flex items-center gap-2">
// //                     <span className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded text-xs">#{p.id}</span> {p.title}
// //                   </h4>
// //                   <p className="text-xs text-[color:var(--theme-text-secondary)] leading-relaxed font-medium">
// //                     {p.content}
// //                   </p>
// //                 </div>
// //               </div>
// //             ))}

// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ResumeAnatomy;


// import React, { useState } from 'react';

// const ResumeAnatomy = () => {
//   const [activePoint, setActivePoint] = useState(null);

//   // Resume-specific hotspots with adjusted top percentages for perfect vertical alignment
//   const points = [
//     {
//       id: 1,
//       top: '4%',
//       left: '-20px',
//       title: 'Professional Header',
//       content: 'Clear name, title, and clickable contact links (LinkedIn/Portfolio). No full address needed, just City/State.'
//     },
//     {
//       id: 2,
//       top: '17%',
//       left: '-20px',
//       title: 'The "Hook" Summary',
//       content: '3-4 lines summarizing your years of experience, key industries, and top 2 achievements. Ditch the "Objective".'
//     },
//     {
//       id: 3,
//       top: '29%',
//       left: '-20px',
//       title: 'Skills Section',
//       content: 'ATS scanners look here first. List hard skills (tools, languages) relevant to the job description.'
//     },
//     {
//       id: 4,
//       top: '42%',
//       left: '-20px',
//       title: 'Action-Oriented Bullets',
//       content: 'Start with strong verbs (Led, Built). Use the "X-Y-Z formula": Achieved [X] measured by [Y], by doing [Z].'
//     },
//     {
//       id: 5,
//       top: '57%',
//       left: '-20px',
//       title: 'Quantifiable Results',
//       content: 'Numbers pop. "Increased revenue by 20%" is far stronger than "Responsible for sales".'
//     },
//     {
//       id: 6,
//       top: '71%',
//       left: '-20px',
//       title: 'Strategic Projects',
//       content: 'Highlight specific initiatives where you applied your skills. This proves you can solve complex problems.'
//     },
//     {
//       id: 7,
//       top: '82%',
//       left: '-20px',
//       title: 'Education',
//       content: 'Keep it brief. Degree, School, and Date. If you are experienced, move this to the bottom.'
//     },
//     {
//       id: 8,
//       top: '91%',
//       left: '-20px',
//       title: 'Awards & Certifications',
//       content: 'External validation creates trust. List relevant certifications (PMP, AWS) and honors.'
//     }
//   ];

//   // Helper to apply highlight styles (now fully dark-mode compatible)
//   const getHighlightClass = (id) => {
//     if (activePoint === id) {
//       // Highlight: Active
//       return "bg-teal-50 dark:bg-teal-900/30 ring-2 ring-teal-200 dark:ring-teal-700/50 rounded-lg px-2 -mx-2 transition-all duration-300 shadow-sm relative z-10";
//     }
//     if (activePoint !== null && activePoint !== id) {
//       // Blur: Inactive
//       return "opacity-30 blur-[2px] transition-all duration-300";
//     }
//     // Default
//     return "transition-all duration-300";
//   };

//   return (
//     <div className="w-full">
//       <div className="max-w-7xl mx-auto px-6">
        
//         {/* Section Header */}
//         <div className="text-center mb-16">
//           <h2 className="landing-eyebrow mb-3">Expert Advice</h2>
//           <h3 className="landing-heading text-4xl font-black mb-4">The Anatomy of a Winning Resume</h3>
//           <p className="landing-copy text-lg max-w-2xl mx-auto font-medium">
//             Hover over the numbers to unlock the secrets of an ATS-friendly resume. Our builder ensures you hit every one of these points automatically.
//           </p>
//         </div>

//         <div className="flex justify-center">
//           {/* Document Container (Theme-Aware) */}
//           <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl rounded-sm border border-slate-200 dark:border-slate-800 aspect-[210/297] p-8 md:p-12 transform transition-all duration-500 hover:shadow-teal-100/50 dark:hover:shadow-teal-900/20 font-sans text-slate-800 dark:text-slate-300 text-[10px] md:text-xs leading-relaxed">
            
//             {/* Background Texture */}
//             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-[0.03] dark:opacity-[0.06] pointer-events-none"></div>

//             {/* --- ACTUAL RESUME CONTENT --- */}
            
//             {/* 1. Header Area */}
//             <div className={`mb-5 text-center py-1 ${getHighlightClass(1)}`}>
//               <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">POOJA BANSAL</h1>
//               <p className="text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-widest mb-2">Senior Product Manager</p>
//               <div className="flex justify-center gap-3 text-slate-400 dark:text-slate-500 font-medium">
//                 <span>(555) 123-4567</span> • <span>POOJA@careerSENSE.com</span> • <span>linkedin.com/in/POOJA</span> • <span>New York, NY</span>
//               </div>
//               <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mt-4 rounded-full"></div>
//             </div>

//             {/* 2. Summary */}
//             <div className={`mb-5 py-1 ${getHighlightClass(2)}`}>
//               <h4 className="text-teal-700 dark:text-teal-400 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 dark:border-teal-800 pb-1 mb-2">Professional Summary</h4>
//               <p className="text-slate-600 dark:text-slate-300 text-justify">
//                 Results-oriented Product Manager with <strong className="dark:text-white">7+ years of experience</strong> driving product strategy for SaaS platforms. Proven track record of increasing user retention by <strong className="dark:text-white">25%</strong> through data-driven feature optimization. Expert in Agile methodologies, cross-functional leadership, and go-to-market execution.
//               </p>
//             </div>

//             {/* 3. Skills */}
//             <div className={`mb-5 py-1 ${getHighlightClass(3)}`}>
//               <h4 className="text-teal-700 dark:text-teal-400 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 dark:border-teal-800 pb-1 mb-2">Core Competencies</h4>
//               <div className="flex flex-wrap gap-2">
//             {[
//               'Product Strategy', 'Agile/Scrum', 'Jira & Confluence', 'Data Analysis (SQL)', 
//               'A/B Testing', 'Stakeholder Management', 'Roadmapping', 'Strategic Planning', 
//               , 'Executive Leadership', 'Board Relations', 'Mergers & Acquisitions', 
//               'Fundraising & Investor Relations'
//     ].map(skill => (
//         <span key={skill} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-bold text-[9px]">{skill}</span>
//     ))}
// </div>
//             </div>

//             {/* EXPERIENCE WRAPPER (Separated Points 4 and 5) */}
//             <div className="mb-5">
//               <h4 className="text-teal-700 dark:text-teal-400 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 dark:border-teal-800 pb-1 mb-3">Professional Experience</h4>
              
//               {/* 4. Experience Role 1 (Action-Oriented Bullets) */}
//               <div className={`mb-4 py-1 ${getHighlightClass(4)}`}>
//                 <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-1">
//                     <span>Senior Product Manager</span>
//                     <span>2020 - Present</span>
//                 </div>
//                 <div className="text-slate-500 dark:text-slate-400 italic mb-2">TechFlow Solutions</div>
//                 <ul className="list-disc ml-4 space-y-1 text-slate-600 dark:text-slate-300">
//     <li><strong className="dark:text-white">Spearheaded</strong> the launch of the "Analytics V2" module, securing strong cross-departmental buy-in.</li>
//     <li><strong className="dark:text-white">Led</strong> a cross-functional team of 15 engineers and designers, establishing a unified agile delivery cadence.</li>
//     <li><strong className="dark:text-white">Built</strong> a comprehensive go-to-market strategy alongside marketing and sales teams.</li>
//     <li><strong className="dark:text-white">Optimized</strong> user onboarding workflows, significantly reducing drop-off rates and accelerating time-to-value for new enterprise clients.</li>
//     <li><strong className="dark:text-white">Architected</strong> a scalable customer feedback pipeline that directly integrated user research into the quarterly product roadmap.</li>
// </ul>
//               </div>

//               {/* 5. Experience Role 2 (Quantifiable Results Highlight) */}
//               <div className={`py-1 ${getHighlightClass(5)}`}>
//                 <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-1">
//                     <span>Product Owner</span>
//                     <span>2017 - 2020</span>
//                 </div>
//                 <div className="text-slate-500 dark:text-slate-400 italic mb-2">CreativePulse Inc.</div>
//                 <ul className="list-disc ml-4 space-y-1 text-slate-600 dark:text-slate-300">
//     <li>Managed product roadmap for 3 enterprise clients valued at <strong className="dark:text-white">$500k+</strong> each.</li>
//     <li>Reduced overall platform churn by <strong className="dark:text-white">15%</strong> through proactive customer feedback loops.</li>
//     <li>Implemented new user onboarding flow, boosting activation rates by <strong className="dark:text-white">22%</strong> year-over-year.</li>
//     <li>Increased annual recurring revenue (ARR) by <strong className="dark:text-white">18%</strong> through the successful launch of a tiered subscription model.</li>
//     <li>Accelerated feature delivery cycles by <strong className="dark:text-white">30%</strong> by restructuring sprint planning and backlog grooming processes.</li>
// </ul>
//               </div>
//             </div>

//             {/* 6. Key Projects */}
//             <div className={`mb-5 py-1 ${getHighlightClass(6)}`}>
//               <h4 className="text-teal-700 dark:text-teal-400 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 dark:border-teal-800 pb-1 mb-2">Key Projects</h4>
//               <div className="mb-2">
//                 <div className="flex justify-between font-bold text-slate-900 dark:text-white text-[10px]">
//                     <span>AI-Driven Recommendation Engine</span>
//                     <span className="italic font-normal text-slate-400 dark:text-slate-500">2023</span>
//                 </div>
//                 <p className="text-slate-600 dark:text-slate-300 mt-1">
//                    Led the development of a machine learning model to suggest personalized content, increasing daily active users (DAU) by 18%.
//                 </p>
//               </div>
//             </div>

//             {/* 7. Education */}
//             <div className={`mb-5 py-1 ${getHighlightClass(7)}`}>
//               <h4 className="text-teal-700 dark:text-teal-400 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 dark:border-teal-800 pb-1 mb-2">Education</h4>
//               <div className="flex justify-between font-bold text-slate-900 dark:text-white">
//                   <span>MBA, Business Administration</span>
//                   <span>2016</span>
//               </div>
//               <div className="text-slate-500 dark:text-slate-400 mb-1">Stern School of Business, NY</div>
//             </div>

//             {/* 8. Awards & Certifications */}
//             <div className={`py-1 ${getHighlightClass(8)}`}>
//               <h4 className="text-teal-700 dark:text-teal-400 font-bold uppercase text-[10px] tracking-widest border-b border-teal-100 dark:border-teal-800 pb-1 mb-2">Awards & Certifications</h4>
//               <div className="grid grid-cols-2 gap-4">
//                   <div>
//                       <div className="font-bold text-slate-900 dark:text-white">Certified Scrum Product Owner (CSPO)</div>
//                       <div className="text-slate-500 dark:text-slate-400 text-[9px]">Scrum Alliance • 2018</div>
//                   </div>
//                   <div>
//                       <div className="font-bold text-slate-900 dark:text-white">Innovator of the Year</div>
//                       <div className="text-slate-500 dark:text-slate-400 text-[9px]">TechFlow Internal Awards • 2022</div>
//                   </div>
//               </div>
//             </div>


//             {/* --- INTERACTIVE HOTSPOTS --- */}
//             {points.map((p) => (
//               <div
//                 key={p.id}
//                 className="absolute z-20 group"
//                 style={{ top: p.top, left: p.left }}
//                 onMouseEnter={() => setActivePoint(p.id)}
//                 onMouseLeave={() => setActivePoint(null)}
//               >
//                 {/* Number Circle */}
//                 <div className={`
//                   w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center 
//                   text-sm md:text-base font-bold shadow-lg cursor-pointer transition-all duration-300
//                   ${activePoint === p.id 
//                     ? 'bg-teal-600 dark:bg-teal-500 text-white scale-110 ring-4 ring-teal-100 dark:ring-teal-900' 
//                     : 'landing-control bg-white dark:bg-slate-800 text-[color:var(--theme-accent-strong)] border-2 hover:border-[color:var(--theme-accent)] hover:scale-105'}
//                 `}>
//                   {p.id}
//                 </div>

//                 {/* Tooltip Content */}
//                 <div className={`
//                   landing-card absolute left-14 top-1/2 -translate-y-1/2 w-64 md:w-80 p-5 rounded-xl shadow-2xl
//                   transition-all duration-300 origin-left z-30 pointer-events-none font-sans bg-[color:var(--theme-card-bg)] border border-[color:var(--theme-card-border)]
//                   ${activePoint === p.id ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-4 hidden'}
//                 `}>
//                   {/* Tooltip Arrow */}
//                   <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[color:var(--theme-card-bg)] border-l border-b border-[color:var(--theme-card-border)] transform rotate-45 -translate-y-1/2"></div>
                  
//                   <h4 className="text-sm font-bold text-[color:var(--theme-text-primary)] mb-2 flex items-center gap-2">
//                     <span className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40 px-1.5 py-0.5 rounded text-xs">#{p.id}</span> {p.title}
//                   </h4>
//                   <p className="text-xs text-[color:var(--theme-text-secondary)] leading-relaxed font-medium">
//                     {p.content}
//                   </p>
//                 </div>
//               </div>
//             ))}

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResumeAnatomy;

import React, { useState } from 'react';

const ResumeAnatomy = () => {
  const [activePoint, setActivePoint] = useState(null);

  const points = [
    {
      id: 1,
      top: '4%',
      left: '-20px',
      title: 'Professional Header',
      content:
        'Clear name, title, and clickable contact links such as LinkedIn or portfolio. No full address needed, just City and State.',
    },
    {
      id: 2,
      top: '17%',
      left: '-20px',
      title: 'The Hook Summary',
      content:
        '3 to 4 lines summarizing your years of experience, key industries, and top achievements. Avoid outdated objective statements.',
    },
    {
      id: 3,
      top: '29%',
      left: '-20px',
      title: 'Skills Section',
      content:
        'ATS scanners look here first. List hard skills, tools, and keywords that match the job description.',
    },
    {
      id: 4,
      top: '42%',
      left: '-20px',
      title: 'Action-Oriented Bullets',
      content:
        'Start with strong verbs like Led, Built, Improved, Reduced, or Launched. Use the X-Y-Z formula: Achieved X measured by Y by doing Z.',
    },
    {
      id: 5,
      top: '57%',
      left: '-20px',
      title: 'Quantifiable Results',
      content:
        'Numbers stand out. Increased revenue by 20% is stronger than Responsible for sales.',
    },
    {
      id: 6,
      top: '71%',
      left: '-20px',
      title: 'Strategic Projects',
      content:
        'Highlight specific initiatives where you applied your skills. This proves you can solve real business problems.',
    },
    {
      id: 7,
      top: '82%',
      left: '-20px',
      title: 'Education',
      content:
        'Keep it brief. Degree, school, and date. If you are experienced, move this section toward the bottom.',
    },
    {
      id: 8,
      top: '91%',
      left: '-20px',
      title: 'Awards & Certifications',
      content:
        'External validation creates trust. List relevant certifications and honors that support your role.',
    },
  ];

  const getHighlightClass = (id) => {
    if (activePoint === id) {
      return 'bg-[#B9964A]/10 ring-2 ring-[#B9964A]/35 rounded-lg px-2 -mx-2 transition-all duration-300 shadow-sm relative z-10';
    }

    if (activePoint !== null && activePoint !== id) {
      return 'opacity-30 blur-[2px] transition-all duration-300';
    }

    return 'transition-all duration-300';
  };

  const skills = [
    'Product Strategy',
    'Agile/Scrum',
    'Jira & Confluence',
    'Data Analysis (SQL)',
    'A/B Testing',
    'Stakeholder Management',
    'Roadmapping',
    'Strategic Planning',
    'Executive Leadership',
    'Board Relations',
    'Mergers & Acquisitions',
    'Fundraising & Investor Relations',
  ];

  return (
  <div className="w-full">
    <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.26em] text-[#9A7628]">
            Expert Advice
          </h2>

          <h3 className="mb-4 text-4xl font-black tracking-tight text-[#071426]">
            The Anatomy of a Winning Resume
          </h3>

          <p className="mx-auto max-w-1xl text-lg font-medium leading-8 text-[#475569]">
            Hover over the numbers to understand what makes a resume ATS-friendly,
            readable, and recruiter-ready.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative aspect-[210/297] w-full max-w-3xl rounded-sm border border-[#E1E7EF] bg-white p-8 font-sans text-[10px] leading-relaxed text-[#334155] shadow-[0_28px_90px_rgba(11,18,32,0.16)] transition-all duration-500 hover:shadow-[0_32px_100px_rgba(11,18,32,0.20)] md:p-12 md:text-xs">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.28]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(203, 213, 225, 0.28) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(203, 213, 225, 0.24) 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px',
              }}
            />

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 12% 8%, rgba(185, 150, 74, 0.08), transparent 30%),
                  radial-gradient(circle at 92% 18%, rgba(11, 18, 32, 0.05), transparent 34%)
                `,
              }}
            />

            <div className="relative z-10">
              <div className={`mb-5 py-1 text-center ${getHighlightClass(1)}`}>
                <h1 className="mb-1 text-3xl font-black uppercase tracking-tight text-[#071426]">
                  POOJA BANSAL
                </h1>

                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#9A7628]">
                  Senior Product Manager
                </p>

                <div className="flex justify-center gap-3 font-medium text-[#64748B]">
                  <span>(555) 123-4567</span>
                  <span>•</span>
                  <span>POOJA@careerSENSE.com</span>
                  <span>•</span>
                  <span>linkedin.com/in/POOJA</span>
                  <span>•</span>
                  <span>New York, NY</span>
                </div>

                <div className="mt-4 h-px w-full rounded-full bg-[#E1E7EF]" />
              </div>

              <div className={`mb-5 py-1 ${getHighlightClass(2)}`}>
                <h4 className="mb-2 border-b border-[#B9964A]/25 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9A7628]">
                  Professional Summary
                </h4>

                <p className="text-justify text-[#475569]">
                  Results-oriented Product Manager with{' '}
                  <strong className="text-[#071426]">7+ years of experience</strong>{' '}
                  driving product strategy for SaaS platforms. Proven track record of
                  increasing user retention by{' '}
                  <strong className="text-[#071426]">25%</strong> through data-driven
                  feature optimization. Expert in Agile methodologies, cross-functional
                  leadership, and go-to-market execution.
                </p>
              </div>

              <div className={`mb-5 py-1 ${getHighlightClass(3)}`}>
                <h4 className="mb-2 border-b border-[#B9964A]/25 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9A7628]">
                  Core Competencies
                </h4>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded border border-[#E1E7EF] bg-[#F7F8FA] px-2 py-1 text-[9px] font-bold text-[#475569]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <h4 className="mb-3 border-b border-[#B9964A]/25 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9A7628]">
                  Professional Experience
                </h4>

                <div className={`mb-4 py-1 ${getHighlightClass(4)}`}>
                  <div className="mb-1 flex justify-between font-bold text-[#071426]">
                    <span>Senior Product Manager</span>
                    <span>2020 - Present</span>
                  </div>

                  <div className="mb-2 italic text-[#64748B]">
                    TechFlow Solutions
                  </div>

                  <ul className="ml-4 list-disc space-y-1 text-[#475569]">
                    <li>
                      <strong className="text-[#071426]">Spearheaded</strong> the
                      launch of the Analytics V2 module, securing strong
                      cross-departmental buy-in.
                    </li>
                    <li>
                      <strong className="text-[#071426]">Led</strong> a
                      cross-functional team of 15 engineers and designers,
                      establishing a unified agile delivery cadence.
                    </li>
                    <li>
                      <strong className="text-[#071426]">Built</strong> a
                      comprehensive go-to-market strategy alongside marketing and
                      sales teams.
                    </li>
                    <li>
                      <strong className="text-[#071426]">Optimized</strong> user
                      onboarding workflows, reducing drop-off and accelerating
                      time-to-value for enterprise clients.
                    </li>
                    <li>
                      <strong className="text-[#071426]">Architected</strong> a
                      customer feedback pipeline that fed directly into the quarterly
                      product roadmap.
                    </li>
                  </ul>
                </div>

                <div className={`py-1 ${getHighlightClass(5)}`}>
                  <div className="mb-1 flex justify-between font-bold text-[#071426]">
                    <span>Product Owner</span>
                    <span>2017 - 2020</span>
                  </div>

                  <div className="mb-2 italic text-[#64748B]">
                    CreativePulse Inc.
                  </div>

                  <ul className="ml-4 list-disc space-y-1 text-[#475569]">
                    <li>
                      Managed product roadmap for 3 enterprise clients valued at{' '}
                      <strong className="text-[#071426]">$500k+</strong> each.
                    </li>
                    <li>
                      Reduced overall platform churn by{' '}
                      <strong className="text-[#071426]">15%</strong> through
                      proactive customer feedback loops.
                    </li>
                    <li>
                      Implemented new onboarding flow, boosting activation rates by{' '}
                      <strong className="text-[#071426]">22%</strong> year-over-year.
                    </li>
                    <li>
                      Increased annual recurring revenue by{' '}
                      <strong className="text-[#071426]">18%</strong> through a
                      successful tiered subscription model.
                    </li>
                    <li>
                      Accelerated feature delivery cycles by{' '}
                      <strong className="text-[#071426]">30%</strong> by improving
                      sprint planning and backlog grooming.
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`mb-5 py-1 ${getHighlightClass(6)}`}>
                <h4 className="mb-2 border-b border-[#B9964A]/25 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9A7628]">
                  Key Projects
                </h4>

                <div className="mb-2">
                  <div className="flex justify-between text-[10px] font-bold text-[#071426]">
                    <span>AI-Driven Recommendation Engine</span>
                    <span className="font-normal italic text-[#64748B]">2023</span>
                  </div>

                  <p className="mt-1 text-[#475569]">
                    Led the development of a machine learning model to suggest
                    personalized content, increasing daily active users by 18%.
                  </p>
                </div>
              </div>

              <div className={`mb-5 py-1 ${getHighlightClass(7)}`}>
                <h4 className="mb-2 border-b border-[#B9964A]/25 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9A7628]">
                  Education
                </h4>

                <div className="flex justify-between font-bold text-[#071426]">
                  <span>MBA, Business Administration</span>
                  <span>2016</span>
                </div>

                <div className="mb-1 text-[#64748B]">
                  Stern School of Business, NY
                </div>
              </div>

              <div className={`py-1 ${getHighlightClass(8)}`}>
                <h4 className="mb-2 border-b border-[#B9964A]/25 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9A7628]">
                  Awards & Certifications
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-bold text-[#071426]">
                      Certified Scrum Product Owner (CSPO)
                    </div>
                    <div className="text-[9px] text-[#64748B]">
                      Scrum Alliance • 2018
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-[#071426]">
                      Innovator of the Year
                    </div>
                    <div className="text-[9px] text-[#64748B]">
                      TechFlow Internal Awards • 2022
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {points.map((point) => (
              <div
                key={point.id}
                className="group absolute z-20"
                style={{ top: point.top, left: point.left }}
                onMouseEnter={() => setActivePoint(point.id)}
                onMouseLeave={() => setActivePoint(null)}
              >
                <div
                  className={`
                    flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sm font-bold shadow-lg transition-all duration-300 md:h-10 md:w-10 md:text-base
                    ${
                      activePoint === point.id
                        ? 'scale-110 bg-[#071426] text-[#B9964A] ring-4 ring-[#B9964A]/20'
                        : 'border-2 border-[#D6C7A8] bg-white text-[#9A7628] hover:scale-105 hover:border-[#B9964A]'
                    }
                  `}
                >
                  {point.id}
                </div>

                <div
                  className={`
                    pointer-events-none absolute left-14 top-1/2 z-30 w-64 origin-left -translate-y-1/2 rounded-xl border border-[#E1E7EF] bg-white p-5 font-sans shadow-2xl transition-all duration-300 md:w-80
                    ${
                      activePoint === point.id
                        ? 'translate-x-0 scale-100 opacity-100'
                        : 'hidden -translate-x-4 scale-95 opacity-0'
                    }
                  `}
                >
                  <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b border-l border-[#E1E7EF] bg-white" />

                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#071426]">
                    <span className="rounded bg-[#B9964A]/10 px-1.5 py-0.5 text-xs text-[#9A7628]">
                      #{point.id}
                    </span>
                    {point.title}
                  </h4>

                  <p className="text-xs font-medium leading-relaxed text-[#475569]">
                    {point.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnatomy;