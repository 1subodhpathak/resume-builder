/*
 * CareerSense Resume Dashboard — DARK SIDEBAR / LIGHT WORKSPACE
 * Updated: 2026-08-31
 *
 * Visual verification:
 * - No BuilderNavbar on this page
 * - Premium dark navy dashboard sidebar
 * - Light CareerSense workspace
 * - Sidebar logo renders directly with NO white card/background
 * - Designed for a transparent/light CareerSense logo asset
 * - Default section = Dashboard
 * - KPI row: Saved Resumes / Average ATS / Interview Prep / AI Requests / Points Used
 * - Dashboard modules: Recent Activity / Resume Repository / Resume Health / Quick Actions
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  FileArchive,
  FileText,
  FolderOpen,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Save,
  ScanLine,
  Sparkles,
  TrendingUp,
  Trash2,
  Upload,
  UserRound,
  X,
  LayoutDashboard,
  LayoutTemplate,
  Gauge,
  Activity,
  Zap,
} from 'lucide-react';
import {
  deleteResumeRecord,
  getRepositoryStats,
  getResumeProfile,
  getTokenUsageAnalytics,
  formatUsdFromCareerPoints,
  formatUsdAmount,
  listResumeRecords,
  updateResumeProfile,
  upsertProfileFromResume,
} from '../../services/resumeRepositoryService';
import { getSubscriptionStatus, getSubscriptionLedger, isResumeBuilderLedgerService, POINTS_PER_USD, formatUsd } from '../../services/subscriptionService';
import { getResumeInsights } from '../../utils/resumeInsights';
import ATSScoreModal from './ATSScoreModal';
import InterviewPrepModal from './InterviewPrepModal';
import careerSenseLogo from '../../assets/cs_logo.png';
import CustomUserButton from '../common/CustomUserButton';
const MODE_LABELS = {
  scratch: 'From Scratch',
  upload: 'Using Old Resume',
  tailor: 'Resume + JD',
};
const OPERATION_LABELS = {
  extract_resume_data: 'Resume Extract',
  extract_resume_data_verbatim: 'Exact Import',
  enhance_resume_data: 'AI Enhance Resume',
  generate_text_variations: 'AI Rewrite',
  calculate_ats_score: 'ATS Score',
  generate_interview_prep: 'Interview Prep',
  tailor_phase_extract_resume: 'Extract Resume',
  tailor_phase_analyze_jd: 'Analyze JD',
  tailor_phase_rewrite_resume: 'Rewrite Resume',
};
const AI_BRAND_LABEL = 'CareerSense AI';
const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Career workspace',
    icon: LayoutDashboard,
  },
  {
    id: 'profile',
    label: 'My Profile',
    description: 'Master profile',
    icon: UserRound,
  },
  {
    id: 'resumes',
    label: 'My Resumes',
    description: 'Resume library',
    icon: FolderOpen,
  },
  {
    id: 'templates',
    label: 'Templates',
    description: 'Browse resume templates',
    icon: LayoutTemplate,
  },
  {
    id: 'history',
    label: 'ATS & Analysis',
    description: 'Scores + prep',
    icon: ScanLine,
  },
  {
    id: 'billing',
    label: 'Usage & Billing',
    description: 'Tokens + plan',
    icon: Coins,
  },
];

const formatDateTime = (value) => {
  if (!value) return 'Not yet';
  try {
    return new Date(value).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch (error) {
    return value;
  }
};

const formatNumber = (value) =>
  new Intl.NumberFormat().format(Number(value || 0));

const getOperationLabel = (value) =>
  OPERATION_LABELS[value] || value.replace(/_/g, ' ');

const clampText = (value = '', maxLength = 72) => {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
};

const getTargetJobLabel = (record) => {
  const jdText = record?.jdText || '';

  const lines = jdText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10);

  const labeledLine = lines.find((line) =>
    /^(job\s*)?(title|role|position)\s*[:\-]/i.test(line)
  );

  if (labeledLine) {
    return clampText(
      labeledLine.replace(/^(job\s*)?(title|role|position)\s*[:\-]\s*/i, ''),
      64
    );
  }

  return clampText(
    lines[0] ||
    record?.resumeData?.personal?.title ||
    record?.personalSnapshot?.title ||
    'Target job attached',
    64
  );
};

const getProfileCompleteness = (profile = {}) => {
  const fields = [
    ['name', 'name'],
    ['title', 'title'],
    ['email', 'email'],
    ['phone', 'phone'],
    ['location', 'location'],
    ['linkedin', 'LinkedIn'],
  ];

  const completed = fields.filter(([key]) =>
    String(profile?.[key] || '').trim()
  ).length;

  const missing = fields.find(([key]) => !String(profile?.[key] || '').trim());

  return {
    percent: Math.round((completed / fields.length) * 100),
    missingLabel: missing?.[1] || '',
  };
};

const getFeatureUsageCategory = (operation = '') => {
  if (operation === 'calculate_ats_score') return 'ATS Scoring';
  if (operation === 'generate_interview_prep') return 'Interview Prep';

  if (
    [
      'extract_resume_data',
      'extract_resume_data_verbatim',
      'enhance_resume_data',
      'generate_text_variations',
      'tailor_phase_extract_resume',
      'tailor_phase_analyze_jd',
      'tailor_phase_rewrite_resume',
    ].includes(operation)
  ) {
    return 'Creating Resumes';
  }

  return 'Other';
};

const getReadinessTone = (entry) => {
  if (!entry?.summary) return 'neutral';
  if (entry.summary.ready) return 'positive';
  if ((entry.summary.blockerCount || 0) > 0) return 'warning';
  return 'neutral';
};

const getReadinessLabel = (entry) => {
  if (!entry?.summary) return 'No readiness checks';
  if (entry.summary.ready) {
    return entry.summary.warningCount > 0
      ? `Exportable with ${entry.summary.warningCount} warning${entry.summary.warningCount === 1 ? '' : 's'}`
      : 'Export-ready';
  }
  return `${entry.summary.blockerCount || 0} blocker${entry.summary.blockerCount === 1 ? '' : 's'} remaining`;
};

const getReadinessDeltaText = (latestEntry, previousEntry) => {
  if (!latestEntry?.summary || !previousEntry?.summary) return '';

  const blockerDelta =
    Number(previousEntry.summary.blockerCount || 0) -
    Number(latestEntry.summary.blockerCount || 0);
  const warningDelta =
    Number(previousEntry.summary.warningCount || 0) -
    Number(latestEntry.summary.warningCount || 0);

  if (blockerDelta > 0 || warningDelta > 0) {
    const pieces = [
      blockerDelta > 0 ? `${blockerDelta} blocker${blockerDelta === 1 ? '' : 's'} resolved` : null,
      warningDelta > 0 ? `${warningDelta} warning${warningDelta === 1 ? '' : 's'} improved` : null,
    ].filter(Boolean);
    return pieces.join(', ');
  }

  if (blockerDelta < 0 || warningDelta < 0) {
    const pieces = [
      blockerDelta < 0 ? `${Math.abs(blockerDelta)} blocker${Math.abs(blockerDelta) === 1 ? '' : 's'} added` : null,
      warningDelta < 0 ? `${Math.abs(warningDelta)} warning${Math.abs(warningDelta) === 1 ? '' : 's'} added` : null,
    ].filter(Boolean);
    return pieces.join(', ');
  }

  return 'No change since last check';
};

const getSnapshotValue = (entry, key, fallback = null) =>
  entry?.snapshot && Object.prototype.hasOwnProperty.call(entry.snapshot, key)
    ? entry.snapshot[key]
    : fallback;

const getSkillDelta = (latestSkills = [], previousSkills = []) => {
  const latest = new Set((latestSkills || []).map((item) => String(item).toLowerCase()));
  const previous = new Set((previousSkills || []).map((item) => String(item).toLowerCase()));

  return {
    added: (latestSkills || []).filter((item) => !previous.has(String(item).toLowerCase())),
    removed: (previousSkills || []).filter((item) => !latest.has(String(item).toLowerCase())),
  };
};

const buildResumeVersionSnapshot = (record, options = {}) => {
  const source = options.source || 'current';
  const readinessEntry = options.readinessEntry || null;
  const atsEntry = options.atsEntry || null;
  const resumeData = options.resumeData || record?.resumeData || null;
  const insights = resumeData ? getResumeInsights(resumeData) : null;
  const summary = readinessEntry?.summary || null;

  return {
    id: options.id || `${record?.id || 'resume'}-${source}`,
    label: options.label || (source === 'current' ? 'Latest Version' : 'Previous Checkpoint'),
    createdAt: options.createdAt || readinessEntry?.createdAt || atsEntry?.createdAt || record?.updatedAt || record?.createdAt,
    selectedTemplate:
      options.selectedTemplate ||
      readinessEntry?.selectedTemplate ||
      atsEntry?.selectedTemplate ||
      record?.selectedTemplate ||
      '',
    readinessLabel: summary ? getReadinessLabel(readinessEntry) : 'No readiness snapshot',
    blockerCount: Number(summary?.blockerCount || 0),
    warningCount: Number(summary?.warningCount || 0),
    ready: Boolean(summary?.ready),
    atsScore: atsEntry?.result?.score ?? null,
    jdAttached: Boolean(record?.jdText?.trim()),
    roleCount: getSnapshotValue(readinessEntry, 'experienceCount', insights?.experienceCount ?? null),
    skillCount: getSnapshotValue(readinessEntry, 'totalSkills', insights?.totalSkillCount ?? null),
    technicalSkillCount: getSnapshotValue(readinessEntry, 'technicalSkills', insights?.technicalSkillCount ?? null),
    coreSkillCount: getSnapshotValue(readinessEntry, 'coreSkills', (resumeData?.skills?.core?.length || 0) + (resumeData?.skills?.soft?.length || 0)),
    pageTarget: getSnapshotValue(readinessEntry, 'targetPages', insights?.recommendedPageCount ?? null),
    seniority: getSnapshotValue(readinessEntry, 'seniorityLevel', insights?.seniorityLevel || ''),
    roleFamily: getSnapshotValue(readinessEntry, 'roleFamily', insights?.roleFamily || ''),
    projectCount: getSnapshotValue(readinessEntry, 'projectCount', insights?.projectCount ?? null),
    certificationCount: getSnapshotValue(readinessEntry, 'certificationCount', insights?.certificationCount ?? null),
    summaryWords: getSnapshotValue(readinessEntry, 'summaryWords', insights?.summaryWords ?? null),
    resumeScore: getSnapshotValue(readinessEntry, 'resumeScore', insights?.resumeScore ?? null),
    predictedPagePressure: getSnapshotValue(readinessEntry, 'predictedPagePressure', insights?.predictedPagePressure || ''),
    summaryExcerpt: getSnapshotValue(readinessEntry, 'summaryExcerpt', ''),
    topSkills: getSnapshotValue(readinessEntry, 'topSkills', []),
    sectionStatuses: getSnapshotValue(readinessEntry, 'sectionStatuses', {}),
  };
};

