import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  X,
} from 'lucide-react';

import { listUploadedResumes } from '../../../services/resumeRepositoryService';


/* =========================================================
   DATE FORMATTER
========================================================= */

const formatStoredDate = (value) => {
  if (!value) return 'Saved upload';

  try {
    return new Date(value).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Saved upload';
  }
};


/* =========================================================
   OPTIMIZATION STAGES
========================================================= */

const OPTIMIZATION_STAGES = [
  {
    icon: Search,
    title: 'ATS Readability',
    text: 'Structure, keywords & formatting',
  },
  {
    icon: Users,
    title: 'Recruiter Clarity',
    text: 'Relevance, positioning & readability',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Hiring Impact',
    text: 'Skills, outcomes & professional value',
  },
];

const UPLOAD_HELP_STEPS = [
  { target: 'upload-overview', title: 'Import your current resume', description: 'CareerSense structures your existing resume for the builder. After uploading, you can preserve the wording or use AI-assisted optimization.' },
  { target: 'upload-dropzone', title: 'Select a supported file', description: 'Drag and drop a PDF, DOC, or DOCX here, or click the upload area to browse. You can replace the selected file before continuing.' },
  { target: 'upload-workspace', title: 'Reuse a recent upload', description: 'If recent resumes are available, select one to continue without uploading it again. Your saved uploads remain inside your CareerSense workspace.' },
  { target: 'upload-continue', title: 'Continue with your resume', description: 'After selecting a new file, this button becomes active. CareerSense will then ask whether to preserve the content or optimize it with AI.' },
];


/* =========================================================
   COMPONENT
========================================================= */

