import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Cpu,
  FileText,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Zap,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react';
import BuilderNavbar from './BuilderNavbar';
import { getResumeInsights } from '../../utils/resumeInsights';

const STEPS = [
  { id: 'personal', label: 'Header', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Cpu },
  { id: 'projects', label: 'Projects', icon: Layers },
  { id: 'summary', label: 'Summary', icon: FileText },
];

const REVIEW_HELP_STEPS = [
  {
    target: 'review-readiness',
    title: 'Check resume readiness',
    description: 'This score reflects how complete the imported resume is. Review every section even when the score is high to catch extraction mistakes.',
  },
  {
    target: 'review-sections',
    title: 'Move between sections',
    description: 'Open Header, Experience, Education, Skills, Projects, and Summary in any order. The active section is clearly marked.',
  },
  {
    target: 'review-overview',
    title: 'Verify what was captured',
    description: 'These totals give you a quick check of the roles, skills, summary, projects, and other details found during import.',
  },
  {
    target: 'review-form',
    title: 'Correct the extracted data',
    description: 'Edit any field that is incomplete or incorrect. You can also add or remove experience, education, and project entries.',
  },
  {
    target: 'review-navigation',
    title: 'Complete the review',
    description: 'Use Previous and Next to review each section. On the final section, continue to templates or open the builder.',
  },
];

