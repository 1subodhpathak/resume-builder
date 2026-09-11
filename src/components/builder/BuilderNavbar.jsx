import React, { useEffect, useMemo, useState } from 'react';
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { ArrowLeft, HelpCircle, Zap } from 'lucide-react';
import { getRepositoryStats, getTokenUsageEntries, listResumeRecords } from '../../services/resumeRepositoryService';
import { getSubscriptionStatus, getSubscriptionLedger, calculateResumeBuilderUsage, formatUsd } from '../../services/subscriptionService';
import { getBuilderSteps } from './BuilderProgress';
import careerSenseLogo from '../../assets/cs_logo.png';
import CustomUserButton from '../common/CustomUserButton';

const StepPill = ({ step, index, state }) => (
  <div
    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
      state === 'current'
        ? 'border-[#B9964A]/45 bg-[#E8EEF7] text-[#071426] shadow-sm'
        : state === 'done'
          ? 'border-[#E1E7EF] bg-white text-[#123B6D]'
          : 'border-[#E1E7EF] bg-[#F7F8FA] text-[#64748B]'
    }`}
  >
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
        state === 'current'
          ? 'bg-[#071426] text-[#B9964A]'
          : state === 'done'
            ? 'bg-[#E8EEF7] text-[#123B6D] ring-1 ring-[#123B6D]/15'
            : 'bg-[#E1E7EF] text-[#64748B]'
      }`}
    >
      {index + 1}
    </span>

    <span className="hidden sm:inline">{step.label}</span>
  </div>
);

