import React from 'react';
import WorkflowAnimation from './WorkflowAnimation';

const LaptopAnimation = () => {
  return (
    <section
      id="laptop-demo"
      className="relative overflow-hidden border-b border-[#284C77]/30 bg-[#06172C] py-10 sm:py-12 lg:min-h-[calc(100vh-72px)] lg:py-8 scroll-mt-28"
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#041225_0%,#071A32_42%,#0C2A4D_76%,#123B68_100%)]" />

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:42px_42px]" />

        {/* room lighting */}
        <div className="absolute left-[-12%] top-[10%] h-[500px] w-[500px] rounded-full bg-[#3977BA]/16 blur-[125px]" />
        <div className="absolute right-[-10%] top-[12%] h-[480px] w-[480px] rounded-full bg-[#287D78]/10 blur-[125px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-5 sm:px-7">

        {/* HEADER */}
        <div className="mx-auto mb-6 text-center lg:mb-7">
          {/* eyebrow */}
          <div className="mb-2.5 bg-gradient-to-r from-[#D1A74D] via-[#F0D078] to-[#B8872D] bg-clip-text text-[9px] font-black uppercase tracking-[0.24em] text-transparent sm:text-[10px]">
            Live Builder Experience
          </div>

          {/* heading */}
          <h2 className="mb-3 text-[1.75rem] font-black leading-[1.05] tracking-[-0.04em] sm:text-[2rem] lg:text-[2.2rem]">
            <span className="bg-gradient-to-b from-white via-[#E1EBF6] to-[#9FB2C7] bg-clip-text text-transparent">
              Resume Builder
            </span>{' '}
            <span className="bg-gradient-to-b from-[#F2D783] via-[#C89B3C] to-[#9A6D1F] bg-clip-text text-transparent">
              in Action
            </span>
          </h2>

          {/* subtitle */}
          <p className="mx-auto text-[13px] font-medium leading-[1.6] text-[#A9B8CA] sm:text-[14px] lg:max-w-none lg:whitespace-nowrap">
            Experience a clean, real-time workspace designed to give you complete control over your resume building process. Every edit updates instantly.
          </p>
        </div>

        {/* LAPTOP */}
        <div className="relative mx-auto w-full max-w-[980px] xl:max-w-[1020px]">

          {/* MAIN ROOM-LIGHT GLOW */}
          <div className="pointer-events-none absolute left-1/2 top-[43%] h-[360px] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[48%] bg-[#4385C8]/24 blur-[85px]" />

          {/* teal right-side light */}
          <div className="pointer-events-none absolute right-[1%] top-[28%] h-[260px] w-[180px] rounded-full bg-[#2EA39A]/11 blur-[75px]" />

          {/* blue left-side light */}
          <div className="pointer-events-none absolute left-[1%] top-[26%] h-[270px] w-[180px] rounded-full bg-[#3C7FC4]/14 blur-[75px]" />

          {/* gold floor reflection */}
          <div className="pointer-events-none absolute bottom-[-2%] left-1/2 h-[90px] w-[55%] -translate-x-1/2 rounded-full bg-[#C39A43]/13 blur-[58px]" />

          {/* LAPTOP */}
          <div className="relative z-10">

            {/* floor shadow */}
            <div className="pointer-events-none absolute left-1/2 top-[99%] h-8 w-[76%] -translate-x-1/2 rounded-full bg-black/35 blur-xl" />

            {/* SCREEN / LID */}
            <div className="relative mx-auto w-full">
              <div className="relative rounded-t-[22px] bg-gradient-to-b from-[#151E28] via-[#080C12] to-[#030509] p-[10px] shadow-[0_24px_65px_rgba(0,0,0,0.42)] sm:p-[12px]">

                {/* very subtle top rim */}
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#86ADD5]/40 to-transparent" />

                {/* camera */}
                <div className="absolute left-1/2 top-[4px] z-30 flex h-[7px] w-[7px] -translate-x-1/2 items-center justify-center rounded-full bg-black ring-1 ring-white/[0.08]">
                  <div className="h-[2px] w-[2px] rounded-full bg-[#426A91]/70" />
                </div>

                {/* actual screen */}
                <div className="overflow-hidden rounded-[8px] border border-white/[0.10] bg-[#F7F8FA]">
                  <WorkflowAnimation />
                </div>

                {/* bottom bezel */}
                <div className="flex h-[20px] items-center justify-center bg-[#030509]">
                  <span className="bg-gradient-to-r from-[#73879B] via-[#D4B15C] to-[#73879B] bg-clip-text text-[7px] font-semibold uppercase tracking-[0.30em] text-transparent sm:text-[8px]">
                    CareerSense
                  </span>
                </div>
              </div>

              {/* LAPTOP BASE */}
              <div className="relative mx-auto h-[18px] w-[104%] -translate-x-[2%] rounded-b-[14px] border border-[#9B772A]/40 bg-gradient-to-b from-[#E8CB79] via-[#C2943B] to-[#7F5D1D] shadow-[0_10px_24px_rgba(0,0,0,0.26)]">

                {/* metallic shine */}
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#FFF0B2]/65 to-transparent" />

                {/* center groove */}
                <div className="absolute left-1/2 top-0 h-[6px] w-[145px] -translate-x-1/2 rounded-b-[7px] bg-[#76541F]/45 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]" />

                {/* front edge */}
                <div className="absolute inset-x-12 bottom-[3px] h-px bg-[#F6DA88]/28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LaptopAnimation;