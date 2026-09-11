import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  HelpCircle,
  History,
  Lightbulb,
  Loader2,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { generateInterviewPrep } from '../../services/groqService';

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

const InterviewPrepModal = ({
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
      const saved = existingEntry?.result || (existingEntry?.questions ? existingEntry : null);
      if (saved) {
        setResults(saved);
        setError('');
        setLoading(false);
        return;
      }

      if (!allowRerun) {
        setError('No saved Interview Prep found for this resume.');
        setLoading(false);
        return;
      }

      if (!jdText || jdText.trim() === '') {
        setError(
          'Please paste a Job Description in the Editor first to generate targeted interview questions.'
        );
        return;
      }

      if (!results) {
        runPrep();
      }
    } else {
      setResults(null);
      setError('');
      setLoading(false);
    }
  }, [existingEntry, isOpen, jdText, allowRerun]);

  const runPrep = async () => {
    if (!jdText || jdText.trim() === '') {
      setError(
        'Please paste a Job Description in the Editor first to generate targeted interview questions.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await generateInterviewPrep(resumeData, jdText);
      setResults(data);
      onResults?.(data);
    } catch (err) {
      setError('Failed to generate Interview Prep. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const latestResultLabel = existingEntry?.createdAt
    ? `Latest saved prep from ${formatDateTime(existingEntry.createdAt)}`
    : '';

  const questionCount = results?.questions?.length || 0;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#071426]/45 p-3 font-sans backdrop-blur-[6px] sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[1.35rem] border border-white/60 bg-white shadow-[0_32px_90px_rgba(7,20,38,0.28)]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#DCE4EC] bg-white px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.8rem] border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#9A7225]">
              <MessageSquare size={19} />
            </div>

            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A87922]">
                Interview Intelligence
              </div>
              <h3 className="mt-0.5 truncate text-[18px] font-black tracking-tight text-[#173A62]">
                AI Interview Coach
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.72rem] border border-[#D7E1EA] bg-[#F8FAFC] text-[#708398] transition-all hover:border-[#C3CFDB] hover:bg-white hover:text-[#173A62]"
            aria-label="Close interview prep"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[linear-gradient(rgba(18,59,109,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.025)_1px,transparent_1px),linear-gradient(180deg,#F8FAFC_0%,#F3F6F9_100%)] bg-[size:30px_30px,30px_30px,auto] p-4 custom-scrollbar sm:p-5">
          {error ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="w-full max-w-[540px] rounded-[1rem] border border-rose-200 bg-white p-6 text-center shadow-[0_8px_24px_rgba(190,18,60,0.06)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <AlertCircle size={24} />
                </div>

                <h4 className="mt-4 text-[16px] font-black text-[#173A62]">
                  Interview prep could not start
                </h4>

                <p className="mx-auto mt-2 max-w-[440px] text-[13px] leading-6 text-[#657A8F]">
                  {error}
                </p>

                {jdText?.trim() ? (
                  <button
                    type="button"
                    onClick={runPrep}
                    className="mt-5 inline-flex items-center gap-2 rounded-[0.72rem] bg-[#123B6D] px-4 py-2.5 text-[12px] font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0D315D]"
                  >
                    <RotateCcw size={15} />
                    Try Again
                  </button>
                ) : null}
              </div>
            </div>
          ) : loading ? (
            <div className="flex min-h-[390px] items-center justify-center">
              <div className="w-full max-w-[560px] text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#123B6D]/10 blur-xl" />
                  <div className="absolute inset-[4px] rounded-full border border-[#C7D7E6] bg-white shadow-[0_8px_24px_rgba(15,43,75,0.08)]" />
                  <Loader2
                    size={31}
                    className="relative z-10 animate-spin text-[#123B6D]"
                  />
                </div>

                <div className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A87922]">
                  Preparing Interview Strategy
                </div>

                <h4 className="mt-2 text-[19px] font-black tracking-tight text-[#173A62]">
                  Predicting the questions most likely to come up
                </h4>

                <p className="mx-auto mt-2 max-w-[470px] text-[12px] leading-5 text-[#6B7E92]">
                  Analyzing your resume, target role and job description to build a focused interview plan.
                </p>

                <div className="mx-auto mt-5 grid max-w-[500px] grid-cols-3 gap-2">
                  {['Role Signals', 'Question Themes', 'STAR Strategy'].map((item) => (
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
          ) : results?.questions ? (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              {existingEntry?.result ? (
                <div className="mb-4 rounded-[0.9rem] border border-[#C8D9E8] bg-[#EEF5FB] px-3.5 py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border border-[#C8D9E8] bg-white text-[#123B6D]">
                      <History size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-black text-[#173A62]">
                        Showing your latest saved interview prep
                      </div>
                      <p className="mt-0.5 text-[11px] leading-5 text-[#55718D]">
                        {latestResultLabel ||
                          'These questions were already generated for the current resume and job description.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Summary strip */}
              <div className="mb-4 grid gap-3 md:grid-cols-[240px_minmax(0,1fr)]">
                <div className="rounded-[1rem] border border-[#173A62] bg-[linear-gradient(150deg,#071426_0%,#102D4F_58%,#173F69_100%)] p-4 text-white shadow-[0_12px_28px_rgba(7,20,38,0.15)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#E1BC68]">
                        Interview Plan
                      </div>
                      <div className="mt-1 text-[11px] font-medium text-white/55">
                        Targeted for this role
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-[0.72rem] border border-white/10 bg-white/[0.07] text-[#E1BC68]">
                      <Target size={17} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    <div className="text-[38px] font-black leading-none">
                      {questionCount}
                    </div>
                    <div className="pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
                      Questions
                    </div>
                  </div>

                  <div className="mt-3 rounded-[0.75rem] border border-white/10 bg-white/[0.06] px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <Brain
                        size={14}
                        className="mt-0.5 shrink-0 text-[#E1BC68]"
                      />
                      <p className="text-[10px] leading-4 text-white/60">
                        Use the strategy notes to shape your own authentic answer rather than memorizing a script.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1rem] border border-[#D9E3EC] bg-white p-4 shadow-[0_5px_16px_rgba(15,43,75,0.04)]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#9A7225]">
                      <Sparkles size={15} />
                    </div>

                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#A87922]">
                        How to use this prep
                      </div>

                      <h4 className="mt-1 text-[15px] font-black text-[#173A62]">
                        Practice the reasoning behind each answer
                      </h4>

                      <p className="mt-1.5 text-[12px] leading-5 text-[#5E7389]">
                        Each question includes the likely interviewer intent and a suggested STAR direction so you can prepare concise, evidence-based responses.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          'Understand intent',
                          'Prepare evidence',
                          'Structure with STAR',
                        ].map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE4EC] bg-[#F8FAFC] px-2.5 py-1 text-[9px] font-bold text-[#657A8F]"
                          >
                            <CheckCircle2
                              size={10}
                              className="text-[#123B6D]"
                            />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {results.questions.map((q, i) => (
                  <article
                    key={i}
                    className="overflow-hidden rounded-[1rem] border border-[#D9E3EC] bg-white shadow-[0_5px_16px_rgba(15,43,75,0.045)]"
                  >
                    <div className="flex items-start gap-3 border-b border-[#E4EAF0] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAFBFC_100%)] px-4 py-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border border-[#D7B35C]/40 bg-[#FFF8E8] text-[10px] font-black text-[#9A7225]">
                        Q{i + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8999A9]">
                          Predicted Interview Question
                        </div>
                        <h4 className="mt-1 text-[14px] font-black leading-5 text-[#173A62]">
                          {q.question}
                        </h4>
                      </div>
                    </div>

                    <div className="grid gap-3 p-4 lg:grid-cols-2">
                      <div className="rounded-[0.85rem] border border-[#DCE4EC] bg-[#F8FAFC] p-3.5">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#6D8195]">
                          <HelpCircle
                            size={13}
                            className="text-[#123B6D]"
                          />
                          Why they ask this
                        </div>

                        <p className="mt-2 text-[12px] font-medium leading-5 text-[#50667D]">
                          {q.why_they_ask_this}
                        </p>
                      </div>

                      <div className="rounded-[0.85rem] border border-[#E5D19C] bg-[#FFF9EC] p-3.5">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#9A7225]">
                          <Lightbulb size={13} />
                          Suggested STAR Strategy
                        </div>

                        <p className="mt-2 text-[12px] font-medium leading-5 text-[#5A4A2D]">
                          {q.suggested_strategy}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {allowRerun && jdText?.trim() ? (
                <div className="mt-4 flex flex-col-reverse items-stretch justify-between gap-3 rounded-[0.9rem] border border-[#DCE4EC] bg-white px-3.5 py-3 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-2 text-[11px] leading-5 text-[#708398]">
                    <MessageSquare
                      size={15}
                      className="mt-0.5 shrink-0 text-[#123B6D]"
                    />
                    <span>
                      Re-run after changing your resume or target job description to refresh the predicted questions.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={runPrep}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[0.72rem] border border-[#D7B35C]/45 bg-[#FFF8E8] px-4 py-2.5 text-[11px] font-extrabold text-[#8D651F] transition-all hover:-translate-y-0.5 hover:border-[#C49A43] hover:bg-[#FFF3D4]"
                  >
                    <RotateCcw size={15} />
                    {existingEntry?.result
                      ? 'Generate Interview Prep Again'
                      : 'Refresh Interview Prep'}
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

export default InterviewPrepModal;
