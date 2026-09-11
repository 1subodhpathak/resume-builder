import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  History,
  Loader2,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { calculateATSScore } from '../../services/groqService';

const formatDateTime = (value) => {
  if (!value) return '';

  try {
    return new Date(value).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch (error) {
    return value;
  }
};

const scoreMeta = (score = 0) => {
  if (score >= 80) {
    return {
      label: 'Strong Match',
      accent: '#123B6D',
      soft: '#EEF5FB',
      border: '#C8D9E8',
      text: '#173A62',
      description: 'Your resume is strongly aligned with this role.',
    };
  }

  if (score >= 60) {
    return {
      label: 'Good Foundation',
      accent: '#B9964A',
      soft: '#FFF8E8',
      border: '#E5D19C',
      text: '#8D651F',
      description: 'You have a solid base with a few important gaps to close.',
    };
  }

  return {
    label: 'Needs Attention',
    accent: '#E11D48',
    soft: '#FFF1F2',
    border: '#FECDD3',
    text: '#BE123C',
    description: 'Several important role signals are still missing.',
  };
};

const KeywordPill = ({ children, tone = 'matched' }) => {
  const matched = tone === 'matched';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        matched
          ? 'border-[#C8D9E8] bg-white text-[#173A62]'
          : 'border-rose-200 bg-white text-rose-600'
      }`}
    >
      {children}
    </span>
  );
};

const ATSScoreModal = ({
  isOpen,
  onClose,
  resumeData,
  jdText,
  onResults,
  existingEntry = null,
  allowRerun = true,
}) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = existingEntry?.result || (typeof existingEntry?.score === 'number' ? existingEntry : null);
      if (saved) {
        setResults(saved);
        setError('');
        setLoading(false);
        return;
      }

      if (!allowRerun) {
        setError('No saved ATS scan found for this resume.');
        setLoading(false);
        return;
      }

      if (!jdText || jdText.trim() === '') {
        setError(
          'Please paste a Job Description in the Editor first to calculate your match score.'
        );
        return;
      }

      if (!results) {
        runScan();
      }
    } else {
      setResults(null);
      setError('');
      setLoading(false);
    }
  }, [existingEntry, isOpen, jdText, allowRerun]);

  const runScan = async () => {
    if (!jdText || jdText.trim() === '') {
      setError(
        'Please paste a Job Description in the Editor first to calculate your match score.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await calculateATSScore(resumeData, jdText);
      setResults(data);
      onResults?.(data);
    } catch (err) {
      setError('Failed to run ATS Scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const latestResultLabel = existingEntry?.createdAt
    ? `Latest saved scan from ${formatDateTime(existingEntry.createdAt)}`
    : '';

  const meta = scoreMeta(results?.score || 0);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#071426]/45 p-3 backdrop-blur-[6px] sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[1.35rem] border border-white/60 bg-white shadow-[0_32px_90px_rgba(7,20,38,0.28)]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#DCE4EC] bg-white px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.8rem] border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#9A7225]">
              <ScanLine size={19} />
            </div>

            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A87922]">
                Resume Intelligence
              </div>
              <h3 className="mt-0.5 truncate text-[18px] font-black tracking-tight text-[#173A62]">
                Live ATS Scan
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.72rem] border border-[#D7E1EA] bg-[#F8FAFC] text-[#708398] transition-all hover:border-[#C3CFDB] hover:bg-white hover:text-[#173A62]"
            aria-label="Close ATS scan"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[linear-gradient(rgba(18,59,109,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.025)_1px,transparent_1px),linear-gradient(180deg,#F8FAFC_0%,#F3F6F9_100%)] bg-[size:30px_30px,30px_30px,auto] p-4 custom-scrollbar sm:p-5">
          {error ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="w-full max-w-[520px] rounded-[1rem] border border-rose-200 bg-white p-6 text-center shadow-[0_8px_24px_rgba(190,18,60,0.06)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <AlertCircle size={24} />
                </div>

                <h4 className="mt-4 text-[16px] font-black text-[#173A62]">
                  ATS scan could not start
                </h4>

                <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-6 text-[#657A8F]">
                  {error}
                </p>

                {jdText?.trim() ? (
                  <button
                    type="button"
                    onClick={runScan}
                    className="mt-5 inline-flex items-center gap-2 rounded-[0.72rem] bg-[#123B6D] px-4 py-2.5 text-[12px] font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0D315D]"
                  >
                    <RotateCcw size={15} />
                    Try Again
                  </button>
                ) : null}
              </div>
            </div>
          ) : loading ? (
            <div className="flex min-h-[380px] items-center justify-center">
              <div className="w-full max-w-[540px] text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#123B6D]/10 blur-xl" />
                  <div className="absolute inset-[4px] rounded-full border border-[#C7D7E6] bg-white shadow-[0_8px_24px_rgba(15,43,75,0.08)]" />
                  <Loader2
                    size={31}
                    className="relative z-10 animate-spin text-[#123B6D]"
                  />
                </div>

                <div className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A87922]">
                  Analyzing Job Match
                </div>

                <h4 className="mt-2 text-[19px] font-black tracking-tight text-[#173A62]">
                  Scanning your resume against the job description
                </h4>

                <p className="mx-auto mt-2 max-w-[460px] text-[12px] leading-5 text-[#6B7E92]">
                  Checking keyword coverage, role alignment and ATS-relevant signals.
                </p>

                <div className="mx-auto mt-5 grid max-w-[440px] grid-cols-3 gap-2">
                  {['Structure', 'Keywords', 'Role Match'].map((item) => (
                    <div
                      key={item}
                      className="rounded-[0.7rem] border border-[#DCE4EC] bg-white px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#71849A]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : results ? (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              {existingEntry?.result ? (
                <div className="mb-4 rounded-[0.9rem] border border-[#C8D9E8] bg-[#EEF5FB] px-3.5 py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border border-[#C8D9E8] bg-white text-[#123B6D]">
                      <History size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-black text-[#173A62]">
                        Showing your latest saved ATS result
                      </div>
                      <p className="mt-0.5 text-[11px] leading-5 text-[#55718D]">
                        {latestResultLabel ||
                          'This score was already generated for the current resume and job description.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 lg:grid-cols-[270px_minmax(0,1fr)]">
                {/* Score panel */}
                <div className="rounded-[1rem] border border-[#173A62] bg-[linear-gradient(150deg,#071426_0%,#102D4F_58%,#173F69_100%)] p-5 text-white shadow-[0_14px_30px_rgba(7,20,38,0.16)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#E1BC68]">
                        ATS Match Score
                      </div>
                      <div className="mt-1 text-[11px] font-medium text-white/55">
                        Resume vs. target role
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-[0.72rem] border border-white/10 bg-white/[0.07] text-[#E1BC68]">
                      <Target size={17} />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-center">
                    <div className="relative flex h-[138px] w-[138px] items-center justify-center">
                      <svg
                        className="absolute inset-0 h-full w-full -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path
                          className="text-white/10"
                          strokeWidth="2.6"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          strokeDasharray={`${results.score}, 100`}
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          stroke="#E1BC68"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>

                      <div className="text-center">
                        <div className="text-[38px] font-black leading-none text-white">
                          {results.score}
                        </div>
                        <div className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-white/45">
                          out of 100
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-[0.75rem] border border-white/10 bg-white/[0.06] px-3 py-2.5 text-center">
                    <div className="text-[11px] font-black text-[#E6C978]">
                      {meta.label}
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-white/55">
                      {meta.description}
                    </p>
                  </div>
                </div>

                {/* Main feedback */}
                <div className="space-y-4">
                  <div className="rounded-[1rem] border border-[#D9E3EC] bg-white p-4 shadow-[0_5px_16px_rgba(15,43,75,0.04)]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#9A7225]">
                        <Sparkles size={15} />
                      </div>

                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#A87922]">
                          ATS Feedback
                        </div>
                        <p className="mt-1.5 text-[13px] leading-6 text-[#50667D]">
                          {results.feedback}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1rem] border border-[#C9D9E8] bg-[#EEF5FB] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#173A62]">
                          <CheckCircle2 size={14} />
                          Matched Skills
                        </h4>

                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-[#173A62] shadow-sm">
                          {(results.matched_keywords || results.matchedKeywords)?.length || 0}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {((results.matched_keywords || results.matchedKeywords) || []).length > 0 ? (
                          (results.matched_keywords || results.matchedKeywords).map((kw, i) => (
                            <KeywordPill key={`${kw}-${i}`}>
                              {kw}
                            </KeywordPill>
                          ))
                        ) : (
                          <span className="text-[11px] italic text-[#6F8296]">
                            No matches found.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-rose-200 bg-rose-50/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-rose-700">
                          <TrendingUp size={14} />
                          Skills to Strengthen
                        </h4>

                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-rose-600 shadow-sm">
                          {(results.missing_keywords || results.missingKeywords)?.length || 0}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {((results.missing_keywords || results.missingKeywords) || []).length > 0 ? (
                          (results.missing_keywords || results.missingKeywords).map((kw, i) => (
                            <KeywordPill
                              key={`${kw}-${i}`}
                              tone="missing"
                            >
                              {kw}
                            </KeywordPill>
                          ))
                        ) : (
                          <span className="text-[11px] italic text-[#6F8296]">
                            You hit all the important keywords.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {allowRerun && jdText?.trim() ? (
                <div className="mt-4 flex flex-col-reverse items-stretch justify-between gap-3 rounded-[0.9rem] border border-[#DCE4EC] bg-white px-3.5 py-3 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-2 text-[11px] leading-5 text-[#708398]">
                    <ShieldCheck
                      size={15}
                      className="mt-0.5 shrink-0 text-[#123B6D]"
                    />
                    <span>
                      Re-run after updating your resume or target job description.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={runScan}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[0.72rem] border border-[#D7B35C]/45 bg-[#FFF8E8] px-4 py-2.5 text-[11px] font-extrabold text-[#8D651F] transition-all hover:-translate-y-0.5 hover:border-[#C49A43] hover:bg-[#FFF3D4]"
                  >
                    <RotateCcw size={15} />
                    {existingEntry?.result
                      ? 'Run ATS Scan Again'
                      : 'Refresh ATS Scan'}
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ATSScoreModal;
