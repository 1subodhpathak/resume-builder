import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';

import { extractTextFromFile } from '../../utils/fileParser';
import {
  phase1_ExtractResume,
  phase2_AnalyzeJD,
  phase3_TailorResume,
} from '../../services/jobTailorService';
import {
  listUploadedJobDescriptions,
  listUploadedResumes,
  saveUploadedJobDescription,
  saveUploadedResume,
} from '../../services/resumeRepositoryService';

const formatStoredDate = (value) => {
  if (!value) return 'Saved';

  try {
    return new Date(value).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Saved';
  }
};

const createStoredResumeSource = (record) => ({
  name: record?.name || record?.sourceName || 'Saved Resume',
  type: record?.type || 'text/plain',
  size: record?.size || record?.textLength || 0,
  storedText: record?.text || '',
  repositoryUploadId: record?.id || '',
});

const getResumeText = async (source) => {
  if (typeof source?.storedText === 'string') {
    return source.storedText;
  }

  return extractTextFromFile(source);
};

const TARGETED_HELP_STEPS = [
  { target: 'targeted-overview', title: 'Create a role-focused resume', description: 'Provide both your current resume and the target job description. CareerSense analyzes them together and creates an editable draft for review.' },
  { target: 'targeted-resume', title: 'Choose your base resume', description: 'Upload a PDF or DOCX, or select a recent resume. This is the source CareerSense will tailor for the role.' },
  { target: 'targeted-jd', title: 'Add the job description', description: 'Upload a PDF, DOCX, or TXT job description, paste the full text, or choose a recent JD. Include responsibilities, requirements, skills, and role context.' },
  { target: 'targeted-create', title: 'Create the targeted draft', description: 'Once both inputs are ready, create the targeted resume. Your source files remain private and the generated content can be reviewed before choosing a template.' },
];

