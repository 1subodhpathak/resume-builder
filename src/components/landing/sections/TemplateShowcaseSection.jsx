import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import ResumeThumbnail from '../../resume/ResumeThumbnail';
import { TEMPLATES } from '../../../data/templateCatalog';
import { getTemplateRecommendations } from '../../../utils/resumeInsights';
import { LIVE_TEMPLATE_COUNT, PREVIEW_DATA, SCROLLER_TEMPLATES } from '../data/landingData.jsx';

export default function TemplateShowcaseSection({
  onViewTemplates,
  onUseTemplate,
  scroll,
  scrollRef,
}) {
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const minimizeButtonRef = useRef(null);

  useEffect(() => {
    if (!previewTemplate || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPreviewTemplate(null);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => minimizeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewTemplate]);

  const closePreview = () => setPreviewTemplate(null);

  const usePreviewTemplate = () => {
    if (!previewTemplate) return;
    onUseTemplate?.(previewTemplate.id);
    setPreviewTemplate(null);
  };

  const templateProfile = previewTemplate
    ? TEMPLATES.find((template) => template.id === previewTemplate.id)
    : null;

  const templateRecommendation = templateProfile
    ? getTemplateRecommendations(PREVIEW_DATA, [templateProfile], 'scratch', '')[0]
    : null;

  const estimatedAtsScore = templateRecommendation
    ? Math.min(
        98,
        (templateRecommendation.atsSafety === 'high' ? 68 : 48) +
          (String(templateRecommendation.columns) === '1' ? 14 : 5) +
          (String(templateRecommendation.graphics).toLowerCase() === 'low' ? 10 : 2) +
          (!templateRecommendation.hasHeadshot ? 6 : 0)
      )
    : 0;

  const contentFitScore = templateRecommendation
    ? Math.min(
        98,
        Math.max(55, 62 + Number(templateRecommendation.breakdown?.contentFit || 0))
      )
    : 0;

  const layoutLabel = String(templateProfile?.columns) === '1'
    ? 'Single column'
    : 'Two columns';

  const styleLabel = templateProfile
    ? `${String(templateProfile.graphics).toLowerCase() === 'low' ? 'Minimal' : 'Visual'}${
        templateProfile.hasHeadshot ? ' · Photo' : ' · Text first'
      }`
    : previewTemplate?.style;

  return (
<>
<section
  id="templates"
  className="
    landing-section
    landing-section--surface
    relative
    overflow-hidden
    border-b
    border-[#DCE4EC]
    py-12
    sm:py-14
    lg:py-16
    scroll-mt-28
  "
>
  {/* BACKGROUND DECORATION */}
  <div className="pointer-events-none absolute inset-0">

    {/* soft blue glow */}
    <div
      className="
        absolute
        -right-[12%]
        -top-[40%]
        h-[600px]
        w-[600px]
        rounded-full
        bg-[#123B6D]/[0.07]
        blur-[120px]
      "
    />

    {/* soft gold glow */}
    <div
      className="
        absolute
        -left-[12%]
        bottom-[-45%]
        h-[520px]
        w-[520px]
        rounded-full
        bg-[#B9964A]/[0.06]
        blur-[130px]
      "
    />

    {/* subtle grid */}
    <div
      className="
        absolute
        inset-0
        opacity-[0.022]
        bg-[linear-gradient(#15375D_1px,transparent_1px),linear-gradient(90deg,#15375D_1px,transparent_1px)]
        bg-[size:38px_38px]
      "
    />
  </div>

  <div className="relative z-10 mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">

    {/* HEADER */}
    <div
      className="
        mb-7
        flex
        flex-col
        gap-5
        sm:mb-9
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      <div className="max-w-[720px]">

        {/* EYEBROW */}
        <div
          className="
            mb-2.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.20em]
            text-[#A87922]
          "
        >
          Professional Resume Library
        </div>

        {/* TITLE */}
        <h2
          className="
            mb-4
            text-[1.75rem]
            font-black
            leading-[1.08]
            tracking-[-0.035em]
            sm:text-[2.1rem]
            lg:text-[2.4rem]
          "
        >
          <span
            className="
              bg-gradient-to-b
              from-[#2B507F]
              via-[#13345B]
              to-[#06172C]
              bg-clip-text
              text-transparent
            "
          >
            Choose from our
          </span>

          {' '}

          <span
            className="
              bg-gradient-to-b
              from-[#E6C66E]
              via-[#B88931]
              to-[#89601C]
              bg-clip-text
              text-transparent
            "
          >
            {LIVE_TEMPLATE_COUNT} Professional Templates
          </span>
        </h2>

        {/* COPY */}
        <p
          className="
            max-w-[660px]
            text-[14px]
            font-medium
            leading-[1.75]
            text-[#53657E]
            sm:text-[15px]
          "
        >
          Explore recruiter-friendly, executive, modern, data, creative,
          and specialist layouts, then switch styles without rebuilding the
          resume itself.
        </p>
      </div>

      {/* SCROLLER CONTROLS */}
      <div className="flex shrink-0 gap-2.5">

        <button
          type="button"
          aria-label="Previous templates"
          onClick={() => scroll('left', scrollRef)}
          className="
            group
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-[0.72rem]
            border
            border-[#D6E0EA]
            bg-white
            text-[#52677F]
            shadow-[0_4px_14px_rgba(15,43,75,0.05)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:border-[#C49A43]/55
            hover:bg-[#FFF9EC]
            hover:text-[#A87922]
            active:scale-95
          "
        >
          <ChevronLeft
            size={18}
            className="transition-transform group-hover:-translate-x-0.5"
          />
        </button>

        <button
          type="button"
          aria-label="Next templates"
          onClick={() => scroll('right', scrollRef)}
          className="
            group
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-[0.72rem]
            border
            border-[#D6E0EA]
            bg-white
            text-[#52677F]
            shadow-[0_4px_14px_rgba(15,43,75,0.05)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:border-[#C49A43]/55
            hover:bg-[#FFF9EC]
            hover:text-[#A87922]
            active:scale-95
          "
        >
          <ChevronRight
            size={18}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>

    {/* TEMPLATE SCROLLER */}
    <div
      ref={scrollRef}
      className="
        hide-scrollbar
        flex
        snap-x
        snap-mandatory
        gap-5
        overflow-x-auto
        pb-6
        sm:gap-6
      "
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {SCROLLER_TEMPLATES.map((tpl) => (
        <button
          type="button"
          key={tpl.id}
          onClick={() => setPreviewTemplate(tpl)}
          aria-label={`Enlarge ${tpl.name}`}
          className="
            group
            w-[218px]
            shrink-0
            cursor-pointer
            snap-center
            sm:w-[238px]
            lg:w-[250px]
            xl:w-[260px]
            text-left
          "
        >
          {/* TEMPLATE OUTER CARD */}
          <div
            className="
              relative
              rounded-[1rem]
              border
              border-[#DCE4EC]
              bg-white
              p-[5px]
              shadow-[0_8px_24px_rgba(15,43,75,0.07)]
              transition-all
              duration-300
              group-hover:-translate-y-1.5
              group-hover:border-[#C49A43]/55
              group-hover:shadow-[0_18px_40px_rgba(15,43,75,0.13)]
            "
          >
            {/* top highlight */}
            <span
              className="
                pointer-events-none
                absolute
                inset-x-5
                top-0
                z-20
                h-[2px]
                bg-gradient-to-r
                from-transparent
                via-[#C89F47]/70
                to-transparent
              "
            />

            {/* TEMPLATE PREVIEW */}
            <div
              className="
                relative
                aspect-[210/297]
                overflow-hidden
                rounded-[0.78rem]
                bg-white
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  h-[308%]
                  w-[308%]
                  origin-top-left
                  scale-[0.325]
                  select-none
                  bg-white
                "
              >
                <ResumeThumbnail
                  templateId={tpl.id}
                  data={PREVIEW_DATA}
                />
              </div>

              {/* HOVER OVERLAY */}
              <div
                className="
                  absolute
                  inset-0
                  z-10
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  bg-[linear-gradient(180deg,rgba(7,20,38,0.12)_0%,rgba(7,20,38,0.80)_100%)]
                  opacity-0
                  transition-all
                  duration-300
                  group-hover:opacity-100
                "
              >
                {/* GOLD LINE */}
                <div
                  className="
                    h-px
                    w-10
                    bg-gradient-to-r
                    from-transparent
                    via-[#D8B35C]
                    to-transparent
                  "
                />

                <span
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-white
                  "
                >
                  View Details
                </span>

                {/* CTA CIRCLE */}
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#D6B25E]/40
                    bg-[#D6B25E]
                    text-[#071426]
                    shadow-[0_8px_20px_rgba(0,0,0,0.20)]
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                >
                  <ArrowRight className="h-[16px] w-[16px]" />
                </div>
              </div>
            </div>
          </div>

          {/* TEMPLATE NAME */}
          <div className="mt-3 min-h-[48px] text-center">
            <h3
              className="
                text-[12px]
                font-black
                leading-[1.25]
                tracking-[-0.01em]
                text-[#173A62]
                transition-colors
                duration-300
                group-hover:text-[#A87922]
              "
            >
              {tpl.name}
            </h3>

            <p className="mt-1 text-[9px] font-semibold leading-4 text-[#7A8CA0]">
              {tpl.style}
            </p>

            {/* tiny indicator */}
            <div
              className="
                mx-auto
                mt-2
                h-[2px]
                w-0
                rounded-full
                bg-gradient-to-r
                from-[#123963]
                to-[#C59B42]
                transition-all
                duration-300
                group-hover:w-8
              "
            />
          </div>
        </button>
      ))}
    </div>

    {/* BOTTOM CTA */}
    <div className="mt-2 flex justify-center">
      <button
        type="button"
        onClick={onViewTemplates}
        className="
          group
          inline-flex
          min-h-[44px]
          items-center
          justify-center
          gap-2.5
          rounded-[0.75rem]
          border
          border-[#123B6D]
          bg-[#123B6D]
          px-6
          py-2.5
          text-[12px]
          font-extrabold
          text-white
          shadow-[0_7px_18px_rgba(18,59,109,0.14)]
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:bg-[#0D315D]
          hover:shadow-[0_10px_24px_rgba(18,59,109,0.18)]
        "
      >
        Explore All Templates

        <ArrowRight
          className="
            h-4
            w-4
            text-[#E5C36D]
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </button>
    </div>
  </div>
</section>

  {previewTemplate && typeof document !== 'undefined'
    ? createPortal(
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071426]/82 p-3 backdrop-blur-sm sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePreview();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-preview-title"
            className="flex max-h-[94vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[1.1rem] border border-white/15 bg-[#F6F8FA] shadow-[0_30px_90px_rgba(0,0,0,0.38)] lg:grid lg:grid-cols-[minmax(0,1fr)_300px]"
          >
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#E8EDF2] p-4 sm:p-7 lg:p-9">
              <div className="relative aspect-[210/297] h-[min(72vh,850px)] max-h-full overflow-hidden bg-white shadow-[0_18px_55px_rgba(7,20,38,0.22)] ring-1 ring-[#C8D3DE]">
                <div className="pointer-events-none absolute inset-0 h-[308%] w-[308%] origin-top-left scale-[0.325] select-none bg-white">
                  <ResumeThumbnail
                    templateId={previewTemplate.id}
                    data={PREVIEW_DATA}
                  />
                </div>
              </div>
            </div>

            <aside className="flex min-h-0 shrink-0 flex-col overflow-y-auto border-t border-[#D7E0E8] bg-white p-5 sm:p-6 lg:border-l lg:border-t-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A87922]">
                    Template Preview
                  </div>
                  <h3
                    id="template-preview-title"
                    className="mt-2 text-xl font-black tracking-[-0.025em] text-[#173A62]"
                  >
                    {previewTemplate.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-[#6B7E92]">
                    {previewTemplate.style}
                  </p>
                </div>

                <button
                  ref={minimizeButtonRef}
                  type="button"
                  onClick={closePreview}
                  aria-label="Minimize template preview"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.7rem] border border-[#D7E0E8] text-[#52677F] transition hover:border-[#C49A43]/55 hover:bg-[#FFF8E8] hover:text-[#9A7628] focus:outline-none focus:ring-4 focus:ring-[#123B6D]/15"
                >
                  <Minimize2 size={18} />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-[0.72rem] bg-[#F2F6FA] px-3 py-2.5 text-[11px] font-semibold text-[#61758B]">
                <Maximize2 size={15} className="text-[#A87922]" />
                Enlarged A4 preview
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <div className="rounded-[0.75rem] border border-[#DCE5EC] bg-[#F8FAFC] p-3">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-[#71849A]">
                    <ShieldCheck size={14} className="text-[#A87922]" />
                    ATS Score
                  </div>
                  <div className="mt-2 flex items-end gap-1 text-[#173A62]">
                    <span className="text-xl font-black leading-none">{estimatedAtsScore}</span>
                    <span className="text-[10px] font-bold text-[#8090A2]">/100</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E3E9EF]">
                    <div
                      className="h-full rounded-full bg-[#B9964A]"
                      style={{ width: `${estimatedAtsScore}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[0.75rem] border border-[#DCE5EC] bg-[#F8FAFC] p-3">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-[#71849A]">
                    <FileText size={14} className="text-[#A87922]" />
                    Content Fit
                  </div>
                  <div className="mt-2 flex items-end gap-1 text-[#173A62]">
                    <span className="text-xl font-black leading-none">{contentFitScore}</span>
                    <span className="text-[10px] font-bold text-[#8090A2]">%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E3E9EF]">
                    <div
                      className="h-full rounded-full bg-[#123B6D]"
                      style={{ width: `${contentFitScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <dl className="mt-3 divide-y divide-[#E5EBF0] rounded-[0.75rem] border border-[#DCE5EC] bg-white px-3.5">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2 text-[10px] font-bold text-[#71849A]">
                    <LayoutGrid size={14} className="text-[#A87922]" />
                    Layout
                  </dt>
                  <dd className="text-right text-[11px] font-black text-[#173A62]">
                    {layoutLabel}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2 text-[10px] font-bold text-[#71849A]">
                    <Maximize2 size={14} className="text-[#A87922]" />
                    Style
                  </dt>
                  <dd className="text-right text-[11px] font-black text-[#173A62]">
                    {styleLabel}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2 text-[10px] font-bold text-[#71849A]">
                    <Palette size={14} className="text-[#A87922]" />
                    Accent color
                  </dt>
                  <dd className="flex items-center gap-2 text-[10px] font-black uppercase text-[#173A62]">
                    <span
                      className="h-4 w-4 rounded-full border border-[#CBD5DF] shadow-sm"
                      style={{ backgroundColor: templateProfile?.color || '#123B6D' }}
                    />
                    {templateProfile?.color || '#123B6D'}
                  </dd>
                </div>
              </dl>

              <p className="mt-2 text-[9px] font-medium leading-4 text-[#8A99A9]">
                Scores are estimates based on layout structure and the sample resume shown.
              </p>

              <div className="mt-auto grid gap-3 pt-6">
                <button
                  type="button"
                  onClick={usePreviewTemplate}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[0.78rem] bg-[#123B6D] px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(18,59,109,0.22)] transition hover:bg-[#0D315D] focus:outline-none focus:ring-4 focus:ring-[#123B6D]/20"
                >
                  Use Template
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={closePreview}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[0.78rem] border border-[#D7E0E8] bg-white px-5 text-sm font-bold text-[#52677F] transition hover:border-[#C49A43]/55 hover:bg-[#FFF9EC] hover:text-[#94691F] focus:outline-none focus:ring-4 focus:ring-[#123B6D]/15"
                >
                  <Minimize2 size={16} />
                  Minimize
                </button>

                <button
                  type="button"
                  onClick={onViewTemplates}
                  className="py-1 text-xs font-bold text-[#71849A] transition hover:text-[#173A62]"
                >
                  Browse all templates
                </button>
              </div>
            </aside>
          </div>
        </div>,
        document.body
      )
    : null}
</>
  );
}
