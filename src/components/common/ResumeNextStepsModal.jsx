import React from 'react';
import { createPortal } from 'react-dom';
import { 
  FileCheck2, 
  ScrollText, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  X 
} from 'lucide-react';

export default function ResumeNextStepsModal({
  isOpen,
  onClose,
  targetRole = '',
  candidateName = '',
}) {
  if (!isOpen) return null;

  const roleText = targetRole || 'your target role';
  const encodedRole = encodeURIComponent(targetRole || '');

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Editorial Obsidian Backdrop */}
      <div
        className="fixed inset-0 bg-[#071426]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card in Obsidian & Champagne Gold Palette */}
      <div 
        className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-[#FFFFFF] border border-[#B9964A]/40 p-6 sm:p-8 shadow-2xl transition-all my-auto text-[#071426]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-next-steps-title"
      >
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B9964A] via-[#E5C378] to-[#071426]" />

        {/* Subtle Gold Aura */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#B9964A]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#123B6D]/10 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 hover:bg-[#F8F6F2] hover:text-[#071426] transition"
          aria-label="Close recommendations"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Title and Status Box */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pr-8">
          <div className="flex-1">
            {/* Top pill indicator */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#8C6D23]">
              <span className="h-2 w-2 rounded-full bg-[#B9964A]" />
              <span>Resume saved successfully</span>
            </div>

            {/* Main Title */}
            <h2
              id="resume-next-steps-title"
              className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[#071426]"
            >
              {candidateName ? `Your resume is ready, ${candidateName}.` : 'Your resume is ready.'}
            </h2>

            {/* Subtitle */}
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Formatted with recruiter-tested templates. Explore these practical next steps before applying.
            </p>
          </div>

          {/* Right Status Box */}
          <div className="flex shrink-0 self-start sm:self-auto items-center justify-center rounded-2xl bg-[#F8F6F2] border border-[#B9964A]/30 px-6 py-3.5 text-center min-w-[125px]">
            <div>
              <div className="text-3xl font-black text-[#071426] leading-none">
                100%
              </div>
              <div className="mt-1.5 text-[9.5px] font-extrabold uppercase tracking-widest text-[#8C6D23]">
                Ready to apply
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="mt-6 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
          <span>Recommended Next Steps</span>
          <span className="text-slate-400 font-semibold normal-case tracking-normal text-xs">3 career tools</span>
        </div>

        {/* Recommendation Cards */}
        <div className="mt-3.5 space-y-3">
          {/* Recommendation 1: ATS Score Checker */}
          <div className="group rounded-2xl border border-[#B9964A]/40 bg-white p-4 sm:p-5 shadow-xs transition hover:border-[#B9964A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071426] text-[#B9964A] shadow-xs">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#071426]">Audit with ATS Score Checker</span>
                    <span className="rounded-full bg-[#B9964A]/15 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-[#8C6D23] border border-[#B9964A]/30">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-lg">
                    Check your ATS score and keyword match against recruiter criteria before applying.
                  </p>
                </div>
              </div>

              <a
                href={`https://ats.careersenseai.com/${encodedRole ? `?role=${encodedRole}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#071426] hover:bg-[#123B6D] px-4 py-2.5 text-xs font-bold text-white shadow-xs active:scale-95 transition"
              >
                <span>Run ATS scan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Recommendation 2: Cover Letter Builder */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#123B6D]">
                  <ScrollText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#071426]">Create a tailored cover letter</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-blue-800 border border-blue-200/60">
                      CAREER TOOL
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-lg">
                    Introduce your strengths with a cover letter tailored to the role and your resume.
                  </p>
                </div>
              </div>

              <a
                href={`https://coverletter.careersenseai.com/${encodedRole ? `?role=${encodedRole}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#071426] shadow-xs hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition"
              >
                <span>Write cover letter</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Recommendation 3: Career GPS (100% Free) */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <Compass className="h-5 w-5 text-amber-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#071426]">Explore your Career GPS</span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-amber-800 border border-amber-200/60">
                      FREE CAREER TOOL
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-lg">
                    Understand your career readiness, explore role benchmarks, and plan your next steps.
                  </p>
                </div>
              </div>

              <a
                href="https://careersenseai.com/career-gps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#071426] shadow-xs hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition"
              >
                <span>Explore Career GPS</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Helper Note Banner */}
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#B9964A]" />
          <span>Choose the tools that fit your goals. Your full resume remains saved in your dashboard.</span>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#071426] hover:underline transition"
          >
            Continue editing resume
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-[#071426] hover:bg-[#123B6D] px-5 py-2.5 text-xs font-extrabold text-white border border-[#B9964A]/30 shadow-sm active:scale-95 transition"
          >
            Close & continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
