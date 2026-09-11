import resumeJdVideo from '../../../assets/Resume&JD.mp4';
import resumeVideo from '../../../assets/Resume.mp4';

export default function HowItWorksSection() {
  return (
<section
  id="how-it-works"
  className="relative overflow-hidden border-b border-[#D8E0EA] bg-[#F8F7F3] py-14 sm:py-16 lg:py-20 scroll-mt-28"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F7F9FC_48%,#EEF3F8_100%)]" />

    {/* subtle grid */}
    <div className="absolute inset-0 opacity-[0.022] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:42px_42px]" />

    {/* ambient lights */}
    <div className="absolute -left-[12%] -top-[35%] h-[540px] w-[540px] rounded-full bg-[#295D95]/9 blur-[130px]" />
    <div className="absolute -bottom-[45%] right-[5%] h-[460px] w-[460px] rounded-full bg-[#B98A32]/7 blur-[130px]" />
  </div>

  <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-7">

    {/* HEADER */}
    <div className="mx-auto mb-9 max-w-[760px] text-center sm:mb-11">

      {/* EYEBROW */}
      <div className="mb-3 bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[10px] font-black uppercase tracking-[0.22em] text-transparent">
        Simple. Flexible. AI Assisted.
      </div>

      {/* HEADING */}
      <h2 className="mb-4 text-[1.9rem] font-black leading-[1.06] tracking-[-0.04em] sm:text-[2.15rem] lg:text-[2.4rem]">
        <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
          How CareerSense Resume Builder
        </span>{' '}

        <span className="bg-gradient-to-b from-[#E7C86E] via-[#BA8B32] to-[#88601B] bg-clip-text text-transparent">
          Works
        </span>
      </h2>

      {/* SUBHEADING */}
      <p className="mx-auto max-w-[720px] text-[14px] font-medium leading-[1.7] text-[#53657E] sm:text-[15px]">
        Start from an existing resume or tailor one directly to a target job.
        Both flows give you full control before you export the final version.
      </p>
    </div>

    {/* VIDEO GRID */}
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">

      {/* VIDEO 1 */}
      <div className="group relative">
        {/* subtle glow */}
        <div className="pointer-events-none absolute -inset-3 rounded-[1.7rem] bg-[#295D95]/8 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative overflow-hidden rounded-[1.4rem] border border-[#CCD8E4] bg-white/80 p-4 shadow-[0_14px_36px_rgba(6,23,44,0.08)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#C49A43]/45 group-hover:shadow-[0_22px_48px_rgba(6,23,44,0.13)] sm:p-5">

          {/* TOP LABEL */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#28517F] via-[#14375F] to-[#071A31] text-[12px] font-black text-[#DDBA65] shadow-sm">
              01
            </div>

            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.17em] text-[#9A7628]">
                Import Flow
              </div>

              <h3 className="mt-0.5 text-[14px] font-extrabold text-[#102F54] sm:text-[15px]">
                Exact Import or AI Optimized
              </h3>
            </div>
          </div>

          {/* VIDEO */}
          <div className="relative aspect-video overflow-hidden rounded-[1rem] border border-[#162C45]/15 bg-[#02060B] shadow-[0_10px_26px_rgba(6,23,44,0.16)]">
            <video
              src={resumeVideo}
              controls
              preload="metadata"
              className="absolute inset-0 h-full w-full object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* FOOTER NOTE */}
          <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-[#708197]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B98A32]" />
            Upload → choose mode → review → continue editing
          </div>
        </div>
      </div>

      {/* VIDEO 2 */}
      <div className="group relative">
        {/* subtle glow */}
        <div className="pointer-events-none absolute -inset-3 rounded-[1.7rem] bg-[#B98A32]/8 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative overflow-hidden rounded-[1.4rem] border border-[#CCD8E4] bg-white/80 p-4 shadow-[0_14px_36px_rgba(6,23,44,0.08)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#C49A43]/45 group-hover:shadow-[0_22px_48px_rgba(6,23,44,0.13)] sm:p-5">

          {/* TOP LABEL */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#28517F] via-[#14375F] to-[#071A31] text-[12px] font-black text-[#DDBA65] shadow-sm">
              02
            </div>

            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.17em] text-[#9A7628]">
                Tailoring Flow
              </div>

              <h3 className="mt-0.5 text-[14px] font-extrabold text-[#102F54] sm:text-[15px]">
                Tailor to a Target Job Description
              </h3>
            </div>
          </div>

          {/* VIDEO */}
          <div className="relative aspect-video overflow-hidden rounded-[1rem] border border-[#162C45]/15 bg-[#02060B] shadow-[0_10px_26px_rgba(6,23,44,0.16)]">
            <video
              src={resumeJdVideo}
              controls
              preload="metadata"
              className="absolute inset-0 h-full w-full object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* FOOTER NOTE */}
          <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-[#708197]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B98A32]" />
            Add JD → align content → review changes → export
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}
