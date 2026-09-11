import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import ProblemBg from '../../../assets/Problem.png';
import { addresses, painPoints } from '../data/landingData.jsx';

export default function ProblemSection({ onStart }) {
  return (
<section
  id="problem"
  className="relative overflow-hidden border-y border-[#284C77]/30 bg-[#041225] py-14 md:py-16 lg:py-20"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0 z-0">
    <img
      src={ProblemBg}
      alt=""
      aria-hidden="true"
      className="h-full w-full object-cover object-center"
    />

    {/* Dark left-to-right overlay for readability */}
    <div className="absolute inset-0 bg-[linear-gradient(90deg,#041225_0%,rgba(4,18,37,0.98)_34%,rgba(5,21,42,0.92)_58%,rgba(6,27,51,0.62)_100%)]" />

    {/* Vertical depth */}
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,14,29,0.28)_0%,transparent_30%,transparent_68%,rgba(2,12,25,0.35)_100%)]" />

    {/* Ambient glows */}
    <div className="absolute -right-[10%] -top-[35%] h-[620px] w-[620px] rounded-full bg-[#295D95]/15 blur-[130px]" />
    <div className="absolute -bottom-[45%] left-[30%] h-[430px] w-[430px] rounded-full bg-[#B98A32]/8 blur-[130px]" />
  </div>

  <div className="relative z-20 mx-auto max-w-[1280px] px-6">
    <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 xl:gap-16">

      {/* LEFT CONTENT */}
      <div>

        {/* EYEBROW */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#C89D45]/35 bg-[#071B34]/75 px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
          <AlertTriangle className="h-3.5 w-3.5 text-[#D7B45D]" />

          <span className="bg-gradient-to-r from-[#D1A74D] via-[#F0D078] to-[#B8872D] bg-clip-text text-[10px] font-extrabold uppercase tracking-[0.18em] text-transparent">
            The Career Challenge
          </span>
        </div>

        {/* HEADING */}
        <h2 className="mb-7 max-w-[610px] text-[2.15rem] font-extrabold leading-[1.06] tracking-[-0.04em] text-white sm:text-[2.55rem] md:text-[2.9rem] lg:text-[3.1rem]">
          The Gaps in Your
          <br />

          <span className="bg-gradient-to-b from-[#F2D783] via-[#C89B3C] to-[#9A6D1F] bg-clip-text text-transparent">
            Application Process
          </span>
        </h2>

        {/* PAIN POINTS */}
        <div className="mb-8 space-y-4">
          {painPoints.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.text}
                className="group flex max-w-[610px] items-start gap-4"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#C6993D]/25 bg-gradient-to-b from-[#163A63]/90 via-[#0E2A4A]/90 to-[#081D36]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-sm transition-all duration-300 group-hover:border-[#D5AA4C]/45 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                  <Icon className="h-4 w-4 text-[#D7B45D]" />
                </div>

                <p className="pt-1 text-[14px] font-medium leading-[1.55] text-[#C3CEE0] sm:text-[15px]">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* SUMMARY + CTA */}
        <div className="max-w-[610px] border-t border-white/10 pt-6">
          <p className="mb-6 text-[13px] leading-[1.75] text-[#8FA1B9] sm:text-[14px]">
            The problem isn't just writing. It's{" "}
            <strong className="font-bold text-[#F2F5FA]">
              formatting, ATS optimization, and role alignment
            </strong>
            . CareerSense solves this instantly.
          </p>

          <button
            onClick={onStart}
            className="group relative inline-flex min-h-[50px] w-full items-center justify-center gap-3 overflow-hidden rounded-[0.95rem] border border-[#335F91] bg-gradient-to-b from-[#29517F] via-[#14365E] to-[#081C35] px-7 py-3 text-[14px] font-extrabold text-white shadow-[0_14px_32px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4778AA] hover:shadow-[0_18px_38px_rgba(0,0,0,0.28)] sm:w-auto"
          >
            <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#72A0D0]/65 to-transparent" />

            <span className="relative z-10">Start Building Now</span>

            <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative ml-auto w-full">

        {/* PANEL GLOW */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 rounded-[2.2rem] bg-[radial-gradient(circle_at_20%_10%,rgba(69,119,171,0.22),transparent_38%),radial-gradient(circle_at_85%_90%,rgba(198,153,61,0.13),transparent_34%)] blur-3xl"
        />

        {/* GLASS CARD */}
        <div className="relative overflow-hidden rounded-[1.6rem] border border-[#6C89A8]/40 bg-gradient-to-br from-[#173B63]/72 via-[#0B294A]/78 to-[#061A31]/84 p-7 shadow-[0_30px_70px_rgba(0,0,0,0.30)] backdrop-blur-xl sm:p-8 md:p-9 lg:p-10">

          {/* PANEL LIGHTING */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(115,161,208,0.13),transparent_37%),radial-gradient(circle_at_95%_8%,rgba(226,190,103,0.10),transparent_31%)]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[1px] rounded-[1.5rem] border border-white/[0.04]"
          />

          <div className="relative">

            {/* CAPABILITIES */}
            <div className="mb-9">
              <div className="mb-5 text-[9px] font-extrabold uppercase tracking-[0.20em] text-[#92A8C2]">
                Builder Capabilities
              </div>

              <div className="flex flex-wrap gap-2.5">
                {addresses.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-lg border border-[#7192B6]/45 bg-gradient-to-b from-[#183B62]/75 to-[#0A2441]/85 px-4 py-2.5 text-[12px] font-semibold text-[#EDF3FA] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:border-[#D0A44B]/55 hover:bg-[#16375B]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-[#567A9F]/35 to-transparent" />

            {/* OUTCOMES */}
            <div>
              <div className="mb-5 text-[9px] font-extrabold uppercase tracking-[0.20em] text-[#92A8C2]">
                Post-Build Outcomes
              </div>

              <ul className="space-y-4">
                {[
                  "ATS-Ready PDF Export",
                  "Role-Aligned Content",
                  "Professional Layouts",
                  "Intelligent Skill Suggestions",
                ].map((benefit) => (
                  <li
                    key={benefit}
                    className="group flex items-center gap-3.5"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C99A3E]/25 bg-[#C99A3E]/10 transition-all duration-300 group-hover:border-[#E1B95E]/45 group-hover:bg-[#C99A3E]/15">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#D6AD52]" />
                    </div>

                    <span className="text-[13px] font-semibold text-[#E1E8F1] sm:text-[14px]">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}
