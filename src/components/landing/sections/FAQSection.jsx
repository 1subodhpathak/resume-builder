import { FAQ_DATA } from '../data/landingData.jsx';

export default function FAQSection() {
  return (
<section
  id="faq"
  className="relative overflow-hidden border-b border-[#D8E0EA] bg-[#F8F7F3] px-4 py-14 sm:px-6 sm:py-16 lg:py-20 scroll-mt-28"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F7F9FC_48%,#EEF3F8_100%)]" />

    <div className="absolute inset-0 opacity-[0.022] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:42px_42px]" />

    <div className="absolute -left-[12%] -top-[38%] h-[520px] w-[520px] rounded-full bg-[#295D95]/9 blur-[130px]" />

    <div className="absolute -bottom-[45%] right-[5%] h-[460px] w-[460px] rounded-full bg-[#B98A32]/7 blur-[130px]" />
  </div>

  <div className="relative z-10 mx-auto grid max-w-[1350px] items-start gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">

    {/* LEFT CONTENT */}
    <div className="max-w-[500px] lg:sticky lg:top-32">
      {/* EYEBROW */}
      <div className="mb-3 bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[10px] font-black uppercase tracking-[0.22em] text-transparent">
        Knowledge Base
      </div>

      {/* HEADING */}
      <h2 className="mb-5 text-[1.9rem] font-black leading-[1.06] tracking-[-0.04em] sm:text-[2.15rem] lg:text-[2.4rem]">
        <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
          Clear Answers for
        </span>

        <br />

        <span className="bg-gradient-to-b from-[#E7C86E] via-[#BA8B32] to-[#88601B] bg-clip-text text-transparent">
          Every Step
        </span>
      </h2>

      {/* COPY */}
      <p className="max-w-[470px] text-[14px] font-medium leading-[1.75] text-[#53657E] sm:text-[15px]">
        Find answers about resume workflows, AI suggestions, ATS scoring,
        job-description tailoring, importing, editing, and professional PDF
        export.
      </p>

      {/* SMALL SUPPORT NOTE */}
      <div className="mt-6 flex max-w-[430px] items-start gap-3 border-t border-[#D7E0EA] pt-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#28517F] via-[#14375F] to-[#071A31] text-[#DDBA65] shadow-sm">
          ?
        </div>

        <div>
          <div className="text-[11px] font-extrabold text-[#173A62]">
            Still have a question?
          </div>

          <p className="mt-1 text-[10px] leading-5 text-[#75879D]">
            Most workflow questions are answered below. Expand any item to see
            the details.
          </p>
        </div>
      </div>
    </div>

    {/* FAQ PANEL */}
    <div className="relative">
      {/* subtle panel glow */}
      <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_20%_10%,rgba(41,93,149,0.12),transparent_42%),radial-gradient(circle_at_85%_90%,rgba(185,138,50,0.09),transparent_38%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#CBD7E3] bg-white/80 shadow-[0_22px_60px_rgba(6,23,44,0.10)] backdrop-blur-xl">
        {/* CARD TOP BAR */}
        <div className="flex items-center justify-between border-b border-[#DEE5ED] bg-white/65 px-5 py-3.5 backdrop-blur-xl">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#667A92]">
            Frequently Asked Questions
          </div>

          <div className="rounded-full border border-[#C99E47]/30 bg-[#FBF5E7] px-3 py-1 text-[8px] font-black uppercase tracking-[0.13em] text-[#926820]">
            {FAQ_DATA.length} Answers
          </div>
        </div>

        {/* FAQ LIST */}
        <div className="max-h-[500px] overflow-y-auto px-5 custom-scrollbar sm:px-6">
          {FAQ_DATA.map((faq, i) => (
            <details
              key={i}
              className="group border-b border-[#E2E8EF] last:border-b-0"
            >
              <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-5 py-4 text-left outline-none">
                {/* QUESTION */}
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-[2px] text-[9px] font-black tracking-[0.08em] text-[#B18732]">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="text-[13px] font-extrabold leading-[1.45] text-[#173A62] transition-colors duration-300 group-hover:text-[#9A7628] sm:text-[14px]">
                    {faq.q}
                  </span>
                </div>

                {/* ARROW */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D4DEE8] bg-[#F7F9FB] text-[10px] text-[#687B92] transition-all duration-300 group-hover:border-[#C49A43]/50 group-hover:bg-[#FBF5E8] group-hover:text-[#9A7628] group-open:rotate-180 group-open:border-[#C49A43]/50 group-open:bg-[#FBF5E8] group-open:text-[#9A7628]">
                  ▼
                </span>
              </summary>

              {/* ANSWER */}
              <div className="pb-5 pl-8 pr-12">
                <div className="rounded-xl border border-[#E0E7EE] bg-[#F7F9FB]/80 p-4 text-[12px] font-medium leading-[1.75] text-[#65778E] sm:text-[13px]">
                  {faq.a}
                </div>
              </div>
            </details>
          ))}
        </div>

        {/* BOTTOM FADE */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/85 to-transparent" />
      </div>
    </div>
  </div>
</section>
  );
}
