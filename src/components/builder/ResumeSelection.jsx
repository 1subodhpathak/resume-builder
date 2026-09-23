import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Cpu,
  Maximize2,
  Minimize2,
  PenTool,
  PlayCircle,
  Sparkles,
  Target,
  UploadCloud,
  X,
} from 'lucide-react';

const resumeVideo = 'https://d7exlrhix3get.cloudfront.net/Resume.mp4';
const resumeJdVideo = 'https://d7exlrhix3get.cloudfront.net/Resume-JD.mp4';


/* =========================================================
   FEATURE ITEM
========================================================= */

const FeatureItem = ({ text }) => (
  <div className="flex items-start gap-2 text-[10.5px] font-medium leading-[1.55] text-[#5D7087]">
    <CheckCircle2
      size={13}
      className="mt-[2px] shrink-0 text-[#B5882E]"
    />
    <span>{text}</span>
  </div>
);


/* =========================================================
   TIER BADGE
========================================================= */

const TierBadge = ({ tier }) => {
  const styles = {
    free: 'border-[#345D88]/20 bg-[#EDF3F8] text-[#31577F]',
    premium: 'border-[#345D88]/20 bg-[#EDF3F8] text-[#31577F]',
    exclusive: 'border-[#C49A43]/35 bg-[#FFF8E9] text-[#94691F]',
  };

  const style = styles[tier?.toLowerCase()];
  if (!style) return null;

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.17em] ${style}`}
    >
      {tier}
    </span>
  );
};


/* =========================================================
   VIDEO MODAL
========================================================= */

const VideoModal = ({ src, onClose }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#03101F]/75 p-4 backdrop-blur-md sm:p-6">

      <div
        className={`flex flex-col overflow-hidden border border-white/10 bg-[#071426] shadow-[0_35px_100px_rgba(0,0,0,0.42)] transition-all duration-300 ${
          isMaximized
            ? 'h-full w-full rounded-[1.5rem]'
            : 'aspect-video w-full max-w-5xl rounded-[1.5rem]'
        }`}
      >
        {/* HEADER */}
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0A1E37] px-4 sm:px-5">

          <div className="flex items-center gap-2">
            <PlayCircle size={15} className="text-[#D6B158]" />

            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#B8C6D7]">
              CareerSense Demo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMaximized((current) => !current)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#A0B0C2] transition hover:bg-white/[0.06] hover:text-white"
              title={isMaximized ? 'Minimize video' : 'Maximize video'}
            >
              {isMaximized ? (
                <Minimize2 size={15} />
              ) : (
                <Maximize2 size={15} />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#A0B0C2] transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
              title="Close video"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* VIDEO */}
        <div className="relative min-h-0 flex-1 bg-black">
          <video
            src={src}
            controls
            autoPlay
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};


/* =========================================================
   SELECTION CARD
========================================================= */

const SelectionCard = ({
  index,
  title,
  subTitle,
  description,
  icon: Icon,
  onClick,
  badge,
  tier,
  features,
  onPlayVideo,
  bestFor,
  buttonLabel,
  estimatedUsage,
  featured = false,
  tourTarget,
}) => (
  <article
    data-help-tour={tourTarget}
    onClick={onClick}
    className={`
      group relative flex cursor-pointer flex-col overflow-hidden
      rounded-[1.35rem] border bg-white/78 p-4
      backdrop-blur-xl transition-all duration-300
      hover:-translate-y-1
      ${
        featured
          ? 'border-[#C59A43]/50 shadow-[0_20px_55px_rgba(128,92,24,0.11)] hover:shadow-[0_26px_65px_rgba(128,92,24,0.15)]'
          : 'border-[#D2DCE7] shadow-[0_15px_40px_rgba(6,23,44,0.065)] hover:border-[#7F9DBB]/45 hover:shadow-[0_22px_55px_rgba(6,23,44,0.11)]'
      }
    `}
  >
    {/* BACKGROUND DETAIL */}
    <div
      className={`pointer-events-none absolute inset-0 ${
        featured
          ? 'bg-[radial-gradient(circle_at_100%_0%,rgba(201,157,67,0.13),transparent_36%),linear-gradient(145deg,transparent_55%,rgba(255,248,229,0.60))]'
          : 'bg-[radial-gradient(circle_at_100%_0%,rgba(41,93,149,0.09),transparent_38%)]'
      }`}
    />

    {/* LARGE DECORATIVE ICON */}
    <Icon
      size={115}
      className="pointer-events-none absolute -right-7 -top-7 text-[#123B6D] opacity-[0.025] transition-all duration-500 group-hover:scale-105 group-hover:opacity-[0.045]"
    />

    <div className="relative z-10 flex h-full flex-col">

      {/* TOP */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">

          {/* NUMBER */}
          <div className="text-[9px] font-black tracking-[0.12em] text-[#9A7628]">
            0{index}
          </div>

          {/* ICON */}
          <div
            className={`
              flex h-10 w-10 items-center justify-center rounded-xl
              border shadow-sm transition-all
              ${
                featured
                  ? 'border-[#C79D45]/30 bg-gradient-to-b from-[#315981] via-[#16385F] to-[#071A31] text-[#E0BC65]'
                  : 'border-[#D3DEE8] bg-gradient-to-b from-[#F8FAFC] to-[#E8EEF5] text-[#214A75]'
              }
            `}
          >
            <Icon size={19} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {tier && <TierBadge tier={tier} />}

          {badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#173B63] to-[#071A31] px-2.5 py-1 text-[7.5px] font-black uppercase tracking-[0.15em] text-[#E1BD66]">
              <Sparkles size={8} />
              {badge}
            </span>
          )}
        </div>
      </div>


      {/* TITLE */}
      <div className="mb-3">
        <div className="mb-1 text-[8.5px] font-black uppercase tracking-[0.20em] text-[#8A9AAD]">
          {subTitle}
        </div>

        <h3 className="text-[1.08rem] font-black leading-tight tracking-[-0.025em] text-[#071A31]">
          {title}
        </h3>

        <p className="mt-2 min-h-[40px] text-[11.5px] font-medium leading-[1.6] text-[#5B6E85]">
          {description}
        </p>
      </div>


      {/* BEST FOR */}
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#DCE4EC] bg-[#F7F9FB]/75 px-3 py-2.5">
        <div>
          <div className="text-[7.5px] font-black uppercase tracking-[0.17em] text-[#8B9BAD]">
            Best For
          </div>

          <div className="mt-0.5 text-[10.5px] font-bold text-[#173A62]">
            {bestFor}
          </div>
        </div>

        {estimatedUsage ? (
          <div className="shrink-0 border-l border-[#DCE4EC] pl-3 text-right">
            <div className="text-[7.5px] font-black uppercase tracking-[0.14em] text-[#8B9BAD]">
              Estimated AI usage
            </div>
            <div className="mt-0.5 text-[10px] font-black text-[#9A7628]">
              {estimatedUsage}
            </div>
          </div>
        ) : null}
      </div>


      {/* VIDEO BUTTON / PLACEHOLDER */}
      <div className="mb-3 min-h-[34px]">
        {onPlayVideo ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPlayVideo();
            }}
            className="group/video inline-flex items-center gap-2 rounded-lg border border-[#C49A43]/30 bg-[#FFF9EC] px-3 py-2 text-[8.5px] font-black uppercase tracking-[0.14em] text-[#956A20] transition-all hover:border-[#B88931]/50 hover:bg-[#FFF4D8]"
          >
            <PlayCircle
              size={14}
              className="transition-transform group-hover/video:scale-110"
            />
            Watch Demo
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#91A0B1]">
            <CheckCircle2 size={12} className="text-[#B58B34]" />
            Start instantly
          </div>
        )}
      </div>


      {/* FEATURES */}
      <div className="mb-4 flex-1">
        <div className="mb-2.5 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-[#7E8FA3]">
          <Cpu size={11} className="text-[#A77A25]" />
          Included in this flow
        </div>

        <div className="rounded-xl border border-[#DFE6ED] bg-[#F7F9FB]/72 p-3">
          <div className="space-y-1.5">
            {features.map((feature) => (
              <FeatureItem key={feature} text={feature} />
            ))}
          </div>
        </div>
      </div>


      {/* CTA */}
      <button
        type="button"
        className={`
          flex min-h-[43px] w-full items-center justify-center gap-2
          rounded-[0.8rem] px-4 text-[9px] font-black uppercase
          tracking-[0.15em] text-white shadow-sm
          transition-all duration-300
          ${
            featured
              ? 'bg-gradient-to-b from-[#315B89] via-[#173A63] to-[#071A31] hover:shadow-[0_10px_26px_rgba(6,23,44,0.20)]'
              : 'bg-gradient-to-b from-[#294F7C] via-[#14365D] to-[#071A31] hover:shadow-[0_10px_26px_rgba(6,23,44,0.18)]'
          }
        `}
      >
        {buttonLabel || 'Choose path'}

        <ArrowRight
          size={13}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </div>
  </article>
);


/* =========================================================
   MAIN
========================================================= */

const SELECTION_HELP_STEPS = [
  { target: 'selection-overview', title: 'Choose your starting point', description: 'All three paths lead to the same resume builder. Choose based on how much content you already have and whether you are targeting a specific job.' },
  { target: 'selection-scratch', title: 'Build from scratch', description: 'Start with a blank resume and enter each section manually. This is best for a new resume or a complete rewrite.' },
  { target: 'selection-import', title: 'Import an existing resume', description: 'Upload your current resume, preserve its wording or optimize it with AI, then review every extracted section before choosing a template.' },
  { target: 'selection-targeted', title: 'Tailor for a specific role', description: 'Upload a resume and job description to improve keyword coverage, summaries, and experience bullets for that application. Use Watch Demo for a preview.' },
];

const ResumeSelection = ({ onSelect, helpRequest = 0 }) => {
  const [playingVideo, setPlayingVideo] = useState(null);
  const [helpTourStep, setHelpTourStep] = useState(null);
  const [helpTourPosition, setHelpTourPosition] = useState(null);
  const helpTourPanelRef = useRef(null);
  const helpTourDragRef = useRef({ offsetX: 0, offsetY: 0 });

  useEffect(() => {
    if (helpRequest > 0) setHelpTourStep(0);
  }, [helpRequest]);

  const closeHelpTour = useCallback(() => setHelpTourStep(null), []);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const step = SELECTION_HELP_STEPS[helpTourStep];
    let target = null;
    const timer = window.setTimeout(() => {
      target = document.querySelector(`[data-help-tour="${step.target}"]`);
      target?.classList.add('selection-help-target');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 80);
    return () => {
      window.clearTimeout(timer);
      target?.classList.remove('selection-help-target');
    };
  }, [helpTourStep]);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeHelpTour();
      if (event.key === 'ArrowRight') setHelpTourStep((step) => Math.min(SELECTION_HELP_STEPS.length - 1, step + 1));
      if (event.key === 'ArrowLeft') setHelpTourStep((step) => Math.max(0, step - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeHelpTour, helpTourStep]);

  const startTourDrag = useCallback((event) => {
    if (event.button !== 0 || event.target.closest('button')) return;
    const rect = helpTourPanelRef.current?.getBoundingClientRect();
    if (!rect) return;
    helpTourDragRef.current = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    setHelpTourPosition({ x: rect.left, y: rect.top, width: rect.width });
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.style.userSelect = 'none';
  }, []);

  const dragTour = useCallback((event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = helpTourPanelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gap = 12;
    const maxX = Math.max(gap, window.innerWidth - rect.width - gap);
    const maxY = Math.max(gap, window.innerHeight - rect.height - gap);
    setHelpTourPosition((current) => ({
      x: Math.min(maxX, Math.max(gap, event.clientX - helpTourDragRef.current.offsetX)),
      y: Math.min(maxY, Math.max(gap, event.clientY - helpTourDragRef.current.offsetY)),
      width: current?.width || rect.width,
    }));
  }, []);

  const endTourDrag = useCallback((event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => () => { document.body.style.userSelect = ''; }, []);

  return (
    <>
      <style>{`
        .selection-help-target {
          position: relative !important;
          z-index: 10001 !important;
          outline: 3px solid #D6B25E !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 8px rgba(214,178,94,.18), 0 0 0 9999px rgba(7,20,38,.58) !important;
          border-radius: 1rem;
        }
      `}</style>

      {helpTourStep !== null ? (
        <aside
          ref={helpTourPanelRef}
          role="dialog"
          aria-label="Resume starting options guided tour"
          className="fixed bottom-4 left-4 right-4 z-[10002] overflow-hidden rounded-[1rem] border border-[#D6B25E]/45 bg-[#071426] text-white shadow-[0_24px_70px_rgba(2,12,28,0.42)] sm:left-auto sm:right-6 sm:w-[390px]"
          style={helpTourPosition ? { left: helpTourPosition.x, top: helpTourPosition.y, right: 'auto', bottom: 'auto', width: helpTourPosition.width } : undefined}
        >
          <div
            onPointerDown={startTourDrag}
            onPointerMove={dragTour}
            onPointerUp={endTourDrag}
            onPointerCancel={endTourDrag}
            className="flex touch-none cursor-grab items-center justify-between border-b border-white/10 px-4 py-3 active:cursor-grabbing"
            title="Drag to move this help window"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid grid-cols-2 gap-0.5 text-white/35" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((dot) => <span key={dot} className="h-1 w-1 rounded-full bg-current" />)}
              </span>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E4C56F]">
                Start tour · {helpTourStep + 1} of {SELECTION_HELP_STEPS.length}
              </div>
            </div>
            <button type="button" onClick={closeHelpTour} aria-label="Close help tour" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="px-4 py-4">
            <h2 className="text-base font-extrabold">{SELECTION_HELP_STEPS[helpTourStep].title}</h2>
            <p className="mt-2 text-[13px] leading-5 text-white/70">{SELECTION_HELP_STEPS[helpTourStep].description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setHelpTourStep((step) => Math.max(0, step - 1))} disabled={helpTourStep === 0} className="h-9 rounded-lg border border-white/15 px-3 text-xs font-bold transition hover:bg-white/10 disabled:opacity-35">Back</button>
              <div className="flex gap-1.5" aria-hidden="true">
                {SELECTION_HELP_STEPS.map((step, index) => <span key={step.target} className={`h-1.5 rounded-full ${index === helpTourStep ? 'w-5 bg-[#D6B25E]' : 'w-1.5 bg-white/25'}`} />)}
              </div>
              <button type="button" onClick={() => helpTourStep === SELECTION_HELP_STEPS.length - 1 ? closeHelpTour() : setHelpTourStep((step) => step + 1)} className="h-9 rounded-lg bg-[#D6B25E] px-4 text-xs font-extrabold text-[#071426] hover:bg-[#E4C56F]">
                {helpTourStep === SELECTION_HELP_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </aside>
      ) : null}

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
        {/* =================================================
            BACKGROUND
        ================================================= */}
        <div className="pointer-events-none absolute inset-0">

          {/* BASE */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F8FAFC_46%,#ECF2F8_100%)]" />

          {/* GRID */}
          <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(#173A63_1px,transparent_1px),linear-gradient(90deg,#173A63_1px,transparent_1px)] bg-[size:38px_38px]" />

          {/* NAVY AMBIENCE */}
          <div className="absolute -left-[14%] -top-[38%] h-[600px] w-[600px] rounded-full bg-[#295D95]/10 blur-[130px]" />

          {/* GOLD AMBIENCE */}
          <div className="absolute -right-[12%] -top-[35%] h-[520px] w-[520px] rounded-full bg-[#C39A43]/10 blur-[130px]" />

          {/* CENTER LIGHT */}
          <div className="absolute left-1/2 top-[35%] h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-white/55 blur-[120px]" />

          {/* curved decorative line */}
          <div className="absolute left-[7%] top-[20%] h-[520px] w-[86%] rounded-[50%] border border-[#254E7A]/[0.045]" />
        </div>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1220px] flex-col justify-center">

          {/* HEADER */}
          <header data-help-tour="selection-overview" className="mx-auto mb-5 shrink-0 text-center lg:mb-6">

            {/* EYEBROW */}
            <div className="mb-2.5 inline-flex items-center gap-2">
              <Brain size={12} className="text-[#A77A25]" />

              <span className="bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[9px] font-black uppercase tracking-[0.22em] text-transparent">
                Choose Your Starting Point
              </span>
            </div>


            {/* HEADING */}
            <h1 className="text-[1.8rem] font-black leading-[1.05] tracking-[-0.045em] sm:text-[2.15rem] lg:text-[2.35rem]">
              <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
                Start Your Resume
              </span>{' '}

              <span className="bg-gradient-to-b from-[#E5C56D] via-[#B88931] to-[#89601C] bg-clip-text text-transparent">
                Your Way
              </span>
            </h1>


            {/* COPY */}
            <p className="mx-auto mt-2.5 max-w-[740px] text-[12.5px] font-medium leading-[1.65] text-[#61748B] sm:text-[13.5px] lg:whitespace-nowrap">
              Choose how you want to begin — all three paths lead into the same CareerSense builder.
            </p>
          </header>


          {/* =================================================
              CARDS
          ================================================= */}
          <div className="grid gap-4 pb-4 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:pb-0">

            <SelectionCard
              tourTarget="selection-scratch"
              index={1}
              title="Build from Scratch"
              subTitle="Manual Start"
              description="Begin with a blank resume and build every section with full control."
              icon={PenTool}
              tier="Free"
              bestFor="New resume or full rewrite"
              estimatedUsage="0 points to start"
              buttonLabel="Start from scratch"
              onClick={() => onSelect('scratch')}
              features={[
                'Guided section-by-section flow',
                'Live preview while editing',
                'Flexible section ordering',
                'Professional PDF export',
              ]}
            />

            <SelectionCard
              tourTarget="selection-import"
              index={2}
              title="Import Resume"
              subTitle="Exact or AI Assisted"
              description="Upload your current resume and choose between exact import or AI-assisted improvement."
              icon={UploadCloud}
              tier="Premium"
              bestFor="Refreshing an existing resume"
              estimatedUsage="~6,000–24,000 points"
              buttonLabel="Import resume"
              onPlayVideo={() => setPlayingVideo(resumeVideo)}
              onClick={() => onSelect('upload')}
              features={[
                'Preserve original content',
                'Optional AI optimization',
                'Editable imported sections',
                'Continue directly to templates',
              ]}
            />

            <SelectionCard
              tourTarget="selection-targeted"
              index={3}
              title="Targeted Resume"
              subTitle="Resume + Job Description"
              description="Align your resume with a specific role using your existing resume and target job description."
              icon={Target}
              tier="Exclusive"

              featured
              bestFor="Applying to a specific role"
              estimatedUsage="~20,000–35,000 points"
              buttonLabel="Tailor for a job"
              onPlayVideo={() => setPlayingVideo(resumeJdVideo)}
              onClick={() => onSelect('tailor')}
              features={[
                'Resume and JD comparison',
                'Keyword coverage analysis',
                'Role-aligned summaries and bullets',
                'Targeted final resume',
              ]}
            />
          </div>


          {/* FOOT NOTE */}
          <div className="mt-4 hidden shrink-0 items-center justify-center gap-2 text-[9px] font-semibold text-[#8998A9] lg:flex">
            <CheckCircle2 size={12} className="text-[#B78B32]" />
            You can change templates and continue editing after choosing any path.
          </div>
        </div>
      </main>

      <VideoModal
        src={playingVideo}
        onClose={() => setPlayingVideo(null)}
      />
    </>
  );
};

export default ResumeSelection;