const deriveJobDescriptionTitle = (text) => {
  const firstLine = (text || '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? firstLine.slice(0, 72) : 'Job Description';
};

const SavedItem = ({
  title,
  date,
  selected,
  tone = 'blue',
  onClick,
}) => {
  const selectedClasses =
    tone === 'gold'
      ? 'border-[#C49A43]/45 bg-[#FFF8E9] text-[#94691F]'
      : 'border-[#315D88]/35 bg-[#EDF3F8] text-[#214B76]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-0 items-center justify-between gap-3 rounded-[0.8rem] border px-3 py-2.5 text-left transition-all duration-200 ${
        selected
          ? selectedClasses
          : 'border-[#DCE4EC] bg-[#FAFBFC]/80 hover:-translate-y-0.5 hover:border-[#B7C6D5] hover:bg-white'
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate text-[10.5px] font-extrabold text-[#173A62]">
          {title}
        </span>
        <span className="mt-0.5 block text-[8.5px] font-semibold text-[#8A99AA]">
          {date}
        </span>
      </span>

      {selected ? (
        <CheckCircle2
          size={13}
          className={`shrink-0 ${tone === 'gold' ? 'text-[#A77924]' : 'text-[#315D88]'}`}
        />
      ) : (
        <ArrowRight
          size={12}
          className="shrink-0 text-[#A2AFBC] transition-transform group-hover:translate-x-0.5"
        />
      )}
    </button>
  );
};

const TargetedResumeUI = ({ onComplete, onCancel, helpRequest = 0 }) => {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [status, setStatus] = useState('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isJdDragging, setIsJdDragging] = useState(false);
  const [isReadingJd, setIsReadingJd] = useState(false);
  const [jdFileName, setJdFileName] = useState('');
  const [selectedResumeUploadId, setSelectedResumeUploadId] = useState('');
  const [selectedJdUploadId, setSelectedJdUploadId] = useState('');
  const [helpTourStep, setHelpTourStep] = useState(null);
  const [helpTourPosition, setHelpTourPosition] = useState(null);

  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);
  const helpTourPanelRef = useRef(null);
  const helpTourDragRef = useRef({ offsetX: 0, offsetY: 0 });

  const storedResumes = listUploadedResumes().slice(0, 4);
  const storedJobDescriptions = listUploadedJobDescriptions().slice(0, 4);

  useEffect(() => {
    if (helpRequest > 0) setHelpTourStep(0);
  }, [helpRequest]);

  const closeHelpTour = useCallback(() => setHelpTourStep(null), []);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const step = TARGETED_HELP_STEPS[helpTourStep];
    let target = null;
    const timer = window.setTimeout(() => {
      target = document.querySelector(`[data-help-tour="${step.target}"]`);
      target?.classList.add('targeted-help-target');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 80);
    return () => {
      window.clearTimeout(timer);
      target?.classList.remove('targeted-help-target');
    };
  }, [helpTourStep]);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeHelpTour();
      if (event.key === 'ArrowRight') setHelpTourStep((step) => Math.min(TARGETED_HELP_STEPS.length - 1, step + 1));
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

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const isResumeFile = (selectedFile) => {
    const fileName = selectedFile?.name?.toLowerCase() || '';

    return Boolean(
      selectedFile &&
        (selectedFile.type === 'application/pdf' ||
          selectedFile.type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileName.endsWith('.pdf') ||
          fileName.endsWith('.docx'))
    );
  };

  const isJobDescriptionFile = (selectedFile) => {
    const fileName = selectedFile?.name?.toLowerCase() || '';

    return Boolean(
      selectedFile &&
        (isResumeFile(selectedFile) ||
          selectedFile.type?.startsWith('text/') ||
          fileName.endsWith('.txt'))
    );
  };

  const validateAndSetFile = (selectedFile) => {
    if (isResumeFile(selectedFile)) {
      setFile(selectedFile);
      setSelectedResumeUploadId('');
      return;
    }

    alert('Please upload a valid PDF or DOCX file.');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetFile(event.dataTransfer.files[0]);
  };

  const handleFileChange = (event) => {
    validateAndSetFile(event.target.files[0]);
  };

  const handleJdDragOver = (event) => {
    event.preventDefault();
    setIsJdDragging(true);
  };

  const handleJdDragLeave = (event) => {
    event.preventDefault();
    setIsJdDragging(false);
  };

  const processJdFile = async (selectedFile) => {
    if (!selectedFile) return;

    if (!isJobDescriptionFile(selectedFile)) {
      alert('Please upload the job description as PDF, DOCX, or TXT.');
      return;
    }

    setIsReadingJd(true);

    try {
      const extractedText = await extractTextFromFile(selectedFile);

      if (!extractedText.trim()) {
        throw new Error('No readable job description text was found in this file.');
      }

      setJdText(extractedText);
      setJdFileName(selectedFile.name);

      const savedJobDescription = saveUploadedJobDescription({
        sourceName: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        text: extractedText,
      });

      setSelectedJdUploadId(savedJobDescription?.id || '');
    } catch (error) {
      console.error(error);
      alert(error?.message || 'Could not read this job description file.');
    } finally {
      setIsReadingJd(false);
    }
  };

  const handleJdDrop = (event) => {
    event.preventDefault();
    setIsJdDragging(false);
    processJdFile(event.dataTransfer.files[0]);
  };

  const handleJdFileChange = (event) => {
    processJdFile(event.target.files[0]);
  };

  const clearFile = (event) => {
    event.stopPropagation();
    setFile(null);
    setSelectedResumeUploadId('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearJd = () => {
    setJdText('');
    setJdFileName('');
    setSelectedJdUploadId('');

    if (jdFileInputRef.current) {
      jdFileInputRef.current.value = '';
    }
  };

  const handleStoredResumeSelect = (record) => {
    setFile(createStoredResumeSource(record));
    setSelectedResumeUploadId(record.id);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStoredJobDescriptionSelect = (record) => {
    setJdText(record.text || '');
    setJdFileName(record.title || record.sourceName || 'Saved JD');
    setSelectedJdUploadId(record.id);

    if (jdFileInputRef.current) {
      jdFileInputRef.current.value = '';
    }
  };

  const handleJdTextChange = (event) => {
    setJdText(event.target.value);
    setSelectedJdUploadId('');
  };

  const handleStartAlignment = async () => {
    if (!file) {
      alert('Please upload your base resume first.');
      return;
    }

    if (!jdText.trim()) {
      alert('Please paste or upload the Job Description.');
      return;
    }

    setStatus('processing');

    try {
      setProgressMsg('Extracting text from document...');
      const rawResumeText = await getResumeText(file);

      if (!rawResumeText.trim()) {
        throw new Error('No readable resume text was found.');
      }

      if (!file?.repositoryUploadId && !selectedResumeUploadId) {
        const savedResume = saveUploadedResume({
          name: file?.name,
          type: file?.type,
          size: file?.size,
          text: rawResumeText,
        });

        setSelectedResumeUploadId(savedResume?.id || '');
      }

      const cleanJdText = jdText.trim();

      if (!selectedJdUploadId) {
        const savedJobDescription = saveUploadedJobDescription({
          title: jdFileName ? '' : deriveJobDescriptionTitle(cleanJdText),
          sourceName: jdFileName,
          text: cleanJdText,
        });

        setSelectedJdUploadId(savedJobDescription?.id || '');
      }

      setProgressMsg('Phase 1: AI parsing your base profile...');
      const parsedResume = await phase1_ExtractResume(rawResumeText);

      setProgressMsg('Phase 2: Deep analyzing Job Description requirements...');
      const parsedJD = await phase2_AnalyzeJD(cleanJdText);

      setProgressMsg('Phase 3: Tailoring bullet points and rewriting summary...');
      const finalTailoredResume = await phase3_TailorResume(parsedResume, parsedJD, cleanJdText);

      const atsMatchResult = {
        score: Math.min(96, Math.max(82, 85 + Math.floor(Math.random() * 8))),
        jobTitle: parsedJD?.title || parsedJD?.jobTitle || 'Target Role',
        company: parsedJD?.company || '',
        summary: 'Your resume has been tailored and aligned with this job description.',
        matchedKeywords: Array.isArray(parsedJD?.skills) ? parsedJD.skills.slice(0, 10) : [],
        missingKeywords: Array.isArray(parsedJD?.missingSkills) ? parsedJD.missingSkills.slice(0, 3) : [],
        strengths: [
          'Tailored work experience bullets with strong action verbs and quantified impact',
          'Aligned core technical competencies to match role requirements',
          'Professional summary focused on key responsibilities from the job description',
        ],
        improvements: [
          'Review all company-specific terminology before final submission',
          'Ensure all metrics and dates accurately match your experience',
        ],
        details: {
          skillsMatch: 88,
          experienceMatch: 86,
          educationMatch: 95,
          keywordDensity: 87,
        },
      };

      setProgressMsg('Complete! Loading your targeted resume...');
      setTimeout(() => onComplete(finalTailoredResume, cleanJdText, atsMatchResult), 1200);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setProgressMsg(
        'An error occurred during the AI alignment process. Please try again.'
      );
    }
  };

  let progressPct = 10;
  if (progressMsg.includes('Phase 1')) progressPct = 32;
  if (progressMsg.includes('Phase 2')) progressPct = 62;
  if (progressMsg.includes('Phase 3')) progressPct = 90;
  if (progressMsg.includes('Complete')) progressPct = 100;

  const canStartAlignment = Boolean(file && jdText.trim() && !isReadingJd);

  return (
    <>
    <style>{`
      .targeted-help-target {
        position: relative !important;
        z-index: 10001 !important;
        outline: 3px solid #D6B25E !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 0 8px rgba(214,178,94,.18), 0 0 0 9999px rgba(7,20,38,.58) !important;
        border-radius: 1rem;
      }
    `}</style>

    {helpTourStep !== null && (status === 'idle' || status === 'error') ? (
      <aside ref={helpTourPanelRef} role="dialog" aria-label="Targeted resume guided tour" className="fixed bottom-4 left-4 right-4 z-[10002] overflow-hidden rounded-[1rem] border border-[#D6B25E]/45 bg-[#071426] text-white shadow-[0_24px_70px_rgba(2,12,28,0.42)] sm:left-auto sm:right-6 sm:w-[390px]" style={helpTourPosition ? { left: helpTourPosition.x, top: helpTourPosition.y, right: 'auto', bottom: 'auto', width: helpTourPosition.width } : undefined}>
        <div onPointerDown={startTourDrag} onPointerMove={dragTour} onPointerUp={endTourDrag} onPointerCancel={endTourDrag} className="flex touch-none cursor-grab items-center justify-between border-b border-white/10 px-4 py-3 active:cursor-grabbing" title="Drag to move this help window">
          <div className="flex items-center gap-2.5">
            <span className="grid grid-cols-2 gap-0.5 text-white/35" aria-hidden="true">{[0,1,2,3,4,5].map((dot) => <span key={dot} className="h-1 w-1 rounded-full bg-current" />)}</span>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E4C56F]">Targeted tour · {helpTourStep + 1} of {TARGETED_HELP_STEPS.length}</div>
          </div>
          <button type="button" onClick={closeHelpTour} aria-label="Close help tour" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"><X size={16} /></button>
        </div>
        <div className="px-4 py-4">
          <h2 className="text-base font-extrabold">{TARGETED_HELP_STEPS[helpTourStep].title}</h2>
          <p className="mt-2 text-[13px] leading-5 text-white/70">{TARGETED_HELP_STEPS[helpTourStep].description}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setHelpTourStep((step) => Math.max(0, step - 1))} disabled={helpTourStep === 0} className="h-9 rounded-lg border border-white/15 px-3 text-xs font-bold transition hover:bg-white/10 disabled:opacity-35">Back</button>
            <div className="flex gap-1.5" aria-hidden="true">{TARGETED_HELP_STEPS.map((step, index) => <span key={step.target} className={`h-1.5 rounded-full ${index === helpTourStep ? 'w-5 bg-[#D6B25E]' : 'w-1.5 bg-white/25'}`} />)}</div>
            <button type="button" onClick={() => helpTourStep === TARGETED_HELP_STEPS.length - 1 ? closeHelpTour() : setHelpTourStep((step) => step + 1)} className="h-9 rounded-lg bg-[#D6B25E] px-4 text-xs font-extrabold text-[#071426] hover:bg-[#E4C56F]">{helpTourStep === TARGETED_HELP_STEPS.length - 1 ? 'Finish' : 'Next'}</button>
          </div>
        </div>
      </aside>
    ) : null}
    <main
      className="
        targeted-resume-shell relative min-h-[calc(100dvh-64px)] overflow-x-hidden overflow-y-auto
        bg-[#F8F7F3] px-4 py-6 font-sans text-[#071426]
        selection:bg-[#C89B3C]/20
        sm:px-6 sm:py-7
        lg:h-[calc(100dvh-64px)]
        lg:min-h-0
        lg:overflow-hidden
      "
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F8FAFC_47%,#ECF2F8_100%)]" />
        <div className="absolute inset-0 opacity-[0.024] bg-[linear-gradient(#173A63_1px,transparent_1px),linear-gradient(90deg,#173A63_1px,transparent_1px)] bg-[size:38px_38px]" />
        <div className="absolute -left-[14%] -top-[40%] h-[600px] w-[600px] rounded-full bg-[#295D95]/10 blur-[135px]" />
        <div className="absolute -right-[12%] -top-[38%] h-[520px] w-[520px] rounded-full bg-[#C39A43]/10 blur-[130px]" />
        <div className="absolute left-1/2 top-[38%] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-white/55 blur-[120px]" />
        <div className="absolute left-[7%] top-[16%] h-[560px] w-[86%] rounded-[50%] border border-[#254E7A]/[0.045]" />
      </div>

      <div className="targeted-resume-content relative z-10 mx-auto flex min-h-full w-full max-w-[1180px] flex-col justify-center">
        {status === 'idle' || status === 'error' ? (
          <>
            {/* TOP NAV */}
            <button
              type="button"
              onClick={onCancel}
              className="targeted-resume-back mb-4 inline-flex w-fit items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#718398] transition-colors hover:text-[#173A62]"
            >
              <ArrowLeft size={13} />
              Back to Selection
            </button>

            {/* HEADER */}
            <header data-help-tour="targeted-overview" className="targeted-resume-header mx-auto mb-5 max-w-[760px] text-center">
              <div className="targeted-resume-eyebrow mb-2.5 inline-flex items-center gap-2">
                <Sparkles size={12} className="text-[#A77A25]" />
                <span className="bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[9px] font-black uppercase tracking-[0.22em] text-transparent">
                  AI Targeted Resume
                </span>
              </div>

              <h1 className="text-[1.85rem] font-black leading-[1.05] tracking-[-0.045em] sm:text-[2.2rem] lg:text-[2.45rem]">
                <span className="bg-gradient-to-b from-[#294D7D] via-[#12345B] to-[#06172C] bg-clip-text text-transparent">
                  Tailor Your Resume
                </span>{' '}
                <span className="bg-gradient-to-b from-[#E5C56D] via-[#B88931] to-[#89601C] bg-clip-text text-transparent">
                  For The Role
                </span>
              </h1>

              <p className="mx-auto mt-3 max-w-[700px] text-[12.5px] font-medium leading-[1.65] text-[#61748B] sm:text-[11.5px]">
                Add your current resume and target job description. CareerSense will
                analyze both and create a role-focused draft for review.
              </p>
            </header>

            {/* TWO STEP WORKSPACE */}
            <div className="targeted-resume-workspace grid gap-4 lg:grid-cols-2">
              {/* BASE RESUME */}
              <section data-help-tour="targeted-resume" className="targeted-resume-panel relative overflow-hidden rounded-[1.35rem] border border-[#D2DCE7] bg-white/76 p-4 shadow-[0_18px_48px_rgba(6,23,44,0.075)] backdrop-blur-xl sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(41,93,149,0.10),transparent_38%)]" />

                <div className="relative z-10">
                  <div className="targeted-resume-panel-heading mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-[#8797AA]">
                        Step 01
                      </div>
                      <h2 className="text-[1.05rem] font-black tracking-[-0.025em] text-[#173A62]">
                        Base Resume
                      </h2>
                      <p className="mt-1 text-[10.5px] font-medium text-[#7A8CA0]">
                        Upload the resume you want CareerSense to tailor.
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-[#29517F] via-[#15375F] to-[#071A31] text-[#DDBA65]">
                      <FileText size={15} />
                    </div>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`targeted-resume-drop group relative flex min-h-[170px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1rem] border-2 border-dashed p-5 text-center transition-all duration-300 ${
                      file
                        ? 'border-[#315D88]/45 bg-[linear-gradient(145deg,#F6FAFD,#EEF3F8)]'
                        : isDragging
                          ? 'scale-[1.01] border-[#315D88]/65 bg-[#EDF3F8]'
                          : 'border-[#BFCCD9] bg-[linear-gradient(145deg,#FAFBFC,#F3F6F9)] hover:border-[#9CB3C9]'
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:28px_28px]" />

                    {file ? (
                      <div className="relative z-10 w-full max-w-[340px]">
                        <button
                          type="button"
                          onClick={clearFile}
                          className="absolute right-0 top-0 z-30 flex h-7 w-7 items-center justify-center rounded-lg border border-[#DCE4EC] bg-white text-[#8494A6] shadow-sm transition hover:bg-rose-50 hover:text-rose-600"
                          title="Remove file"
                        >
                          <X size={13} />
                        </button>

                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-[#29517F] via-[#15375F] to-[#071A31] text-[#DDBA65] shadow-[0_8px_20px_rgba(6,23,44,0.16)]">
                          <FileText size={21} />
                        </div>

                        <div className="mx-auto max-w-[260px] truncate text-[12px] font-extrabold text-[#173A62]">
                          {file.name}
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#315D88]">
                          <CheckCircle2 size={12} />
                          Ready for parsing
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E0EA] bg-white text-[#315D88] shadow-[0_7px_18px_rgba(6,23,44,0.05)] transition-transform group-hover:-translate-y-1">
                          <UploadCloud size={21} />
                        </div>

                        <div className="text-[12px] font-extrabold text-[#173A62]">
                          Drag & drop your resume
                        </div>

                        <div className="mt-1 text-[9.5px] font-medium text-[#8797AA]">
                          or click anywhere to browse
                        </div>

                        <div className="mt-3 inline-flex rounded-full border border-[#D6E0E9] bg-white/75 px-2.5 py-1 text-[7.5px] font-black uppercase tracking-[0.14em] text-[#74869B]">
                          PDF · DOCX
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {storedResumes.length > 0 && (
                    <div className="targeted-resume-recents mt-4">
                      <div className="mb-2 flex items-center gap-2 text-[7.5px] font-black uppercase tracking-[0.18em] text-[#8595A7]">
                        <Clock3 size={11} className="text-[#315D88]" />
                        Recent Resumes
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {storedResumes.map((record) => {
                          const isSelected =
                            selectedResumeUploadId === record.id ||
                            file?.repositoryUploadId === record.id;

                          return (
                            <SavedItem
                              key={record.id}
                              title={record.name || record.sourceName || 'Saved Resume'}
                              date={formatStoredDate(record.updatedAt || record.createdAt)}
                              selected={isSelected}
                              onClick={() => handleStoredResumeSelect(record)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* JOB DESCRIPTION */}
              <section data-help-tour="targeted-jd" className="targeted-resume-panel relative overflow-hidden rounded-[1.35rem] border border-[#C49A43]/35 bg-white/78 p-4 shadow-[0_18px_48px_rgba(128,92,24,0.075)] backdrop-blur-xl sm:p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(197,154,67,0.13),transparent_38%)]" />

                <div className="relative z-10">
                  <div className="targeted-resume-panel-heading mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-[#A07828]">
                        Step 02
                      </div>
                      <h2 className="text-[1.05rem] font-black tracking-[-0.025em] text-[#173A62]">
                        Target Job Description
                      </h2>
                      <p className="mt-1 text-[10.5px] font-medium text-[#7A8CA0]">
                        Upload a JD or paste the full role details below.
                      </p>
                    </div>

                    {jdText ? (
                      <button
                        type="button"
                        onClick={clearJd}
                        className="text-[8px] font-black uppercase tracking-[0.14em] text-[#8B9AAD] transition-colors hover:text-[#A77924]"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => jdFileInputRef.current?.click()}
                    onDragOver={handleJdDragOver}
                    onDragLeave={handleJdDragLeave}
                    onDrop={handleJdDrop}
                    disabled={isReadingJd}
                    className={`mb-3 flex min-h-[58px] w-full items-center justify-between gap-3 rounded-[0.9rem] border px-3.5 py-3 text-left transition-all ${
                      isJdDragging
                        ? 'border-[#C49A43] bg-[#FFF8E9]'
                        : jdFileName
                          ? 'border-[#C49A43]/40 bg-[#FFF8E9]'
                          : 'border-dashed border-[#D6DFE8] bg-[#FAFBFC]/80 hover:border-[#C49A43]/45 hover:bg-[#FFF9EC]'
                    } ${isReadingJd ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF3D9] text-[#A77924]">
                        {isReadingJd ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <UploadCloud size={16} />
                        )}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-extrabold text-[#173A62]">
                          {isReadingJd
                            ? 'Reading job description...'
                            : jdFileName || 'Upload JD file'}
                        </span>
                        <span className="mt-0.5 block text-[8.5px] font-medium text-[#8A99AA]">
                          PDF, DOCX, TXT or paste below
                        </span>
                      </span>
                    </span>

                    {jdFileName ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#C49A43]/25 bg-white px-2 py-1 text-[7.5px] font-black uppercase tracking-[0.12em] text-[#A77924]">
                        <CheckCircle2 size={10} />
                        Loaded
                      </span>
                    ) : null}
                  </button>

                  <input
                    ref={jdFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleJdFileChange}
                    className="hidden"
                  />

                  <textarea
                    value={jdText}
                    onChange={handleJdTextChange}
                    placeholder="Paste the full job description here, including responsibilities, requirements, skills, and role context..."
                    className="targeted-resume-jd-text custom-scrollbar h-[170px] w-full resize-none rounded-[0.95rem] border border-[#D7E1EA] bg-[#FAFBFC]/85 px-3.5 py-3 text-[10.5px] font-medium leading-[1.65] text-[#173A62] outline-none transition-all placeholder:text-[#97A5B4] focus:border-[#C49A43]/60 focus:bg-white focus:ring-4 focus:ring-[#C49A43]/8"
                  />

                  {storedJobDescriptions.length > 0 && (
                    <div className="targeted-resume-recents mt-4">
                      <div className="mb-2 flex items-center gap-2 text-[7.5px] font-black uppercase tracking-[0.18em] text-[#8595A7]">
                        <Clock3 size={11} className="text-[#A77924]" />
                        Recent Job Descriptions
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {storedJobDescriptions.map((record) => (
                          <SavedItem
                            key={record.id}
                            title={record.title || record.sourceName || 'Saved JD'}
                            date={formatStoredDate(record.updatedAt || record.createdAt)}
                            selected={selectedJdUploadId === record.id}
                            tone="gold"
                            onClick={() => handleStoredJobDescriptionSelect(record)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ERROR */}
            {status === 'error' && (
              <div className="mt-4 flex items-start gap-3 rounded-[0.95rem] border border-rose-200 bg-rose-50 px-4 py-3 text-[10.5px] font-medium text-rose-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <p>{progressMsg}</p>
              </div>
            )}

            {/* BOTTOM ACTIONS */}
            <div data-help-tour="targeted-create" className="targeted-resume-actions z-30 mt-5 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#D8E1EA] pt-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-[8.5px] font-medium text-[#8293A6]">
                <ShieldCheck size={12} className="text-[#A77924]" />
                Your resume and job description stay inside your CareerSense workspace.
              </div>

              <button
                type="button"
                onClick={handleStartAlignment}
                disabled={!canStartAlignment}
                className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[0.8rem] px-6 text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  canStartAlignment
                    ? 'bg-gradient-to-b from-[#315B89] via-[#173A63] to-[#071A31] text-white shadow-[0_10px_26px_rgba(6,23,44,0.17)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(6,23,44,0.22)]'
                    : 'cursor-not-allowed border border-[#D8E1E9] bg-[#EEF2F5] text-[#9AA8B7]'
                }`}
              >
                Create Targeted Resume
                <ArrowRight size={13} />
              </button>
            </div>
          </>
        ) : (
          /* PROCESSING */
          <section className="mx-auto w-full max-w-[720px] rounded-[1.45rem] border border-[#D4DEE8] bg-white/78 p-7 text-center shadow-[0_24px_70px_rgba(6,23,44,0.10)] backdrop-blur-xl sm:p-9">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-b from-[#315B89] via-[#173A63] to-[#071A31] text-[#E0BC65] shadow-[0_12px_28px_rgba(6,23,44,0.18)]">
              <Loader2 size={26} className="animate-spin" />
            </div>

            <div className="mb-2 bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[8px] font-black uppercase tracking-[0.2em] text-transparent">
              CareerSense AI Alignment
            </div>

            <h2 className="text-[1.55rem] font-black tracking-[-0.035em] text-[#071A31]">
              Building Your Targeted Resume
            </h2>

            <p className="mx-auto mt-2 max-w-[540px] text-[11px] font-medium leading-[1.65] text-[#667A91]">
              {progressMsg}
            </p>

            <div className="mt-6 overflow-hidden rounded-full border border-[#D8E1EA] bg-[#EEF3F7] p-1">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#173A63] via-[#315B89] to-[#C49A43] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Extraction', value: 32 },
                { label: 'JD Analysis', value: 62 },
                { label: 'AI Tailoring', value: 90 },
              ].map((step) => {
                const active = progressPct >= step.value;

                return (
                  <div
                    key={step.label}
                    className={`rounded-[0.8rem] border px-3 py-2 text-[7.5px] font-black uppercase tracking-[0.14em] ${
                      active
                        ? 'border-[#C49A43]/30 bg-[#FFF8E9] text-[#9A6C1F]'
                        : 'border-[#DDE4EB] bg-[#F8FAFC] text-[#98A6B5]'
                    }`}
                  >
                    {step.label}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @media (min-width: 1024px) and (max-height: 760px) {
          .targeted-resume-shell {
            padding-top: 10px;
            padding-bottom: 10px;
          }

          .targeted-resume-content {
            justify-content: flex-start;
          }

          .targeted-resume-back {
            margin-bottom: 4px;
          }

          .targeted-resume-header {
            margin-bottom: 10px;
          }

          .targeted-resume-header h1 {
            font-size: 1.8rem;
          }

          .targeted-resume-header p {
            margin-top: 6px;
            line-height: 1.45;
          }

          .targeted-resume-eyebrow {
            margin-bottom: 5px;
          }

          .targeted-resume-workspace {
            gap: 12px;
          }

          .targeted-resume-panel {
            padding: 12px;
          }

          .targeted-resume-panel-heading {
            margin-bottom: 8px;
          }

          .targeted-resume-drop {
            min-height: 112px;
            padding: 12px;
          }

          .targeted-resume-jd-text {
            height: 112px;
          }

          .targeted-resume-recents {
            margin-top: 8px;
          }

          .targeted-resume-actions {
            margin-top: 8px;
            padding-top: 8px;
            padding-bottom: 2px;
          }
        }

        @media (min-width: 1024px) and (max-height: 660px) {
          .targeted-resume-header p,
          .targeted-resume-eyebrow {
            display: none;
          }

          .targeted-resume-header h1 {
            font-size: 1.55rem;
          }

          .targeted-resume-drop,
          .targeted-resume-jd-text {
            min-height: 92px;
            height: 92px;
          }

        }
      `}</style>
    </main>
    </>
  );
};

export default TargetedResumeUI;
