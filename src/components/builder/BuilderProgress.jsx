import React from 'react';
import { CheckCircle2, FileUp, PencilLine, LayoutTemplate, Download } from 'lucide-react';

const DEFAULT_STUDIO_STEPS = [
  { id: 'import', label: 'Import', icon: FileUp },
  { id: 'review', label: 'Review', icon: PencilLine },
  { id: 'template', label: 'Template', icon: LayoutTemplate },
  { id: 'edit', label: 'Edit', icon: CheckCircle2 },
  { id: 'export', label: 'Export', icon: Download },
];

const SCRATCH_STUDIO_STEPS = [
  { id: 'template', label: 'Template', icon: LayoutTemplate },
  { id: 'edit', label: 'Edit', icon: CheckCircle2 },
  { id: 'export', label: 'Export', icon: Download },
];

export const getBuilderSteps = (mode = 'upload') => (
  mode === 'scratch' ? SCRATCH_STUDIO_STEPS : DEFAULT_STUDIO_STEPS
);

const BuilderProgress = ({
  current = 'review',
  className = '',
  compact = false,
  minimal = false,
  inline = false,
  showCounter = true,
  mode = 'upload',
  steps: providedSteps,
}) => {
  const steps = providedSteps || getBuilderSteps(mode);
  const currentIndex = Math.max(
    steps.findIndex((step) => step.id === current),
    0
  );

  if (inline) {
    return (
      <div className={`flex items-center gap-1.5 whitespace-nowrap ${className}`}>
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8rem] font-black uppercase tracking-[0.12em] whitespace-nowrap transition-all ${
                isCurrent
                  ? 'border-[#B7C4D5] bg-[#E8EEF7] text-[#071426]'
                  : isCompleted
                    ? 'border-[#B9964A]/30 bg-[#B9964A]/10 text-[#9A7628]'
                    : 'border-[#E1E7EF] bg-white text-[#64748B]'
              }`}
            >
              <span
                className={`flex h-4.5 w-4.5 items-center justify-center rounded-full ${
                  isCurrent
                    ? 'bg-white text-[#123B6D]'
                    : isCompleted
                      ? 'bg-white text-[#9A7628]'
                      : 'bg-[#F7F8FA] text-[#94A3B8]'
                }`}
              >
                <Icon size={11} />
              </span>
              <span>{step.label}</span>
            </div>
          );
        })}
        {showCounter ? (
          <div className="rounded-full border border-[#E1E7EF] bg-[#E8EEF7] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#123B6D]">
            Step {Math.min(currentIndex + 1, steps.length)} of {steps.length}
          </div>
        ) : null}
      </div>
    );
  }

  if (minimal) {
    return (
    <div className={`rounded-[1.4rem] border border-[#E1E7EF] bg-white/90 p-2.5 shadow-sm shadow-slate-200/60 backdrop-blur ${className}`}>
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, index) => {
            const isCurrent = index === currentIndex;
            const isCompleted = index < currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                  isCurrent
                    ? 'border-[#B7C4D5] bg-[#E8EEF7] text-[#071426]'
                    : isCompleted
                      ? 'border-[#B9964A]/30 bg-[#B9964A]/10 text-[#9A7628]'
                      : 'border-[#E1E7EF] bg-[#F7F8FA] text-[#64748B]'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isCurrent
                      ? 'bg-white text-[#123B6D]'
                      : isCompleted
                        ? 'bg-white text-[#9A7628]'
                        : 'bg-white text-[#94A3B8]'
                  }`}
                >
                  <Icon size={14} />
                </span>
                <span>{step.label}</span>
              </div>
            );
          })}
          <div className="ml-auto rounded-full border border-[#E1E7EF] bg-[#E8EEF7] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#123B6D]">
            Step {Math.min(currentIndex + 1, steps.length)} of {steps.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[1.75rem] border border-[#E1E7EF] bg-white/85 ${compact ? 'p-3' : 'p-4'} shadow-sm shadow-slate-200/60 backdrop-blur ${className}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#123B6D]">Resume Studio</div>
          <div className="text-sm font-semibold text-[#475569]">A guided path from import to export</div>
        </div>
        <div className="rounded-full border border-[#E1E7EF] bg-[#E8EEF7] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#123B6D]">
          Step {Math.min(currentIndex + 1, steps.length)} of {steps.length}
        </div>
      </div>

      <div className={compact ? 'flex flex-wrap gap-2' : `grid grid-cols-2 gap-3 ${steps.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-5'}`}>
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`border transition-all ${
                compact ? 'inline-flex items-center gap-2 rounded-full px-3 py-2' : 'rounded-2xl px-3 py-3'
              } ${
                isCurrent
                  ? 'border-[#B7C4D5] bg-[#E8EEF7] text-[#071426] shadow-sm'
                  : isCompleted
                    ? 'border-[#B9964A]/30 bg-[#B9964A]/10 text-[#9A7628]'
                    : 'border-[#E1E7EF] bg-[#F7F8FA] text-[#64748B]'
              }`}
            >
              <div className={`flex items-center gap-2 ${compact ? '' : 'mb-2 justify-between'}`}>
                <div
                  className={`flex items-center justify-center ${
                    compact ? 'h-7 w-7 rounded-full' : 'h-8 w-8 rounded-xl'
                  } ${
                    isCurrent
                      ? 'bg-white text-[#123B6D] shadow-sm'
                      : isCompleted
                        ? 'bg-white text-[#9A7628]'
                        : 'bg-white text-[#94A3B8]'
                  }`}
                >
                  <Icon size={16} />
                </div>
                {!compact && (
                  <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                    {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Next'}
                  </span>
                )}
              </div>
              <div className={`${compact ? 'text-xs' : 'text-sm'} font-bold`}>{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuilderProgress;
