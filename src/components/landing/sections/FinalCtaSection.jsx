import { ArrowRight, CheckCircle } from 'lucide-react';
import { entryPathsData } from '../data/landingData.jsx';

export default function FinalCtaSection({ onStart, onViewTemplates }) {
  return (
<section
  id="final-cta"
  className="relative overflow-hidden border-t border-[#284C77]/30 bg-[#06172C] py-16 sm:py-20 lg:py-24 text-white"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#041225_0%,#071A32_42%,#0C2A4D_75%,#123B68_100%)]" />

    {/* subtle grid */}
    <div className="absolute inset-0 opacity-[0.045] bg-[linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:42px_42px]" />

    {/* blue ambient glow */}
    <div className="absolute -left-[12%] -top-[40%] h-[600px] w-[600px] rounded-full bg-[#3977BA]/18 blur-[130px]" />

    {/* gold ambient glow */}
    <div className="absolute -bottom-[55%] right-[5%] h-[520px] w-[520px] rounded-full bg-[#B98A32]/11 blur-[130px]" />

    {/* center depth */}
    <div className="absolute left-1/2 top-[48%] h-[440px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#275B8F]/8 blur-[120px]" />
  </div>

  <div className="relative z-10 mx-auto grid max-w-[1350px] items-center gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">

    {/* LEFT CONTENT */}
    <div className="max-w-[600px]">
      {/* EYEBROW */}
      <div className="mb-3 bg-gradient-to-r from-[#D1A74D] via-[#F0D078] to-[#B8872D] bg-clip-text text-[10px] font-black uppercase tracking-[0.22em] text-transparent">
        Build Your Next Opportunity
      </div>

      {/* HEADING */}
      <h2 className="mb-5 text-[2rem] font-black leading-[1.05] tracking-[-0.04em] sm:text-[2.35rem] lg:text-[2.7rem]">
        <span className="bg-gradient-to-b from-white via-[#E3EDF7] to-[#9FB2C7] bg-clip-text text-transparent">
          Your Career Journey.
        </span>

        <br />

        <span className="bg-gradient-to-b from-[#F2D783] via-[#C89B3C] to-[#9A6D1F] bg-clip-text text-transparent">
          Optimized.
        </span>
      </h2>

      {/* DESCRIPTION */}
      <p className="mb-7 max-w-[560px] text-[14px] font-medium leading-[1.75] text-[#A9B8CA] sm:text-[15px]">
        Build, import, tailor, optimize, and export your resume from one complete
        CareerSense workspace.
      </p>

      {/* BENEFITS */}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {[
          '100+ Templates',
          'AI Suggestions',
          'PDF Export',
        ].map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-[11px] font-bold text-[#BAC7D6]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#C79A3F]/30 bg-[#C79A3F]/10">
              <CheckCircle className="h-3.5 w-3.5 text-[#D7B45D]" />
            </div>

            {item}
          </div>
        ))}
      </div>
    </div>

    {/* RIGHT PATH SELECTOR */}
    <div className="relative w-full max-w-[560px] lg:ml-auto">
      {/* panel glow */}
      <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-[radial-gradient(circle_at_20%_10%,rgba(72,126,181,0.20),transparent_42%),radial-gradient(circle_at_85%_90%,rgba(198,153,61,0.12),transparent_38%)] blur-2xl" />

      {/* PANEL */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#6383A6]/35 bg-gradient-to-br from-[#163A62]/72 via-[#0A2949]/82 to-[#06192F]/90 p-5 shadow-[0_26px_65px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-6">

        {/* top light */}
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#8BB1D7]/35 to-transparent" />

        {/* PANEL HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8FA4BC]">
              Select Your Starting Point
            </div>

            <div className="mt-1 text-[13px] font-bold text-[#E5ECF5]">
              Choose how you want to begin
            </div>
          </div>

          <div className="rounded-full border border-[#C89D45]/25 bg-[#C89D45]/10 px-3 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#D9B760]">
            3 Paths
          </div>
        </div>

        {/* PATHS */}
        <div className="space-y-3">
          {entryPathsData.map((path, index) => (
            <button
              key={path.title}
              type="button"
              onClick={() => {
                if (path.mode === 'scratch') {
                  onViewTemplates?.();
                  return;
                }

                onStart?.();
              }}
              className="group flex w-full items-center gap-4 rounded-[1rem] border border-[#7291B1]/20 bg-[#081E38]/55 px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C89D45]/40 hover:bg-[#102F52]/80 hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
            >
              {/* NUMBER */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#486E96]/35 bg-gradient-to-b from-[#234A75] via-[#12345B] to-[#071A31] text-[10px] font-black text-[#DDBA65]">
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* TEXT */}
              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-extrabold text-white sm:text-[14px]">
                  {path.title}
                </h4>

                <p className="mt-1 text-[10px] font-medium leading-[1.45] text-[#8FA1B7] transition-colors group-hover:text-[#B9C7D8]">
                  {path.action}
                </p>
              </div>

              {/* ARROW */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#071A31]/80 text-[#8398AF] transition-all duration-300 group-hover:border-[#C89D45]/30 group-hover:bg-[#122F50] group-hover:text-[#D9B55E]">
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>

        {/* BOTTOM NOTE */}
        <div className="mt-4 border-t border-white/[0.08] pt-4 text-center text-[9px] font-medium text-[#71869E]">
          You can switch workflows at any time.
        </div>
      </div>
    </div>
  </div>
</section>
  );
}
