import ResumeAnatomy from '../features/ResumeAnatomy';

export default function ResumeAnatomySection() {
  return (
<section
  id="anatomy"
  className="relative overflow-hidden border-b border-[#D7DFE9] bg-[#F8F7F3] py-16 sm:py-20 lg:py-24 scroll-mt-28"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">
    {/* soft cream / white surface */}
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F8F9FB_46%,#EEF3F9_100%)]" />

    {/* subtle navy grid */}
    <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:42px_42px]" />

    {/* blue ambient glow */}
    <div className="absolute -right-[12%] -top-[30%] h-[620px] w-[620px] rounded-full bg-[#2B5C91]/10 blur-[130px]" />

    {/* gold ambient glow */}
    <div className="absolute -bottom-[40%] -left-[8%] h-[500px] w-[500px] rounded-full bg-[#C59A42]/8 blur-[130px]" />

    {/* faint center light */}
    <div className="absolute left-1/2 top-[15%] h-[380px] w-[700px] -translate-x-1/2 rounded-full bg-white/50 blur-[110px]" />
  </div>

  {/* CONTENT */}
  <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-7">
    <ResumeAnatomy />
  </div>
</section>
  );
}