const BuilderNavbar = ({
  currentStep = 'import',
  mode = 'upload',
  onDashboard,
  onBack,
  onHome,
  onHelp,
  primaryAction = null,
  showSteps = true,
  showHelp = true,
  showDashboard = true,
  contextLabel = '',
  pageTitle = '',
  className = '',
}) => {
  const { user } = useUser();
  const [subData, setSubData] = useState({ plan: 'free', tokensRemaining: 10000 });
  const [totalBillUsd, setTotalBillUsd] = useState(0);
  const repositoryStats = useMemo(() => getRepositoryStats(), []);
  const steps = useMemo(() => getBuilderSteps(mode), [mode]);

  useEffect(() => {
    const refreshUsage = (ledger = []) => {
      const localUsage = getTokenUsageEntries?.() || [];
      const resumes = listResumeRecords?.() || [];
      const usage = calculateResumeBuilderUsage(ledger, localUsage, resumes);
      setTotalBillUsd(usage.totalBillUsd);
    };

    if (user?.id) {
      getSubscriptionStatus(user.id).then((sub) => {
        if (sub) {
          setSubData({
            plan: sub.plan || 'free',
            tokensRemaining: sub.tokensRemaining ?? 10000,
          });
        }
      });
      getSubscriptionLedger(user.id).then((res) => {
        refreshUsage(res?.ledger || []);
      }).catch(() => {
        refreshUsage([]);
      });
    } else {
      refreshUsage([]);
    }
  }, [user?.id]);

  const currentStepIndex = Math.max(
    steps.findIndex((step) => step.id === currentStep),
    0
  );

  const formatNumber = (value) =>
    new Intl.NumberFormat().format(Number(value || 0));

  const PrimaryActionIcon = primaryAction?.icon || null;
  const handleHomeClick = () => {
    if (onHome) {
      onHome();
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.assign(window.location.origin + window.location.pathname);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[#E1E7EF] bg-white/95 shadow-[0_10px_32px_rgba(7,20,38,0.08)] backdrop-blur-md ${className}`}
    >
      <div className="flex min-h-[64px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6 xl:px-8">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          {/* Brand */}
          <button
            type="button"
            onClick={handleHomeClick}
            className="group flex items-center gap-2.5 rounded-xl text-left outline-none transition focus-visible:ring-4 focus-visible:ring-[#B9964A]/20"
            aria-label="Go to CareerSense home"
          >
            <img
              src={careerSenseLogo}
              alt=""
              aria-hidden="true"
              className="h-[2.2rem] w-[2.2rem] shrink-0 object-contain drop-shadow-[0_4px_8px_rgba(7,20,38,0.14)] sm:h-[2.4rem] sm:w-[2.4rem]"
            />

            <div className="min-w-0">
              <div className="whitespace-nowrap text-[0.96rem] font-black leading-none tracking-[-0.036em] sm:text-[1.16rem]">
                <span className="text-[#071426]">Career</span><span className="text-[#123B6D]">Sense</span>
              </div>
              <div className="mt-1 whitespace-nowrap text-[7.2px] font-extrabold uppercase tracking-[0.224em] text-[#9A7628] sm:text-[8px]">
                Resume Builder
              </div>
            </div>
          </button>

          {showSteps ? (
            <div className="hidden h-8 w-px bg-[#E1E7EF] xl:block" />
          ) : null}

          {/* Builder Steps */}
          {showSteps ? (
            <nav
              className="flex min-w-0 flex-wrap items-center gap-2"
              aria-label="Builder progress"
            >
              {steps.map((step, index) => {
                const state =
                  index === currentStepIndex
                    ? 'current'
                    : index < currentStepIndex
                      ? 'done'
                      : 'upcoming';

                return (
                  <StepPill
                    key={step.id}
                    step={step}
                    index={index}
                    state={state}
                  />
                );
              })}
            </nav>
          ) : null}

          {/* Dashboard Page Title */}
          {!showSteps && pageTitle ? (
            <>
              <div className="hidden h-8 w-px bg-[#E1E7EF] xl:block" />

              <div className="hidden min-w-0 lg:block">
                {contextLabel ? (
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B9964A]">
                    {contextLabel}
                  </div>
                ) : null}

                <div className="mt-1 truncate text-sm font-semibold text-[#071426]">
                  {pageTitle}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {showHelp ? (
            <button
              type="button"
              onClick={onHelp}
              aria-label="Open editor help tour"
              title="Take a guided tour of the editor"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#64748B] transition hover:bg-[#E8EEF7] hover:text-[#071426]"
            >
              <HelpCircle size={14} />
              Help
            </button>
          ) : null}

          <SignedIn>
            <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E1E7EF] bg-white px-3 text-xs font-medium text-[#475569] shadow-sm">
              <Zap size={13} className="text-[#9A7628]" />
              <span className="hidden sm:inline">AI Tokens</span>
              <span className="font-semibold text-[#071426]">
                {formatNumber(subData.tokensRemaining)}
              </span>
            </div>

            <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E1E7EF] bg-white px-3 text-xs font-medium text-[#475569] shadow-sm">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-black text-[11px]">
                $
              </div>
              <span className="hidden sm:inline">Bills</span>
              <span className="font-semibold text-[#071426]">
                {formatUsd(totalBillUsd)}
              </span>
            </div>

            {showDashboard && onDashboard ? (
              <button
                type="button"
                onClick={onDashboard}
                className="inline-flex h-9 items-center rounded-lg border border-[#E1E7EF] bg-white px-4 text-xs font-semibold text-[#475569] shadow-sm transition hover:border-[#123B6D]/30 hover:bg-[#E8EEF7] hover:text-[#071426]"
              >
                Dashboard
              </button>
            ) : null}
          </SignedIn>

          {primaryAction ? (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#071426] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123B6D]"
            >
              {PrimaryActionIcon ? <PrimaryActionIcon size={14} /> : null}
              {primaryAction.label}
            </button>
          ) : null}

          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#071426] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123B6D]"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          ) : null}

          <SignedIn>
            <div className="ml-1 flex items-center">
              <CustomUserButton onOpenDashboard={onDashboard} />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[#123B6D] px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c2749]"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default BuilderNavbar;
