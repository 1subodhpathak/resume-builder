import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';


/* =========================================================
   OPTION CARD
========================================================= */

const OptionCard = ({
  title,
  subtitle,
  description,
  icon: Icon,
  features,
  onClick,
  buttonLabel,
  summary,
  estimatedUsage,
  featured = false,
  number,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      group relative flex h-full flex-col overflow-hidden
      rounded-[1.4rem] border bg-white/78 p-4 text-left
      shadow-[0_16px_45px_rgba(6,23,44,0.07)]
      backdrop-blur-xl transition-all duration-300
      hover:-translate-y-1
      ${
        featured
          ? 'border-[#C49A43]/50 hover:border-[#B88931]/70 hover:shadow-[0_24px_60px_rgba(128,92,24,0.13)]'
          : 'border-[#D2DCE7] hover:border-[#7898B9]/45 hover:shadow-[0_24px_60px_rgba(6,23,44,0.11)]'
      }
    `}
  >
    {/* BACKGROUND DETAIL */}
    <div
      className={`pointer-events-none absolute inset-0 ${
        featured
          ? 'bg-[radial-gradient(circle_at_100%_0%,rgba(197,154,67,0.14),transparent_36%),linear-gradient(145deg,transparent_58%,rgba(255,248,229,0.55))]'
          : 'bg-[radial-gradient(circle_at_100%_0%,rgba(41,93,149,0.10),transparent_40%)]'
      }`}
    />

    {/* LARGE DECORATIVE ICON */}
    <Icon
      size={130}
      className="pointer-events-none absolute -right-8 -top-8 text-[#153A62] opacity-[0.025] transition-all duration-500 group-hover:scale-105 group-hover:opacity-[0.045]"
    />

    <div className="relative z-10 flex h-full flex-col">
      {/* TOP */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* NUMBER */}
          <div className="text-[9px] font-black tracking-[0.12em] text-[#9A7628]">
            {number}
          </div>

          {/* ICON */}
          <div
            className={`
              flex h-11 w-11 items-center justify-center rounded-xl border
              shadow-sm transition-all duration-300
              ${
                featured
                  ? 'border-[#C49A43]/30 bg-gradient-to-b from-[#315A86] via-[#173A63] to-[#071A31] text-[#E1BD66]'
                  : 'border-[#D4DEE8] bg-gradient-to-b from-white to-[#E8EEF5] text-[#214B76]'
              }
            `}
          >
            <Icon size={20} />
          </div>
        </div>

        {/* TYPE BADGE */}
        <span
          className={`
            rounded-full border px-3 py-1 text-[7.5px] font-black
            uppercase tracking-[0.15em]
            ${
              featured
                ? 'border-[#C49A43]/35 bg-[#FFF8E9] text-[#94691F]'
                : 'border-[#345D88]/20 bg-[#EDF3F8] text-[#31577F]'
            }
          `}
        >
          {subtitle}
        </span>
      </div>


      {/* TITLE */}
      <div className="mb-4">
        <h2 className="text-[1.2rem] font-black leading-tight tracking-[-0.025em] text-[#071A31]">
          {title}
        </h2>

        <p className="mt-2 min-h-[44px] max-w-[500px] text-[11.5px] font-medium leading-[1.65] text-[#5E7188]">
          {description}
        </p>
      </div>


      {/* RESULT */}
      {summary && (
        <div className="mb-4 rounded-xl border border-[#DDE5ED] bg-[#F7F9FB]/75 px-3.5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[7.5px] font-black uppercase tracking-[0.17em] text-[#8A9AAD]">
                Best Result
              </div>

              <div className="mt-1 text-[10.5px] font-extrabold text-[#173A62]">
                {summary}
              </div>
            </div>

            {estimatedUsage ? (
              <div className="shrink-0 border-l border-[#DDE5ED] pl-4 text-right">
                <div className="text-[7.5px] font-black uppercase tracking-[0.14em] text-[#8A9AAD]">
                  Estimated usage
                </div>
                <div className="mt-1 text-[10px] font-black text-[#9A7628]">
                  {estimatedUsage}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}


      {/* FEATURES */}
      <div className="mb-5 flex-1">
        <div className="mb-2.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#8192A5]">
          What happens next
        </div>

        <div className="space-y-2">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-2 text-[10.5px] font-medium leading-[1.5] text-[#64768B]"
            >
              <CheckCircle2
                size={13}
                className="mt-[2px] shrink-0 text-[#B5882E]"
              />

              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>


      {/* CTA */}
      <div
        className={`
          flex min-h-[44px] w-full items-center justify-center gap-2
          rounded-[0.82rem] px-4 text-[9px] font-black uppercase
          tracking-[0.15em] text-white shadow-sm
          transition-all duration-300
          ${
            featured
              ? 'bg-gradient-to-b from-[#315B89] via-[#173A63] to-[#071A31]'
              : 'bg-gradient-to-b from-[#294F7C] via-[#14365D] to-[#071A31]'
          }
        `}
      >
        {buttonLabel || 'Choose import'}

        <ArrowRight
          size={13}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </div>
  </button>
);


/* =========================================================
   MAIN COMPONENT
========================================================= */

const ResumeImportOptions = ({
  file,
  onBack,
  onSelectOption,
}) => {
  const fileName = file?.name || 'Uploaded Resume';

  const sourceLabel = file?.repositoryUploadId
    ? 'Saved Resume'
    : 'Selected File';


  return (
    <main
      className="
        relative min-h-[calc(100dvh-64px)] overflow-y-auto
        bg-[#F8F7F3] px-4 py-6 font-sans text-[#071426]
        selection:bg-[#C89B3C]/20
        sm:px-6 sm:py-7
        lg:h-[calc(100dvh-64px)]
        lg:min-h-[650px]
        lg:overflow-hidden
      "
    >
      {/* ===================================================
          BACKGROUND
      =================================================== */}
      <div className="pointer-events-none absolute inset-0">

        {/* base */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F8FAFC_47%,#ECF2F8_100%)]" />

        {/* grid */}
        <div className="absolute inset-0 opacity-[0.024] bg-[linear-gradient(#173A63_1px,transparent_1px),linear-gradient(90deg,#173A63_1px,transparent_1px)] bg-[size:38px_38px]" />

        {/* blue ambience */}
        <div className="absolute -left-[14%] -top-[40%] h-[600px] w-[600px] rounded-full bg-[#295D95]/10 blur-[135px]" />

        {/* gold ambience */}
        <div className="absolute -right-[12%] -top-[38%] h-[520px] w-[520px] rounded-full bg-[#C39A43]/10 blur-[130px]" />

        {/* center light */}
        <div className="absolute left-1/2 top-[35%] h-[390px] w-[800px] -translate-x-1/2 rounded-full bg-white/55 blur-[120px]" />

        {/* subtle decorative arc */}
        <div className="absolute left-[8%] top-[16%] h-[540px] w-[84%] rounded-[50%] border border-[#254E7A]/[0.045]" />
      </div>


      {/* ===================================================
          CONTENT
      =================================================== */}
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1120px] flex-col justify-center">

        {/* BACK */}
        <button
          type="button"
          onClick={onBack}
          className="
            mb-5 inline-flex w-fit items-center gap-2
            text-[9px] font-black uppercase tracking-[0.18em]
            text-[#718398] transition-colors
            hover:text-[#173A62]
          "
        >
          <ArrowLeft size={13} />
          Back to Upload
        </button>


        {/* =================================================
            HEADER
        ================================================= */}
        <header className="mx-auto mb-5 max-w-[760px] text-center">

          {/* EYEBROW */}
          <div className="mb-2.5 inline-flex items-center gap-2">
            <Sparkles size={12} className="text-[#A77A25]" />

            <span className="bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[9px] font-black uppercase tracking-[0.22em] text-transparent">
              Choose Import Style
            </span>
          </div>


          {/* HEADING */}
          <h1 className="text-[1.85rem] font-black leading-[1.05] tracking-[-0.045em] sm:text-[2.2rem] lg:text-[2.4rem]">
            <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
              How Should We Open
            </span>{' '}

            <span className="bg-gradient-to-b from-[#E5C56D] via-[#B88931] to-[#89601C] bg-clip-text text-transparent">
              Your Resume?
            </span>
          </h1>


          {/* COPY */}
          <p className="mx-auto mt-3 max-w-[680px] text-[12.5px] font-medium leading-[1.65] text-[#61748B] sm:text-[13.5px]">
            Keep your existing wording exactly as it is, or let CareerSense AI
            create a stronger starting draft. You can edit everything afterward.
          </p>
        </header>


        {/* =================================================
            FILE SUMMARY
        ================================================= */}
        <div
          className="
            mb-5 flex flex-col gap-3 rounded-[1rem]
            border border-[#D5DFE9] bg-white/68 px-4 py-3
            shadow-[0_8px_24px_rgba(6,23,44,0.045)]
            backdrop-blur-md
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <div className="flex min-w-0 items-center gap-3">

            {/* FILE ICON */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#29517F] via-[#15375F] to-[#071A31] text-[#DDBA65] shadow-sm">
              <FileText size={15} />
            </div>

            <div className="min-w-0">
              <div className="text-[7.5px] font-black uppercase tracking-[0.17em] text-[#8999AA]">
                {sourceLabel}
              </div>

              <div className="mt-0.5 max-w-[480px] truncate text-[11px] font-extrabold text-[#173A62] sm:text-[12px]">
                {fileName}
              </div>
            </div>
          </div>


          <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#8293A6]">
            <ShieldCheck size={12} className="text-[#A77924]" />
            Both options remain fully editable
          </div>
        </div>


        {/* =================================================
            IMPORT OPTIONS
        ================================================= */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* EXACT */}
          <OptionCard
            number="01"
            title="Exact Import"
            subtitle="Keep My Wording"
            description="CareerSense maps your uploaded resume into editable sections while preserving your original content as closely as possible."
            icon={FileText}
            summary="Ideal when your resume wording is already final."
            estimatedUsage="~6,000–12,000 points"
            features={[
              'No AI rewriting',
              'Preserves existing content',
              'Refresh your layout and template',
              'Every field remains editable',
            ]}
            buttonLabel="Use Exact Import"
            onClick={() => onSelectOption('verbatim')}
          />


          {/* AI */}
          <OptionCard
            number="02"
            title="AI Optimized Import"
            subtitle="Improve My Draft"
            description="CareerSense extracts your resume information and improves summaries, bullets, and positioning before opening the builder."
            icon={Brain}
            summary="Ideal when you want a stronger starting draft quickly."
            estimatedUsage="~14,000–24,000 points"
            featured
            features={[
              'AI-enhanced professional summary',
              'Stronger experience bullets',
              'Improved clarity and positioning',
              'Every AI suggestion remains editable',
            ]}
            buttonLabel="Use AI Optimized Import"
            onClick={() => onSelectOption('ai-enhanced')}
          />
        </div>


        {/* =================================================
            FOOT NOTE
        ================================================= */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-medium text-[#8494A6]">
          <ShieldCheck size={12} className="text-[#B58A32]" />

          Both paths continue to the same CareerSense review and editing
          workspace.
        </div>
      </div>
    </main>
  );
};

export default ResumeImportOptions;