const SidebarItem = ({ step, index, activeIndex, onClick }) => {
  const isActive = index === activeIndex;
  const isCompleted = index < activeIndex;
  const Icon = step.icon;

  return (
    <button
      onClick={() => onClick(index)}
      className={`group relative w-full overflow-hidden rounded-[0.82rem] border px-2.5 py-2.5 text-left transition-all duration-200 ${
        isActive
          ? 'border-[#C9A64E]/45 bg-[linear-gradient(135deg,#FFFDF8_0%,#FFF8E8_100%)] text-[#173A62] shadow-[0_7px_20px_rgba(185,150,74,0.10)]'
          : isCompleted
            ? 'border-[#D9E3EC] bg-white text-[#173A62] shadow-[0_2px_8px_rgba(15,43,75,0.035)] hover:border-[#C9A64E]/35'
            : 'border-[#D9E3EC] bg-white text-[#6C7E91] shadow-[0_2px_8px_rgba(15,43,75,0.025)] hover:-translate-y-0.5 hover:border-[#BFCBD7] hover:text-[#173A62] hover:shadow-[0_6px_16px_rgba(15,43,75,0.06)]'
      }`}
    >
      {isActive ? (
        <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-[linear-gradient(180deg,#123B6D_0%,#B9964A_100%)]" />
      ) : null}

      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border transition-colors ${
            isActive
              ? 'border-[#D8B45E]/45 bg-white text-[#9A7225] shadow-[0_3px_10px_rgba(185,150,74,0.10)]'
              : isCompleted
                ? 'border-[#C8D7E5] bg-[#EEF4FA] text-[#123B6D]'
                : 'border-[#E1E7EF] bg-[#F7F9FB] text-[#8292A3] group-hover:bg-white group-hover:text-[#123B6D]'
          }`}
        >
          {isCompleted ? <CheckCircle2 size={17} /> : <Icon size={17} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-extrabold">{step.label}</div>
          <div
            className={`mt-0.5 text-[8.5px] font-black uppercase tracking-[0.14em] ${
              isActive
                ? 'text-[#A87922]'
                : isCompleted
                  ? 'text-[#698098]'
                  : 'text-[#9AA8B7]'
            }`}
          >
            {isCompleted ? 'Complete' : isActive ? 'Editing' : `Step ${index + 1}`}
          </div>
        </div>

        {isActive ? (
          <div className="h-2 w-2 rounded-full bg-[#C89F47] shadow-[0_0_0_4px_rgba(200,159,71,0.10)]" />
        ) : null}
      </div>
    </button>
  );
};

const FormInput = ({ label, value, onChange, placeholder, half = false }) => (
  <div className={`${half ? 'sm:col-span-1' : 'sm:col-span-2'}`}>
    <label className="mb-1.5 block text-[11.5px] font-semibold text-[#40556D]">
      {label}
    </label>
    <input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-10 w-full rounded-[0.7rem] border border-[#D6E0EA] bg-white px-3.5 py-2 text-[13.5px] font-medium text-[#10243E] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition-all placeholder:text-[#98A7B6] hover:border-[#C6D2DE] focus:border-[#C49A43] focus:ring-4 focus:ring-[#C49A43]/10"
    />
  </div>
);

const FormTextArea = ({ label, value, onChange, placeholder }) => (
  <div className="sm:col-span-2">
    <label className="mb-1.5 block text-[11.5px] font-semibold text-[#40556D]">
      {label}
    </label>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-24 w-full resize-none rounded-[0.7rem] border border-[#D6E0EA] bg-white px-3.5 py-2.5 text-[13.5px] font-medium leading-[1.5] text-[#10243E] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition-all custom-scrollbar placeholder:text-[#98A7B6] hover:border-[#C6D2DE] focus:border-[#C49A43] focus:ring-4 focus:ring-[#C49A43]/10"
    />
  </div>
);

const ReviewMetricCard = ({ label, value }) => (
  <div className="min-w-[132px] rounded-[0.8rem] border border-[#D9E3EC] bg-white px-3 py-2.5 shadow-[0_3px_10px_rgba(15,43,75,0.035)]">
    <div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#7A8CA0]">
      {label}
    </div>
    <div className="mt-1 text-[18px] font-black tracking-tight text-[#173A62]">
      {value}
    </div>
  </div>
);

const normalizeSkillList = (value) =>
  (Array.isArray(value) ? value : [])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

const mergeSkillLists = (...lists) => {
  const seen = new Set();

  return lists
    .flatMap((list) => normalizeSkillList(list))
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const DataReview = ({
  extractedData,
  onComplete,
  importMode = 'ai-enhanced',
  mode = 'upload',
  onBack,
  onHome,
  onOpenRepository,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [helpTourStep, setHelpTourStep] = useState(null);
  const [helpTourPosition, setHelpTourPosition] = useState(null);
  const helpTourPanelRef = useRef(null);
  const helpTourDragRef = useRef({ offsetX: 0, offsetY: 0 });
  const [formData, setFormData] = useState(() => {
    const mergedCoreSkills = mergeSkillLists(
      extractedData?.skills?.core,
      extractedData?.skills?.soft
    );

    return {
      ...(extractedData || {}),
      skills: {
        ...(extractedData?.skills || {}),
        technical: normalizeSkillList(extractedData?.skills?.technical),
        core: mergedCoreSkills,
        soft: mergedCoreSkills,
      },
    };
  });

  const currentStep = STEPS[activeStep];
  const isVerbatimImport = importMode === 'verbatim';
  const completionLabel = isVerbatimImport ? 'Open Builder' : 'Continue to Templates';
  const insights = useMemo(() => getResumeInsights(formData), [formData]);

  const updatePersonal = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const updateList = (section, index, field, value) => {
    const newList = [...(formData[section] || [])];
    newList[index] = {
      ...newList[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      [section]: newList,
    }));
  };

  const addListItem = (section) => {
    const defaults = {
      experience: {
        id: Date.now(),
        role: '',
        company: '',
        location: '',
        employmentType: '',
        date: '',
        desc: '',
      },
      education: {
        id: Date.now(),
        degree: '',
        school: '',
        specialization: '',
        grade: '',
        date: '',
      },
      projects: {
        id: Date.now(),
        name: '',
        desc: '',
        url: '',
        repositoryUrl: '',
      },
    };

    setFormData((prev) => ({
      ...prev,
      [section]: [
        ...(prev[section] || []),
        defaults[section],
      ],
    }));
  };

  const removeListItem = (section, index) => {
    const newList = [...formData[section]];
    newList.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      [section]: newList,
    }));
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    onComplete(formData);
  };

  const closeHelpTour = useCallback(() => setHelpTourStep(null), []);

  const handleHelpTourDragStart = useCallback((event) => {
    if (event.button !== 0 || event.target.closest('button')) return;
    const panel = helpTourPanelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    helpTourDragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    setHelpTourPosition({ x: rect.left, y: rect.top, width: rect.width });
    event.currentTarget.setPointerCapture(event.pointerId);
    document.body.style.userSelect = 'none';
  }, []);

  const handleHelpTourDrag = useCallback((event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const panel = helpTourPanelRef.current;
    if (!panel) return;

    const panelRect = panel.getBoundingClientRect();
    const edgeGap = 12;
    const maxX = Math.max(edgeGap, window.innerWidth - panelRect.width - edgeGap);
    const maxY = Math.max(edgeGap, window.innerHeight - panelRect.height - edgeGap);
    const x = Math.min(
      maxX,
      Math.max(edgeGap, event.clientX - helpTourDragRef.current.offsetX)
    );
    const y = Math.min(
      maxY,
      Math.max(edgeGap, event.clientY - helpTourDragRef.current.offsetY)
    );
    setHelpTourPosition((current) => ({
      x,
      y,
      width: current?.width || panelRect.width,
    }));
  }, []);

  const handleHelpTourDragEnd = useCallback((event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => () => {
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (helpTourStep === null) return undefined;

    const step = REVIEW_HELP_STEPS[helpTourStep];
    let target = null;
    const timer = window.setTimeout(() => {
      target = document.querySelector(`[data-help-tour="${step.target}"]`);
      if (!target) return;
      target.classList.add('review-help-target');
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 80);

    return () => {
      window.clearTimeout(timer);
      target?.classList.remove('review-help-target');
    };
  }, [helpTourStep]);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeHelpTour();
      if (event.key === 'ArrowRight') {
        setHelpTourStep((current) => Math.min(REVIEW_HELP_STEPS.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setHelpTourStep((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeHelpTour, helpTourStep]);

  const metricCards = [
    {
      label: 'Summary Lines',
      value: insights.summaryLines,
    },
    {
      label: 'Roles Found',
      value: insights.experienceCount,
    },
    {
      label: 'Skills Captured',
      value: insights.totalSkillCount,
    },
    {
      label: 'Projects + Extras',
      value:
        insights.projectCount +
        insights.certificationCount +
        insights.awardCount,
    },
  ];

  return (
    <div className="theme-app-shell relative min-h-screen overflow-hidden bg-[linear-gradient(rgba(18,59,109,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.03)_1px,transparent_1px),radial-gradient(circle_at_84%_4%,rgba(18,59,109,0.12),transparent_33%),radial-gradient(circle_at_10%_12%,rgba(185,150,74,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#F2F5F8_100%)] bg-[size:36px_36px,36px_36px,auto,auto,auto] font-sans text-[#071426] lg:flex lg:h-[100dvh] lg:max-h-[100dvh] lg:flex-col lg:overflow-hidden">
      <style>{`
        .review-help-target {
          position: relative !important;
          z-index: 10001 !important;
          outline: 3px solid #D6B25E !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 8px rgba(214, 178, 94, 0.18), 0 0 0 9999px rgba(7, 20, 38, 0.58) !important;
          border-radius: 0.9rem;
        }
      `}</style>
      <BuilderNavbar
        className="lg:shrink-0"
        currentStep="review"
        mode={mode}
        onHelp={() => setHelpTourStep(0)}
        onHome={onHome}
        onDashboard={onOpenRepository}
        onBack={onBack}
      />

      {helpTourStep !== null ? (
        <aside
          ref={helpTourPanelRef}
          role="dialog"
          aria-label="Resume review guided tour"
          className="fixed bottom-4 left-4 right-4 z-[10002] overflow-hidden rounded-[1rem] border border-[#D6B25E]/45 bg-[#071426] text-white shadow-[0_24px_70px_rgba(2,12,28,0.42)] sm:left-auto sm:right-6 sm:w-[390px]"
          style={helpTourPosition ? {
            left: `${helpTourPosition.x}px`,
            top: `${helpTourPosition.y}px`,
            right: 'auto',
            bottom: 'auto',
            width: `${helpTourPosition.width}px`,
          } : undefined}
        >
          <div
            onPointerDown={handleHelpTourDragStart}
            onPointerMove={handleHelpTourDrag}
            onPointerUp={handleHelpTourDragEnd}
            onPointerCancel={handleHelpTourDragEnd}
            className="flex touch-none cursor-grab items-center justify-between border-b border-white/10 px-4 py-3 active:cursor-grabbing"
            title="Drag to move this help window"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid grid-cols-2 gap-0.5 text-white/35" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((dot) => <span key={dot} className="h-1 w-1 rounded-full bg-current" />)}
              </span>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E4C56F]">
                Review tour · {helpTourStep + 1} of {REVIEW_HELP_STEPS.length}
              </div>
            </div>
            <button
              type="button"
              onClick={closeHelpTour}
              aria-label="Close help tour"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B25E]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-4 py-4">
            <h2 className="text-base font-extrabold tracking-[-0.01em]">
              {REVIEW_HELP_STEPS[helpTourStep].title}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-white/70">
              {REVIEW_HELP_STEPS[helpTourStep].description}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setHelpTourStep((current) => Math.max(0, current - 1))}
                disabled={helpTourStep === 0}
                className="h-9 rounded-lg border border-white/15 px-3 text-xs font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Back
              </button>
              <div className="flex gap-1.5" aria-hidden="true">
                {REVIEW_HELP_STEPS.map((step, index) => (
                  <span key={step.target} className={`h-1.5 rounded-full transition-all ${index === helpTourStep ? 'w-5 bg-[#D6B25E]' : 'w-1.5 bg-white/25'}`} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => helpTourStep === REVIEW_HELP_STEPS.length - 1
                  ? closeHelpTour()
                  : setHelpTourStep((current) => current + 1)}
                className="h-9 rounded-lg bg-[#D6B25E] px-4 text-xs font-extrabold text-[#071426] transition hover:bg-[#E4C56F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D6B25E]/30"
              >
                {helpTourStep === REVIEW_HELP_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      <div className="flex min-h-[calc(100vh-64px)] w-full max-w-full flex-col lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
        <aside className="shrink-0 border-b border-[#DCE4EC] bg-white/92 backdrop-blur-xl lg:h-full lg:w-[276px] lg:border-b-0 lg:border-r lg:border-[#D8E2EB]">
          <div className="flex h-full flex-col gap-3 overflow-y-auto p-3.5 custom-scrollbar">
            <div data-help-tour="review-readiness" className="rounded-[0.95rem] border border-[#173A62] bg-[linear-gradient(145deg,#071426_0%,#102D4F_58%,#173F69_100%)] p-3.5 text-white shadow-[0_10px_24px_rgba(7,20,38,0.15)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E2BE68]">
                    Resume Readiness
                  </div>
                  <div className="mt-1 text-[12.5px] font-extrabold">
                    Review extracted data
                  </div>
                  <p className="mt-0.5 text-[10px] leading-[1.55] text-white/55">
                    Check each section before moving into templates.
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] border border-white/10 bg-white/[0.08] text-[#E2BE68]">
                  <ShieldCheck size={19} />
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div className="text-[24px] font-black tracking-tight text-white">
                  {insights.readinessScore}
                  <span className="ml-0.5 text-[13px] font-bold text-white/50">%</span>
                </div>

                <div className="rounded-full border border-[#D8B45E]/30 bg-[#D8B45E]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#E4C46E]">
                  Ready
                </div>
              </div>

              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#E4C46E_0%,#B9964A_100%)] transition-all duration-300"
                  style={{
                    width: `${insights.readinessScore}%`,
                  }}
                />
              </div>
            </div>

            <div data-help-tour="review-sections" className="px-1">
              <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#8192A4]">
                Review Sections
              </div>

              <div className="space-y-1.5">
                {STEPS.map((step, idx) => (
                  <SidebarItem
                    key={step.id}
                    step={step}
                    index={idx}
                    activeIndex={activeStep}
                    onClick={setActiveStep}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-3.5 custom-scrollbar sm:p-4 lg:min-h-0 lg:overflow-y-auto lg:p-4 xl:p-5">
          <div className="mx-auto w-full max-w-[1360px] lg:pb-3">
            <section data-help-tour="review-overview" className="mb-4 overflow-hidden rounded-[1rem] border border-[#D9E3EC] bg-white/95 shadow-[0_7px_22px_rgba(15,43,75,0.05)] backdrop-blur-xl">
              <div className="grid gap-4 p-3.5 sm:p-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] ${
                        isVerbatimImport
                          ? 'border border-[#D8B45E]/35 bg-[#FFF8E8] text-[#8D651F]'
                          : 'border border-[#C9D9E8] bg-[#EEF5FB] text-[#173A62]'
                      }`}
                    >
                      <Sparkles size={10} />
                      {isVerbatimImport ? 'Exact Import' : 'AI Optimized'}
                    </span>

                    <span className="rounded-full border border-[#DCE4EC] bg-[#F7F9FB] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#73869A]">
                      Review
                    </span>
                  </div>

                  <h1 className="mt-2 text-[23px] font-black tracking-[-0.025em] text-[#173A62] sm:text-[26px]">
                    Review your resume data
                  </h1>

                  <p className="mt-1 max-w-[680px] text-[12px] leading-5 text-[#667B90]">
                    Confirm the information we extracted, correct anything that needs attention, and continue when your profile is ready.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {metricCards.map((card) => (
                    <ReviewMetricCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                    />
                  ))}
                </div>
              </div>

              <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(185,150,74,0.28),transparent)]" />
            </section>

            <section className="overflow-hidden rounded-[1rem] border border-[#D9E3EC] bg-white/96 shadow-[0_8px_24px_rgba(15,43,75,0.055)] backdrop-blur-xl">
              <div className="flex flex-col gap-2.5 border-b border-[#E0E7EE] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFBFC_100%)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[0.68rem] border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#9A7225]">
                    {React.createElement(currentStep.icon, {
                      size: 17,
                    })}
                  </div>

                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A87922]">
                      Currently Editing
                    </div>
                    <h2 className="mt-0.5 text-[16px] font-black tracking-tight text-[#173A62]">
                      {currentStep.label}
                    </h2>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#D9E3EC] bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#74879B] shadow-[0_2px_7px_rgba(15,43,75,0.03)] sm:self-auto">
                  Step {activeStep + 1}
                  <span className="text-[#B7C2CD]">/</span>
                  {STEPS.length}
                </div>
              </div>

              <div data-help-tour="review-form" className="p-3.5 sm:p-4">
                {activeStep === 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormInput
                      label="Full Name"
                      value={formData.personal?.name}
                      onChange={(v) => updatePersonal('name', v)}
                      placeholder="e.g. John Doe"
                    />
                    <FormInput
                      label="Job Title"
                      value={formData.personal?.title}
                      onChange={(v) => updatePersonal('title', v)}
                      placeholder="e.g. Product Manager"
                    />
                    <FormInput
                      label="Email"
                      value={formData.personal?.email}
                      onChange={(v) => updatePersonal('email', v)}
                      placeholder="john@example.com"
                      half
                    />
                    <FormInput
                      label="Phone"
                      value={formData.personal?.phone}
                      onChange={(v) => updatePersonal('phone', v)}
                      placeholder="+1 555 000 0000"
                      half
                    />
                    <FormInput
                      label="Location"
                      value={formData.personal?.location}
                      onChange={(v) => updatePersonal('location', v)}
                      placeholder="New York, USA"
                    />
                    <FormInput label="LinkedIn" value={formData.personal?.linkedin} onChange={(v) => updatePersonal('linkedin', v)} placeholder="linkedin.com/in/username" />
                    <FormInput label="GitHub" value={formData.personal?.github} onChange={(v) => updatePersonal('github', v)} placeholder="github.com/username" half />
                    <FormInput label="Portfolio / Website" value={formData.personal?.portfolio || formData.personal?.website} onChange={(v) => updatePersonal('portfolio', v)} placeholder="yourportfolio.com" half />
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-3">
                    {formData.experience?.map((exp, i) => (
                      <div
                        key={exp.id || i}
                        className="group relative overflow-hidden rounded-[0.88rem] border border-[#D8E2EB] bg-white p-3.5 shadow-[0_4px_13px_rgba(15,43,75,0.04)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:bg-[linear-gradient(180deg,#123B6D_0%,#B9964A_100%)]"
                      >
                        <button
                          onClick={() => removeListItem('experience', i)}
                          className="absolute right-3 top-3 rounded-[0.65rem] border border-[#E0E6ED] bg-white p-2 text-[#94A3B8] transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Remove experience"
                        >
                          <Trash2 size={15} />
                        </button>

                        <div className="mb-2.5 pr-10">
                          <div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8798A9]">
                            Experience {i + 1}
                          </div>
                          <div className="mt-0.5 text-[12.5px] font-extrabold text-[#173A62]">
                            {exp.role || exp.company || 'Untitled position'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <FormInput
                            label="Job Title"
                            value={exp.role}
                            onChange={(v) => updateList('experience', i, 'role', v)}
                            placeholder="e.g. Senior Analyst"
                          />
                          <FormInput
                            label="Employer"
                            value={exp.company}
                            onChange={(v) => updateList('experience', i, 'company', v)}
                            placeholder="e.g. Google"
                          />
                          <FormInput
                            label="Date Range"
                            value={exp.date}
                            onChange={(v) => updateList('experience', i, 'date', v)}
                            placeholder="e.g. 2020 - Present"
                          />
                          <FormInput label="Location" value={exp.location} onChange={(v) => updateList('experience', i, 'location', v)} placeholder="Bengaluru, India or Remote" half />
                          <FormInput label="Employment Type" value={exp.employmentType} onChange={(v) => updateList('experience', i, 'employmentType', v)} placeholder="Full-time, Internship, Contract" half />
                          <FormTextArea
                            label="Description"
                            value={exp.desc}
                            onChange={(v) => updateList('experience', i, 'desc', v)}
                            placeholder="• Achievements..."
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addListItem('experience')}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[0.8rem] border border-dashed border-[#AEBECD] bg-[#F9FBFC] py-2.5 text-[13px] font-bold text-[#52677F] transition-all hover:border-[#C49A43] hover:bg-[#FFF9EC] hover:text-[#8D651F]"
                    >
                      <Plus size={17} />
                      Add Position
                    </button>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-3">
                    {formData.education?.map((edu, i) => (
                      <div
                        key={edu.id || i}
                        className="group relative overflow-hidden rounded-[0.88rem] border border-[#D8E2EB] bg-white p-3.5 shadow-[0_4px_13px_rgba(15,43,75,0.04)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:bg-[linear-gradient(180deg,#123B6D_0%,#B9964A_100%)]"
                      >
                        <button
                          onClick={() => removeListItem('education', i)}
                          className="absolute right-3 top-3 rounded-[0.65rem] border border-[#E0E6ED] bg-white p-2 text-[#94A3B8] transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Remove education"
                        >
                          <Trash2 size={15} />
                        </button>

                        <div className="mb-2.5 pr-10">
                          <div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8798A9]">
                            Education {i + 1}
                          </div>
                          <div className="mt-0.5 text-[12.5px] font-extrabold text-[#173A62]">
                            {edu.degree || edu.school || 'Untitled education'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <FormInput
                            label="School Name"
                            value={edu.school}
                            onChange={(v) => updateList('education', i, 'school', v)}
                            placeholder="e.g. Harvard University"
                          />
                          <FormInput
                            label="Degree"
                            value={edu.degree}
                            onChange={(v) => updateList('education', i, 'degree', v)}
                            placeholder="e.g. Bachelors in Science"
                          />
                          <FormInput
                            label="Graduation Date"
                            value={edu.date}
                            onChange={(v) => updateList('education', i, 'date', v)}
                            placeholder="e.g. May 2019"
                          />
                          <FormInput label="Specialization" value={edu.specialization} onChange={(v) => updateList('education', i, 'specialization', v)} placeholder="Finance, Data Science..." half />
                          <FormInput label="Grade / GPA / Percentage" value={edu.grade} onChange={(v) => updateList('education', i, 'grade', v)} placeholder="8.4 CGPA or 82%" half />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addListItem('education')}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[0.8rem] border border-dashed border-[#AEBECD] bg-[#F9FBFC] py-2.5 text-[13px] font-bold text-[#52677F] transition-all hover:border-[#C49A43] hover:bg-[#FFF9EC] hover:text-[#8D651F]"
                    >
                      <Plus size={17} />
                      Add Education
                    </button>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="grid grid-cols-1 gap-3">
                    <FormTextArea
                      label="Technical Skills"
                      value={formData.skills?.technical?.join(', ')}
                      onChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            technical: v
                              .split(',')
                              .map((item) => item.trim())
                              .filter(Boolean),
                          },
                        }))
                      }
                      placeholder="Python, Java, React..."
                    />

                    <FormTextArea
                      label="Core / Soft Skills"
                      value={formData.skills?.core?.join(', ')}
                      onChange={(v) => {
                        const nextSkills = v
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean);

                        setFormData((prev) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            core: nextSkills,
                            soft: nextSkills,
                          },
                        }));
                      }}
                      placeholder="Leadership, Communication..."
                    />
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-3">
                    {formData.projects?.map((proj, i) => (
                      <div
                        key={proj.id || i}
                        className="group relative overflow-hidden rounded-[0.88rem] border border-[#D8E2EB] bg-white p-3.5 shadow-[0_4px_13px_rgba(15,43,75,0.04)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:bg-[linear-gradient(180deg,#123B6D_0%,#B9964A_100%)]"
                      >
                        <button
                          onClick={() => removeListItem('projects', i)}
                          className="absolute right-3 top-3 rounded-[0.65rem] border border-[#E0E6ED] bg-white p-2 text-[#94A3B8] transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Remove project"
                        >
                          <Trash2 size={15} />
                        </button>

                        <div className="mb-2.5 pr-10">
                          <div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8798A9]">
                            Project {i + 1}
                          </div>
                          <div className="mt-0.5 text-[12.5px] font-extrabold text-[#173A62]">
                            {proj.name || 'Untitled project'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <FormInput
                            label="Project Name"
                            value={proj.name}
                            onChange={(v) => updateList('projects', i, 'name', v)}
                          />
                          <FormInput label="Project Link" value={proj.url} onChange={(v) => updateList('projects', i, 'url', v)} placeholder="project.example.com" half />
                          <FormInput label="Repository Link" value={proj.repositoryUrl} onChange={(v) => updateList('projects', i, 'repositoryUrl', v)} placeholder="github.com/user/repository" half />
                          <FormTextArea
                            label="Details"
                            value={proj.desc}
                            onChange={(v) => updateList('projects', i, 'desc', v)}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => addListItem('projects')}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[0.8rem] border border-dashed border-[#AEBECD] bg-[#F9FBFC] py-2.5 text-[13px] font-bold text-[#52677F] transition-all hover:border-[#C49A43] hover:bg-[#FFF9EC] hover:text-[#8D651F]"
                    >
                      <Plus size={17} />
                      Add Project
                    </button>
                  </div>
                )}

                {activeStep === 5 && (
                  <FormTextArea
                    label="Professional Summary"
                    value={formData.personal?.summary}
                    onChange={(v) => updatePersonal('summary', v)}
                    placeholder="Write a short summary of your career..."
                  />
                )}
              </div>

              <footer data-help-tour="review-navigation" className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#E0E7EE] bg-[#FAFBFC] px-4 py-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                  className="w-full rounded-[0.72rem] border border-[#D3DEE8] bg-white px-5 py-2 text-[12.5px] font-bold text-[#60758B] shadow-[0_2px_7px_rgba(15,43,75,0.035)] transition-all hover:border-[#AEBECD] hover:bg-[#F8FAFC] hover:text-[#173A62] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-[#D3DEE8] disabled:hover:bg-white sm:w-auto"
                >
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[0.72rem] bg-[#123B6D] px-6 py-2.5 text-[12.5px] font-extrabold text-white shadow-[0_5px_14px_rgba(18,59,109,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#0D315D] sm:w-auto"
                >
                  {activeStep === STEPS.length - 1 ? (
                    <>
                      {completionLabel}
                      <Zap size={16} />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </footer>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DataReview;
