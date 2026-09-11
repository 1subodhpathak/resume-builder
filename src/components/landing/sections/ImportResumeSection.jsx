import { UploadCloud } from 'lucide-react';

export default function ImportResumeSection({ onFileSelect }) {
  return (
<section
  id="import"
  className="relative overflow-hidden border-b border-[#D8E0EA] bg-[#F8F7F3] py-16 sm:py-20 lg:py-24 scroll-mt-28"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F7F9FC_48%,#EEF3F8_100%)]" />

    <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:42px_42px]" />

    <div className="absolute -left-[12%] -top-[35%] h-[560px] w-[560px] rounded-full bg-[#295D95]/10 blur-[130px]" />
    <div className="absolute -bottom-[45%] right-[10%] h-[480px] w-[480px] rounded-full bg-[#B98A32]/8 blur-[130px]" />
  </div>

  <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-7 lg:grid-cols-2 lg:gap-16">

    {/* LEFT — UPLOAD CARD */}
    <div className="group relative">

      {/* CARD GLOW */}
      <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_25%_15%,rgba(40,93,149,0.16),transparent_45%),radial-gradient(circle_at_80%_90%,rgba(185,138,50,0.12),transparent_40%)] blur-2xl transition-all duration-500 group-hover:opacity-90" />

      <div className="relative overflow-hidden rounded-[1.7rem] border border-[#C9D5E2] bg-white/75 p-4 shadow-[0_26px_65px_rgba(6,23,44,0.12)] backdrop-blur-xl sm:p-6">

        {/* TOP HIGHLIGHT */}
        <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-[#D8B65E] to-transparent" />

        <div className="rounded-[1.25rem] border border-[#DCE4EC] bg-gradient-to-br from-white via-[#FCFDFE] to-[#F3F6F9] p-5 text-center sm:p-7">

          {/* CARD TITLE */}
          <h3 className="mb-2 text-[1.15rem] font-extrabold tracking-[-0.02em]">
            <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
              Import Your Resume
            </span>
          </h3>

          <p className="mb-6 text-[13px] font-medium leading-relaxed text-[#667991]">
            Drag and drop PDF, DOCX, DOC, or TXT files to start.
          </p>

          {/* DROP AREA */}
          <div className="group/drop relative flex min-h-[245px] cursor-pointer flex-col items-center justify-center rounded-[1.15rem] border-2 border-dashed border-[#B7C6D7] bg-[linear-gradient(145deg,#F9FBFD_0%,#F3F6FA_55%,#F8F3E8_100%)] p-7 transition-all duration-300 hover:border-[#C49A43]/80 hover:shadow-[inset_0_0_0_1px_rgba(196,154,67,0.08),0_16px_36px_rgba(6,23,44,0.08)]">

            <input
              type="file"
              className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) =>
                e.target.files?.[0] &&
                onFileSelect(e.target.files[0])
              }
            />

            {/* ICON */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#3D648D]/25 bg-gradient-to-b from-[#264D78] via-[#14365E] to-[#071A31] text-[#DDBA65] shadow-[0_10px_24px_rgba(6,23,44,0.18)] transition-transform duration-300 group-hover/drop:-translate-y-1 group-hover/drop:scale-105">
              <UploadCloud size={26} />
            </div>

            <span className="text-[13px] font-extrabold text-[#102F54]">
              Drag and drop a file here
            </span>

            <span className="mt-1.5 text-[11px] font-medium text-[#8797AA]">
              PDF, DOCX, DOC or TXT
            </span>

            {/* BROWSE */}
            <button
              type="button"
              className="pointer-events-none mt-5 rounded-lg border border-[#345D88] bg-gradient-to-b from-[#294F7C] via-[#14365D] to-[#071A31] px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_rgba(6,23,44,0.16)]"
            >
              Browse
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* RIGHT CONTENT */}
    <div>

      {/* EYEBROW */}
      <div className="mb-3 bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[10px] font-black uppercase tracking-[0.22em] text-transparent">
        Bring Your Existing Resume
      </div>

      {/* HEADING */}
      <h2 className="mb-5 text-[1.9rem] font-black leading-[1.07] tracking-[-0.04em] sm:text-[2.2rem] lg:text-[2.45rem]">
        <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
          Import Your Resume
        </span>

        <br />

        <span className="bg-gradient-to-b from-[#E7C86E] via-[#BA8B32] to-[#88601B] bg-clip-text text-transparent">
          Without Losing Your Momentum
        </span>
      </h2>

      {/* DESCRIPTION */}
      <p className="mb-7 max-w-[590px] text-[14px] font-medium leading-[1.75] text-[#53657E] sm:text-[15px]">
        Start from an existing draft, choose Exact Import or AI Optimized,
        review every section, and continue editing on desktop or mobile before
        exporting the final PDF.
      </p>

      {/* FEATURE PILLS */}
      <div className="mb-7 flex flex-wrap gap-2.5">
        {[
          'PDF, DOCX, DOC, TXT',
          'Exact or AI Optimized',
          'Desktop + mobile editing',
        ].map((item) => (
          <div
            key={item}
            className="rounded-full border border-[#CAD5E1] bg-white/80 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#566A83] shadow-[0_6px_16px_rgba(6,23,44,0.04)] backdrop-blur-sm"
          >
            {item}
          </div>
        ))}
      </div>

      {/* IMPORT CTA */}
      <div className="relative inline-block w-full sm:w-auto">
        <input
          type="file"
          className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
          accept=".pdf,.docx,.doc,.txt"
          onChange={(e) =>
            e.target.files?.[0] &&
            onFileSelect(e.target.files[0])
          }
        />

        <button
          type="button"
          className="group relative inline-flex min-h-[50px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-[0.95rem] border border-[#335F91] bg-gradient-to-b from-[#29517F] via-[#14365E] to-[#081C35] px-7 py-3 text-[12px] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_14px_32px_rgba(6,23,44,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4778AA] hover:shadow-[0_18px_38px_rgba(6,23,44,0.24)] sm:w-auto"
        >
          <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#72A0D0]/70 to-transparent" />

          Import My Resume

          <UploadCloud className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  </div>
</section>
  );
}
