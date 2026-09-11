import ResumeExamples from '../features/ResumeExamples';

export default function ResumeExamplesSection({ onStart }) {
  return (
<section
  id="examples"
  className="relative overflow-hidden border-b border-[#D8E0EA] bg-[#F8F7F3] py-16 sm:py-20 scroll-mt-28"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">

    <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F7F9FC_48%,#EEF3F8_100%)]" />

    <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:42px_42px]" />

    <div className="absolute -right-[12%] -top-[35%] h-[580px] w-[580px] rounded-full bg-[#295D95]/10 blur-[130px]" />

    <div className="absolute -bottom-[45%] -left-[8%] h-[480px] w-[480px] rounded-full bg-[#B98A32]/8 blur-[130px]" />

  </div>

  <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-7">
    <ResumeExamples onStart={onStart} />
  </div>
</section>
  );
}