const buildVersionComparison = (record) => {
  if (!record) return null;

  const latestReadiness = record.exportReadinessHistory?.[0] || null;
  const previousReadiness = record.exportReadinessHistory?.[1] || null;
  const latestAts = record.atsHistory?.[0] || null;
  const previousAts = record.atsHistory?.[1] || null;

  const latest = buildResumeVersionSnapshot(record, {
    label: 'Latest Version',
    source: 'current',
    readinessEntry: latestReadiness,
    atsEntry: latestAts,
  });

  const hasPreviousCheckpoint = Boolean(previousReadiness || previousAts);

  const previous = hasPreviousCheckpoint
    ? buildResumeVersionSnapshot(record, {
      label: 'Previous Checkpoint',
      source: 'previous',
      readinessEntry: previousReadiness,
      atsEntry: previousAts,
      // Important: do not use the current resume body as a fallback for
      // historical metrics. Only values actually saved in the old
      // checkpoint should appear here.
      resumeData: null,
      createdAt: previousReadiness?.createdAt || previousAts?.createdAt,
      selectedTemplate:
        previousReadiness?.selectedTemplate ||
        previousAts?.selectedTemplate ||
        '',
    })
    : null;

  return {
    latest,
    previous,
    hasPreviousCheckpoint,
    readinessDelta: previous
      ? getReadinessDeltaText(latestReadiness, previousReadiness)
      : '',
    atsDelta:
      previous && latest.atsScore != null && previous.atsScore != null
        ? latest.atsScore - previous.atsScore
        : null,
    summaryWordDelta:
      previous && latest.summaryWords != null && previous.summaryWords != null
        ? latest.summaryWords - previous.summaryWords
        : null,
    skillDelta: previous
      ? getSkillDelta(latest.topSkills, previous.topSkills)
      : { added: [], removed: [] },
    scoreDelta:
      previous && latest.resumeScore != null && previous.resumeScore != null
        ? latest.resumeScore - previous.resumeScore
        : null,
  };
};

const StatCard = ({ label, value, hint }) => (
  <div className="relative flex min-h-[124px] flex-col justify-between overflow-hidden rounded-[0.95rem] border border-[#DCE4EC] bg-white p-3.5 shadow-[0_6px_20px_rgba(15,43,75,0.04)]">
    <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[#C49A43]/7 blur-2xl" />
    <div className="relative">
      <div className="flex items-center justify-between">
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8292A5]">
          {label}
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-[#C49A43]" />
      </div>

      <div className="mt-3 text-[1.65rem] font-black tracking-[-0.035em] text-[#071A31]">
        {value}
      </div>
    </div>

    <div className="relative mt-3 text-[9.5px] font-medium leading-[1.55] text-[#718398]">{hint}</div>
  </div>
);

const DashboardMetricCard = ({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'teal',
  visual,
}) => {
  const accents = {
    teal: {
      icon: 'bg-[#EEF5FB] text-[#123B6D] border-[#C9D9E8]',
      fill: '#123B6D',
    },
    blue: {
      icon: 'bg-[#F0F5FA] text-[#315D88] border-[#D4E0EB]',
      fill: '#315D88',
    },
    gold: {
      icon: 'bg-[#FFF8E9] text-[#A77924] border-[#E8D39F]',
      fill: '#A77924',
    },
    violet: {
      icon: 'bg-[#FBF6E9] text-[#966C22] border-[#E8D9B2]',
      fill: '#966C22',
    },
    navy: {
      icon: 'bg-[#EDF3F8] text-[#244C78] border-[#D7E2ED]',
      fill: '#244C78',
    },
  };

  const tone = accents[accent] || accents.teal;

  return (
    <div className="relative overflow-hidden rounded-[0.95rem] border border-[#DCE4EC] bg-white p-3.5 shadow-[0_6px_20px_rgba(15,43,75,0.045)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-[0.75rem] border ${tone.icon}`}>
          <Icon size={16} />
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8A99AA]">
          {label}
        </div>
      </div>

      <div className="mt-3 text-[1.55rem] font-black tracking-[-0.04em] text-[#173A62]">
        {value}
      </div>

      <div className="mt-1 text-[9px] font-medium text-[#718398]">
        {hint}
      </div>

      {visual ? (
        <div className="mt-3 border-t border-[#E6ECF2] pt-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-[7.5px] font-bold uppercase tracking-[0.1em] text-[#8292A5]">
            <span>{visual.label}</span>
            <span className="text-[#385A7E]">{visual.reference}</span>
          </div>

          {visual.type === 'segments' ? (
            <div
              className="flex h-1.5 overflow-hidden rounded-full bg-[#E9EFF4]"
              role="img"
              aria-label={visual.ariaLabel || `${label} breakdown`}
            >
              {(visual.segments || []).map((segment, index) => (
                <span
                  key={`${label}-${segment.label}-${index}`}
                  title={`${segment.label}: ${formatNumber(segment.value)}`}
                  style={{
                    width: `${visual.total ? (segment.value / visual.total) * 100 : 0}%`,
                    backgroundColor: segment.color,
                  }}
                />
              ))}
            </div>
          ) : visual.type === 'progress' ? (
            <div
              className="h-1.5 overflow-hidden rounded-full bg-[#E9EFF4]"
              role="progressbar"
              aria-label={visual.ariaLabel || label}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(visual.percent || 0)}
            >
              <div
                className="h-full rounded-full transition-transform duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, visual.percent || 0))}%`,
                  backgroundColor: tone.fill,
                }}
              />
            </div>
          ) : (
            <div className="flex h-5 items-center gap-2" role="status">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone.fill }} />
              <span className="text-[11px] font-black tracking-[-0.02em] text-[#385A7E]">
                {visual.detailValue}
              </span>
            </div>
          )}

          <div className="mt-1.5 truncate text-[8px] font-medium text-[#718398]">
            {visual.caption}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const CompactMetric = ({ label, value, hint }) => (
  <div className="rounded-[0.95rem] border border-[#D9E2EB] bg-white/78 px-4 py-3.5 shadow-[0_6px_18px_rgba(6,23,44,0.04)] backdrop-blur-xl">
    <div className="text-[7.5px] font-black uppercase tracking-[0.16em] text-[#8393A6]">
      {label}
    </div>

    <div className="mt-1.5 text-[1.35rem] font-black tracking-[-0.035em] text-[#173A62]">
      {value}
    </div>

    {hint ? (
      <div className="mt-1 text-[8.5px] font-medium text-[#8293A6]">{hint}</div>
    ) : null}
  </div>
);

const LibrarySummaryCard = ({ icon: Icon, title, count, detail, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative overflow-hidden rounded-[1rem] border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${active
        ? 'border-[#C49A43]/45 bg-[linear-gradient(145deg,#FFF9EC,#F5F8FB)] shadow-[0_12px_30px_rgba(128,92,24,0.08)]'
        : 'border-[#D8E2EC] bg-white/78 shadow-[0_8px_24px_rgba(6,23,44,0.045)] hover:border-[#B9C9D8] hover:shadow-[0_12px_30px_rgba(6,23,44,0.07)]'
      }`}
  >
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#295D95]/7 blur-2xl" />
    <div className="relative flex items-start justify-between gap-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-[0.7rem] border ${active
            ? 'border-[#C49A43]/30 bg-gradient-to-b from-[#315B89] via-[#173A63] to-[#071A31] text-[#E0BC65]'
            : 'border-[#D8E2EC] bg-[#F7F9FB] text-[#315D88]'
          }`}
      >
        <Icon size={16} />
      </div>

      <ArrowRight
        size={14}
        className={active ? 'text-[#A77924]' : 'text-[#8EA0B2]'}
      />
    </div>

    <div className="relative mt-4 text-[11px] font-black text-[#173A62]">{title}</div>
    <div className="relative mt-1 text-[1.7rem] font-black tracking-[-0.04em] text-[#071A31]">
      {formatNumber(count)}
    </div>
    <div className="relative mt-1.5 text-[9px] font-medium leading-[1.55] text-[#7A8CA0]">
      {detail}
    </div>
  </button>
);

const ProfileInput = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="space-y-1.5">
    <label className="block text-[11.5px] font-semibold text-[#40556D]">{label}</label>

    <input
      type={type}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-10 w-full rounded-[0.72rem] border border-[#D6E0EA] bg-white px-3.5 text-[13px] font-medium text-[#10243E] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition-all placeholder:text-[#98A7B6] hover:border-[#C6D2DE] focus:border-[#C49A43] focus:ring-4 focus:ring-[#C49A43]/10"
    />
  </div>
);

const RepositoryNavButton = ({
  icon: Icon,
  label,
  count,
  isActive,
  isCollapsed,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className={`flex w-full items-center gap-3 rounded-[0.75rem] border px-3 py-2.5 text-left transition-all duration-200 ${isActive
        ? 'border-[#C49A43]/35 bg-[#FFF8E9] font-bold text-[#173A62] shadow-[0_4px_14px_rgba(128,92,24,0.06)]'
        : 'border-transparent font-semibold text-[#718398] hover:border-[#DDE5EC] hover:bg-white/75 hover:text-[#173A62]'
      } ${isCollapsed ? 'justify-center px-2' : ''}`}
  >
    <Icon size={16} className={isActive ? 'text-[#A77924]' : 'text-[#7A8CA0]'} />

    {!isCollapsed && (
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <span className="truncate text-[10.5px]">{label}</span>

        {count && (
          <span className="shrink-0 self-start rounded-full border border-[#C49A43]/25 bg-white/85 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-[#94691F]">
            {count}
          </span>
        )}
      </div>
    )}
  </button>
);

const SectionCard = ({
  eyebrow,
  title,
  description,
  actions = null,
  children,
  className = '',
}) => (
  <div
    className={`rounded-[1rem] border border-[#DCE4EC] bg-white/96 p-[18px] shadow-[0_8px_24px_rgba(15,43,75,0.05)] backdrop-blur-xl ${className}`}
  >
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="mb-1.5 bg-gradient-to-r from-[#8D651F] via-[#B88A32] to-[#D8B65E] bg-clip-text text-[8px] font-black uppercase tracking-[0.18em] text-transparent">
            {eyebrow}
          </div>
        )}

        <h2 className="text-[1.25rem] font-black tracking-[-0.03em] text-[#173A62]">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 text-[10px] font-medium leading-[1.6] text-[#718398]">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>

    <div>{children}</div>
  </div>
);