const ResumeUpload = ({
  onFileUpload,
  onStoredResumeSelect,
  helpRequest = 0,
}) => {
  const [file, setFileLocal] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [helpTourStep, setHelpTourStep] = useState(null);
  const [helpTourPosition, setHelpTourPosition] = useState(null);
  const helpTourPanelRef = useRef(null);
  const helpTourDragRef = useRef({ offsetX: 0, offsetY: 0 });

  const storedResumes = listUploadedResumes().slice(0, 3);

  useEffect(() => {
    if (helpRequest > 0) setHelpTourStep(0);
  }, [helpRequest]);

  const closeHelpTour = useCallback(() => setHelpTourStep(null), []);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const step = UPLOAD_HELP_STEPS[helpTourStep];
    let target = null;
    const timer = window.setTimeout(() => {
      target = document.querySelector(`[data-help-tour="${step.target}"]`);
      target?.classList.add('upload-help-target');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 80);
    return () => {
      window.clearTimeout(timer);
      target?.classList.remove('upload-help-target');
    };
  }, [helpTourStep]);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeHelpTour();
      if (event.key === 'ArrowRight') setHelpTourStep((step) => Math.min(UPLOAD_HELP_STEPS.length - 1, step + 1));
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


  /* -------------------------------------------------------
     FILE INPUT
  ------------------------------------------------------- */

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFileLocal(selectedFile);
    }
  };


  /* -------------------------------------------------------
     DRAG & DROP
  ------------------------------------------------------- */

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      setFileLocal(droppedFile);
    }
  };


  /* -------------------------------------------------------
     CONTINUE
  ------------------------------------------------------- */

  const handleNext = () => {
    if (file) {
      onFileUpload(file);
    }
  };


  /* -------------------------------------------------------
     STORED RESUME
  ------------------------------------------------------- */

  const handleStoredResumeSelect = (record) => {
    setFileLocal(null);
    onStoredResumeSelect?.(record);
  };


  return (
    <>
    <style>{`
      .upload-help-target {
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
        aria-label="Resume upload guided tour"
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
              Upload tour · {helpTourStep + 1} of {UPLOAD_HELP_STEPS.length}
            </div>
          </div>
          <button type="button" onClick={closeHelpTour} aria-label="Close help tour" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="px-4 py-4">
          <h2 className="text-base font-extrabold">{UPLOAD_HELP_STEPS[helpTourStep].title}</h2>
          <p className="mt-2 text-[13px] leading-5 text-white/70">{UPLOAD_HELP_STEPS[helpTourStep].description}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setHelpTourStep((step) => Math.max(0, step - 1))} disabled={helpTourStep === 0} className="h-9 rounded-lg border border-white/15 px-3 text-xs font-bold transition hover:bg-white/10 disabled:opacity-35">Back</button>
            <div className="flex gap-1.5" aria-hidden="true">
              {UPLOAD_HELP_STEPS.map((step, index) => <span key={step.target} className={`h-1.5 rounded-full ${index === helpTourStep ? 'w-5 bg-[#D6B25E]' : 'w-1.5 bg-white/25'}`} />)}
            </div>
            <button type="button" onClick={() => helpTourStep === UPLOAD_HELP_STEPS.length - 1 ? closeHelpTour() : setHelpTourStep((step) => step + 1)} className="h-9 rounded-lg bg-[#D6B25E] px-4 text-xs font-extrabold text-[#071426] hover:bg-[#E4C56F]">
              {helpTourStep === UPLOAD_HELP_STEPS.length - 1 ? 'Finish' : 'Next'}
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
        lg:min-h-[680px]
        lg:overflow-hidden
      "
    >
      {/* ===================================================
          BACKGROUND
      =================================================== */}
      <div className="pointer-events-none absolute inset-0">

        {/* Base surface */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F8FAFC_47%,#ECF2F8_100%)]" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.024] bg-[linear-gradient(#173A63_1px,transparent_1px),linear-gradient(90deg,#173A63_1px,transparent_1px)] bg-[size:38px_38px]" />

        {/* Blue ambience */}
        <div className="absolute -left-[15%] -top-[40%] h-[620px] w-[620px] rounded-full bg-[#295D95]/10 blur-[135px]" />

        {/* Gold ambience */}
        <div className="absolute -right-[12%] -top-[38%] h-[540px] w-[540px] rounded-full bg-[#C39A43]/10 blur-[130px]" />

        {/* Center light */}
        <div className="absolute left-1/2 top-[38%] h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-white/55 blur-[120px]" />

        {/* Decorative arc */}
        <div className="absolute left-[7%] top-[15%] h-[580px] w-[86%] rounded-[50%] border border-[#254E7A]/[0.045]" />
      </div>


      {/* ===================================================
          PAGE GRID
      =================================================== */}
      <div className="relative z-10 mx-auto grid min-h-full w-full max-w-[1260px] items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">

        {/* =================================================
            LEFT CONTENT
        ================================================= */}
        <section data-help-tour="upload-overview">

          {/* EYEBROW */}
          <div className="mb-3 inline-flex items-center gap-2">
            <Sparkles size={12} className="text-[#A77A25]" />

            <span className="bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[9px] font-black uppercase tracking-[0.22em] text-transparent">
              CareerSense AI Parsing Engine
            </span>
          </div>


          {/* HEADING */}
          <h1 className="max-w-[620px] text-[2rem] font-black leading-[1.04] tracking-[-0.045em] sm:text-[2.4rem] lg:text-[2.7rem]">
            <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
              Your Resume is
            </span>

            <br />

            <span className="bg-gradient-to-b from-[#E6C66E] via-[#B88931] to-[#89601C] bg-clip-text text-transparent">
              The Blueprint.
            </span>
          </h1>


          {/* DESCRIPTION */}
          <p className="mt-4 max-w-[590px] text-[13.5px] font-medium leading-[1.75] text-[#61748B] sm:text-[14.5px]">
            Upload your existing resume and let CareerSense structure the
            content for your builder. You can preserve the original wording or
            continue with AI-assisted optimization.
          </p>


          {/* ------------------------------------------------
              OPTIMIZED FOR
          ------------------------------------------------ */}
          <div className="mt-7">
            <div className="mb-3 flex items-center gap-2 text-[8.5px] font-black uppercase tracking-[0.20em] text-[#8292A5]">
              <Brain size={12} className="text-[#A77A25]" />
              Optimized For
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {OPTIMIZATION_STAGES.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="
                    group rounded-xl border border-[#D7E0E9]
                    bg-white/65 p-3.5
                    shadow-[0_7px_22px_rgba(6,23,44,0.045)]
                    backdrop-blur-md transition-all duration-300
                    hover:-translate-y-0.5 hover:border-[#C49A43]/40
                    hover:bg-white
                  "
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#29517F] via-[#15375F] to-[#071A31] text-[#DDBA65] shadow-sm">
                    <Icon size={14} />
                  </div>

                  <div className="text-[10.5px] font-extrabold text-[#173A62]">
                    {title}
                  </div>

                  <div className="mt-1 text-[9.5px] font-medium leading-[1.5] text-[#778A9F]">
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* ------------------------------------------------
              TRUST STRIP
          ------------------------------------------------ */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#D7E0E9] pt-5">

            <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#64778E]">
              <ShieldCheck size={15} className="text-[#B58A32]" />
              Private & secure
            </div>

            <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#64778E]">
              <Brain size={15} className="text-[#B58A32]" />
              AI-assisted extraction
            </div>

            <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#64778E]">
              <FileCheck2 size={15} className="text-[#B58A32]" />
              Fully editable output
            </div>
          </div>
        </section>


        {/* =================================================
            RIGHT — UPLOAD WORKSPACE
        ================================================= */}
        <section className="relative">

          {/* CARD GLOW */}
          <div className="pointer-events-none absolute -inset-5 rounded-[2.2rem] bg-[radial-gradient(circle_at_15%_10%,rgba(41,93,149,0.13),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(185,138,50,0.10),transparent_36%)] blur-2xl" />


          {/* MAIN CARD */}
          <div
            data-help-tour="upload-workspace"
            className="
              relative overflow-hidden rounded-[1.5rem]
              border border-[#CBD7E3]
              bg-white/76 p-4
              shadow-[0_25px_70px_rgba(6,23,44,0.12)]
              backdrop-blur-xl
              sm:p-5
            "
          >
            {/* TOP GOLD LIGHT */}
            <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-[#D8B65E] to-transparent" />


            {/* CARD HEADER */}
            <div className="mb-4 flex items-start justify-between gap-4 px-1">

              <div>
                <div className="mb-1 text-[8px] font-black uppercase tracking-[0.20em] text-[#A07828]">
                  Resume Import
                </div>

                <h2 className="text-[1.35rem] font-black tracking-[-0.03em] text-[#071A31]">
                  Upload Your Resume
                </h2>

                <p className="mt-1 text-[10.5px] font-medium text-[#75879C]">
                  PDF, DOC or DOCX · Max one resume at a time
                </p>
              </div>


              {/* STEP BADGE */}
              <div className="rounded-full border border-[#C49A43]/30 bg-[#FFF8E9] px-3 py-1 text-[7.5px] font-black uppercase tracking-[0.14em] text-[#94691F]">
                Step 1
              </div>
            </div>


            {/* =================================================
                DROP ZONE
            ================================================= */}
            <div
              data-help-tour="upload-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                group/drop relative flex min-h-[235px] cursor-pointer
                flex-col items-center justify-center overflow-hidden
                rounded-[1.15rem] border-2 border-dashed
                p-6 text-center transition-all duration-300
                ${
                  file
                    ? 'border-[#B88931]/55 bg-[linear-gradient(145deg,#FFFCF4,#F4F7FA)]'
                    : isDragging
                      ? 'scale-[1.01] border-[#315E8D]/65 bg-[#EDF3F8]'
                      : 'border-[#BFCCD9] bg-[linear-gradient(145deg,#FAFBFC_0%,#F3F6F9_62%,#FBF6EA_100%)] hover:border-[#A3B8CC]'
                }
              `}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
              />


              {/* subtle drop zone grid */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:30px_30px]" />


              {file ? (
                /* -------------------------------------------
                   FILE SELECTED
                ------------------------------------------- */
                <div className="relative z-10 w-full max-w-[420px]">

                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-b from-[#29517F] via-[#15375F] to-[#071A31] text-[#DDBA65] shadow-[0_10px_25px_rgba(6,23,44,0.18)]">
                    <FileText size={25} />
                  </div>

                  <div className="mx-auto max-w-[330px] truncate text-[14px] font-extrabold text-[#102F54]">
                    {file.name}
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1.5 text-[8.5px] font-black uppercase tracking-[0.14em] text-[#9A7628]">
                    <CheckCircle2 size={13} />
                    Ready to process
                  </div>

                  <div className="mt-3 text-[9.5px] font-medium text-[#8898AA]">
                    Click or drop another file to replace it
                  </div>
                </div>
              ) : (
                /* -------------------------------------------
                   EMPTY STATE
                ------------------------------------------- */
                <div className="relative z-10">

                  <div
                    className={`
                      mx-auto mb-4 flex h-14 w-14 items-center justify-center
                      rounded-xl border transition-all duration-300
                      ${
                        isDragging
                          ? 'scale-110 border-[#315E8D] bg-gradient-to-b from-[#315E8D] to-[#102F54] text-[#E2C36D] shadow-[0_12px_28px_rgba(6,23,44,0.18)]'
                          : 'border-[#D2DDE7] bg-white text-[#315A83] shadow-[0_8px_20px_rgba(6,23,44,0.06)] group-hover/drop:-translate-y-1'
                      }
                    `}
                  >
                    <Upload size={24} />
                  </div>

                  <div className="text-[14px] font-extrabold text-[#102F54]">
                    Drag & drop your resume
                  </div>

                  <div className="mt-1 text-[10.5px] font-medium text-[#8495A8]">
                    or click anywhere to browse
                  </div>

                  <div className="mt-4 inline-flex rounded-full border border-[#D5DEE7] bg-white/75 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.13em] text-[#71849A]">
                    PDF · DOC · DOCX
                  </div>
                </div>
              )}
            </div>


            {/* =================================================
                SAVED UPLOADS
            ================================================= */}
            {storedResumes.length > 0 && (
              <div className="mt-4">
                <div className="mb-2.5 flex items-center justify-between">

                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-[#7F90A4]">
                    <Clock3 size={11} className="text-[#A77924]" />
                    Recent Uploads
                  </div>

                  <span className="text-[8.5px] font-medium text-[#95A3B2]">
                    Use without uploading again
                  </span>
                </div>


                <div className="grid gap-2 sm:grid-cols-3">
                  {storedResumes.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => handleStoredResumeSelect(record)}
                      className="
                        group/resume min-w-0 rounded-xl border
                        border-[#DCE4EC] bg-[#F8FAFC]/75
                        p-3 text-left transition-all duration-300
                        hover:-translate-y-0.5
                        hover:border-[#C49A43]/40 hover:bg-white
                        hover:shadow-[0_8px_20px_rgba(6,23,44,0.06)]
                      "
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E9EFF5] text-[#315A83]">
                          <FileText size={13} />
                        </div>

                        <ArrowRight
                          size={12}
                          className="text-[#91A0B0] transition-transform group-hover/resume:translate-x-0.5 group-hover/resume:text-[#A77924]"
                        />
                      </div>

                      <div className="truncate text-[10.5px] font-extrabold text-[#173A62]">
                        {record.name ||
                          record.sourceName ||
                          'Saved Resume'}
                      </div>

                      <div className="mt-1 text-[8.5px] font-medium text-[#8797A8]">
                        {formatStoredDate(
                          record.updatedAt || record.createdAt
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}


            {/* =================================================
                CONTINUE BUTTON
            ================================================= */}
            <button
              data-help-tour="upload-continue"
              type="button"
              onClick={handleNext}
              disabled={!file}
              className={`
                mt-4 flex min-h-[46px] w-full items-center
                justify-center gap-2 rounded-[0.85rem]
                px-5 text-[9.5px] font-black uppercase
                tracking-[0.16em] transition-all duration-300
                ${
                  file
                    ? 'border border-[#315D88] bg-gradient-to-b from-[#29517F] via-[#14365E] to-[#071A31] text-white shadow-[0_10px_25px_rgba(6,23,44,0.17)] hover:-translate-y-0.5 hover:shadow-[0_15px_32px_rgba(6,23,44,0.22)]'
                    : 'cursor-not-allowed border border-[#D8E1E9] bg-[#EEF2F5] text-[#9AA8B7]'
                }
              `}
            >
              {file ? 'Continue with Resume' : 'Upload to Continue'}

              <ArrowRight size={14} />
            </button>


            {/* PRIVACY NOTE */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[8.5px] font-medium text-[#8A9AAB]">
              <ShieldCheck size={11} className="text-[#A77924]" />
              Your resume remains private to your CareerSense workspace.
            </div>
          </div>
        </section>
      </div>
    </main>
    </>
  );
};

export default ResumeUpload;
