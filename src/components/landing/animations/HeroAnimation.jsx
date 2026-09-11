import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Layout } from 'lucide-react';

const checklist = [
  { label: 'Structure', done: true },
  { label: 'Keywords', done: false },
  { label: 'Formatting', done: false },
];

const ResumeBuilder = () => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative h-[610px] w-[820px] max-w-full rounded-[2.25rem] border border-[#dfe9ee] bg-white p-5 shadow-[0_18px_46px_rgba(31,55,70,0.14)] xl:h-[662px] xl:w-[890px]"
    >
      <div className="relative flex h-full overflow-hidden rounded-[1.55rem] border border-[#dfe7ef] bg-[#eef2f6] shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
        <aside className="flex w-[250px] shrink-0 flex-col border-r border-[#dfe7ef] bg-white px-7 py-6 xl:w-[270px]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#48978d] text-white">
              <Layout size={17} strokeWidth={2.4} />
            </div>
            <span className="font-serif text-[1rem] font-bold text-[#2f3b4a]">CareerSense AI</span>
          </div>

          <div className="mt-8 xl:mt-10">
            <div className="font-serif text-[0.72rem] font-black uppercase tracking-[0.22em] text-[#8d9aab]">
              Progress
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#edf1f5]">
              <motion.div
                className="h-full rounded-full bg-[#5bb7aa]"
                initial={{ width: '30%' }}
                animate={reduceMotion ? undefined : { width: ['30%', '40%', '30%'] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#101827] px-5 py-5 text-center text-white xl:mt-7 xl:py-6">
            <div className="font-serif text-[0.66rem] font-black uppercase tracking-[0.08em] text-[#8d99aa]">
              Live ATS Score
            </div>
            <div className="relative mx-auto mt-4 flex h-[104px] w-[104px] items-center justify-center xl:h-[112px] xl:w-[112px]">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 104 104" aria-hidden="true">
                <circle cx="52" cy="52" r="39" stroke="#354157" strokeWidth="6" fill="none" />
                <motion.circle
                  cx="52"
                  cy="52"
                  r="39"
                  stroke="#ef5f57"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="245"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 245 }}
                  animate={reduceMotion ? { strokeDashoffset: 147 } : { strokeDashoffset: [245, 147, 147] }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute text-2xl font-black text-white">40</span>
            </div>
          </div>

          <div className="mt-auto space-y-4 pb-1">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between font-serif text-[0.8rem] text-[#69798d]">
                <span>{item.label}</span>
                {item.done ? (
                  <CheckCircle2 size={15} className="text-[#62c29c]" />
                ) : (
                  <span className="h-4 w-4 rounded-full border-2 border-[#d3dde8]" />
                )}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center bg-[#eff3f7] px-8 py-8">
          <div
            className="h-[455px] w-[368px] shrink-0 rounded border border-white bg-white px-10 py-12 shadow-[0_22px_55px_rgba(31,55,70,0.13)] xl:h-[505px] xl:w-[405px]"
          >
            <div className="border-b-[3px] border-[#2a3444] pb-5">
              <h2 className="text-[1.55rem] font-black uppercase leading-none tracking-[-0.05em] text-[#071426] xl:text-[1.75rem]">
                Pooja Bansal
              </h2>
              <p className="mt-4 font-serif text-[0.72rem] font-black uppercase tracking-[0.02em] text-[#6d7b8f]">
                Product Manager &bull; New York, NY
              </p>
            </div>

            <div className="mt-7">
              <h3 className="border-b border-[#d9e0e7] pb-3 text-[0.85rem] font-black uppercase tracking-[-0.01em] text-[#1e293b]">
                Experience
              </h3>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default ResumeBuilder;