const ResumeRepository = ({
  onBack,
  onHome,
  onOpenResume,
  onStartNew,
  onViewTemplates,
  mode = 'upload',
}) => {
  const { user } = useUser();
  const [profileDraft, setProfileDraft] = useState(() => getResumeProfile());
  const [resumeRecords, setResumeRecords] = useState(() => listResumeRecords());
  const [stats, setStats] = useState(() => getRepositoryStats());
  const [tokenAnalytics, setTokenAnalytics] = useState(() =>
    getTokenUsageAnalytics()
  );
  const [subData, setSubData] = useState(null);
  const [serverLedger, setServerLedger] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'dashboard';
  const validTabs = ['dashboard', 'profile', 'resumes', 'templates', 'history', 'billing', 'usage'];
  const activeSection = rawTab === 'usage' ? 'billing' : (validTabs.includes(rawTab) ? rawTab : 'dashboard');

  const setActiveSection = useCallback((tabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    });
  }, [setSearchParams]);

  const [saveState, setSaveState] = useState('idle');
  const [selectedAtsRecord, setSelectedAtsRecord] = useState(null);
  const [selectedInterviewRecord, setSelectedInterviewRecord] = useState(null);
  const [selectedCompareRecord, setSelectedCompareRecord] = useState(null);
  const [libraryView, setLibraryView] = useState('saved');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const refreshRepository = useCallback(() => {
    setProfileDraft(getResumeProfile());
    setResumeRecords(listResumeRecords());
    setStats(getRepositoryStats());
    setTokenAnalytics(getTokenUsageAnalytics());
    if (user?.id) {
      getSubscriptionStatus(user.id, true).then(res => setSubData(res));
      getSubscriptionLedger(user.id).then(res => {
        if (res?.success && Array.isArray(res.ledger)) {
          setServerLedger(res.ledger);
        }
      });
    }
  }, [user?.id]);

  useEffect(() => {
    refreshRepository();
  }, [refreshRepository]);

  useEffect(() => {
    const intervalId = window.setInterval(refreshRepository, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshRepository();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshRepository]);


  const handleProfileFieldChange = (field, value) => {
    setProfileDraft((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaveState('dirty');
  };

  const handleSaveProfile = () => {
    updateResumeProfile(profileDraft);
    setSaveState('saved');
    refreshRepository();
  };

  const handleDeleteResume = (resumeId) => {
    const confirmed = window.confirm('Delete this saved resume from My Repository?');
    if (!confirmed) return;

    deleteResumeRecord(resumeId);
    refreshRepository();
  };

  const latestResume = resumeRecords[0] || null;

  const uploadedResumeRecords = useMemo(
    () =>
      resumeRecords.filter(
        (record) => record.mode === 'upload' || record.mode === 'tailor'
      ),
    [resumeRecords]
  );

  const jdRecords = useMemo(
    () => resumeRecords.filter((record) => record.jdText?.trim()),
    [resumeRecords]
  );

  const latestUploadedResume = uploadedResumeRecords[0] || null;

  const profileCompleteness = useMemo(
    () => getProfileCompleteness(profileDraft),
    [profileDraft]
  );

  const handleUpdateProfileFromLatestResume = () => {
    if (!latestUploadedResume?.resumeData) return;

    const nextProfile = upsertProfileFromResume(latestUploadedResume.resumeData);
    setProfileDraft(nextProfile);
    setSaveState('saved');
    refreshRepository();
  };

  const recentActivity = useMemo(() => {
    const resumeActivity = resumeRecords.flatMap((record) => {
      const events = [
        {
          id: `${record.id}-updated`,
          type: record.mode === 'tailor' ? 'Resume tailored' : 'Resume saved',
          when: record.updatedAt || record.createdAt,
          title:
            record.mode === 'tailor'
              ? `Tailored resume for ${getTargetJobLabel(record)}`
              : `Updated ${record.title}`,
          detail: record.title,
          record,
        },
      ];

      if (record.jdText?.trim()) {
        events.push({
          id: `${record.id}-jd`,
          type: 'JD uploaded',
          when: record.updatedAt || record.createdAt,
          title: `Saved JD for ${getTargetJobLabel(record)}`,
          detail: record.title,
          record,
        });
      }

      if (Array.isArray(record.atsHistory) && record.atsHistory.length > 0) {
        record.atsHistory.forEach((entry) => {
          const scoreVal = entry.score ?? entry.result?.score ?? record.atsScore;
          events.push({
            id: `${record.id}-ats-${entry.id || Math.random()}`,
            type: 'ATS Scan',
            when: entry.createdAt || record.updatedAt || record.createdAt,
            title: `ATS score ${scoreVal != null ? `${scoreVal}%` : '--'}`,
            detail: record.title,
            record,
            entry,
          });
        });
      } else if (record.atsScore != null) {
        events.push({
          id: `${record.id}-ats-legacy`,
          type: 'ATS Scan',
          when: record.updatedAt || record.createdAt,
          title: `ATS score ${record.atsScore}%`,
          detail: record.title,
          record,
          entry: {
            score: record.atsScore,
            feedback: record.atsFeedback || '',
            matchedKeywords: record.matchedKeywords || [],
            missingKeywords: record.missingKeywords || [],
            result: {
              score: record.atsScore,
              feedback: record.atsFeedback || '',
              matched_keywords: record.matchedKeywords || [],
              missing_keywords: record.missingKeywords || [],
            },
          },
        });
      }

      if (Array.isArray(record.interviewPrepHistory) && record.interviewPrepHistory.length > 0) {
        record.interviewPrepHistory.forEach((entry) => {
          const qCount = entry.questions?.length || entry.result?.questions?.length || 0;
          events.push({
            id: `${record.id}-prep-${entry.id || Math.random()}`,
            type: 'Interview Prep',
            when: entry.createdAt || record.updatedAt || record.createdAt,
            title: `${qCount} interview question${qCount === 1 ? '' : 's'} generated`,
            detail: record.title,
            record,
            entry,
          });
        });
      }

      return events;
    });

    return resumeActivity
      .filter((activity) => activity.when)
      .sort(
        (left, right) =>
          new Date(right.when).getTime() - new Date(left.when).getTime()
      )
      .slice(0, 10);
  }, [resumeRecords]);

  const analysisActivity = useMemo(
    () =>
      recentActivity
        .filter(
          (activity) =>
            activity.type === 'ATS Scan' || activity.type === 'Interview Prep'
        )
        .slice(0, 8),
    [recentActivity]
  );

  const averageAtsScore = useMemo(() => {
    const scores = resumeRecords
      .flatMap((record) => {
        const list = [];
        if (typeof record.atsScore === 'number') list.push(record.atsScore);
        if (Array.isArray(record.atsHistory)) {
          record.atsHistory.forEach((h) => {
            const val = Number(h.score ?? h.result?.score);
            if (Number.isFinite(val)) list.push(val);
          });
        }
        return list;
      })
      .filter((score) => Number.isFinite(score));

    if (!scores.length) return null;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [resumeRecords]);

  const totalInterviewQuestions = useMemo(
    () =>
      resumeRecords.reduce((total, record) => {
        const count = (record.interviewPrepHistory || []).reduce(
          (sub, entry) => sub + (entry?.questions?.length || entry?.result?.questions?.length || 0),
          0
        );
        return total + count;
      }, 0),
    [resumeRecords]
  );

  const readinessActivity = useMemo(
    () =>
      resumeRecords
        .flatMap((record) =>
          (record.exportReadinessHistory || []).slice(0, 3).map((entry, index, entries) => ({
            id: `${record.id}-readiness-${entry.id}`,
            type: 'Export Readiness',
            when: entry.createdAt,
            title: getReadinessLabel(entry),
            detail: getReadinessDeltaText(entry, entries[index + 1]),
            record,
            entry,
          }))
        )
        .sort((left, right) => new Date(right.when).getTime() - new Date(left.when).getTime())
        .slice(0, 10),
    [resumeRecords]
  );
  const selectedComparison = useMemo(
    () => buildVersionComparison(selectedCompareRecord),
    [selectedCompareRecord]
  );

  const formatOperationTitle = (raw = '') => {
    if (!raw) return 'Resume Generation';
    const s = String(raw).trim();
    if (s.toLowerCase().includes('request')) return s;
    if (
      s.toLowerCase().includes('score') ||
      s.toLowerCase().includes('analysis') ||
      s.toLowerCase().includes('prep') ||
      s.toLowerCase().includes('generation') ||
      s.toLowerCase().includes('tailor') ||
      s.toLowerCase().includes('extract') ||
      s.toLowerCase().includes('rewrite') ||
      s.toLowerCase().includes('enhancement') ||
      s.toLowerCase().includes('import') ||
      s.toLowerCase().includes('job description')
    ) {
      return s;
    }
    return `${s} AI Request`;
  };

  const ledgerRecords = useMemo(() => {
    const combined = [];
    const validServerEntries = (serverLedger || []).filter((entry) =>
      isResumeBuilderLedgerService(entry.serviceId)
    );

    if (validServerEntries.length > 0) {
      validServerEntries.forEach((entry) => {
        const rawOp = entry.serviceId || 'Resume Generation';
        combined.push({
          id: `server_${entry._id || entry.id || entry.createdAt}`,
          operation: formatOperationTitle(rawOp),
          resource: 'CareerSense Core AI',
          detail: entry.transactionType ? entry.transactionType.replace(/_/g, ' ').toUpperCase() : 'TOOL USAGE',
          createdAt: entry.createdAt,
          tokens: Math.abs(entry.amount || 0),
          status: 'Completed',
        });
      });
    } else if (tokenAnalytics.tokenUsage && tokenAnalytics.tokenUsage.length > 0) {
      tokenAnalytics.tokenUsage.forEach((entry) => {
        const rawOp = getOperationLabel(entry.operation) || 'Resume AI';
        combined.push({
          id: `local_${entry.id || entry.createdAt}`,
          operation: formatOperationTitle(rawOp),
          resource: entry.model || 'gpt-4o-mini',
          detail: entry.source || 'Resume Session',
          createdAt: entry.createdAt,
          tokens: entry.totalTokens || 0,
          status: 'Completed',
        });
      });
    } else if (resumeRecords.length > 0) {
      resumeRecords.forEach((rec) => {
        const genLen = JSON.stringify(rec.resumeData || {}).length;
        const tokens = Math.max(800, Math.round(genLen / 4));
        combined.push({
          id: `derived_${rec.id}`,
          operation: rec.mode === 'tailor' ? 'Resume + JD Tailoring' : rec.mode === 'upload' ? 'Resume Extraction' : 'Resume Generation',
          resource: rec.title || 'Executive Resume',
          detail: 'gpt-4o-mini',
          createdAt: rec.updatedAt || rec.createdAt || new Date().toISOString(),
          tokens,
          status: 'Completed',
        });
      });
    }

    return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [serverLedger, tokenAnalytics.tokenUsage, resumeRecords]);

  const totalTokensRecorded = useMemo(() => {
    return ledgerRecords.reduce((sum, item) => sum + (Number(item.tokens) || 0), 0);
  }, [ledgerRecords]);

  const totalBillUsd = totalTokensRecorded / POINTS_PER_USD;

  const navItems = useMemo(
    () => [
      { ...NAV_ITEMS[0], count: `${formatNumber(recentActivity.length)} recent` },
      { ...NAV_ITEMS[1], count: `${profileCompleteness.percent}%` },
      { ...NAV_ITEMS[2], count: `${formatNumber(resumeRecords.length)} items` },
      { ...NAV_ITEMS[3], count: '100+' },
      {
        ...NAV_ITEMS[4],
        count: `${formatNumber(stats.atsRuns + stats.interviewPrepRuns || analysisActivity.length)} runs`,
      },
      { ...NAV_ITEMS[5], count: `${formatNumber(ledgerRecords.length)} logs` },
    ],
    [
      analysisActivity.length,
      profileCompleteness.percent,
      recentActivity.length,
      resumeRecords.length,
      stats.atsRuns,
      stats.interviewPrepRuns,
      ledgerRecords.length,
    ]
  );

  const getPageTitle = () => {
    const item = navItems.find((navItem) => navItem.id === activeSection);
    return item ? item.label : 'Overview';
  };

  const resumeModeSegments = [
    { label: 'Scratch', value: stats.scratchCount, color: '#173A62' },
    { label: 'Imported', value: stats.uploadCount, color: '#6F94B8' },
    { label: 'Tailored', value: stats.tailorCount, color: '#C49A43' },
  ];

  const renderDashboardSection = () => (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardMetricCard
          icon={FolderOpen}
          label="Saved Resumes"
          value={formatNumber(stats.totalResumes)}
          hint={`${formatNumber(uploadedResumeRecords.length)} imported bases`}
          accent="teal"
          visual={{
            type: 'segments',
            label: 'Resume mix',
            reference: `${formatNumber(stats.totalResumes)} total`,
            total: stats.totalResumes,
            segments: resumeModeSegments,
            caption: `${stats.scratchCount} scratch · ${stats.uploadCount} imported · ${stats.tailorCount} tailored`,
            ariaLabel: `Resume mix: ${stats.scratchCount} scratch, ${stats.uploadCount} imported, ${stats.tailorCount} tailored`,
          }}
        />
        <DashboardMetricCard
          icon={Gauge}
          label="Average ATS"
          value={averageAtsScore == null ? '--' : `${averageAtsScore}%`}
          hint={`${formatNumber(stats.atsRuns || (averageAtsScore != null ? 1 : 0))} saved ATS scan${stats.atsRuns === 1 ? '' : 's'}`}
          accent="blue"
          visual={{
            type: 'progress',
            label: 'Score reference',
            reference: averageAtsScore == null ? 'No scans' : `${averageAtsScore} / 100`,
            percent: averageAtsScore || 0,
            caption: averageAtsScore == null ? 'Run an ATS scan to establish a score' : 'Average across all saved ATS scans',
            ariaLabel: 'Average ATS score out of 100',
          }}
        />
        <DashboardMetricCard
          icon={MessageSquare}
          label="Interview Prep"
          value={formatNumber(stats.interviewPrepRuns || (totalInterviewQuestions > 0 ? 1 : 0))}
          hint="Saved preparation sessions"
          accent="violet"
          visual={{
            type: 'detail',
            label: 'Questions saved',
            reference: formatNumber(totalInterviewQuestions),
            detailValue: stats.interviewPrepRuns
              ? `${(totalInterviewQuestions / Math.max(1, stats.interviewPrepRuns)).toFixed(1)} average / session`
              : `${totalInterviewQuestions} questions`,
            caption: totalInterviewQuestions
              ? `${formatNumber(totalInterviewQuestions)} questions saved`
              : 'Complete a prep session to save questions',
          }}
        />
        <DashboardMetricCard
          icon={Zap}
          label="AI Tokens Remaining"
          value={(subData?.tokensRemaining ?? 10000).toLocaleString()}
          hint="CareerSense Reverse Balance"
          accent="gold"
          visual={{
            type: 'progress',
            label: 'Token balance',
            reference: `${(subData?.tokensRemaining ?? 10000).toLocaleString()}`,
            percent: Math.min(100, Math.max(0, ((subData?.tokensRemaining ?? 10000) / 10000) * 100)),
            caption: `${(subData?.plan || 'free').toUpperCase()} Plan Quota`,
            ariaLabel: 'AI Tokens remaining',
          }}
        />
        <DashboardMetricCard
          icon={Coins}
          label="Current Spend (Est.)"
          value={formatUsdAmount(totalBillUsd)}
          hint={`${formatNumber(totalTokensRecorded)} tokens recorded`}
          accent="navy"
          visual={{
            type: 'progress',
            label: 'Billing ledger',
            reference: `${formatNumber(ledgerRecords.length)} logs`,
            percent: 100,
            caption: `${(subData?.plan || 'free').toUpperCase()} Tier Active`,
            ariaLabel: 'Estimated spend and token usage',
          }}
        />
      </div>


      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_300px]">
        <section className="rounded-[1.15rem] border border-[#DDE5EC] bg-white p-4 shadow-[0_8px_24px_rgba(6,23,44,0.045)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#A77924]">
                Activity
              </div>
              <h2 className="mt-1 text-[14px] font-black tracking-[-0.025em] text-[#173A62]">
                Recent Activity
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveSection('history')}
              className="text-[8px] font-black uppercase tracking-[0.14em] text-[#315D88] transition hover:text-[#A77924]"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <div className="rounded-[0.85rem] border border-dashed border-[#CFD9E3] bg-[#F8FAFC] px-4 py-8 text-center text-[10px] font-medium text-[#8293A6]">
                No recent activity yet.
              </div>
            ) : (
              recentActivity.slice(0, 5).map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => {
                    if (activity.type === 'ATS Scan') {
                      setSelectedAtsRecord({
                        ...activity.record,
                        activeEntry: activity.entry || activity.record?.atsHistory?.[0],
                      });
                    } else if (activity.type === 'Interview Prep') {
                      setSelectedInterviewRecord({
                        ...activity.record,
                        activeEntry: activity.entry || activity.record?.interviewPrepHistory?.[0],
                      });
                    } else {
                      onOpenResume?.(activity.record);
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-[0.8rem] px-2.5 py-2.5 text-left transition hover:bg-[#F4F8FB]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] bg-[#EAF5F3] text-[#0E9F91]">
                    {activity.type === 'ATS Scan' ? (
                      <ScanLine size={14} />
                    ) : activity.type === 'Interview Prep' ? (
                      <MessageSquare size={14} />
                    ) : activity.type === 'JD uploaded' ? (
                      <BriefcaseBusiness size={14} />
                    ) : (
                      <FileText size={14} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10.5px] font-extrabold text-[#173A62]">
                      {activity.title}
                    </div>
                    <div className="mt-0.5 truncate text-[8.5px] font-medium text-[#8293A6]">
                      {activity.detail}
                    </div>
                  </div>

                  <div className="shrink-0 text-[8px] font-medium text-[#8E9CAD]">
                    {formatDateTime(activity.when)}
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[1.15rem] border border-[#DDE5EC] bg-white p-4 shadow-[0_8px_24px_rgba(6,23,44,0.045)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#A77924]">
                Workspace
              </div>
              <h2 className="mt-1 text-[14px] font-black tracking-[-0.025em] text-[#173A62]">
                Resume Repository
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveSection('resumes')}
              className="text-[8px] font-black uppercase tracking-[0.14em] text-[#315D88] transition hover:text-[#A77924]"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {resumeRecords.length === 0 ? (
              <div className="rounded-[0.85rem] border border-dashed border-[#CFD9E3] bg-[#F8FAFC] px-4 py-8 text-center">
                <div className="text-[10px] font-bold text-[#60748A]">No resumes yet</div>
                <button
                  type="button"
                  onClick={onStartNew}
                  className="mt-3 rounded-[0.65rem] bg-[#071A31] px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-white"
                >
                  Create Resume
                </button>
              </div>
            ) : (
              resumeRecords.slice(0, 4).map((record, index) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => onOpenResume?.(record)}
                  className="flex w-full items-center gap-3 rounded-[0.8rem] border border-transparent px-2.5 py-2.5 text-left transition hover:border-[#DDE5EC] hover:bg-[#F8FAFC]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] bg-[#EDF3F8] text-[#315D88]">
                    <FileText size={14} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10.5px] font-extrabold text-[#173A62]">
                      {record.title}
                    </div>
                    <div className="mt-0.5 text-[8.5px] font-medium text-[#8293A6]">
                      Updated {formatDateTime(record.updatedAt || record.createdAt)}
                    </div>
                  </div>

                  {index === 0 ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-emerald-700">
                      Latest
                    </span>
                  ) : (
                    <ChevronRight size={13} className="text-[#A0ADBA]" />
                  )}
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={onStartNew}
            className="mt-3 flex min-h-[38px] w-full items-center justify-center gap-2 rounded-[0.7rem] border border-[#D9E2EB] bg-[#F8FAFC] text-[8.5px] font-black uppercase tracking-[0.14em] text-[#315D88] transition hover:border-[#C49A43]/35 hover:bg-[#FFF9EC] hover:text-[#A77924]"
          >
            <Plus size={13} />
            New Resume
          </button>
        </section>

        <section className="rounded-[1.15rem] border border-[#DDE5EC] bg-white p-4 shadow-[0_8px_24px_rgba(6,23,44,0.045)]">
          <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#A77924]">
            Resume Health
          </div>
          <h2 className="mt-1 text-[14px] font-black tracking-[-0.025em] text-[#173A62]">
            Career Readiness
          </h2>

          <div className="mt-5 flex justify-center">
            <div
              className="relative h-28 w-28 rounded-full"
              style={{
                background: `conic-gradient(#16B8A7 ${profileCompleteness.percent * 3.6
                  }deg, rgba(255,255,255,.10) 0deg)`,
              }}
            >
              <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white">
                <div className="text-[1.55rem] font-black tracking-[-0.04em] text-[#071A31]">
                  {profileCompleteness.percent}%
                </div>
                <div className="mt-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-[#8192A5]">
                  Profile
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[8.5px] font-semibold text-[#667A91]">
                <span>Profile Completion</span>
                <span>{profileCompleteness.percent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E8EEF4]">
                <div
                  className="h-full rounded-full bg-[#2F75D6]"
                  style={{ width: `${profileCompleteness.percent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-[8.5px] font-semibold text-[#667A91]">
                <span>ATS Activity</span>
                <span>{formatNumber(stats.atsRuns)} runs</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E8EEF4]">
                <div
                  className="h-full rounded-full bg-[#16B8A7]"
                  style={{ width: `${Math.min(100, stats.atsRuns * 12)}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className="mt-5 flex min-h-[38px] w-full items-center justify-center gap-2 rounded-[0.7rem] border border-[#D9E2EB] bg-white text-[8.5px] font-black uppercase tracking-[0.14em] text-[#315D88] transition hover:border-[#C49A43]/35 hover:bg-[#FFF9EC] hover:text-[#A77924]"
          >
            Improve Profile
            <ArrowRight size={12} />
          </button>
        </section>
      </div>

      <section className="rounded-[1.15rem] border border-[#DDE5EC] bg-white p-4 shadow-[0_8px_24px_rgba(6,23,44,0.045)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.18em] text-[#A77924]">
              Shortcuts
            </div>
            <h2 className="mt-1 text-[14px] font-black tracking-[-0.025em] text-[#173A62]">
              Quick Actions
            </h2>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Create Resume',
              icon: Plus,
              onClick: onStartNew,
            },
            {
              label: 'My Resumes',
              icon: FolderOpen,
              onClick: () => setActiveSection('resumes'),
            },
            {
              label: 'ATS & Analysis',
              icon: ScanLine,
              onClick: () => setActiveSection('history'),
            },
            {
              label: 'My Profile',
              icon: UserRound,
              onClick: () => setActiveSection('profile'),
            },
          ].map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex items-center gap-3 rounded-[0.85rem] border border-[#DDE5EC] bg-[#F8FAFC] px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#C49A43]/35 hover:bg-[#FFF9EC]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-[0.65rem] bg-white text-[#315D88] shadow-sm">
                <Icon size={14} />
              </div>
              <span className="text-[9.5px] font-extrabold text-[#173A62]">{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="rounded-[1rem] border border-[#DCE4EC] bg-white/96 p-4 shadow-[0_8px_24px_rgba(15,43,75,0.05)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A87922]">
              <CheckCircle2 size={14} />
              Profile Completeness
            </div>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0F172A]">
              Your Master Profile is {profileCompleteness.percent}% complete.
            </h2>

            <p className="mt-2 text-sm font-medium leading-relaxed text-[#64748B]">
              {profileCompleteness.missingLabel
                ? `Add your ${profileCompleteness.missingLabel} to save time during AI generation.`
                : 'Your core profile fields are ready for faster resume generation.'}
            </p>
          </div>

          <div className="w-full lg:w-80">
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
              <span>Master data</span>
              <span>{profileCompleteness.percent}%</span>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#E1E7EF]">
              <div
                className="h-full rounded-full bg-[#A87922] transition-all"
                style={{ width: `${profileCompleteness.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <SectionCard
        eyebrow="My Profile"
        title="Profile Settings"
        description="Manage the master profile CareerSense uses to speed up new resume generation."
        actions={
          <button
            type="button"
            onClick={handleSaveProfile}
            className="inline-flex items-center justify-center gap-2 rounded-[0.72rem] bg-[#123B6D] px-5 py-2.5 text-[12px] font-extrabold text-white shadow-[0_5px_14px_rgba(18,59,109,0.14)] transition-all hover:-translate-y-0.5 hover:bg-[#0D315D]"
          >
            <Save size={16} />
            {saveState === 'dirty' ? 'Save Profile' : 'Save Changes'}
          </button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileInput label="Full Name" value={profileDraft.name} onChange={(value) => handleProfileFieldChange('name', value)} placeholder="Aanchal Agarwal" />
          <ProfileInput label="Job Title" value={profileDraft.title} onChange={(value) => handleProfileFieldChange('title', value)} placeholder="Business Analyst" />
          <ProfileInput label="Email" type="email" value={profileDraft.email} onChange={(value) => handleProfileFieldChange('email', value)} placeholder="name@email.com" />
          <ProfileInput label="Phone" value={profileDraft.phone} onChange={(value) => handleProfileFieldChange('phone', value)} placeholder="+91 98765 43210" />
          <ProfileInput label="Location" value={profileDraft.location} onChange={(value) => handleProfileFieldChange('location', value)} placeholder="Delhi, India" />
          <ProfileInput label="LinkedIn" value={profileDraft.linkedin} onChange={(value) => handleProfileFieldChange('linkedin', value)} placeholder="linkedin.com/in/yourprofile" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E1E7EF] pt-5 text-xs font-medium text-[#64748B]">
          <span className="rounded-full bg-[#E8EEF7] px-3 py-1.5 text-[#A87922] ring-1 ring-[#E3D1A4]/70">
            Updated {formatDateTime(profileDraft.updatedAt)}
          </span>

          <span className="rounded-full bg-[#F8FAFC] px-3 py-1.5 text-[#64748B] ring-1 ring-[#E1E7EF]">
            {profileDraft.photo ? 'Photo synced from resume' : 'Photo not added yet'}
          </span>
        </div>
      </SectionCard>

      <div className="rounded-[1rem] border border-[#DCE4EC] bg-white/96 p-4 shadow-[0_8px_24px_rgba(15,43,75,0.05)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A87922]">
              Data Management
            </div>

            <h3 className="mt-2 text-xl font-bold tracking-tight text-[#0F172A]">
              Update from latest uploaded resume
            </h3>

            <p className="mt-1.5 text-[10px] font-medium text-[#718398]">
              {latestUploadedResume
                ? `Latest uploaded base: ${latestUploadedResume.title}`
                : 'Upload or tailor a resume first, then use it to refresh your master profile.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleUpdateProfileFromLatestResume}
            disabled={!latestUploadedResume}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${latestUploadedResume
                ? 'bg-[#071426] text-white hover:shadow-[0_10px_24px_rgba(6,23,44,0.16)]'
                : 'cursor-not-allowed border border-[#E1E7EF] bg-[#F8FAFC] text-[#94A3B8]'
              }`}
          >
            <Upload size={16} />
            Update Master Profile
          </button>
        </div>
      </div>
    </div>
  );

  const renderResumesSection = () => {
    const activeRecords =
      libraryView === 'uploads'
        ? uploadedResumeRecords
        : libraryView === 'jds'
          ? jdRecords
          : resumeRecords;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <LibrarySummaryCard
            icon={FolderOpen}
            title="Saved Resumes"
            count={resumeRecords.length}
            detail="Finished and in-progress resume versions."
            active={libraryView === 'saved'}
            onClick={() => setLibraryView('saved')}
          />

          <LibrarySummaryCard
            icon={Upload}
            title="All Resume Uploaded"
            count={uploadedResumeRecords.length}
            detail="Imported base resumes used in upload and Resume + JD flows."
            active={libraryView === 'uploads'}
            onClick={() => setLibraryView('uploads')}
          />

          <LibrarySummaryCard
            icon={BriefcaseBusiness}
            title="All JD Uploaded"
            count={jdRecords.length}
            detail="Job descriptions attached to saved resume work."
            active={libraryView === 'jds'}
            onClick={() => setLibraryView('jds')}
          />
        </div>

        <SectionCard
          eyebrow="Document Management"
          title={
            libraryView === 'uploads'
              ? 'Uploaded Resumes'
              : libraryView === 'jds'
                ? 'Uploaded Job Descriptions'
                : 'Saved Resumes'
          }
          description={
            libraryView === 'jds'
              ? 'Review target jobs attached to resume work.'
              : 'Open, review, or manage saved resume assets.'
          }
          actions={
            <span className="inline-flex items-center rounded-md bg-[#E8EEF7] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A87922] ring-1 ring-[#E3D1A4]/70">
              {activeRecords.length} item{activeRecords.length === 1 ? '' : 's'}
            </span>
          }
        >
          <div className="mt-4 overflow-hidden rounded-[1rem] border border-[#DCE4EC] bg-white/86">
            {activeRecords.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileArchive className="mx-auto h-10 w-10 text-[#CBD5E1]" />

                <h3 className="mt-4 text-sm font-bold tracking-tight text-[#0F172A]">
                  Nothing here yet
                </h3>

                <p className="mt-1 text-xs text-[#64748B]">
                  Create or upload a resume and this list will populate automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E1E7EF]">
                {activeRecords.map((record) => (
                  <div
                    key={`${libraryView}-${record.id}`}
                    className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[#E8EEF7]/60 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-bold tracking-tight text-[#0F172A]">
                          {record.title}
                        </h3>

                        <span className="rounded-md border border-[#E1E7EF] bg-[#F8FAFC] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                          {MODE_LABELS[record.mode] || 'Saved Resume'}
                        </span>
                      </div>

                      {libraryView === 'jds' ? (
                        <div className="mt-2 text-sm font-medium text-[#475569]">
                          Target job:{' '}
                          <span className="font-semibold text-[#0F172A]">
                            {getTargetJobLabel(record)}
                          </span>
                        </div>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-[#64748B]">
                        <span>Prepared {formatDateTime(record.createdAt)}</span>
                        <span>Updated {formatDateTime(record.updatedAt)}</span>
                        {record.selectedTemplate ? (
                          <span>Template {record.selectedTemplate}</span>
                        ) : null}
                      </div>

                      {record.exportReadinessHistory?.length ? (
                        <div className="mt-3 rounded-2xl border border-[#E1E7EF] bg-[#F8FAFC] px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getReadinessTone(record.exportReadinessHistory[0]) === 'positive'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                              {getReadinessLabel(record.exportReadinessHistory[0])}
                            </span>
                            <span className="text-xs font-medium text-[#64748B]">
                              Checked {formatDateTime(record.exportReadinessHistory[0].createdAt)}
                            </span>
                          </div>

                          <div className="mt-2 text-xs font-medium text-[#64748B]">
                            {getReadinessDeltaText(
                              record.exportReadinessHistory[0],
                              record.exportReadinessHistory[1]
                            ) || 'First readiness check saved for this resume.'}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {record.exportReadinessHistory.slice(0, 3).map((entry) => (
                              <span
                                key={entry.id}
                                className="rounded-full border border-[#E1E7EF] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]"
                              >
                                {formatDateTime(entry.createdAt)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* {(record.exportReadinessHistory?.length > 0 || record.atsHistory?.length > 0) ? (
                        <button
                          type="button"
                          onClick={() => setSelectedCompareRecord(record)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#E3D1A4] bg-white px-4 text-sm font-semibold text-[#A87922] transition hover:bg-[#E8EEF7]"
                        >
                          <Sparkles size={15} />
                          Compare Versions
                        </button>
                      ) : null} */}
                      <button
                        type="button"
                        onClick={() => onOpenResume?.(record)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-[0.72rem] bg-[#123B6D] px-4 text-[12px] font-extrabold text-white shadow-[0_4px_12px_rgba(18,59,109,0.12)] transition hover:-translate-y-0.5 hover:bg-[#0D315D]"
                      >
                        <FolderOpen size={15} />
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteResume(record.id)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    );
  };

  const renderAnalysisHistorySection = () => (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <SectionCard
          eyebrow="Recent Activity"
          title="Analysis History"
          description="This shows the latest ATS and interview-prep actions tied to saved resume versions."
        >
          <div className="mt-4 space-y-4">
            {analysisActivity.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-8 text-center text-sm leading-7 text-[#64748B]">
                No ATS or interview prep activity yet. When you tailor or evaluate resumes, the history will appear here with the matching resume context.
              </div>
            ) : (
              analysisActivity.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => {
                    if (activity.type === 'ATS Scan') {
                      setSelectedAtsRecord({
                        ...activity.record,
                        activeEntry: activity.entry || activity.record?.atsHistory?.[0],
                      });
                    } else {
                      setSelectedInterviewRecord({
                        ...activity.record,
                        activeEntry: activity.entry || activity.record?.interviewPrepHistory?.[0],
                      });
                    }
                  }}
                  className="w-full rounded-[0.9rem] border border-[#DCE4EC] bg-white/88 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#E3D1A4] hover:shadow-sm"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#A87922]">
                    {activity.type === 'ATS Scan' ? (
                      <ScanLine size={14} />
                    ) : (
                      <MessageSquare size={14} />
                    )}
                    {activity.type}
                  </div>

                  <div className="mt-2 text-base font-bold text-[#0F172A]">
                    {activity.title}
                  </div>

                  <div className="mt-1 text-sm text-[#64748B]">
                    {activity.detail}
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E8EEF7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A87922] ring-1 ring-[#E3D1A4]/70">
                    <FileText size={12} />
                    {formatDateTime(activity.when)}
                  </div>
                </button>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Export Timeline"
          title="Readiness History"
          description="Track how blockers and warnings changed across the latest readiness checks for saved resumes."
        >
          <div className="mt-4 space-y-4">
            {readinessActivity.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-8 text-center text-sm leading-7 text-[#64748B]">
                No export-readiness checks have been saved yet. Open preview or attempt export from the editor to start the timeline.
              </div>
            ) : (
              readinessActivity.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => onOpenResume?.(activity.record)}
                  className="w-full rounded-[0.9rem] border border-[#DCE4EC] bg-white/88 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#E3D1A4] hover:shadow-sm"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#A87922]">
                    <TrendingUp size={14} />
                    {activity.type}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <div className="text-base font-bold text-[#0F172A]">
                      {activity.title}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getReadinessTone(activity.entry) === 'positive'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {activity.entry?.summary?.ready ? 'Exportable' : 'Needs fixes'}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-[#64748B]">
                    {activity.record.title}
                  </div>

                  <div className="mt-2 text-sm font-medium text-[#64748B]">
                    {activity.detail || 'First readiness checkpoint saved.'}
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E8EEF7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A87922] ring-1 ring-[#E3D1A4]/70">
                    <Clock3 size={12} />
                    {formatDateTime(activity.when)}
                  </div>
                </button>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <StatCard
          label="ATS Runs"
          value={stats.atsRuns || (averageAtsScore != null ? 1 : 0)}
          hint="Saved ATS scans tied to exact resume and JD combinations."
        />

        <StatCard
          label="Readiness Checks"
          value={formatNumber(readinessActivity.length)}
          hint="Recent export-readiness checkpoints saved across your resume library."
        />

        <StatCard
          label="Interview Prep"
          value={stats.interviewPrepRuns || (totalInterviewQuestions > 0 ? 1 : 0)}
          hint="Interview question sets and strategies stored for later review."
        />

        <div className="rounded-[1rem] border border-[#D8E2EC] bg-white/78 p-4 shadow-[0_8px_24px_rgba(6,23,44,0.045)] backdrop-blur-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#A87922]">
            Quick Note
          </div>

          <h3 className="mt-2 text-lg font-bold tracking-tight text-[#0F172A]">
            Open any saved result instantly
          </h3>

          <p className="mt-1.5 text-[10px] font-medium leading-[1.6] text-[#718398]">
            The latest ATS result and interview prep run can both be reopened
            directly from here or from each resume card in the resumes section.
          </p>
        </div>
      </div>
    </div>
  );

  const renderUsageChart = (title, entries) => (
    <div className="rounded-[1rem] border border-[#DCE4EC] bg-[#F8FAFC]/82 p-4 shadow-[0_8px_24px_rgba(6,23,44,0.04)]">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#A87922]">
        {title}
      </div>

      <div className="mt-4 space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white px-4 py-6 text-center text-sm text-[#64748B]">
            No CareerSense AI token usage yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.key}
              className="rounded-xl border border-[#E1E7EF] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    {entry.label}
                  </div>

                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    {formatNumber(entry.calls)} call{entry.calls === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-[#0F172A]">
                    {formatNumber(entry.totalTokens)} AI tokens
                  </div>

                  <div className="mt-1 text-[10px] font-medium text-[#64748B]">
                    {formatNumber(entry.promptTokens)} input /{' '}
                    {formatNumber(entry.completionTokens)} output
                  </div>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E1E7EF]">
                <div
                  className="h-full rounded-full bg-[#A87922]"
                  style={{
                    width: `${Math.max(
                      3,
                      tokenAnalytics.totalTokens
                        ? (entry.totalTokens / tokenAnalytics.totalTokens) * 100
                        : 0
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBillingSection = () => {
    const tokensRemaining = subData?.tokensRemaining ?? 10000;
    const planName = (subData?.plan || 'free').toUpperCase();

    return (
      <div className="space-y-6">
        {/* Top Level Summary Cards */}
        <section className="overflow-hidden rounded-[1.25rem] border border-[#DCE4EC] bg-white p-6 shadow-[0_12px_36px_rgba(15,43,75,0.055)] backdrop-blur-xl">
          <div className="border-b border-[#E8EEF4] pb-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A87922]">Platform Metrics</p>
            <h2 className="text-xl font-extrabold tracking-tight text-[#173A62]">Usage & Billing Ledger</h2>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#64748B]">
              Track AI tokens remaining, subscription tier, and overall billing across resume sessions.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#DCE4EC] bg-[#F8FAFC] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A87922]">AI Tokens Remaining</p>
                <span className="h-1.5 w-1.5 rounded-full bg-[#123B6D]"></span>
              </div>
              <p className="text-2xl font-extrabold tracking-tight text-[#173A62]">
                {tokensRemaining.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#71849A]">CareerSense Reverse Balance</p>
            </div>

            <div className="rounded-2xl border border-[#DCE4EC] bg-[#F8FAFC] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A87922]">Lifetime tokens used</p>
                <span className="h-1.5 w-1.5 rounded-full bg-[#315D88]"></span>
              </div>
              <p className="text-2xl font-extrabold tracking-tight text-[#173A62]">
                {formatNumber(totalTokensRecorded)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#71849A]">Total Platform Consumption</p>
            </div>

            <div className="rounded-2xl border border-[#DCE4EC] bg-[#F8FAFC] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A87922]">Lifetime bills</p>
                <span className="h-1.5 w-1.5 rounded-full bg-[#C49A43]"></span>
              </div>
              <p className="text-2xl font-extrabold tracking-tight text-[#173A62]">
                {formatUsd(totalBillUsd)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#71849A]">Recorded Activity API Estimate</p>
            </div>

            <div className="rounded-2xl border border-[#DCE4EC] bg-[#F8FAFC] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A87922]">Active Operational Tier</p>
                <span className="h-1.5 w-1.5 rounded-full bg-[#A87922]"></span>
              </div>
              <p className="text-2xl font-extrabold tracking-tight text-[#173A62]">
                {planName} Plan
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#71849A]">CareerSense Subscription</p>
            </div>
          </div>

          {/* Subscription Banner */}
          <div className="mt-5 rounded-2xl border border-[#DCE4EC] bg-[#F8FAFC] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#173A62]">CareerSense Subscription Framework</span>
                <span className="rounded-full bg-[#E8EEF7] border border-[#C49A43]/30 px-3 py-0.5 text-xs font-bold text-[#123B6D] uppercase">
                  {planName} TIER
                </span>
              </div>
              <p className="mt-1 text-xs text-[#64748B]">
                ResumeBuilder platform AI usage draws directly from your CareerSense token balance. You have {tokensRemaining.toLocaleString()} AI tokens available.
              </p>
            </div>
            <a
              href="https://careersenseai.com/pricing"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#123B6D] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0D315D]"
            >
              Manage Subscription & Tokens →
            </a>
          </div>
        </section>

        {/* Transaction History Section */}
        <div className="rounded-[1.25rem] border border-[#DCE4EC] bg-white p-5 shadow-[0_12px_36px_rgba(15,43,75,0.055)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[#173A62]">Transaction History</h3>
              <p className="mt-0.5 text-[12px] text-[#64748B]">A detailed ledger of API, extraction, and enhancement usage.</p>
            </div>
            <span className="w-fit rounded-full border border-[#DCE4EC] bg-[#F8FAFC] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A87922]">
              System Logs
            </span>
          </div>

          {ledgerRecords.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-[#DCE4EC]">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[1.15fr_1fr_0.8fr_0.7fr] gap-3 bg-[#F8FAFC] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#71849A]">
                  <span>Operation</span>
                  <span>Resource</span>
                  <span>Timestamp</span>
                  <span className="text-right">Units</span>
                </div>
                <div className="divide-y divide-[#E8EEF4]">
                  {ledgerRecords.map((record) => (
                    <div key={record.id} className="grid grid-cols-[1.15fr_1fr_0.8fr_0.7fr] gap-3 px-4 py-3.5 text-[12px] hover:bg-[#F8FAFC]/70 transition-colors">
                      <div>
                        <p className="font-bold text-[#173A62]">{record.operation}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-[#8293A6]">{record.detail}</p>
                      </div>
                      <p className="flex items-center font-medium text-[#64748B]">{record.resource}</p>
                      <p className="flex items-center font-medium text-[#64748B]">{formatDateTime(record.createdAt)}</p>
                      <p className="flex items-center justify-end text-right font-bold text-[#173A62]">
                        {formatNumber(record.tokens)} Tokens
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCE4EC] bg-[#F8FAFC] px-6 py-12 text-center">
              <Coins className="h-10 w-10 text-[#C49A43]/50 mb-3" />
              <h4 className="text-sm font-bold text-[#173A62]">No operations logged</h4>
              <p className="mt-1 max-w-md text-xs text-[#71849A]">
                Generate, tailor, or enhance a resume and the operational cost and token usage will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardSection();
      case 'resumes':
        return renderResumesSection();
      case 'history':
        return renderAnalysisHistorySection();
      case 'billing':
        return renderBillingSection();
      case 'profile':
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(rgba(18,59,109,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.03)_1px,transparent_1px),radial-gradient(circle_at_84%_4%,rgba(18,59,109,0.12),transparent_33%),radial-gradient(circle_at_10%_12%,rgba(185,150,74,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#F2F5F8_100%)] bg-[size:36px_36px,36px_36px,auto,auto,auto] font-sans text-[#071426]">
      <div className="relative flex h-screen w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-[10%] top-[-15%] h-[520px] w-[520px] rounded-full bg-[#123B6D]/[0.055] blur-[130px]" />
          <div className="absolute -right-[8%] top-[-14%] h-[500px] w-[500px] rounded-full bg-[#B9964A]/[0.055] blur-[125px]" />
        </div>

        <ATSScoreModal
          isOpen={Boolean(selectedAtsRecord)}
          onClose={() => setSelectedAtsRecord(null)}
          resumeData={selectedAtsRecord?.resumeData || null}
          jdText={
            selectedAtsRecord?.activeEntry?.jdText ||
            selectedAtsRecord?.jdText ||
            selectedAtsRecord?.atsHistory?.[0]?.jdText ||
            ''
          }
          existingEntry={
            selectedAtsRecord?.activeEntry ||
            selectedAtsRecord?.atsHistory?.[0] ||
            (selectedAtsRecord?.atsScore != null
              ? {
                result: {
                  score: selectedAtsRecord.atsScore,
                  feedback: selectedAtsRecord.atsFeedback || '',
                  matched_keywords: selectedAtsRecord.matchedKeywords || [],
                  missing_keywords: selectedAtsRecord.missingKeywords || [],
                },
              }
              : null)
          }
          allowRerun={false}
        />

        <InterviewPrepModal
          isOpen={Boolean(selectedInterviewRecord)}
          onClose={() => setSelectedInterviewRecord(null)}
          resumeData={selectedInterviewRecord?.resumeData || null}
          jdText={
            selectedInterviewRecord?.activeEntry?.jdText ||
            selectedInterviewRecord?.jdText ||
            selectedInterviewRecord?.interviewPrepHistory?.[0]?.jdText ||
            ''
          }
          existingEntry={
            selectedInterviewRecord?.activeEntry ||
            selectedInterviewRecord?.interviewPrepHistory?.[0] ||
            null
          }
          allowRerun={false}
        />

        {selectedCompareRecord && selectedComparison ? (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#071426]/45 p-3 backdrop-blur-[6px] sm:p-5">
            <div className="flex max-h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[1.35rem] border border-white/60 bg-white shadow-[0_32px_90px_rgba(7,20,38,0.28)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#DCE4EC] bg-white px-5 py-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A87922]">
                    Version Comparison
                  </div>
                  <div className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">
                    {selectedCompareRecord.title}
                  </div>
                  <div className="mt-1 text-sm text-[#64748B]">
                    Compare the latest saved state against the previous checkpoint for readiness, ATS, template, and structure.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCompareRecord(null)}
                  className="rounded-xl p-2 text-[#64748B] transition hover:bg-white hover:text-[#0F172A]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto bg-[linear-gradient(rgba(18,59,109,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.025)_1px,transparent_1px),linear-gradient(180deg,#F8FAFC_0%,#F3F6F9_100%)] bg-[size:30px_30px,30px_30px,auto] p-4 custom-scrollbar sm:p-5">
                <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] lg:gap-3">
                  {/* PREVIOUS CHECKPOINT */}
                  {selectedComparison.previous ? (
                    <div className="min-w-0 rounded-[1.1rem] border border-[#DCE4EC] bg-[#F8FAFC] p-4 shadow-[0_6px_18px_rgba(15,43,75,0.035)] sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A87922]">
                            {selectedComparison.previous.label}
                          </div>
                          <div className="mt-1 text-[13px] font-extrabold text-[#173A62]">
                            {formatDateTime(selectedComparison.previous.createdAt)}
                          </div>
                        </div>

                        <span
                          className={`max-w-full rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] ${selectedComparison.previous.ready
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {selectedComparison.previous.readinessLabel}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        {[
                          ['Resume Score', selectedComparison.previous.resumeScore ?? '--'],
                          ['Template', selectedComparison.previous.selectedTemplate || 'Not captured'],
                          ['ATS Score', selectedComparison.previous.atsScore ?? '--'],
                          ['Blockers', selectedComparison.previous.blockerCount],
                          ['Warnings', selectedComparison.previous.warningCount],
                          ['Roles', selectedComparison.previous.roleCount ?? '--'],
                          ['Skills', selectedComparison.previous.skillCount ?? '--'],
                          ['Role Family', selectedComparison.previous.roleFamily || '--'],
                          ['Target Pages', selectedComparison.previous.pageTarget ?? '--'],
                        ].map(([label, value]) => (
                          <div
                            key={`previous-${label}`}
                            className="min-w-0 rounded-[0.8rem] border border-[#DCE4EC] bg-white px-3 py-2.5"
                          >
                            <div className="text-[8px] font-black uppercase tracking-[0.1em] text-[#73869A]">
                              {label}
                            </div>
                            <div className="mt-1 break-words text-[12px] font-extrabold text-[#173A62]">
                              {value}
                            </div>
                          </div>
                        ))}

                        <div className="col-span-2 rounded-[0.8rem] border border-[#DCE4EC] bg-white px-3 py-2.5">
                          <div className="text-[8px] font-black uppercase tracking-[0.1em] text-[#73869A]">
                            Skill Mix
                          </div>
                          <div className="mt-1 text-[11px] font-extrabold text-[#173A62]">
                            {selectedComparison.previous.technicalSkillCount ?? '--'} technical /{' '}
                            {selectedComparison.previous.coreSkillCount ?? '--'} core
                          </div>
                        </div>

                        <div className="col-span-2 rounded-[0.8rem] border border-[#DCE4EC] bg-white px-3 py-2.5">
                          <div className="text-[8px] font-black uppercase tracking-[0.1em] text-[#73869A]">
                            Summary Snapshot
                          </div>
                          <div className="mt-1 text-[11px] font-extrabold text-[#173A62]">
                            {selectedComparison.previous.summaryWords ?? '--'} words
                          </div>
                          <div className="mt-1.5 text-[10px] leading-5 text-[#64748B]">
                            {selectedComparison.previous.summaryExcerpt ||
                              'No summary excerpt was captured in this checkpoint.'}
                          </div>
                        </div>

                        <div className="col-span-2 rounded-[0.8rem] border border-[#DCE4EC] bg-white px-3 py-2.5">
                          <div className="text-[8px] font-black uppercase tracking-[0.1em] text-[#73869A]">
                            Top Visible Skills
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {selectedComparison.previous.topSkills?.length ? (
                              selectedComparison.previous.topSkills.map((skill) => (
                                <span
                                  key={`previous-${skill}`}
                                  className="rounded-full border border-[#DCE4EC] bg-[#F8FAFC] px-2 py-1 text-[8px] font-bold text-[#60758B]"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-[#7A8CA0]">
                                No saved skills snapshot
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-0 rounded-[1.1rem] border border-dashed border-[#C9D4DF] bg-white/80 p-5">
                      <div className="flex h-full min-h-[330px] flex-col items-center justify-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#A87922]">
                          <Clock3 size={18} />
                        </div>
                        <div className="mt-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#A87922]">
                          Previous Checkpoint
                        </div>
                        <div className="mt-2 text-[15px] font-black text-[#173A62]">
                          No earlier checkpoint saved
                        </div>
                        <p className="mt-2 max-w-[300px] text-[11px] leading-5 text-[#71849A]">
                          Save another readiness check or ATS scan to create a reliable before-and-after comparison.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DIRECTION INDICATOR */}
                  <div className="hidden items-center justify-center self-center lg:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#A87922] shadow-[0_4px_12px_rgba(185,150,74,0.08)]">
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  {/* LATEST VERSION */}
                  <div className="min-w-0 rounded-[1.1rem] border border-[#C9D9E8] bg-white p-4 shadow-[0_8px_22px_rgba(15,43,75,0.05)] sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#A87922]">
                          {selectedComparison.latest.label}
                        </div>
                        <div className="mt-1 text-[13px] font-extrabold text-[#173A62]">
                          {formatDateTime(selectedComparison.latest.createdAt)}
                        </div>
                      </div>

                      <span
                        className={`max-w-full rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] ${selectedComparison.latest.ready
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {selectedComparison.latest.readinessLabel}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      {[
                        ['Resume Score', selectedComparison.latest.resumeScore ?? '--'],
                        ['Template', selectedComparison.latest.selectedTemplate || 'Not set'],
                        ['ATS Score', selectedComparison.latest.atsScore ?? '--'],
                        ['Blockers', selectedComparison.latest.blockerCount],
                        ['Warnings', selectedComparison.latest.warningCount],
                        ['Roles', selectedComparison.latest.roleCount ?? '--'],
                        ['Skills', selectedComparison.latest.skillCount ?? '--'],
                        ['Role Family', selectedComparison.latest.roleFamily || '--'],
                        ['Target Pages', selectedComparison.latest.pageTarget ?? '--'],
                      ].map(([label, value]) => (
                        <div
                          key={`latest-${label}`}
                          className="min-w-0 rounded-[0.8rem] border border-[#DCE4EC] bg-[#F8FAFC] px-3 py-2.5"
                        >
                          <div className="text-[8px] font-black uppercase tracking-[0.1em] text-[#73869A]">
                            {label}
                          </div>
                          <div className="mt-1 break-words text-[12px] font-extrabold text-[#173A62]">
                            {value}
                          </div>
                        </div>
                      ))}

                      <div className="col-span-2 rounded-[0.8rem] border border-[#DCE4EC] bg-[#F8FAFC] px-3 py-2.5">
                        <div className="text-[8px] font-black uppercase tracking-[0.1em] text-[#73869A]">
                          Skill Mix
                        </div>
                        <div className="mt-1 text-[11px] font-extrabold text-[#173A62]">
                          {selectedComparison.latest.technicalSkillCount ?? '--'} technical /{' '}
                          {selectedComparison.latest.coreSkillCount ?? '--'} core
                        </div>
                      </div>

                      <div className="col-span-2 rounded-[0.8rem] border border-[#DCE4EC] bg-[#F8FAFC] px-3 py-2.5">
                        <div className="text-[8px] font-black uppercase tracking-[0.1em] text-[#73869A]">
                          Summary Snapshot
                        </div>
                        <div className="mt-1 text-[11px] font-extrabold text-[#173A62]">
                          {selectedComparison.latest.summaryWords ?? '--'} words
                        </div>
                        <div className="mt-1.5 text-[10px] leading-5 text-[#64748B]">
                          {selectedComparison.latest.summaryExcerpt ||
                            'No summary excerpt saved for this checkpoint.'}
                        </div>
                      </div>

                      <div className="col-span-2 rounded-[0.8rem] border border-[#DCE4EC] bg-[#F8FAFC] px-3 py-2.5">
                        <div className="text-[8px] font-black uppercase tracking-[0.1em] text-[#73869A]">
                          Top Visible Skills
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedComparison.latest.topSkills?.length ? (
                            selectedComparison.latest.topSkills.map((skill) => (
                              <span
                                key={`latest-${skill}`}
                                className="rounded-full border border-[#DCE4EC] bg-white px-2 py-1 text-[8px] font-bold text-[#60758B]"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[#7A8CA0]">
                              No saved skills snapshot
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMPARISON SUMMARY */}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    {
                      label: 'Readiness Trend',
                      value: selectedComparison.previous
                        ? selectedComparison.readinessDelta || 'No change since last check'
                        : 'Waiting for a second readiness checkpoint',
                      detail:
                        'Compares blockers and warnings between the two saved checkpoints.',
                    },
                    {
                      label: 'ATS Trend',
                      value:
                        selectedComparison.atsDelta == null
                          ? 'No ATS trend available yet'
                          : selectedComparison.atsDelta > 0
                            ? `ATS improved by ${selectedComparison.atsDelta} points`
                            : selectedComparison.atsDelta < 0
                              ? `ATS decreased by ${Math.abs(selectedComparison.atsDelta)} points`
                              : 'ATS score stayed flat',
                      detail: 'Uses the latest two saved ATS scans when both are available.',
                    },
                    {
                      label: 'Resume Score Trend',
                      value:
                        selectedComparison.scoreDelta == null
                          ? 'No score trend available yet'
                          : selectedComparison.scoreDelta > 0
                            ? `Resume score improved by ${selectedComparison.scoreDelta} points`
                            : selectedComparison.scoreDelta < 0
                              ? `Resume score decreased by ${Math.abs(selectedComparison.scoreDelta)} points`
                              : 'Resume score stayed flat',
                      detail: 'Uses saved readiness metrics only; current values are not backfilled into history.',
                    },
                    {
                      label: 'Summary Length Trend',
                      value:
                        selectedComparison.summaryWordDelta == null
                          ? 'No summary comparison available yet'
                          : selectedComparison.summaryWordDelta > 0
                            ? `Summary grew by ${selectedComparison.summaryWordDelta} words`
                            : selectedComparison.summaryWordDelta < 0
                              ? `Summary tightened by ${Math.abs(selectedComparison.summaryWordDelta)} words`
                              : 'Summary length stayed flat',
                      detail: 'Shows whether the latest saved version became more concise or more detailed.',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[0.95rem] border border-[#DCE4EC] bg-white p-4 shadow-[0_4px_14px_rgba(15,43,75,0.035)]"
                    >
                      <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#A87922]">
                        {item.label}
                      </div>
                      <div className="mt-1.5 text-[12px] font-extrabold text-[#173A62]">
                        {item.value}
                      </div>
                      <div className="mt-1.5 text-[10px] leading-5 text-[#71849A]">
                        {item.detail}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-[0.95rem] border border-[#DCE4EC] bg-white p-4 shadow-[0_4px_14px_rgba(15,43,75,0.035)]">
                  <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#A87922]">
                    Visible Skill Changes
                  </div>

                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-[10px] font-extrabold text-[#173A62]">
                        Added to top skills
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedComparison.skillDelta.added.length ? (
                          selectedComparison.skillDelta.added.map((skill) => (
                            <span
                              key={`added-${skill}`}
                              className="rounded-full bg-emerald-100 px-2.5 py-1 text-[8px] font-bold text-emerald-800"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#71849A]">
                            No added top-skill changes recorded.
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-extrabold text-[#173A62]">
                        Removed from top skills
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedComparison.skillDelta.removed.length ? (
                          selectedComparison.skillDelta.removed.map((skill) => (
                            <span
                              key={`removed-${skill}`}
                              className="rounded-full bg-amber-100 px-2.5 py-1 text-[8px] font-bold text-amber-800"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#71849A]">
                            No removed top-skill changes recorded.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <aside
          className={`relative z-30 flex h-full shrink-0 flex-col overflow-hidden border-r border-white/[0.07] bg-[radial-gradient(circle_at_22%_0%,rgba(53,95,142,0.26),transparent_30%),linear-gradient(180deg,#08172D_0%,#071426_52%,#051020_100%)] shadow-[12px_0_42px_rgba(3,12,28,0.16)] transition-all duration-300 ${sidebarCollapsed ? 'w-[74px]' : 'w-[258px]'
            }`}
        >
          <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4">
            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={onHome}
                className="group flex min-w-0 items-center gap-2.5 rounded-[0.55rem] bg-transparent p-0 text-left transition hover:opacity-95"
                aria-label="Go to CareerSense home page"
              >
                <img
                  src={careerSenseLogo}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_5px_12px_rgba(0,0,0,0.20)]"
                />
                <div className="min-w-0 text-left">
                  <div className="whitespace-nowrap text-[0.95rem] font-black leading-none tracking-[-0.045em] text-white">
                    CareerSense
                  </div>
                  <div className="mt-1 whitespace-nowrap text-[6.5px] font-extrabold uppercase tracking-[0.22em] text-[#E1BC68]">
                    Resume Builder
                  </div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onHome}
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-[0.7rem] bg-transparent p-0 transition hover:bg-white/[0.05]"
                aria-label="Go to CareerSense home page"
              >
                <img
                  src={careerSenseLogo}
                  alt=""
                  aria-hidden="true"
                  className="h-[34px] w-[34px] shrink-0 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.22)]"
                />
              </button>
            )}

            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.035] text-[#8295AF] transition hover:border-[#D6B25E]/30 hover:bg-[#D6B25E]/10 hover:text-[#E6C978]"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={15} />
              </button>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
            {!sidebarCollapsed ? (
              <div className="mb-4 rounded-[0.95rem] border border-white/[0.075] bg-white/[0.04] p-3.5 shadow-[0_8px_22px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3">
                  <div
                    className="relative h-12 w-12 shrink-0 rounded-full"
                    style={{
                      background: `conic-gradient(#C89F47 ${profileCompleteness.percent * 3.6
                        }deg, rgba(255,255,255,.10) 0deg)`,
                    }}
                  >
                    <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-[#0A1930] text-[9px] font-black text-white shadow-inner">
                      {profileCompleteness.percent}%
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-white">Profile Complete</div>
                    <div className="mt-1 text-[8px] font-medium leading-[1.45] text-[#6F829E]">
                      Keep building your career profile.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-5 flex justify-center">
                <div
                  className="relative h-10 w-10 rounded-full"
                  style={{
                    background: `conic-gradient(#C89F47 ${profileCompleteness.percent * 3.6
                      }deg, #E8EEF4 0deg)`,
                  }}
                >
                  <div className="absolute inset-[4px] flex items-center justify-center rounded-full bg-[#0A1930] text-[7px] font-black text-white shadow-inner">
                    {profileCompleteness.percent}%
                  </div>
                </div>
              </div>
            )}

            {[
              {
                title: 'Workspace',
                items: navItems.filter((item) => ['dashboard', 'profile'].includes(item.id)),
              },
              {
                title: 'Resume Workspace',
                items: navItems.filter((item) => ['resumes', 'templates', 'history'].includes(item.id)),
              },
              {
                title: 'Account',
                items: navItems.filter((item) => item.id === 'billing'),
              },
            ].map((group) => (
              <div key={group.title} className="mb-5">
                {!sidebarCollapsed ? (
                  <div className="mb-2 px-2 text-[7.5px] font-black uppercase tracking-[0.21em] text-[#4F6482]">
                    {group.title}
                  </div>
                ) : null}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === 'templates') {
                            onViewTemplates?.();
                            return;
                          }

                          setActiveSection(item.id);
                        }}
                        title={item.label}
                        className={`relative flex w-full items-center rounded-[0.8rem] border transition-all duration-200 ${sidebarCollapsed
                            ? 'h-11 justify-center px-2'
                            : 'min-h-[42px] gap-3 px-3'
                          } ${active
                            ? 'border-[#D6B25E]/20 bg-[#D6B25E]/[0.085] text-white shadow-[inset_3px_0_0_#D6B25E,0_5px_16px_rgba(0,0,0,0.08)]'
                            : 'border-transparent text-[#91A3BD] hover:border-white/[0.055] hover:bg-white/[0.045] hover:text-white'
                          }`}
                      >
                        <Icon
                          size={16}
                          className={active ? 'text-[#E4C56F]' : 'text-[#7085A2]'}
                        />

                        {!sidebarCollapsed ? (
                          <>
                            <span className={`min-w-0 flex-1 truncate text-left text-[10.5px] ${active ? 'font-black' : 'font-semibold'}`}>
                              {item.label}
                            </span>

                            {item.count ? (
                              <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.045] px-2 py-0.5 text-[6.5px] font-black uppercase tracking-[0.08em] text-[#70839E]">
                                {item.count}
                              </span>
                            ) : null}
                          </>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!sidebarCollapsed ? (
            <div className="mx-3 mb-3 rounded-[0.95rem] border border-[#D6B25E]/20 bg-[linear-gradient(145deg,rgba(214,178,94,0.08),rgba(255,255,255,0.035))] p-3.5 shadow-[0_10px_26px_rgba(0,0,0,0.10)]">
              <div className="text-[7px] font-black uppercase tracking-[0.22em] text-[#E7C86E]">
                Your Next Move
              </div>
              <div className="mt-2 text-[10.5px] font-black text-white">
                {profileCompleteness.percent < 100
                  ? 'Complete your profile'
                  : 'Create your next resume'}
              </div>
              <div className="mt-1 text-[8px] font-medium text-white/45">
                {profileCompleteness.percent}% profile complete
              </div>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B88931] to-[#E7C86E]"
                  style={{ width: `${profileCompleteness.percent}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="border-t border-white/[0.07] p-3">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D6B25E]/30 bg-[linear-gradient(145deg,#173A62,#0A203A)] text-[12px] font-black text-[#F0D27D] shadow-[0_5px_14px_rgba(0,0,0,0.16)]">
                  {(profileDraft.name || 'U').charAt(0)}
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.035] text-[#8295AF] transition hover:border-[#D6B25E]/30 hover:bg-[#D6B25E]/10 hover:text-[#E6C978]"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-[0.8rem] border border-transparent px-2 py-2 transition hover:border-white/[0.06] hover:bg-white/[0.035]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D6B25E]/30 bg-[linear-gradient(145deg,#173A62,#0A203A)] text-[12px] font-black text-[#F0D27D] shadow-[0_5px_14px_rgba(0,0,0,0.16)]">
                  {(profileDraft.name || 'U').charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-black text-white">
                    {profileDraft.name || 'CareerSense User'}
                  </div>
                  <div className="mt-0.5 truncate text-[7.5px] font-medium text-[#667A96]">
                    {profileDraft.title || `${formatNumber(stats.totalCareerPoints)} points used`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="text-[#70839E] transition hover:text-[#E4C56F]"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-y-auto bg-transparent custom-scrollbar">
          <header className="sticky top-0 z-40 border-b border-[#DCE4EC] bg-white/94 px-4 py-3 shadow-[0_7px_22px_rgba(15,43,75,0.045)] backdrop-blur-xl sm:px-5 lg:px-6">
            <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem] border border-[#DDE5EC] bg-white text-[#718398] transition hover:border-[#C49A43]/35 hover:bg-[#FFF9EC] hover:text-[#A77924] sm:flex"
                    title="Back"
                  >
                    <ArrowLeft size={14} />
                  </button>
                ) : null}

                <div className="min-w-0">
                  <div className="truncate text-[1.15rem] font-black tracking-[-0.035em] text-[#173A62] sm:text-[1.3rem]">
                    {getPageTitle()}
                  </div>
                  <div className="mt-0.5 hidden text-[8.5px] font-medium text-[#8293A6] sm:block">
                    {activeSection === 'dashboard'
                      ? 'Track your resume progress, analysis activity, and CareerSense AI usage.'
                      : navItems.find((item) => item.id === activeSection)?.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onStartNew ? (
                  <button
                    type="button"
                    onClick={onStartNew}
                    className="inline-flex min-h-[38px] items-center gap-2 rounded-[0.7rem] bg-[#123B6D] px-3.5 text-[8px] font-black uppercase tracking-[0.13em] text-white shadow-[0_6px_16px_rgba(18,59,109,0.14)] transition hover:-translate-y-0.5 hover:bg-[#0D315D]"
                  >
                    <Plus size={13} />
                    <span className="hidden sm:inline">Create New Resume</span>
                    <span className="sm:hidden">New</span>
                  </button>
                ) : null}

                <div className="ml-1 flex items-center">
                  <CustomUserButton onOpenDashboard={(tab) => {
                    if (tab) setActiveSection(tab);
                  }} />
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 pb-16 sm:p-5 lg:p-5 xl:p-6">
            <div className="mx-auto max-w-[1380px]">{renderActiveSection()}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResumeRepository;
