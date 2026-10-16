import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Download, Loader2, Trash2, User,
  PanelLeftOpen, Camera, X, Eye, Search, ScanLine, MessageSquare, PencilLine, ZoomIn, ZoomOut, Maximize2, Save, Gauge, ChevronDown, ChevronUp, LayoutGrid, Sparkles, AlertTriangle, BadgeInfo, CheckCircle2
} from 'lucide-react';

import { useUser } from '@clerk/clerk-react';
import { checkDownloadPass } from '../../services/downloadGateService';
import DownloadGateModal from '../common/DownloadGateModal';
import ResumePreview from "../resume/ResumePreview";
import ResumeThumbnail from "../resume/ResumeThumbnail";
import { TEMPLATES, TOP_TEMPLATE_IDS } from '../../data/templateCatalog';
import {
  calculatePageBreaks,
  exportPaginatedA4ElementToPdf,
  findExistingA4Pages,
  getA4PageHeightPx,
  waitForEmbeddedAssets,
} from '../../PDFExport';
import { getSkillSuggestions } from './skillsLibrary';
import poojaImage from '../../assets/Pooja.png';
import BuilderNavbar from './BuilderNavbar';

// --- IMPORTS FOR AI FEATURES ---
import AIEnhanceModal from './AIEnhanceModal';
import ATSScoreModal from './ATSScoreModal';
import InterviewPrepModal from './InterviewPrepModal';

import { normalizeDocumentSettings } from '../resume/ResumePreview';
import { mergeVolunteeringIntoExperience } from '../../utils/volunteeringExperience';
import { findResumeContentSurface } from '../resume/templateSurfaceUtils';
import {
  detectListMode,
  formatTextWithListMode,
  getInitialListValue,
  getListInsertion,
  getModePlaceholder,
  LIST_MODES,
  stripListPrefix,
} from '../../utils/listTextFormatting';
import { getResumeInsights, getTemplateRecommendations } from '../../utils/resumeInsights';
import { createPresentationPlan } from '../../utils/presentationPlan';
import {
  condenseResumeLines,
  normalizeResumeSkills,
  trimResumeSkills,
} from '../../utils/templateSmartActions';
import {
  appendExportReadinessSnapshot,
  appendATSResult,
  appendInterviewPrepResult,
  getResumeRecord,
  markResumePrinted,
  saveResumeRecord,
} from '../../services/resumeRepositoryService';

const DESKTOP_PREVIEW_SCALE = 0.85;
const A4_PREVIEW_WIDTH_PX = 794;
const DEFAULT_EDITOR_PANEL_WIDTH = 408;
const MIN_EDITOR_PANEL_WIDTH = 340;
const MAX_EDITOR_PANEL_WIDTH = 640;
const COLLAPSED_EDITOR_PANEL_WIDTH = 78;
const EDITOR_HELP_STEPS = [
  {
    id: 'workspace',
    target: 'workspace-tabs',
    title: 'Your editing workspace',
    description: 'Use Data to update resume content and Template to change the visual design. Your changes are saved automatically.',
  },
  {
    id: 'data',
    target: 'data-editor',
    title: 'Add and update your information',
    description: 'Choose a resume section here, then fill in personal details, experience, education, skills, projects, and more.',
  },
  {
    id: 'templates',
    target: 'template-picker',
    title: 'Choose a template',
    description: 'Search and select a template at any time. Your resume data stays intact while the live canvas updates.',
  },
  {
    id: 'design',
    target: 'design-controls',
    title: 'Fine-tune the design',
    description: 'Open Design Controls to change the font family, section spacing, font size, and line height.',
  },
  {
    id: 'preview',
    target: 'preview-actions',
    title: 'Check and export your resume',
    description: 'Use Print Preview to verify A4 page flow, then Export PDF when the resume is ready. Save creates a manual checkpoint.',
  },
  {
    id: 'canvas-tools',
    target: 'canvas-tools',
    title: 'Edit and inspect the live canvas',
    description: 'Turn on live edit to change text directly in the preview, or use the zoom controls to inspect and fit the page.',
  },
];
const FONT_OPTIONS = [
  { value: 'inter', label: 'Modern Sans' },
  { value: 'arial', label: 'Arial' },
  { value: 'times', label: 'Times New Roman' },
  { value: 'calibri', label: 'Calibri' },
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'verdana', label: 'Verdana' },
  { value: 'rubik', label: 'Rubik' },
  { value: 'manrope', label: 'Manrope' },
  { value: 'source', label: 'Humanist Sans' },
  { value: 'lora', label: 'Lora' },
  { value: 'georgia', label: 'Classic Serif' },
  { value: 'garamond', label: 'Editorial Serif' },
  { value: 'mono', label: 'Technical Mono' },
];
const LIST_MODE_OPTIONS = [
  { value: LIST_MODES.PLAIN, label: 'None' },
  { value: LIST_MODES.BULLET, label: 'Bullets' },
  { value: LIST_MODES.NUMBER, label: 'Numbers' },
];
const SECTION_COPY = {
  document: {
    heading: 'Shape the final look',
    description: 'Tune typography, spacing, and page rhythm while keeping the live preview aligned with export.',
  },
  templates: {
    heading: 'Switch visual direction',
    description: 'Compare template personalities without losing any of your content or formatting decisions.',
  },
  'target-jd': {
    heading: 'Align to the job',
    description: 'Paste the role description here to unlock ATS scoring and interview prep against your target position.',
  },
  personal: {
    heading: 'Refine the first impression',
    description: 'Tighten your header and summary so the resume opens with clarity and confidence.',
  },
  experience: {
    heading: 'Strengthen your experience',
    description: 'Edit roles, dates, and achievements while checking how the story flows in the live preview.',
  },
  education: {
    heading: 'Keep your credentials clean',
    description: 'Confirm schools, degrees, and dates so the education section stays crisp and scan-friendly.',
  },
  skills: {
    heading: 'Organize your strengths',
    description: 'Group technical and core skills in a way that matches the role and reads quickly.',
  },
  projects: {
    heading: 'Show proof of impact',
    description: 'Use projects to reinforce the experience section with tangible examples and outcomes.',
  },
  certifications: {
    heading: 'Support your expertise',
    description: 'Add certifications that strengthen credibility without overcrowding the page.',
  },
  awards: {
    heading: 'Highlight standout wins',
    description: 'Feature recognitions that make your profile more memorable and more credible.',
  },
  languages: {
    heading: 'Add range and fluency',
    description: 'Show language coverage clearly, especially for global and client-facing roles.',
  },
};
const SECTION_STATUS_META = {
  complete: {
    label: 'Ready',
    dotClassName: 'bg-[#123B6D]',
    pillClassName: 'border border-[#123B6D]/20 bg-[#E8EEF7] text-[#123B6D]',
  },
  progress: {
    label: 'Needs Work',
    dotClassName: 'bg-[#B9964A]',
    pillClassName: 'border border-[#B9964A]/30 bg-[#B9964A]/10 text-[#9A7628]',
  },
  empty: {
    label: 'Empty',
    dotClassName: 'bg-[#CBD5E1]',
    pillClassName: 'border border-[#E1E7EF] bg-[#F7F8FA] text-[#64748B]',
  },
};

const buildEditorGuidance = ({ insights, selectedTemplateMeta, selectedTemplateRecommendation, previewPagesLength }) => {
  const items = [];

  if (selectedTemplateRecommendation?.reasons?.[0]) {
    items.push({
      tone: 'positive',
      icon: Sparkles,
      title: 'Why this template works',
      text: selectedTemplateRecommendation.reasons[0],
    });
  }

  if (insights.predictedPagePressure === 'high') {
    items.push({
      tone: 'warning',
      icon: AlertTriangle,
      title: 'Content density warning',
      text: `This resume is likely to need ${insights.recommendedPageCount} pages. Condense older roles and trim lower-value details if you want a tighter layout.`,
    });
  }

  if (insights.skillsOverflowRisk !== 'low') {
    items.push({
      tone: 'info',
      icon: BadgeInfo,
      title: 'Skills section',
      text: `You currently show ${insights.totalSkillCount} skills. The strongest resumes usually keep the visible set closer to 12-16 high-signal skills.`,
    });
  }

  if (selectedTemplateMeta?.columns === '2' && insights.predictedPagePressure === 'high') {
    items.push({
      tone: 'warning',
      icon: AlertTriangle,
      title: 'Layout fit',
      text: `${selectedTemplateMeta.name} is more visual, so dense experience may feel compressed. A single-column template may breathe better.`,
    });
  }

  if (previewPagesLength > insights.recommendedPageCount) {
    items.push({
      tone: 'info',
      icon: BadgeInfo,
      title: 'Page count',
      text: `Your live preview is already at ${previewPagesLength} pages. Review summary length, skills count, and older-role bullets before export.`,
    });
  }

  return items.slice(0, 3);
};

const LOCAL_WORD_REGEX = /[a-zA-Z][a-zA-Z0-9'+-]*/g;
const WEAK_BULLET_PATTERNS = [
  /^responsible\b/i,
  /^worked\b/i,
  /^helped\b/i,
  /^assisted\b/i,
  /^supported\b/i,
  /^involved\b/i,
  /^participated\b/i,
  /^handled\b/i,
  /^tasked\b/i,
  /^was\b/i,
  /^were\b/i,
  /^did\b/i,
  /^used\b/i,
];
const countInlineWords = (value = '') => (String(value).match(LOCAL_WORD_REGEX) || []).length;
const splitResumeLines = (value = '') =>
  String(value)
    .split(/\r?\n+/)
    .map((line) => stripListPrefix(line).trim())
    .filter(Boolean);

const trimSummaryToWordTarget = (summary = '', maxWords = 80) => {
  const words = String(summary).trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return String(summary || '').trim();
  return `${words.slice(0, maxWords).join(' ').replace(/[,:;-\s]+$/, '')}.`;
};

const buildContentFitAudit = ({
  insights,
  plan,
  previewPagesLength,
  selectedTemplateMeta,
}) => {
  const audit = [];
  const scoreLookup = Object.fromEntries(
    (insights.resumeScoreBreakdown || []).map((item) => [item.key, item.score])
  );

  if (countInlineWords(plan.currentSummary || '') > plan.summaryTargetWords + 10) {
    audit.push({
      key: 'summary',
      severity: 'warning',
      title: 'Summary is longer than the target',
      detail: `This template plan targets about ${plan.summaryTargetWords} words, but the current summary is heavier than that.`,
      actionId: 'tighten-summary',
      actionLabel: 'Tighten summary',
    });
  }

  if (insights.totalSkillCount > plan.skillsLimit) {
    audit.push({
      key: 'skills',
      severity: 'warning',
      title: 'Visible skills exceed the layout target',
      detail: `${selectedTemplateMeta?.name || 'This template'} is planning for about ${plan.skillsLimit} visible skills, while the resume currently shows ${insights.totalSkillCount}.`,
      actionId: 'trim-skills',
      actionLabel: 'Trim skills',
    });
  }

  if (previewPagesLength > plan.targetPages || insights.predictedPagePressure === 'high') {
    audit.push({
      key: 'pages',
      severity: 'warning',
      title: 'Content is pushing past the ideal page footprint',
      detail: `The current plan is tuned for ${plan.targetPages} page${plan.targetPages === 1 ? '' : 's'}, but dense experience is likely to compress this template.`,
      actionId: 'condense-roles',
      actionLabel: 'Condense roles',
    });
  }

  if ((scoreLookup.verbs || 0) < 68 && insights.experienceCount > 0) {
    audit.push({
      key: 'verbs',
      severity: 'info',
      title: 'Experience bullets could sound stronger',
      detail: 'Some bullets may still read as responsibilities instead of achievements, which weakens recruiter impact.',
      actionId: 'rewrite-weakest-bullets',
      actionLabel: 'AI rewrite weakest bullets',
    });
  }

  if ((scoreLookup.repetition || 0) < 72) {
    audit.push({
      key: 'repetition',
      severity: 'info',
      title: 'Some phrasing may feel repetitive',
      detail: 'Repeated wording or similar bullet starts can make the resume feel flatter than it should.',
      actionId: 'rewrite-weakest-bullets',
      actionLabel: 'AI rewrite weakest bullets',
    });
  }

  if (plan.warnings?.length && !audit.some((item) => item.key === 'template-fit')) {
    audit.push({
      key: 'template-fit',
      severity: 'info',
      title: 'Template fit still has tradeoffs',
      detail: plan.warnings[0],
      actionId: 'review-template',
      actionLabel: 'Review template',
    });
  }

  return audit.slice(0, 4);
};

const scoreWeakBullet = (line = '', jdText = '', jdAware = false) => {
  const trimmed = String(line).trim();
  if (!trimmed) return -999;

  const words = countInlineWords(trimmed);
  const hasMetric = /\b\d/.test(trimmed) || /\b(percent|%|kpi|roi|revenue|cost|growth|time|hours|days)\b/i.test(trimmed);
  const startsWeak = WEAK_BULLET_PATTERNS.some((pattern) => pattern.test(trimmed));
  const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() || '';
  const jdScore = jdAware && jdText.trim() ? scoreTextAgainstJd(trimmed, jdText) : 0;

  let score = 100;
  if (startsWeak) score -= 35;
  if (!hasMetric) score -= 18;
  if (words < 8) score -= 16;
  if (words > 32) score -= 10;
  if (['responsible', 'worked', 'helped', 'assisted', 'supported', 'used'].includes(firstWord)) score -= 10;
  if (jdAware && jdText.trim()) {
    if (jdScore === 0) score -= 20;
    else if (jdScore < 3) score -= 10;
  }

  return score;
};

const findWeakestExperienceBulletGroup = (experience = [], options = {}) => {
  const jdText = options.jdText || '';
  const jdAware = Boolean(options.jdAware && jdText.trim());
  let weakest = null;

  (Array.isArray(experience) ? experience : []).forEach((item) => {
    const lines = splitResumeLines(item?.desc);
    if (!lines.length) return;

    const scoredLines = lines
      .map((line, index) => ({
        line,
        index,
        score: scoreWeakBullet(line, jdText, jdAware),
        jdScore: jdAware ? scoreTextAgainstJd(line, jdText) : 0,
      }))
      .sort((a, b) => a.score - b.score);

    const weakestLines = scoredLines.slice(0, Math.min(2, scoredLines.length));
    if (!weakestLines.length) return;

    const averageScore =
      weakestLines.reduce((total, entry) => total + entry.score, 0) / weakestLines.length;
    const jdScoreAverage =
      weakestLines.reduce((total, entry) => total + entry.jdScore, 0) / weakestLines.length;
    const selectionReason = jdAware
      ? jdScoreAverage <= 1
        ? 'they were weak and under-matched to the JD'
        : 'they were the weakest JD-aligned bullets in this role'
      : 'they were the weakest bullets in this role';

    if (!weakest || averageScore < weakest.averageScore) {
      weakest = {
        roleId: item.id,
        roleLabel: item?.role || item?.company || 'Experience',
        averageScore,
        indices: weakestLines.map((entry) => entry.index),
        text: weakestLines.map((entry) => entry.line).join('\n'),
        jdAware,
        jdScoreAverage,
        selectedCount: weakestLines.length,
        selectionReason,
      };
    }
  });

  return weakest;
};

const buildSafeTrimPlan = ({ resume, presentationPlan }) => {
  const currentSummary = (resume.personal?.summary || '').trim();
  const nextSummary = trimSummaryToWordTarget(
    currentSummary,
    presentationPlan.summaryTargetWords
  );

  const currentSkillCount =
    (Array.isArray(resume.skills?.technical) ? resume.skills.technical.length : 0) +
    (Array.isArray(resume.skills?.core) ? resume.skills.core.length : 0);
  const trimmedSkills = trimResumeSkills(resume.skills, presentationPlan.skillsLimit);
  const nextSkillCount = trimmedSkills.technical.length + trimmedSkills.core.length;

  let changedRoleCount = 0;
  const nextExperience = (resume.experience || []).map((item, index) => {
    if (index < 2) return item;

    const nextDesc = condenseResumeLines(item?.desc, 2);
    if (nextDesc !== (item?.desc || '')) {
      changedRoleCount += 1;
      return {
        ...item,
        fullDescBackup: item.fullDescBackup || item.desc || '',
        desc: nextDesc,
      };
    }

    return item;
  });

  const summaryChanged = Boolean(nextSummary) && nextSummary !== currentSummary;
  const skillsChanged = nextSkillCount < currentSkillCount;
  const hasChanges = summaryChanged || skillsChanged || changedRoleCount > 0;
  const appliedChanges = [
    summaryChanged ? `tightened summary to the ${presentationPlan.summaryTargetWords}-word target` : null,
    skillsChanged ? `trimmed skills from ${currentSkillCount} to ${nextSkillCount}` : null,
    changedRoleCount > 0 ? `condensed ${changedRoleCount} older role${changedRoleCount === 1 ? '' : 's'}` : null,
  ].filter(Boolean);

  return {
    hasChanges,
    summaryChanged,
    skillsChanged,
    changedRoleCount,
    currentSkillCount,
    nextSkillCount,
    trimmedSkills,
    nextExperience,
    nextResume: {
      ...resume,
      personal: summaryChanged
        ? {
            ...resume.personal,
            summary: nextSummary,
          }
        : resume.personal,
      skills: skillsChanged ? trimmedSkills : resume.skills,
      experience: nextExperience,
    },
    skillDrafts: skillsChanged
      ? {
          technical: trimmedSkills.technical.join(', '),
          core: trimmedSkills.core.join(', '),
        }
      : null,
    focusSection: summaryChanged ? 'personal' : skillsChanged ? 'skills' : 'experience',
    message: hasChanges
      ? `Applied safe trims: ${appliedChanges.join(', ')}.`
      : 'Everything already fits the current template well, so no safe trims were needed.',
  };
};

const buildExportReadinessItems = ({
  previewPagesLength,
  presentationPlan,
  criticalSectionGaps,
  previewMetrics,
  resume,
  resumeInsights,
  contentFitAudit,
  weakestGroup,
  mode,
  jdText,
  latestAtsEntry,
}) => {
  const items = [];
  const hasCoreContactFields = Boolean(
    String(resume?.personal?.name || '').trim() &&
    String(resume?.personal?.email || '').trim() &&
    String(resume?.personal?.phone || '').trim()
  );
  const hasPageOverflow = previewPagesLength > presentationPlan.targetPages;
  const hasSummaryOverflow = resumeInsights.summaryWords > presentationPlan.summaryTargetWords + 10;
  const hasSkillsOverflow = resumeInsights.totalSkillCount > presentationPlan.skillsLimit;
  const weakVerbScore = (resumeInsights.resumeScoreBreakdown || []).find((item) => item.key === 'verbs')?.score || 0;
  const latestAtsScore = latestAtsEntry?.result?.score;

  items.push({
    key: 'pages',
    label: hasPageOverflow
      ? `${previewPagesLength} pages detected for a ${presentationPlan.targetPages}-page target`
      : `${previewPagesLength} page${previewPagesLength === 1 ? '' : 's'} mapped cleanly`,
    status: hasPageOverflow ? 'blocker' : 'pass',
    section: 'experience',
    actionId: hasPageOverflow ? 'apply-safe-trims' : null,
  });

  items.push({
    key: 'sections',
    label: criticalSectionGaps === 0
      ? 'Core sections are filled'
      : `${criticalSectionGaps} core section${criticalSectionGaps === 1 ? '' : 's'} still need attention`,
    status: criticalSectionGaps === 0 ? 'pass' : 'blocker',
    section: criticalSectionGaps === 0 ? null : 'personal',
  });

  items.push({
    key: 'contact',
    label: hasCoreContactFields
      ? 'Name, email, and phone are ready for export'
      : 'Contact essentials are incomplete',
    status: hasCoreContactFields ? 'pass' : 'blocker',
    section: hasCoreContactFields ? null : 'personal',
  });

  items.push({
    key: 'summary',
    label: hasSummaryOverflow
      ? 'Summary is still longer than the current template target'
      : 'Summary length fits the current template target',
    status: hasSummaryOverflow ? 'warning' : 'pass',
    section: 'personal',
    actionId: hasSummaryOverflow ? 'tighten-summary' : null,
  });

  items.push({
    key: 'skills',
    label: hasSkillsOverflow
      ? `Skills are still above the selective cap of ${presentationPlan.skillsLimit}`
      : 'Skills are within the current layout target',
    status: hasSkillsOverflow ? 'warning' : 'pass',
    section: 'skills',
    actionId: hasSkillsOverflow ? 'trim-skills' : null,
  });

  items.push({
    key: 'bullets',
    label: weakestGroup?.text && weakVerbScore < 68
      ? `Weak bullets are still reducing recruiter impact in ${weakestGroup.roleLabel}`
      : 'Experience bullets are in a workable export range',
    status: weakestGroup?.text && weakVerbScore < 68 ? 'warning' : 'pass',
    section: 'experience',
    actionId: weakestGroup?.text && weakVerbScore < 68 ? 'rewrite-weakest-bullets' : null,
  });

  items.push({
    key: 'sizing',
    label: previewMetrics.pageHeight ? 'A4 sizing is ready' : 'Sizing preview still initializing',
    status: previewMetrics.pageHeight ? 'pass' : 'warning',
    section: 'document',
  });

  if (mode === 'tailor' && jdText.trim()) {
    items.push({
      key: 'ats',
      label: latestAtsScore == null
        ? 'ATS scan has not been run for this resume and JD yet'
        : latestAtsScore >= 75
          ? `ATS scan looks healthy at ${latestAtsScore}`
          : `ATS score is ${latestAtsScore}; another tailoring pass may help`,
      status: latestAtsScore == null ? 'warning' : latestAtsScore >= 75 ? 'pass' : 'warning',
      section: 'target-jd',
      actionId: 'review-ats',
    });
  }

  if (contentFitAudit.some((item) => item.severity === 'warning') && !hasPageOverflow) {
    items.push({
      key: 'fit',
      label: 'Some content-fit warnings are still present, but export is still possible',
      status: 'warning',
      section: 'experience',
      actionId: 'apply-safe-trims',
    });
  }

  return items;
};

const EDITOR_TAB_CONFIG = [
  { id: 'data', label: 'Data', icon: User },
  { id: 'template', label: 'Template', icon: LayoutGrid },
];

// Retain the per-section spacing implementation for later, but keep it out of
// the Data editor until the manual layout controls are needed again.
const SHOW_SECTION_LAYOUT_SPACING = false;

const TAB_SECTION_GROUPS = {
  data: ['personal', 'experience', 'education', 'skills', 'projects', 'certifications', 'awards', 'languages', 'target-jd'],
  template: ['templates'],
  style: ['document'],
};

const SECTION_SELECT_LABELS = {
  document: 'AI Analysis & Style',
  templates: 'Change Template',
  'target-jd': 'Target Job (JD)',
  personal: 'Personal Details',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  awards: 'Awards',
  languages: 'Languages',
};

const getEditorTabForSection = (sectionId) => {
  if (TAB_SECTION_GROUPS.template.includes(sectionId)) return 'template';
  if (TAB_SECTION_GROUPS.style.includes(sectionId)) return 'style';
  if (TAB_SECTION_GROUPS.data.includes(sectionId)) return 'data';
  return 'data';
};

const getTrimmedText = (value) => (typeof value === 'string' ? value.trim() : '');

const getFilledFieldCount = (entry, fields) =>
  fields.reduce((count, field) => count + (getTrimmedText(entry?.[field]) ? 1 : 0), 0);

const getListCompletionStatus = (items, fields) => {
  if (!Array.isArray(items) || items.length === 0) return 'empty';

  const filledItems = items.filter((item) => getFilledFieldCount(item, fields) > 0);
  if (!filledItems.length) return 'empty';

  const isComplete = filledItems.every((item) => getFilledFieldCount(item, fields) === fields.length);
  return isComplete ? 'complete' : 'progress';
};

const normalizeSkillItems = (value) =>
  (Array.isArray(value) ? value : [])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

const mergeSkillItems = (...lists) => {
  const seen = new Set();

  return lists
    .flatMap((list) => normalizeSkillItems(list))
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const buildRecommendedSkillLookup = (skills = {}, totalLimit = 14) => {
  const trimmed = trimResumeSkills(skills, totalLimit);
  return new Set(
    [...trimmed.technical, ...trimmed.core].map((item) => item.toLowerCase())
  );
};

const normalizeComparisonText = (value = '') =>
  String(value).toLowerCase().replace(/[^a-z0-9+#./\s-]/g, ' ');

const splitSummarySentences = (value = '') =>
  String(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const scoreTextAgainstJd = (text = '', jdText = '') => {
  const normalizedText = normalizeComparisonText(text).trim();
  const jdHaystack = normalizeComparisonText(jdText);
  if (!normalizedText || !jdHaystack) return 0;

  const exactMatch = jdHaystack.includes(normalizedText);
  const wordHits = normalizedText
    .split(/\s+/)
    .filter((part) => part.length >= 3 && jdHaystack.includes(part)).length;

  return (exactMatch ? 100 : 0) + wordHits;
};

const selectTopRelevantEntries = (items = [], jdText = '', limit = 3) => {
  const scored = items
    .map((item, index) => ({
      item,
      index,
      score: scoreTextAgainstJd(item, jdText),
    }))
    .filter((entry) => entry.item)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.index - right.index;
    })
    .slice(0, limit)
    .sort((left, right) => left.index - right.index);

  return scored;
};

const buildJdRecommendedSkillLookup = (skills = {}, jdText = '', totalLimit = 14) => {
  const normalizedSkills = normalizeResumeSkills(skills);
  const jdHaystack = normalizeComparisonText(jdText);
  const allSkills = [...normalizedSkills.technical, ...normalizedSkills.core];

  const scoredSkills = allSkills
    .map((skill, index) => {
      const normalizedSkill = normalizeComparisonText(skill).trim();
      const exactMatch = normalizedSkill ? jdHaystack.includes(normalizedSkill) : false;
      const wordHits = normalizedSkill
        .split(/\s+/)
        .filter((part) => part.length >= 3 && jdHaystack.includes(part)).length;

      return {
        skill,
        index,
        score: (exactMatch ? 100 : 0) + wordHits,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.index - right.index;
    });

  const topSkills = scoredSkills.slice(0, totalLimit).map((item) => item.skill.toLowerCase());
  return new Set(topSkills);
};

const parseDataPath = (path = '') =>
  String(path)
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

const getValueAtPath = (source, path) =>
  parseDataPath(path).reduce((current, segment) => current?.[segment], source);

const setValueAtPath = (source, path, value) => {
  const segments = parseDataPath(path);
  if (!segments.length) return source;

  const rootClone = Array.isArray(source) ? [...source] : { ...(source || {}) };
  let targetCursor = rootClone;
  let sourceCursor = source;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const nextSource = sourceCursor?.[segment];
    const nextSegment = segments[index + 1];
    const nextClone = Array.isArray(nextSource)
      ? [...nextSource]
      : nextSource && typeof nextSource === 'object'
        ? { ...nextSource }
        : /^\d+$/.test(nextSegment)
          ? []
          : {};

    targetCursor[segment] = nextClone;
    targetCursor = nextClone;
    sourceCursor = nextSource;
  }

  const finalSegment = segments[segments.length - 1];
  const existingValue = sourceCursor?.[finalSegment];
  targetCursor[finalSegment] = Array.isArray(existingValue)
    ? String(value).split(',').map((item) => item.trim()).filter(Boolean)
    : value;

  return rootClone;
};

const normalizeEditableText = (value = '') => {
  const raw = String(value ?? '');
  const cleanedLines = raw
    .split('\n')
    .map((line) => stripListPrefix(line).trim())
    .filter(Boolean);
  const normalizedSource = cleanedLines.length ? cleanedLines.join(' ') : raw;

  return normalizedSource.replace(/\s+/g, ' ').trim().toLowerCase();
};

const pushEditableDescriptor = (target, path, label, value, multiline = false) => {
  const normalizedValue = normalizeEditableText(value);
  if (!normalizedValue) return;

  target.push({
    path,
    label,
    value,
    normalizedValue,
    multiline,
  });
};

const buildEditableFieldDescriptors = (resume) => {
  const descriptors = [];

  pushEditableDescriptor(descriptors, 'personal.name', 'Full Name', resume?.personal?.name);
  pushEditableDescriptor(descriptors, 'personal.title', 'Job Title', resume?.personal?.title);
  pushEditableDescriptor(descriptors, 'personal.email', 'Email', resume?.personal?.email);
  pushEditableDescriptor(descriptors, 'personal.phone', 'Phone', resume?.personal?.phone);
  pushEditableDescriptor(descriptors, 'personal.location', 'Location', resume?.personal?.location);
  pushEditableDescriptor(descriptors, 'personal.linkedin', 'LinkedIn', resume?.personal?.linkedin);
  pushEditableDescriptor(descriptors, 'personal.github', 'GitHub', resume?.personal?.github);
  pushEditableDescriptor(descriptors, 'personal.website', 'Website', resume?.personal?.website);
  pushEditableDescriptor(descriptors, 'personal.portfolio', 'Portfolio', resume?.personal?.portfolio);
  pushEditableDescriptor(descriptors, 'personal.summary', 'Professional Summary', resume?.personal?.summary, true);

  (resume?.experience || []).forEach((item, index) => {
    pushEditableDescriptor(descriptors, `experience[${index}].role`, 'Experience Role', item?.role);
    pushEditableDescriptor(descriptors, `experience[${index}].company`, 'Experience Company', item?.company);
    pushEditableDescriptor(descriptors, `experience[${index}].date`, 'Experience Date', item?.date);
    pushEditableDescriptor(descriptors, `experience[${index}].location`, 'Experience Location', item?.location);
    pushEditableDescriptor(descriptors, `experience[${index}].employmentType`, 'Employment Type', item?.employmentType);
    pushEditableDescriptor(descriptors, `experience[${index}].desc`, 'Experience Description', item?.desc, true);
  });

  (resume?.education || []).forEach((item, index) => {
    pushEditableDescriptor(descriptors, `education[${index}].degree`, 'Education Degree', item?.degree);
    pushEditableDescriptor(descriptors, `education[${index}].school`, 'Education School', item?.school);
    pushEditableDescriptor(descriptors, `education[${index}].date`, 'Education Date', item?.date);
    pushEditableDescriptor(descriptors, `education[${index}].specialization`, 'Education Specialization', item?.specialization);
    pushEditableDescriptor(descriptors, `education[${index}].grade`, 'Education Grade', item?.grade);
  });

  (resume?.projects || []).forEach((item, index) => {
    pushEditableDescriptor(descriptors, `projects[${index}].name`, 'Project Name', item?.name);
    pushEditableDescriptor(descriptors, `projects[${index}].desc`, 'Project Description', item?.desc, true);
    pushEditableDescriptor(descriptors, `projects[${index}].url`, 'Project Link', item?.url);
    pushEditableDescriptor(descriptors, `projects[${index}].repositoryUrl`, 'Repository Link', item?.repositoryUrl);
  });

  (resume?.certifications || []).forEach((item, index) => {
    pushEditableDescriptor(descriptors, `certifications[${index}].name`, 'Certification Name', item?.name);
    pushEditableDescriptor(descriptors, `certifications[${index}].issuer`, 'Certification Issuer', item?.issuer);
    pushEditableDescriptor(descriptors, `certifications[${index}].date`, 'Certification Date', item?.date);
    pushEditableDescriptor(descriptors, `certifications[${index}].credentialId`, 'Credential ID', item?.credentialId);
    pushEditableDescriptor(descriptors, `certifications[${index}].credentialUrl`, 'Credential URL', item?.credentialUrl);
    pushEditableDescriptor(descriptors, `certifications[${index}].expiryDate`, 'Certification Expiry', item?.expiryDate);
  });

  (resume?.awards || []).forEach((item, index) => {
    pushEditableDescriptor(descriptors, `awards[${index}].name`, 'Award Name', item?.name);
    pushEditableDescriptor(descriptors, `awards[${index}].issuer`, 'Award Issuer', item?.issuer);
    pushEditableDescriptor(descriptors, `awards[${index}].date`, 'Award Date', item?.date);
  });

  (resume?.languages || []).forEach((item, index) => {
    pushEditableDescriptor(descriptors, `languages[${index}].name`, 'Language', item?.name);
    pushEditableDescriptor(descriptors, `languages[${index}].level`, 'Language Level', item?.level);
  });

  (resume?.volunteering || []).forEach((item, index) => {
    pushEditableDescriptor(descriptors, `volunteering[${index}].role`, 'Volunteering Role', item?.role);
    pushEditableDescriptor(descriptors, `volunteering[${index}].org`, 'Volunteering Organization', item?.org);
    pushEditableDescriptor(descriptors, `volunteering[${index}].date`, 'Volunteering Date', item?.date);
    pushEditableDescriptor(descriptors, `volunteering[${index}].desc`, 'Volunteering Description', item?.desc, true);
  });

  ['technical', 'core'].forEach((group) => {
    (resume?.skills?.[group] || []).forEach((item, index) => {
      pushEditableDescriptor(
        descriptors,
        `skills.${group}[${index}]`,
        group === 'technical' ? 'Technical Skill' : 'Core Skill',
        item
      );
    });
  });

  return descriptors.sort((a, b) => b.normalizedValue.length - a.normalizedValue.length);
};

const EDITABLE_PREVIEW_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,span,div,li,ul,ol';

const findBestEditableElementMatch = (candidates, descriptor) => {
  let bestMatch = null;

  candidates.forEach((element) => {
    const elementText = normalizeEditableText(element.innerText || element.textContent || '');
    if (!elementText) return;

    let score = null;

    if (elementText === descriptor.normalizedValue) {
      score = elementText.length;
    } else if (
      elementText.includes(descriptor.normalizedValue) &&
      elementText.length <= descriptor.normalizedValue.length + 24
    ) {
      score = 1000 + (elementText.length - descriptor.normalizedValue.length);
    }

    if (score === null) return;

    score += element.childElementCount * 20;
    score += element.querySelectorAll('*').length;

    if (!bestMatch || score < bestMatch.score) {
      bestMatch = { element, score };
    }
  });

  return bestMatch?.element || null;
};

const autoAnnotatePreviewEditableFields = (container, resume) => {
  const previewSurface = getPreviewMeasurementRoot(container);
  if (!(previewSurface instanceof HTMLElement)) return;

  previewSurface.querySelectorAll('[data-auto-edit-path="true"]').forEach((node) => {
    node.removeAttribute('data-edit-path');
    node.removeAttribute('data-edit-label');
    node.removeAttribute('data-edit-multiline');
    node.removeAttribute('data-auto-edit-path');
  });

  const descriptors = buildEditableFieldDescriptors(resume);
  if (!descriptors.length) return;

  const candidates = Array.from(previewSurface.querySelectorAll(EDITABLE_PREVIEW_SELECTOR))
    .filter((node) => node instanceof HTMLElement)
    .filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      if (element.dataset.editPath) return false;
      if (element.closest('[data-edit-path]')) return false;
      if (element.classList.contains('manual-page-break')) return false;

      const text = normalizeEditableText(element.innerText || element.textContent || '');
      if (!text) return false;

      return element.childElementCount <= 12;
    });

  const usedElements = new Set();

  descriptors.forEach((descriptor) => {
    const availableCandidates = candidates.filter((element) => !usedElements.has(element));
    const bestMatch = findBestEditableElementMatch(availableCandidates, descriptor);
    if (!(bestMatch instanceof HTMLElement)) return;

    bestMatch.dataset.editPath = descriptor.path;
    bestMatch.dataset.editLabel = descriptor.label;
    bestMatch.dataset.editMultiline = descriptor.multiline ? 'true' : 'false';
    bestMatch.dataset.autoEditPath = 'true';
    usedElements.add(bestMatch);
  });
};

const getPreviewMeasurementRoot = (container) => {
  if (!(container instanceof HTMLElement)) return null;
  return findResumeContentSurface(container) || container;
};

const getPreviewPrintRoot = (container) => {
  if (!(container instanceof HTMLElement)) return null;

  if (container.classList.contains('resume-page-shell')) {
    return container;
  }

  const pageShell = container.querySelector('.resume-page-shell');
  if (pageShell instanceof HTMLElement) {
    return pageShell;
  }

  return getPreviewMeasurementRoot(container);
};

const getPreviewTemplateData = (data, templateId) => {
  const templateMeta = TEMPLATES.find((template) => template.id === templateId);

  if (!templateMeta?.hasHeadshot || data?.personal?.photo) {
    return data;
  }

  return {
    ...data,
    personal: {
      ...data.personal,
      photo: poojaImage,
    },
  };
};

// --- HELPER COMPONENTS ---
const WorkspaceIconButton = ({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
  className = '',
}) => (
  <div className={`group relative ${className}`}>
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onClick?.();
        }
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-[0.7rem] border transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed border-[#E1E7EF] bg-[#EEF2F7]/80 text-[#CBD5E1]'
          : active
            ? 'border-[#D3AD55]/45 bg-[#FFF8E7] text-[#9A6C1F] shadow-[0_4px_12px_rgba(185,150,74,0.12)]'
            : 'border-[#D8E1EA] bg-white text-[#52677F] shadow-[0_2px_7px_rgba(7,20,38,0.05)] hover:-translate-y-0.5 hover:border-[#C9A454] hover:bg-[#FFF9EC] hover:text-[#8D651F]'
      }`}
    >
      <Icon size={17} />
    </button>
    <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-[#27496E] bg-[#071426] px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-[0_10px_30px_rgba(7,20,38,0.25)] transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
      {label}
    </div>
  </div>
);

const ResumeScorePanel = ({ score = 0, label = 'Needs Work', breakdown = [], tip = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toneClassName = score >= 85
    ? 'border-[#123B6D]/20 bg-[#E8EEF7] text-[#123B6D]'
    : score >= 70
      ? 'border-[#B9964A]/30 bg-[#B9964A]/10 text-[#9A7628]'
      : score >= 55
        ? 'border-[#B9964A]/30 bg-[#B9964A]/10 text-[#9A7628]'
        : 'border-[#B91C1C]/20 bg-[#B91C1C]/10 text-[#B91C1C]';

  const progressClassName = score >= 85
    ? 'from-[#123B6D] to-[#B9964A]'
    : score >= 70
      ? 'from-[#071426] to-[#B9964A]'
      : score >= 55
        ? 'from-[#B9964A] to-[#9A7628]'
        : 'from-[#B91C1C] to-[#B9964A]';

  return (
    <div className="mt-4 overflow-hidden rounded-[1.55rem] border border-[#E1E7EF] bg-white/95 shadow-sm shadow-[#071426]/5">
      <div className={`px-4 py-4 ${isExpanded ? 'border-b border-[#E1E7EF] bg-[#F7F8FA]/80' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B9964A]/30 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#9A7628]">
              <Gauge size={12} />
              Resume Score
            </div>
            <div className="mt-3 flex items-end gap-2">
              <div className="text-[2.4rem] font-black leading-none tracking-tight text-[#071426]">{score}</div>
              <div className="pb-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">/ 100</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${toneClassName}`}>
                {label}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-[#E1E7EF] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#475569] transition-all hover:border-[#B9964A]/50 hover:bg-[#B9964A]/10 hover:text-[#9A7628]"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {isExpanded ? 'Hide Detail' : 'View Detail'}
            </button>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div className="space-y-4 px-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">
              <span>Overall strength</span>
              <span>{score}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF2F7]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${progressClassName} transition-all duration-300`}
                style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
              />
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-[#E1E7EF] bg-[#F7F8FA]/70 px-3 py-3">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">
              Quality Breakdown
            </div>
            <div className="space-y-2.5">
              {breakdown.map((item) => (
                <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_56px] items-center gap-3">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-[12px] font-bold text-[#475569]">{item.label}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">
                        {item.score >= 85 ? 'Strong' : item.score >= 70 ? 'Solid' : item.score >= 55 ? 'Build' : 'Low'}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${progressClassName}`}
                        style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#E1E7EF] bg-white px-2 py-2 text-center text-base font-black tracking-tight text-[#071426]">
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.15rem] border border-[#B9964A]/30 bg-[#B9964A]/10 px-3.5 py-3 text-[12px] leading-relaxed text-[#071426]">
            {tip}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="mb-2 block text-[12px] font-semibold leading-none text-[#40556D]">{label}</label>
    <input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-11 w-full rounded-[0.72rem] border border-[#D6E0EA] bg-white px-3.5 py-2.5 text-[14px] font-medium leading-5 text-[#10243E] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#97A6B7] hover:border-[#C7D3DF] focus:border-[#C49A43] focus:bg-white focus:ring-4 focus:ring-[#C49A43]/10"
    />
  </div>
);

const SpacingControl = ({
  label,
  value,
  onChange,
  min = 0,
  max = 200,
  step = 4,
  suffix = 'px',
  displayValue,
  leftLabel,
  rightLabel,
}) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">{label}</label>
      <span className="text-xs font-bold text-[#9A7628]">{displayValue || `${value}${suffix}`}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value || 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#B9964A]"
    />
    {(leftLabel || rightLabel) && (
      <div className="mt-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    )}
  </div>
);

const SelectControl = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="mb-2 block text-[12px] font-semibold text-[#40556D]">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 w-full rounded-[0.72rem] border border-[#D6E0EA] bg-white px-3.5 py-2.5 text-[14px] font-medium text-[#10243E] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition-all hover:border-[#C7D3DF] focus:border-[#C49A43] focus:bg-white focus:ring-4 focus:ring-[#C49A43]/10"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const CanvasRangeControl = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  displayValue,
}) => (
  <label className="min-w-[150px] flex-1">
    <span className="mb-1.5 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#71849A]">
      <span>{label}</span>
      <span className="tracking-normal text-[#9B7227]">{displayValue}</span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="block w-full accent-[#B9964A]"
    />
  </label>
);

const CanvasTypographyControls = ({ settings, onChange }) => {
  const normalizedSettings = normalizeDocumentSettings(settings);

  return (
    <details data-help-tour="design-controls" className="group mt-3 overflow-hidden rounded-[0.9rem] border border-[#D7E1EA] bg-[#F8FAFC] shadow-[0_2px_8px_rgba(15,43,75,0.035)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-3.5 py-2.5 text-[#425A73] transition-colors hover:bg-white [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#A87922]">
            <LayoutGrid size={13} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9B7227]">
              Design Controls
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-[#71849A]">
              Typography and section spacing
            </div>
          </div>
        </div>
        <ChevronDown
          size={15}
          className="text-[#71849A] transition-transform duration-200 group-open:rotate-180"
        />
      </summary>

      <div className="border-t border-[#DDE5ED] bg-white px-3.5 py-3">
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <label className="w-full min-w-[190px] sm:w-[220px]">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#71849A]">
              Font Family
            </span>
            <select
              value={normalizedSettings.fontFamily}
              onChange={(event) => onChange('fontFamily', event.target.value)}
              className="h-9 w-full rounded-lg border border-[#D5DFE8] bg-white px-3 text-xs font-bold text-[#173A62] outline-none transition-colors hover:border-[#C6D2DE] focus:border-[#C49A43] focus:ring-2 focus:ring-[#C49A43]/15"
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <CanvasRangeControl
            label="Section Spacing"
            value={normalizedSettings.sectionSpacing}
            min={12}
            max={56}
            step={4}
            displayValue={`${normalizedSettings.sectionSpacing}px`}
            onChange={(value) => onChange('sectionSpacing', value)}
          />
          <CanvasRangeControl
            label="Font Size"
            value={Math.round(normalizedSettings.fontScale * 100)}
            min={50}
            max={200}
            step={5}
            displayValue={`${Math.round(normalizedSettings.fontScale * 100)}%`}
            onChange={(value) => onChange('fontScale', Number((value / 100).toFixed(2)))}
          />
          <CanvasRangeControl
            label="Line Height"
            value={Math.round(normalizedSettings.lineHeight * 100)}
            min={100}
            max={200}
            step={5}
            displayValue={normalizedSettings.lineHeight.toFixed(2)}
            onChange={(value) => onChange('lineHeight', Number((value / 100).toFixed(2)))}
          />
        </div>
      </div>
    </details>
  );
};

const ListModePicker = ({ mode, onChange }) => (
  <div className="inline-flex min-h-8 items-center gap-0.5 rounded-lg border border-[#D8E1EA] bg-[#F1F4F7] p-0.5">
    {LIST_MODE_OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`min-h-7 rounded-md px-2 py-1 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] transition-all ${
          mode === option.value
            ? 'bg-white text-[#8D651F] shadow-[0_2px_6px_rgba(7,20,38,0.06)]'
            : 'text-[#6D7F92] hover:bg-white/60 hover:text-[#173A62]'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const useLongTextListMode = (value, formattingDefault) => {
  const [listMode, setListMode] = useState(() => (
    (value || '').trim() ? detectListMode(value) : formattingDefault
  ));

  useEffect(() => {
    if ((value || '').trim()) {
      setListMode(detectListMode(value));
    }
  }, [value]);

  return [listMode, setListMode];
};

// --- STANDARD TEXT AREA ---
const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  formattingEnabled = false,
  formattingDefault = LIST_MODES.PLAIN,
}) => {
  const [listMode, setListMode] = useLongTextListMode(value, formattingDefault);

  const handleModeChange = (nextMode) => {
    setListMode(nextMode);

    if (!(value || '').trim()) {
      onChange(getInitialListValue(nextMode));
      return;
    }

    const nextValue = formatTextWithListMode(value, nextMode);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const handleKeyDown = (e) => {
    if (formattingEnabled && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target;
      const cursorPosition = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const textBefore = (value || '').substring(0, cursorPosition);
      const textAfter = (value || '').substring(selectionEnd);
      const insertion = getListInsertion(value, cursorPosition, listMode);
      const nextValue = textBefore + insertion + textAfter;
      onChange(nextValue);

      window.requestAnimationFrame(() => {
        const nextCursor = cursorPosition + insertion.length;
        textarea.selectionStart = nextCursor;
        textarea.selectionEnd = nextCursor;
      });
    }
  };

  const handleChange = (e) => {
    let nextValue = e.target.value;

    if (
      formattingEnabled &&
      !(value || '').trim() &&
      nextValue.trim() &&
      detectListMode(nextValue) === LIST_MODES.PLAIN &&
      listMode !== LIST_MODES.PLAIN
    ) {
      nextValue = formatTextWithListMode(nextValue, listMode);
    }

    onChange(nextValue);
  };

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex flex-wrap items-end justify-between gap-3">
        <label className="block text-[12px] font-semibold text-[#40556D]">{label}</label>
        {formattingEnabled ? <ListModePicker mode={listMode} onChange={handleModeChange} /> : null}
      </div>
      <textarea
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={formattingEnabled ? getModePlaceholder(listMode, placeholder) : placeholder}
        className="h-24 w-full resize-none rounded-[0.72rem] border border-[#D6E0EA] bg-white px-3.5 py-3 text-[14px] font-medium leading-6 text-[#10243E] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition-all custom-scrollbar placeholder:text-[#97A6B7] hover:border-[#C7D3DF] focus:border-[#C49A43] focus:bg-white focus:ring-4 focus:ring-[#C49A43]/10"
      />
    </div>
  );
};

const getSkillToken = (value = '') => {
  const lastCommaIndex = value.lastIndexOf(',');
  return value.slice(lastCommaIndex + 1).trimStart();
};

const replaceLastSkillToken = (value = '', replacement = '') => {
  const lastCommaIndex = value.lastIndexOf(',');

  if (lastCommaIndex === -1) {
    return `${replacement}, `;
  }

  const prefix = value.slice(0, lastCommaIndex + 1);
  return `${prefix} ${replacement}, `;
};

const SkillAutocompleteTextArea = ({
  label,
  value,
  onChange,
  selectedSkills = [],
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const activeToken = getSkillToken(value || '');
  const suggestions = useMemo(
    () => getSkillSuggestions(activeToken, selectedSkills, 10),
    [activeToken, selectedSkills]
  );
  const showSuggestions = isFocused && activeToken.trim().length > 0 && suggestions.length > 0;

  const applySuggestion = (suggestion) => {
    onChange(replaceLastSkillToken(value || '', suggestion));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && showSuggestions) {
      event.preventDefault();
      applySuggestion(suggestions[0]);
    }
  };

  return (
    <div className="relative mb-4">
      <label className="mb-2 block text-[12px] font-semibold text-[#40556D]">{label}</label>
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-24 w-full resize-none rounded-[0.72rem] border border-[#D6E0EA] bg-white px-3.5 py-3 text-[14px] font-medium leading-6 text-[#10243E] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition-all custom-scrollbar placeholder:text-[#97A6B7] hover:border-[#C7D3DF] focus:border-[#C49A43] focus:bg-white focus:ring-4 focus:ring-[#C49A43]/10"
      />
      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#E1E7EF] bg-white p-2 shadow-xl shadow-[#071426]/10">
          <div className="mb-1 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9A7628]">
            Matching Skills
          </div>
          <div className="flex flex-col gap-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  applySuggestion(suggestion);
                }}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-[#071426] transition-colors hover:bg-[#B9964A]/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <p className="mt-2 text-xs text-[#64748B]">
        Type to search the skill library, or keep typing to add a custom skill manually.
      </p>
    </div>
  );
};

// --- AI ENHANCEABLE TEXT AREA ---
const AIEnhanceableTextArea = ({
  label,
  value,
  onChange,
  placeholder,
  onEnhanceClick,
  formattingEnabled = false,
  formattingDefault = LIST_MODES.PLAIN,
}) => {
  const [listMode, setListMode] = useLongTextListMode(value, formattingDefault);

  const handleModeChange = (nextMode) => {
    setListMode(nextMode);

    if (!(value || '').trim()) {
      onChange(getInitialListValue(nextMode));
      return;
    }

    const nextValue = formatTextWithListMode(value, nextMode);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const handleKeyDown = (e) => {
    if (formattingEnabled && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target;
      const cursorPosition = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const textBefore = (value || '').substring(0, cursorPosition);
      const textAfter = (value || '').substring(selectionEnd);
      const insertion = getListInsertion(value, cursorPosition, listMode);
      const nextValue = textBefore + insertion + textAfter;
      onChange(nextValue);

      window.requestAnimationFrame(() => {
        const nextCursor = cursorPosition + insertion.length;
        textarea.selectionStart = nextCursor;
        textarea.selectionEnd = nextCursor;
      });
    }
  };

  const handleChange = (e) => {
    let nextValue = e.target.value;

    if (
      formattingEnabled &&
      !(value || '').trim() &&
      nextValue.trim() &&
      detectListMode(nextValue) === LIST_MODES.PLAIN &&
      listMode !== LIST_MODES.PLAIN
    ) {
      nextValue = formatTextWithListMode(nextValue, listMode);
    }

    onChange(nextValue);
  };

  return (
    <div className="group relative mb-4">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <label className="block text-[12px] font-semibold leading-none text-[#40556D]">{label}</label>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {formattingEnabled ? <ListModePicker mode={listMode} onChange={handleModeChange} /> : null}
          {value && value.length > 10 && (
            <button
              onClick={onEnhanceClick}
              className="flex items-center gap-1.5 rounded-lg border border-[#CFA951]/35 bg-[#FFF8E8] px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#8D651F] transition-all hover:border-[#C49A43]/60 hover:bg-[#FFF3D4]"
              title="Rewrite using AI"
            >
              <Sparkles size={10} /> Enhance with AI
            </button>
          )}
        </div>
      </div>

      <textarea
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={formattingEnabled ? getModePlaceholder(listMode, placeholder || 'Describe your work...') : placeholder}
        className="h-32 w-full resize-none rounded-[0.72rem] border border-[#D6E0EA] bg-white px-3.5 py-3 text-[14px] font-medium leading-6 text-[#10243E] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition-[border-color,box-shadow,background-color] custom-scrollbar placeholder:text-[#97A6B7] hover:border-[#C7D3DF] focus:border-[#C49A43] focus:bg-white focus:ring-4 focus:ring-[#C49A43]/10"
      />
    </div>
  );
};


// --- MAIN EDITOR ---
// Note: added the 'mode' prop here
const Editor = ({
  initialData,
  selectedTemplate,
  onChangeTemplate,
  onBack,
  mode,
  importMode = 'ai-enhanced',
  initialJDText = '',
  initialSmartAction = '',
  initialSmartActionDetails = null,
  resumeRecordId = null,
  onResumeRecordChange,
  onWorkspaceSnapshotChange,
  onHome,
  onOpenRepository,
}) => {
  const { user } = useUser();
  const [activeSection, setActiveSection] = useState('personal');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [smartActionMessage, setSmartActionMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [editorPanelWidth, setEditorPanelWidth] = useState(DEFAULT_EDITOR_PANEL_WIDTH);
  const [isEditorPanelResizing, setIsEditorPanelResizing] = useState(false);
  const [mobileWorkspaceView, setMobileWorkspaceView] = useState('edit');
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [editorTab, setEditorTab] = useState(() => getEditorTabForSection('personal', mode));
  const [isDownloadGateOpen, setIsDownloadGateOpen] = useState(false);
  const [isCheckingPass, setIsCheckingPass] = useState(false);
  const pendingDownloadFnRef = useRef(null);
  const previewRef = useRef(null);
  const previewViewportRef = useRef(null);
  const previewStageRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const hasMountedAutosaveRef = useRef(false);
  const lastPersistedSnapshotRef = useRef('');
  const persistedResumeIdRef = useRef(resumeRecordId || null);
  const editorPanelResizeRef = useRef({
    startX: 0,
    startWidth: DEFAULT_EDITOR_PANEL_WIDTH,
  });


  // --- NEW STATE: TARGET JOB DESCRIPTION ---
const [jdText, setJdText] = useState(initialJDText || '');
  const [previewPageBreaks, setPreviewPageBreaks] = useState([]);
  const [previewMetrics, setPreviewMetrics] = useState({ pageHeight: 0, contentHeight: 0 });
  const [nativePreviewPageCount, setNativePreviewPageCount] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPreviewEditMode, setIsPreviewEditMode] = useState(false);
  const [activePreviewField, setActivePreviewField] = useState(null);
  const [previewZoomLevel, setPreviewZoomLevel] = useState(1);
  const [autosaveState, setAutosaveState] = useState('saved');
  const [lastSavedAt, setLastSavedAt] = useState(() => new Date());
  const [persistedResumeId, setPersistedResumeId] = useState(resumeRecordId || null);
  const [helpTourStep, setHelpTourStep] = useState(null);
  const [helpTourPosition, setHelpTourPosition] = useState(null);
  const helpTourPanelRef = useRef(null);
  const helpTourDragRef = useRef({ offsetX: 0, offsetY: 0 });

  // --- AI MODAL STATES ---
  const [aiModalConfig, setAiModalConfig] = useState({
    isOpen: false,
    text: '',
    type: '',
    onApply: null,
    contextMeta: {},
  });
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [latestAtsEntry, setLatestAtsEntry] = useState(null);
  const [latestInterviewEntry, setLatestInterviewEntry] = useState(null);
  const [latestReadinessEntry, setLatestReadinessEntry] = useState(null);
  const [previousReadinessEntry, setPreviousReadinessEntry] = useState(null);
  const exportPreviewRef = useRef(null);

  // --- DATA INITIALIZATION ---
  const initializeData = (data) => {
    const getList = (arr) => Array.isArray(arr) ? arr : [];
    const experienceData = mergeVolunteeringIntoExperience(data);
    const normalizedSkills = normalizeResumeSkills(experienceData?.skills);

    const safeData = {
      personal: {
        name: '', title: '', email: '', phone: '', location: '',
        summary: '', linkedin: '', github: '', website: '', portfolio: '', photo: null,
        ...(experienceData?.personal || {})
      },
      experience: getList(experienceData?.experience),
      education: getList(experienceData?.education),
      skills: normalizedSkills,
      layoutSpacing: {
        personal: Number(experienceData?.layoutSpacing?.personal || 0),
        experience: Number(experienceData?.layoutSpacing?.experience || 0),
        education: Number(experienceData?.layoutSpacing?.education || 0),
      },
      documentSettings: normalizeDocumentSettings(experienceData?.documentSettings),
      projects: getList(experienceData?.projects),
      languages: getList(experienceData?.languages),
      certifications: getList(experienceData?.certifications),
      awards: getList(experienceData?.awards),
      volunteering: [],
    };

    ['experience', 'education', 'projects', 'languages', 'certifications', 'awards', 'volunteering'].forEach(key => {
      safeData[key] = safeData[key].map(item => ({ ...item, id: item.id || Date.now() + Math.random() }));
    });

    return safeData;
  };

  const [resume, setResume] = useState(() => {
    const hasInitial = initialData && Object.keys(initialData).length > 0 && (
      Boolean(initialData.personal?.name) ||
      Boolean(initialData.personal?.email) ||
      Boolean(initialData.experience?.length)
    );
    if (hasInitial) {
      return initializeData(initialData);
    }
    const targetId = resumeRecordId || persistedResumeIdRef.current;
    if (targetId) {
      const record = getResumeRecord(targetId);
      if (record?.resumeData) {
        return initializeData(record.resumeData);
      }
    }
    return initializeData(initialData);
  });

  const [skillInputDrafts, setSkillInputDrafts] = useState(() => {
    const currentResume = (initialData && Object.keys(initialData).length > 0)
      ? initializeData(initialData)
      : (resumeRecordId && getResumeRecord(resumeRecordId)?.resumeData)
        ? initializeData(getResumeRecord(resumeRecordId).resumeData)
        : initializeData(initialData);
    return {
      technical: currentResume.skills.technical.join(', '),
      core: currentResume.skills.core.join(', '),
    };
  });

  // Sync resume state whenever initialData or resumeRecordId updates
  useEffect(() => {
    const hasInitial = initialData && Object.keys(initialData).length > 0 && (
      Boolean(initialData.personal?.name) ||
      Boolean(initialData.personal?.email) ||
      Boolean(initialData.experience?.length)
    );
    if (hasInitial) {
      const init = initializeData(initialData);
      setResume(init);
      setSkillInputDrafts({
        technical: init.skills.technical.join(', '),
        core: init.skills.core.join(', '),
      });
    } else if (resumeRecordId) {
      const record = getResumeRecord(resumeRecordId);
      if (record?.resumeData) {
        const init = initializeData(record.resumeData);
        setResume(init);
        setSkillInputDrafts({
          technical: init.skills.technical.join(', '),
          core: init.skills.core.join(', '),
        });
        if (record.jdText && !jdText) {
          setJdText(record.jdText);
        }
      }
    }
  }, [initialData, resumeRecordId]);

  // Hydrate saved ATS scan, Interview prep, and readiness checkpoints from record
  useEffect(() => {
    const targetId = resumeRecordId || persistedResumeIdRef.current;
    if (targetId) {
      const record = getResumeRecord(targetId);
      if (record) {
        if (record.atsHistory?.length > 0 && !latestAtsEntry) {
          setLatestAtsEntry(record.atsHistory[0]);
        }
        if (record.interviewPrepHistory?.length > 0 && !latestInterviewEntry) {
          setLatestInterviewEntry(record.interviewPrepHistory[0]);
        }
        if (record.exportReadinessHistory?.length > 0 && !latestReadinessEntry) {
          setLatestReadinessEntry(record.exportReadinessHistory[0]);
          if (record.exportReadinessHistory.length > 1) {
            setPreviousReadinessEntry(record.exportReadinessHistory[1]);
          }
        }
        if (record.jdText && !jdText) {
          setJdText(record.jdText);
        }
      }
    }
  }, [resumeRecordId, latestAtsEntry, latestInterviewEntry, latestReadinessEntry, jdText]);
  const documentSettings = useMemo(
    () => normalizeDocumentSettings(resume.documentSettings),
    [resume.documentSettings]
  );
  const previewPages = useMemo(() => {
    const boundaries = [0, ...previewPageBreaks, previewMetrics.contentHeight || 0]
      .map((value) => Math.max(0, Math.round(value)))
      .filter((value, index, values) => index === 0 || value >= values[index - 1]);

    if (boundaries.length <= 1) {
      return [{
        start: 0,
        end: previewMetrics.contentHeight || previewMetrics.pageHeight || 0,
        visibleHeight: previewMetrics.contentHeight || previewMetrics.pageHeight || 0,
      }];
    }

    return boundaries.slice(0, -1).map((start, index) => {
      const end = boundaries[index + 1];
      return {
        start,
        end,
        visibleHeight: Math.max(0, end - start),
      };
    });
  }, [previewMetrics.contentHeight, previewMetrics.pageHeight, previewPageBreaks]);
  const isMobileLayout = viewportWidth < 1024;

  const handleEditorPanelResizeStart = useCallback(
    (event) => {
      if (isMobileLayout || !isFormOpen) return;

      event.preventDefault();
      event.stopPropagation();

      editorPanelResizeRef.current = {
        startX: event.clientX,
        startWidth: editorPanelWidth,
      };

      setIsEditorPanelResizing(true);
    },
    [editorPanelWidth, isFormOpen, isMobileLayout]
  );

  useEffect(() => {
    if (!isEditorPanelResizing) return undefined;

    const handlePointerMove = (event) => {
      const deltaX = event.clientX - editorPanelResizeRef.current.startX;

      const nextWidth = Math.min(
        MAX_EDITOR_PANEL_WIDTH,
        Math.max(
          MIN_EDITOR_PANEL_WIDTH,
          editorPanelResizeRef.current.startWidth + deltaX
        )
      );

      setEditorPanelWidth(nextWidth);
    };

    const handlePointerUp = () => {
      setIsEditorPanelResizing(false);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isEditorPanelResizing]);
  const basePreviewScale = isMobileLayout
    ? Math.min(
        0.72,
        Math.max(0.34, (viewportWidth - 40) / A4_PREVIEW_WIDTH_PX)
      )
    : DESKTOP_PREVIEW_SCALE;
  const previewScale = Number((basePreviewScale * previewZoomLevel).toFixed(3));
  const previewZoomPercent = Math.round(previewScale * 100);
  const resumeInsights = useMemo(() => getResumeInsights(resume), [resume]);
  const rankedTemplates = useMemo(
    () => getTemplateRecommendations(resume, TEMPLATES, mode, jdText),
    [jdText, mode, resume]
  );
  const editorTemplateList = useMemo(() => {
    const recommendationById = new Map(
      rankedTemplates.map((template) => [template.id, template])
    );
    const topTemplates = TOP_TEMPLATE_IDS
      .map((id) => recommendationById.get(id))
      .filter(Boolean);
    const remainingTemplates = rankedTemplates.filter(
      (template) => !TOP_TEMPLATE_IDS.includes(template.id)
    );

    return [...topTemplates, ...remainingTemplates];
  }, [rankedTemplates]);
  const filteredEditorTemplateList = useMemo(() => {
    const normalizedQuery = templateSearchQuery.trim().toLocaleLowerCase();

    if (!normalizedQuery) return editorTemplateList;

    return editorTemplateList.filter((template) =>
      `${template.name} ${template.seoName || ''} ${template.id} ${(template.searchAliases || []).join(' ')}`
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    );
  }, [editorTemplateList, templateSearchQuery]);
  const editorTemplatePreviewData = useMemo(
    () => new Map(
      filteredEditorTemplateList.map((template) => [
        template.id,
        getPreviewTemplateData(resume, template.id),
      ])
    ),
    [filteredEditorTemplateList, resume]
  );
  const selectedTemplateMeta = useMemo(
    () => TEMPLATES.find((template) => template.id === selectedTemplate) || TEMPLATES[0],
    [selectedTemplate]
  );
  const selectedTemplateRecommendation = useMemo(
    () => rankedTemplates.find((template) => template.id === selectedTemplate) || null,
    [rankedTemplates, selectedTemplate]
  );
  const presentationPlan = useMemo(
    () =>
      createPresentationPlan({
        resumeData: resume,
        templates: TEMPLATES,
        selectedTemplateId: selectedTemplate,
        mode,
      }),
    [mode, resume, selectedTemplate]
  );
  const recommendedSkillLookup = useMemo(
    () =>
      mode === 'tailor' && jdText.trim()
        ? buildJdRecommendedSkillLookup(resume.skills, jdText, 14)
        : buildRecommendedSkillLookup(resume.skills, 14),
    [jdText, mode, resume.skills]
  );
  const selectedTemplateRank = useMemo(() => {
    const index = rankedTemplates.findIndex((template) => template.id === selectedTemplate);
    return index >= 0 ? index + 1 : null;
  }, [rankedTemplates, selectedTemplate]);
  const sectionOverview = useMemo(() => {
    const base = SECTION_COPY[activeSection] || {
      heading: activeSection,
      description: 'Keep the resume clean, readable, and tailored to your target role.',
    };

    const counts = {
      personal: {
        primaryLabel: 'Summary Lines',
        primaryValue: resumeInsights.summaryLines,
        secondaryLabel: 'Profile Fields',
        secondaryValue: `${resumeInsights.personalFields}/5`,
      },
      experience: {
        primaryLabel: 'Roles',
        primaryValue: resumeInsights.experienceCount,
        secondaryLabel: 'Pages',
        secondaryValue: previewPages.length,
      },
      education: {
        primaryLabel: 'Schools',
        primaryValue: resumeInsights.educationCount,
        secondaryLabel: 'Readiness',
        secondaryValue: `${resumeInsights.readinessScore}%`,
      },
      skills: {
        primaryLabel: 'Skill Items',
        primaryValue: resumeInsights.totalSkillCount,
        secondaryLabel: 'Technical',
        secondaryValue: resumeInsights.technicalSkillCount,
      },
      projects: {
        primaryLabel: 'Projects',
        primaryValue: resumeInsights.projectCount,
        secondaryLabel: 'Supporting Items',
        secondaryValue: resumeInsights.projectCount + resumeInsights.certificationCount + resumeInsights.awardCount,
      },
      certifications: {
        primaryLabel: 'Certificates',
        primaryValue: resumeInsights.certificationCount,
        secondaryLabel: 'Readiness',
        secondaryValue: `${resumeInsights.readinessScore}%`,
      },
      awards: {
        primaryLabel: 'Awards',
        primaryValue: resumeInsights.awardCount,
        secondaryLabel: 'Readiness',
        secondaryValue: `${resumeInsights.readinessScore}%`,
      },
      languages: {
        primaryLabel: 'Languages',
        primaryValue: resumeInsights.languageCount,
        secondaryLabel: 'Pages',
        secondaryValue: previewPages.length,
      },
      document: {
        primaryLabel: 'Template',
        primaryValue: selectedTemplateMeta?.name || 'Resume',
        secondaryLabel: 'Pages',
        secondaryValue: previewPages.length,
      },
      templates: {
        primaryLabel: 'Best Fit',
        primaryValue: selectedTemplateMeta?.name || 'Resume',
        secondaryLabel: 'Rank',
        secondaryValue: selectedTemplateRank ? `#${selectedTemplateRank}` : '--',
      },
      'target-jd': {
        primaryLabel: 'JD Status',
        primaryValue: jdText.trim() ? 'Loaded' : 'Missing',
        secondaryLabel: 'ATS + Prep',
        secondaryValue: jdText.trim() ? 'Ready' : 'Locked',
      },
    };

    return {
      ...base,
      ...(counts[activeSection] || {
        primaryLabel: 'Readiness',
        primaryValue: `${resumeInsights.readinessScore}%`,
        secondaryLabel: 'Pages',
        secondaryValue: previewPages.length,
      }),
    };
  }, [
    activeSection,
    jdText,
    previewPages.length,
    resumeInsights,
    selectedTemplateMeta,
    selectedTemplateRank,
  ]);
  const sectionStatusMap = useMemo(() => {
    const personalFilledFields = [
      resume.personal?.name,
      resume.personal?.title,
      resume.personal?.email,
      resume.personal?.phone,
      resume.personal?.location,
      resume.personal?.summary,
    ].filter((value) => getTrimmedText(value)).length;

    return {
      document: 'complete',
      templates: selectedTemplate ? 'complete' : 'progress',
      'target-jd': mode === 'tailor' ? (jdText.trim() ? 'complete' : 'empty') : 'complete',
      personal: personalFilledFields >= 5 ? 'complete' : personalFilledFields > 0 ? 'progress' : 'empty',
      experience: getListCompletionStatus(resume.experience, ['role', 'company', 'date', 'desc']),
      education: getListCompletionStatus(resume.education, ['school', 'degree', 'date']),
      skills:
        resumeInsights.totalSkillCount === 0
          ? 'empty'
          : resumeInsights.technicalSkillCount > 0 && (resume.skills.core?.length || 0) > 0
            ? 'complete'
            : 'progress',
      projects: getListCompletionStatus(resume.projects, ['name', 'desc']),
      certifications: getListCompletionStatus(resume.certifications, ['name', 'issuer', 'date']),
      awards: getListCompletionStatus(resume.awards, ['name', 'issuer', 'date']),
      languages: getListCompletionStatus(resume.languages, ['name', 'level']),
    };
  }, [
    jdText,
    mode,
    resume.awards,
    resume.certifications,
    resume.education,
    resume.experience,
    resume.personal?.email,
    resume.personal?.location,
    resume.personal?.name,
    resume.personal?.phone,
    resume.personal?.summary,
    resume.personal?.title,
    resume.projects,
    resume.skills.core,
    resumeInsights.technicalSkillCount,
    resumeInsights.totalSkillCount,
    resume.languages,
    selectedTemplate,
  ]);
  const activeSectionStatusMeta =
    SECTION_STATUS_META[sectionStatusMap[activeSection] || 'empty'] || SECTION_STATUS_META.empty;

  const editorGuidance = useMemo(
    () =>
      buildEditorGuidance({
        insights: resumeInsights,
        selectedTemplateMeta,
        selectedTemplateRecommendation,
        previewPagesLength: previewPages.length,
      }),
    [previewPages.length, resumeInsights, selectedTemplateMeta, selectedTemplateRecommendation]
  );
  const contentFitAudit = useMemo(
    () =>
      buildContentFitAudit({
        insights: resumeInsights,
        plan: {
          ...presentationPlan,
          currentSummary: resume.personal?.summary || '',
        },
        previewPagesLength: previewPages.length,
        selectedTemplateMeta,
      }),
    [presentationPlan, previewPages.length, resume.personal?.summary, resumeInsights, selectedTemplateMeta]
  );
  const criticalSectionGaps = useMemo(
    () => ['personal', 'experience', 'skills'].filter((key) => sectionStatusMap[key] !== 'complete').length,
    [sectionStatusMap]
  );
  const exportChecklist = useMemo(
    () => [
      {
        key: 'pages',
        label: `${previewPages.length} page${previewPages.length === 1 ? '' : 's'} mapped`,
        pass: previewPages.length > 0,
      },
      {
        key: 'sections',
        label: criticalSectionGaps === 0 ? 'Core sections filled' : `${criticalSectionGaps} section${criticalSectionGaps === 1 ? '' : 's'} to review`,
        pass: criticalSectionGaps === 0,
      },
      {
        key: 'a4',
        label: previewMetrics.pageHeight ? 'A4 ready' : 'Sizing preview',
        pass: Boolean(previewMetrics.pageHeight),
      },
    ],
    [criticalSectionGaps, previewMetrics.pageHeight, previewPages.length]
  );
  const weakestExportBulletGroup = useMemo(
    () => findWeakestExperienceBulletGroup(resume.experience, {
      jdText,
      jdAware: mode === 'tailor',
    }),
    [jdText, mode, resume.experience]
  );
  const exportReadinessItems = useMemo(
    () =>
      buildExportReadinessItems({
        previewPagesLength: previewPages.length,
        presentationPlan,
        criticalSectionGaps,
        previewMetrics,
        resume,
        resumeInsights,
        contentFitAudit,
        weakestGroup: weakestExportBulletGroup,
        mode,
        jdText,
        latestAtsEntry,
      }),
    [
      contentFitAudit,
      criticalSectionGaps,
      jdText,
      latestAtsEntry,
      mode,
      presentationPlan,
      previewMetrics,
      previewPages.length,
      resume,
      resumeInsights,
      weakestExportBulletGroup,
    ]
  );
  const exportReadinessSummary = useMemo(() => {
    const blockerCount = exportReadinessItems.filter((item) => item.status === 'blocker').length;
    const warningCount = exportReadinessItems.filter((item) => item.status === 'warning').length;
    return {
      blockerCount,
      warningCount,
      ready: blockerCount === 0,
    };
  }, [exportReadinessItems]);
  const exportReadinessDelta = useMemo(() => {
    if (!latestReadinessEntry?.summary || !previousReadinessEntry?.summary) return null;

    const blockerDelta =
      Number(previousReadinessEntry.summary.blockerCount || 0) -
      Number(latestReadinessEntry.summary.blockerCount || 0);
    const warningDelta =
      Number(previousReadinessEntry.summary.warningCount || 0) -
      Number(latestReadinessEntry.summary.warningCount || 0);

    return {
      blockerDelta,
      warningDelta,
      improved: blockerDelta > 0 || warningDelta > 0,
    };
  }, [latestReadinessEntry, previousReadinessEntry]);
  const visibleSections = useMemo(() => {
    const sections = TAB_SECTION_GROUPS[editorTab] || TAB_SECTION_GROUPS.data;
    return mode === 'tailor' ? sections : sections.filter((sectionId) => sectionId !== 'target-jd');
  }, [editorTab, mode]);
  const sectionSelectOptions = useMemo(
    () => visibleSections.map((sectionId) => ({
      value: sectionId,
      label: SECTION_SELECT_LABELS[sectionId] || sectionId,
    })),
    [visibleSections]
  );
  const previewViewportKey = useMemo(
    () => `${mode || 'scratch'}:${selectedTemplate || 'template'}:${activeSection}:${persistedResumeId || 'draft'}`,
    [activeSection, mode, persistedResumeId, selectedTemplate]
  );
  const workspaceSnapshot = useMemo(
    () => JSON.stringify({ resume, jdText, selectedTemplate }),
    [jdText, resume, selectedTemplate]
  );
  const persistWorkspaceToRepository = useCallback(() => {
    const hasCurrentContent = Boolean(
      String(resume?.personal?.name || '').trim() ||
      String(resume?.personal?.email || '').trim() ||
      (Array.isArray(resume?.experience) && resume.experience.length > 0) ||
      (Array.isArray(resume?.skills?.technical) && resume.skills.technical.length > 0)
    );

    let resumeToSave = resume;
    if (!hasCurrentContent && persistedResumeIdRef.current) {
      const existing = getResumeRecord(persistedResumeIdRef.current);
      if (existing?.resumeData) {
        resumeToSave = existing.resumeData;
      }
    }

    const normalizedResume = {
      ...resumeToSave,
      skills: normalizeResumeSkills(resumeToSave?.skills),
    };

    const savedRecord = saveResumeRecord({
      resumeId: persistedResumeIdRef.current,
      resumeData: normalizedResume,
      selectedTemplate,
      mode: mode || 'scratch',
      importMode,
      jdText,
    });

    if (savedRecord?.id) {
      persistedResumeIdRef.current = savedRecord.id;
      setPersistedResumeId(savedRecord.id);
      onResumeRecordChange?.(savedRecord.id);
    }

    if (savedRecord) {
      onWorkspaceSnapshotChange?.({
        resume: normalizedResume,
        jdText,
        selectedTemplate,
        resumeRecordId: savedRecord.id,
      });
    }

    return savedRecord;
  }, [importMode, jdText, mode, onResumeRecordChange, onWorkspaceSnapshotChange, resume, selectedTemplate]);

  const recordExportReadinessHistory = useCallback((source = 'manual_check', resumeIdOverride = null) => {
    const targetResumeId = resumeIdOverride || persistedResumeIdRef.current;
    if (!targetResumeId) return null;

    const entry = appendExportReadinessSnapshot({
      resumeId: targetResumeId,
      summary: exportReadinessSummary,
      items: exportReadinessItems,
      source,
      snapshot: {
        resumeScore: resumeInsights.resumeScore,
        summaryWords: resumeInsights.summaryWords,
        totalSkills: resumeInsights.totalSkillCount,
        technicalSkills: resumeInsights.technicalSkillCount,
        coreSkills: (resume.skills?.core?.length || 0) + (resume.skills?.soft?.length || 0),
        experienceCount: resumeInsights.experienceCount,
        projectCount: resumeInsights.projectCount,
        certificationCount: resumeInsights.certificationCount,
        roleFamily: resumeInsights.roleFamily,
        seniorityLevel: resumeInsights.seniorityLevel,
        predictedPagePressure: resumeInsights.predictedPagePressure,
        targetPages: presentationPlan.targetPages,
        summaryExcerpt: String(resume.personal?.summary || '').trim().slice(0, 180),
        topSkills: [
          ...(Array.isArray(resume.skills?.technical) ? resume.skills.technical : []),
          ...(Array.isArray(resume.skills?.core) ? resume.skills.core : []),
          ...(Array.isArray(resume.skills?.soft) ? resume.skills.soft : []),
        ].filter(Boolean).slice(0, 8),
        sectionStatuses: sectionStatusMap,
      },
    });

    if (entry) {
      setPreviousReadinessEntry(latestReadinessEntry || null);
      setLatestReadinessEntry(entry);
    }

    return entry;
  }, [
    exportReadinessItems,
    exportReadinessSummary,
    latestReadinessEntry,
    presentationPlan.targetPages,
    resume.personal?.summary,
    resume.skills,
    resumeInsights.certificationCount,
    resumeInsights.experienceCount,
    resumeInsights.predictedPagePressure,
    resumeInsights.projectCount,
    resumeInsights.resumeScore,
    resumeInsights.roleFamily,
    resumeInsights.seniorityLevel,
    resumeInsights.summaryWords,
    resumeInsights.technicalSkillCount,
    resumeInsights.totalSkillCount,
    sectionStatusMap,
  ]);

  const handleSectionSelect = useCallback(
    (sectionId) => {
      setEditorTab(getEditorTabForSection(sectionId));
      setActiveSection(sectionId);
      setIsFormOpen(true);
      if (isMobileLayout) {
        setMobileWorkspaceView('edit');
      }
    },
    [isMobileLayout]
  );

  useEffect(() => {
    setEditorTab(getEditorTabForSection(activeSection));
  }, [activeSection]);

  const handleEditorTabChange = useCallback((tabId) => {
    setEditorTab(tabId);
    const nextSection = (mode === 'tailor'
      ? TAB_SECTION_GROUPS[tabId]
      : (TAB_SECTION_GROUPS[tabId] || []).filter((sectionId) => sectionId !== 'target-jd')
    )?.[0];

    if (nextSection) {
      setActiveSection(nextSection);
    }
  }, [mode]);

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

    const step = EDITOR_HELP_STEPS[helpTourStep];
    if (!step) return undefined;

    if (step.id === 'workspace' || step.id === 'data') {
      handleSectionSelect('personal');
    } else if (step.id === 'templates') {
      handleSectionSelect('templates');
    } else if (step.id === 'design' || step.id === 'preview' || step.id === 'canvas-tools') {
      if (isMobileLayout) setMobileWorkspaceView('preview');
    }

    let target = null;
    const timer = window.setTimeout(() => {
      target = document.querySelector(`[data-help-tour="${step.target}"]`);
      if (!target) return;

      if (step.id === 'design' && target instanceof HTMLDetailsElement) {
        target.open = true;
      }

      target.classList.add('editor-help-target');
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 120);

    return () => {
      window.clearTimeout(timer);
      target?.classList.remove('editor-help-target');
    };
  }, [handleSectionSelect, helpTourStep, isMobileLayout]);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeHelpTour();
      if (event.key === 'ArrowRight') {
        setHelpTourStep((current) => Math.min(EDITOR_HELP_STEPS.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setHelpTourStep((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeHelpTour, helpTourStep]);

  useEffect(() => {
    if (visibleSections.length && !visibleSections.includes(activeSection)) {
      setActiveSection(visibleSections[0]);
    }
  }, [activeSection, visibleSections]);

  useLayoutEffect(() => {
    const viewport = previewViewportRef.current;
    if (!(viewport instanceof HTMLElement)) return;

    const resetToTop = () => {
      viewport.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      viewport.scrollTop = 0;
      viewport.scrollLeft = 0;
    };

    resetToTop();
    const frameOne = window.requestAnimationFrame(() => {
      resetToTop();
      const frameTwo = window.requestAnimationFrame(() => {
        resetToTop();
      });
      viewport.dataset.previewResetFrame = String(frameTwo);
    });
    const timeoutOne = window.setTimeout(resetToTop, 40);
    const timeoutTwo = window.setTimeout(resetToTop, 140);
    const timeoutThree = window.setTimeout(resetToTop, 320);

    const resizeObserver = new ResizeObserver(() => {
      resetToTop();
    });

    resizeObserver.observe(viewport);
    if (previewStageRef.current instanceof HTMLElement) {
      resizeObserver.observe(previewStageRef.current);
    }
    if (previewRef.current instanceof HTMLElement) {
      resizeObserver.observe(previewRef.current);
    }

    const observerTimeout = window.setTimeout(() => {
      resizeObserver.disconnect();
    }, 450);

    return () => {
      window.cancelAnimationFrame(frameOne);
      window.clearTimeout(timeoutOne);
      window.clearTimeout(timeoutTwo);
      window.clearTimeout(timeoutThree);
      window.clearTimeout(observerTimeout);
      resizeObserver.disconnect();
      const frameTwo = Number(viewport.dataset.previewResetFrame || 0);
      if (frameTwo) {
        window.cancelAnimationFrame(frameTwo);
        delete viewport.dataset.previewResetFrame;
      }
    };
  }, [activeSection, previewViewportKey, isMobileLayout]);

  // --- HANDLERS ---
  const handlePersonalChange = (field, value) => {
    setResume(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const handlePrioritizeSummaryForJd = useCallback(() => {
    if (!jdText.trim()) return;

    const sentences = splitSummarySentences(resume.personal.summary);
    const topSentences = selectTopRelevantEntries(sentences, jdText, 3).map(({ item }) => item);
    const nextSummary = topSentences.join(' ').trim();

    if (!nextSummary || nextSummary === resume.personal.summary.trim()) {
      setSmartActionMessage('Your summary is already tightly aligned with the current job description.');
      return;
    }

    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        summary: nextSummary,
      },
    }));
    setSmartActionMessage('Prioritized the strongest summary sentences for this job description.');
  }, [jdText, resume.personal.summary]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handlePersonalChange('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkillsChange = (type, valueString) => {
    setSkillInputDrafts((prev) => ({
      ...prev,
      [type]: valueString,
    }));

    const list = valueString.split(',').map((s) => s.trim()).filter(Boolean);

    setResume((prev) => {
      const nextSkills =
        type === 'core'
          ? normalizeResumeSkills({ ...prev.skills, core: list, soft: [] })
          : normalizeResumeSkills({ ...prev.skills, [type]: list });

      return { ...prev, skills: nextSkills };
    });
  };

  const handleRemoveSkill = useCallback((type, skillToRemove) => {
    const nextSkills =
      type === 'technical'
        ? normalizeResumeSkills({
            ...resume.skills,
            technical: (resume.skills?.technical || []).filter((skill) => skill !== skillToRemove),
          })
        : normalizeResumeSkills({
            ...resume.skills,
            core: (resume.skills?.core || []).filter((skill) => skill !== skillToRemove),
            soft: (resume.skills?.soft || []).filter((skill) => skill !== skillToRemove),
          });

    setResume((prev) => ({
      ...prev,
      skills: nextSkills,
    }));
    setSkillInputDrafts({
      technical: nextSkills.technical.join(', '),
      core: nextSkills.core.join(', '),
    });
    setSmartActionMessage(`Removed ${skillToRemove} from ${type === 'technical' ? 'technical' : 'core'} skills.`);
  }, [resume.skills]);

  const runSmartTemplateSwitch = useCallback(() => {
    const nextTemplate = rankedTemplates.find((template) => template.id !== selectedTemplate);
    if (!nextTemplate) return;

    onChangeTemplate(nextTemplate.id);
    setActiveSection('templates');
    setEditorTab('template');
    setIsFormOpen(true);
    setSmartActionMessage(`Switched to ${nextTemplate.name}, the current best-fit template.`);
  }, [onChangeTemplate, rankedTemplates, selectedTemplate]);

  const runSmartSkillsTrim = useCallback(() => {
    const trimmedSkills = trimResumeSkills(resume.skills, presentationPlan.skillsLimit);
    setResume((prev) => ({
      ...prev,
      skills: trimmedSkills,
    }));
    setSkillInputDrafts({
      technical: trimmedSkills.technical.join(', '),
      core: trimmedSkills.core.join(', '),
    });
    setActiveSection('skills');
    setEditorTab('data');
    setIsFormOpen(true);
    setSmartActionMessage(`Trimmed skills to ${trimmedSkills.technical.length + trimmedSkills.core.length} high-signal items for better readability.`);
  }, [presentationPlan.skillsLimit, resume.skills]);

  const runSmartSummaryTrim = useCallback(() => {
    const nextSummary = trimSummaryToWordTarget(
      resume.personal?.summary || '',
      presentationPlan.summaryTargetWords
    );

    if (!nextSummary || nextSummary === (resume.personal?.summary || '').trim()) {
      setSmartActionMessage('Summary already fits the current template target well.');
      return;
    }

    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        summary: nextSummary,
      },
    }));
    setActiveSection('personal');
    setEditorTab('data');
    setIsFormOpen(true);
    setSmartActionMessage(`Tightened summary toward the ${presentationPlan.summaryTargetWords}-word target for this template.`);
  }, [presentationPlan.summaryTargetWords, resume.personal?.summary]);

  const runSmartExperienceCondense = useCallback(() => {
    let changedCount = 0;

    setResume((prev) => ({
      ...prev,
      experience: (prev.experience || []).map((item, index) => {
        if (index < 2) return item;

        const nextDesc = condenseResumeLines(item?.desc, 2);
        if (nextDesc !== (item?.desc || '')) {
          changedCount += 1;
          return {
            ...item,
            fullDescBackup: item.fullDescBackup || item.desc || '',
            desc: nextDesc,
          };
        }

        return item;
      }),
    }));

    setActiveSection('experience');
    setEditorTab('data');
    setIsFormOpen(true);
    setSmartActionMessage(
      changedCount > 0
        ? `Condensed ${changedCount} older role${changedCount === 1 ? '' : 's'} to reduce page pressure.`
        : 'Older roles were already concise, so no experience bullets needed trimming.'
    );
  }, []);

  const runSmartSafeTrims = useCallback(() => {
    const trimPlan = buildSafeTrimPlan({ resume, presentationPlan });
    if (!trimPlan.hasChanges) {
      setSmartActionMessage(trimPlan.message);
      return;
    }

    setResume(trimPlan.nextResume);

    if (trimPlan.skillDrafts) {
      setSkillInputDrafts(trimPlan.skillDrafts);
    }

    setActiveSection(trimPlan.focusSection);
    setEditorTab('data');
    setIsFormOpen(true);
    setSmartActionMessage(trimPlan.message);
  }, [presentationPlan, resume]);

  const runSmartSafeTrimsAndRewrite = useCallback(() => {
    const trimPlan = buildSafeTrimPlan({ resume, presentationPlan });
    const workingResume = trimPlan.hasChanges ? trimPlan.nextResume : resume;
    const weakestGroup = findWeakestExperienceBulletGroup(workingResume.experience, {
      jdText,
      jdAware: mode === 'tailor',
    });

    if (!weakestGroup?.text || !weakestGroup.indices?.length) {
      if (trimPlan.hasChanges) {
        setResume(trimPlan.nextResume);
        if (trimPlan.skillDrafts) {
          setSkillInputDrafts(trimPlan.skillDrafts);
        }
        setActiveSection(trimPlan.focusSection);
        setEditorTab('data');
        setIsFormOpen(true);
        setSmartActionMessage(`${trimPlan.message} No weak experience bullets were found to rewrite right now.`);
      } else {
        setSmartActionMessage('No weak experience bullets were found to rewrite right now.');
      }
      return;
    }

    if (trimPlan.hasChanges) {
      setResume(trimPlan.nextResume);
      if (trimPlan.skillDrafts) {
        setSkillInputDrafts(trimPlan.skillDrafts);
      }
    }

    setActiveSection('experience');
    setEditorTab('data');
    setIsFormOpen(true);

    const selectionMessage = `Picked ${weakestGroup.selectedCount} bullet${weakestGroup.selectedCount === 1 ? '' : 's'} from ${weakestGroup.roleLabel} because ${weakestGroup.selectionReason}.`;
    setSmartActionMessage(
      trimPlan.hasChanges
        ? `${trimPlan.message} ${selectionMessage}`
        : selectionMessage
    );

    openAIModal(
      weakestGroup.text,
      'experience bullet rewrite',
      (newText) => {
        const rewrittenLines = splitResumeLines(newText);
        if (!rewrittenLines.length) return;

        setResume((prev) => ({
          ...prev,
          experience: (prev.experience || []).map((item) => {
            if (item.id !== weakestGroup.roleId) return item;

            const originalLines = splitResumeLines(item?.desc);
            const nextLines = [...originalLines];

            weakestGroup.indices.forEach((lineIndex, rewriteIndex) => {
              if (rewrittenLines[rewriteIndex]) {
                nextLines[lineIndex] = rewrittenLines[rewriteIndex];
              }
            });

            return {
              ...item,
              fullDescBackup: item.fullDescBackup || item.desc || '',
              desc: nextLines.join('\n'),
            };
          }),
        }));

        setSmartActionMessage(
          trimPlan.hasChanges
            ? `${trimPlan.message} Rewrote ${weakestGroup.selectedCount} ${weakestGroup.jdAware ? 'JD-aware ' : ''}bullet${weakestGroup.selectedCount === 1 ? '' : 's'} in ${weakestGroup.roleLabel} with AI assistance.`
            : weakestGroup.jdAware
              ? `Rewrote ${weakestGroup.selectedCount} JD-aware bullet${weakestGroup.selectedCount === 1 ? '' : 's'} in ${weakestGroup.roleLabel} with AI assistance.`
              : `Rewrote ${weakestGroup.selectedCount} weak bullet${weakestGroup.selectedCount === 1 ? '' : 's'} in ${weakestGroup.roleLabel} with AI assistance.`
        );
      },
      {
        focusLabel: weakestGroup.jdAware ? 'Safe trim + JD-fit rewrite' : 'Safe trim + weak bullet rewrite',
        focusReason: `${trimPlan.hasChanges ? `${trimPlan.message} ` : ''}${selectionMessage}`,
      }
    );
  }, [jdText, mode, presentationPlan, resume]);

  const runMakeExportReady = useCallback(() => {
    const trimPlan = buildSafeTrimPlan({ resume, presentationPlan });
    const workingResume = trimPlan.hasChanges ? trimPlan.nextResume : resume;
    const nextCriticalSectionGaps = ['personal', 'experience', 'skills'].filter((key) => {
      if (key === 'personal') {
        const nextPersonal = workingResume.personal || {};
        const personalFields = [
          nextPersonal.name,
          nextPersonal.title,
          nextPersonal.email,
          nextPersonal.phone,
          nextPersonal.location,
        ].filter((value) => String(value || '').trim()).length;
        return personalFields < 3;
      }

      if (key === 'experience') {
        return !Array.isArray(workingResume.experience) || workingResume.experience.length === 0;
      }

      if (key === 'skills') {
        const skillCount =
          (Array.isArray(workingResume.skills?.technical) ? workingResume.skills.technical.length : 0) +
          (Array.isArray(workingResume.skills?.core) ? workingResume.skills.core.length : 0) +
          (Array.isArray(workingResume.skills?.soft) ? workingResume.skills.soft.length : 0);
        return skillCount === 0;
      }

      return false;
    }).length;

    const nextInsights = getResumeInsights(workingResume);
    const nextWeakestGroup = findWeakestExperienceBulletGroup(workingResume.experience, {
      jdText,
      jdAware: mode === 'tailor',
    });
    const nextReadinessItems = buildExportReadinessItems({
      previewPagesLength: previewPages.length,
      presentationPlan,
      criticalSectionGaps: nextCriticalSectionGaps,
      previewMetrics,
      resume: workingResume,
      resumeInsights: nextInsights,
      contentFitAudit,
      weakestGroup: nextWeakestGroup,
      mode,
      jdText,
      latestAtsEntry,
    });
    const remainingBlockers = nextReadinessItems.filter((item) => item.status === 'blocker');
    const remainingWarnings = nextReadinessItems.filter((item) => item.status === 'warning');

    if (trimPlan.hasChanges) {
      setResume(trimPlan.nextResume);
      if (trimPlan.skillDrafts) {
        setSkillInputDrafts(trimPlan.skillDrafts);
      }
    }

    setEditorTab('data');
    setIsFormOpen(true);
    if (isMobileLayout) {
      setMobileWorkspaceView('edit');
    }

    if (remainingBlockers.length > 0) {
      const firstBlocker = remainingBlockers[0];
      if (firstBlocker.section) {
        setActiveSection(firstBlocker.section);
      }
      setSmartActionMessage(
        `${trimPlan.hasChanges ? `${trimPlan.message} ` : ''}Resolved safe fixes. ${remainingBlockers.length} manual blocker${remainingBlockers.length === 1 ? '' : 's'} remain${remainingBlockers.length === 1 ? 's' : ''}; opened the highest-priority section next.`
      );
      return;
    }

    setActiveSection(trimPlan.hasChanges ? trimPlan.focusSection : 'personal');
    setSmartActionMessage(
      trimPlan.hasChanges
        ? remainingWarnings.length > 0
          ? `${trimPlan.message} Resume is now export-ready with ${remainingWarnings.length} warning${remainingWarnings.length === 1 ? '' : 's'} still optional to improve.`
          : `${trimPlan.message} Resume is now export-ready.`
        : remainingWarnings.length > 0
          ? `Resume is already export-ready with ${remainingWarnings.length} warning${remainingWarnings.length === 1 ? '' : 's'} still optional to improve.`
          : 'Resume is already export-ready.'
    );
  }, [
    contentFitAudit,
    isMobileLayout,
    jdText,
    latestAtsEntry,
    mode,
    presentationPlan,
    previewMetrics,
    previewPages.length,
    resume,
  ]);

  const handleRewriteWeakestBullets = useCallback(() => {
    const weakestGroup = findWeakestExperienceBulletGroup(resume.experience, {
      jdText,
      jdAware: mode === 'tailor',
    });

    if (!weakestGroup?.text || !weakestGroup.indices?.length) {
      setSmartActionMessage('No weak experience bullets were found to rewrite right now.');
      return;
    }

    setActiveSection('experience');
    setEditorTab('data');
    setIsFormOpen(true);
    setSmartActionMessage(
      `Picked ${weakestGroup.selectedCount} bullet${weakestGroup.selectedCount === 1 ? '' : 's'} from ${weakestGroup.roleLabel} because ${weakestGroup.selectionReason}.`
    );
    openAIModal(
      weakestGroup.text,
      'experience bullet rewrite',
      (newText) => {
        const rewrittenLines = splitResumeLines(newText);
        if (!rewrittenLines.length) return;

        setResume((prev) => ({
          ...prev,
          experience: (prev.experience || []).map((item) => {
            if (item.id !== weakestGroup.roleId) return item;

            const originalLines = splitResumeLines(item?.desc);
            const nextLines = [...originalLines];

            weakestGroup.indices.forEach((lineIndex, rewriteIndex) => {
              if (rewrittenLines[rewriteIndex]) {
                nextLines[lineIndex] = rewrittenLines[rewriteIndex];
              }
            });

            return {
              ...item,
              fullDescBackup: item.fullDescBackup || item.desc || '',
              desc: nextLines.join('\n'),
            };
          }),
        }));

        setSmartActionMessage(
          weakestGroup.jdAware
            ? `Rewrote ${weakestGroup.selectedCount} JD-aware bullet${weakestGroup.selectedCount === 1 ? '' : 's'} in ${weakestGroup.roleLabel} with AI assistance.`
            : `Rewrote ${weakestGroup.selectedCount} weak bullet${weakestGroup.selectedCount === 1 ? '' : 's'} in ${weakestGroup.roleLabel} with AI assistance.`
        );
      },
      {
        focusLabel: weakestGroup.jdAware ? 'Weakest JD-fit bullets' : 'Weakest bullets',
        focusReason: `Picked ${weakestGroup.selectedCount} bullet${weakestGroup.selectedCount === 1 ? '' : 's'} from ${weakestGroup.roleLabel} because ${weakestGroup.selectionReason}.`,
      }
    );
  }, [jdText, mode, resume.experience]);

  const runContentAuditAction = useCallback((actionId) => {
    if (actionId === 'tighten-summary') {
      runSmartSummaryTrim();
      return;
    }

    if (actionId === 'trim-skills') {
      runSmartSkillsTrim();
      return;
    }

    if (actionId === 'condense-roles') {
      runSmartExperienceCondense();
      return;
    }

    if (actionId === 'apply-safe-trims') {
      runSmartSafeTrims();
      return;
    }

    if (actionId === 'apply-safe-trims-and-rewrite') {
      runSmartSafeTrimsAndRewrite();
      return;
    }

    if (actionId === 'make-export-ready') {
      runMakeExportReady();
      return;
    }

    if (actionId === 'rewrite-weakest-bullets') {
      handleRewriteWeakestBullets();
      return;
    }

    if (actionId === 'review-experience') {
      setActiveSection('experience');
      setEditorTab('data');
      setIsFormOpen(true);
      setSmartActionMessage('Opened experience so you can strengthen weak or repetitive bullets.');
      return;
    }

    if (actionId === 'review-summary') {
      setActiveSection('personal');
      setEditorTab('data');
      setIsFormOpen(true);
      setSmartActionMessage('Opened summary so you can sharpen positioning and recruiter-first clarity.');
      return;
    }

    if (actionId === 'review-projects') {
      setActiveSection('projects');
      setEditorTab('data');
      setIsFormOpen(true);
      setSmartActionMessage('Opened projects so you can trim or tighten what deserves resume space.');
      return;
    }

    if (actionId === 'review-certifications') {
      setActiveSection('certifications');
      setEditorTab('data');
      setIsFormOpen(true);
      setSmartActionMessage('Opened certifications so you can keep the most relevant credentials visible.');
      return;
    }

    if (actionId === 'review-ats') {
      if (!jdText.trim()) {
        setActiveSection('target-jd');
        setEditorTab('data');
        setIsFormOpen(true);
        setSmartActionMessage('Paste a target job description first so ATS readiness can be checked.');
      } else {
        persistWorkspaceToRepository();
        setIsAtsModalOpen(true);
      }
      return;
    }

    if (actionId === 'review-template') {
      setActiveSection('templates');
      setEditorTab('template');
      setIsFormOpen(true);
      setSmartActionMessage('Opened template review so you can switch to a better content fit if needed.');
    }
  }, [handleRewriteWeakestBullets, jdText, persistWorkspaceToRepository, runMakeExportReady, runSmartExperienceCondense, runSmartSafeTrims, runSmartSafeTrimsAndRewrite, runSmartSkillsTrim, runSmartSummaryTrim]);

  const handleCondenseExperienceRole = useCallback((id) => {
    let didCondense = false;

    setResume((prev) => ({
      ...prev,
      experience: (prev.experience || []).map((item) => {
        if (item.id !== id) return item;

        const nextDesc = condenseResumeLines(item?.desc, 2);
        if (nextDesc === (item?.desc || '')) return item;

        didCondense = true;
        return {
          ...item,
          fullDescBackup: item.fullDescBackup || item.desc || '',
          desc: nextDesc,
        };
      }),
    }));

    setSmartActionMessage(didCondense ? 'Condensed this role to the strongest two lines.' : 'This role is already concise.');
  }, []);

  const handleRestoreExperienceRole = useCallback((id) => {
    let didRestore = false;

    setResume((prev) => ({
      ...prev,
      experience: (prev.experience || []).map((item) => {
        if (item.id !== id || !item.fullDescBackup) return item;

        didRestore = true;
        return {
          ...item,
          desc: item.fullDescBackup,
        };
      }),
    }));

    setSmartActionMessage(didRestore ? 'Restored the full text for this role.' : 'No saved full version was available for this role.');
  }, []);

  const handlePrioritizeExperienceForJd = useCallback((id) => {
    if (!jdText.trim()) return;

    let didUpdate = false;

    setResume((prev) => ({
      ...prev,
      experience: (prev.experience || []).map((item) => {
        if (item.id !== id) return item;

        const lines = splitResumeLines(item?.desc);
        const topLines = selectTopRelevantEntries(lines, jdText, 3).map(({ item: line }) => line);
        const nextDesc = topLines.join('\n').trim();

        if (!nextDesc || nextDesc === (item?.desc || '').trim()) {
          return item;
        }

        didUpdate = true;
        return {
          ...item,
          fullDescBackup: item.fullDescBackup || item.desc || '',
          desc: nextDesc,
        };
      }),
    }));

    setSmartActionMessage(
      didUpdate
        ? 'Kept the strongest JD-matching bullets for this role.'
        : 'This role is already focused on the strongest JD-matching bullets.'
    );
  }, [jdText]);

  const handleLayoutSpacingChange = (section, value) => {
    setResume((prev) => ({
      ...prev,
      layoutSpacing: {
        ...prev.layoutSpacing,
        [section]: value,
      },
    }));
  };

  const handleDocumentSettingChange = (field, value) => {
    setResume((prev) => ({
      ...prev,
      documentSettings: {
        ...normalizeDocumentSettings(prev.documentSettings),
        [field]: value,
      },
    }));
  };

  const addListItem = (section) => {
    const newItem = { id: Date.now(), title: '', name: '', date: '', desc: '', issuer: '', role: '', company: '' };
    setResume(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
  };

  const updateListItem = (section, id, field, value) => {
    setResume(prev => ({
      ...prev,
      [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeListItem = (section, id) => {
    setResume(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));
  };

  const syncPreviewBreaks = useCallback(async () => {
    const exportRoot = getPreviewPrintRoot(
      exportPreviewRef.current?.firstElementChild ||
      exportPreviewRef.current ||
      previewRef.current
    );
    if (!(exportRoot instanceof HTMLElement)) return [];

    await waitForEmbeddedAssets(exportRoot);

const pageHeight = getA4PageHeightPx(exportRoot.offsetWidth);
const nativePages = findExistingA4Pages(exportRoot);

if (nativePages.length > 0) {
  const contentHeight = pageHeight * nativePages.length;
  const breaks = nativePages
    .slice(1)
    .map((_, index) => pageHeight * (index + 1));

  setNativePreviewPageCount((current) => current === nativePages.length ? current : nativePages.length);
  setPreviewMetrics((current) => (
    current.pageHeight === pageHeight && current.contentHeight === contentHeight
      ? current
      : { pageHeight, contentHeight }
  ));
  setPreviewPageBreaks((current) => (
    current.length === breaks.length && current.every((value, index) => value === breaks[index])
      ? current
      : breaks
  ));
  return breaks;
}

setNativePreviewPageCount((current) => current === 0 ? current : 0);
const contentHeight = exportRoot.scrollHeight;
    const breaks = calculatePageBreaks(exportRoot, pageHeight, {
      manualBreaks: [],
      scale: 1,
      explicitContentHeight: contentHeight,
    });

    setPreviewMetrics((current) => (
      current.pageHeight === pageHeight && current.contentHeight === contentHeight
        ? current
        : { pageHeight, contentHeight }
    ));
    setPreviewPageBreaks((current) => (
      current.length === breaks.length && current.every((value, index) => value === breaks[index])
        ? current
        : breaks
    ));
    return breaks;
  }, []);

  useEffect(() => {
    let frameId = 0;
    const updatePreviewBreaks = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        syncPreviewBreaks();
      });
    };

    updatePreviewBreaks();
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePreviewBreaks) : null;
    const observedNodes = [
      getPreviewPrintRoot(previewRef.current),
      getPreviewPrintRoot(exportPreviewRef.current?.firstElementChild || exportPreviewRef.current),
    ].filter(Boolean);
    observedNodes.forEach((node) => resizeObserver?.observe(node));
    window.addEventListener('resize', updatePreviewBreaks);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updatePreviewBreaks);
    };
  }, [resume, selectedTemplate, isPreviewModalOpen, syncPreviewBreaks]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileLayout) return;

    setIsFormOpen(true);
  }, [isMobileLayout]);

  useEffect(() => {
    persistedResumeIdRef.current = resumeRecordId || null;
    setPersistedResumeId(resumeRecordId || null);
  }, [resumeRecordId]);

  useEffect(() => {
    setSkillInputDrafts({
      technical: resume.skills.technical.join(', '),
      core: resume.skills.core.join(', '),
    });
  }, [persistedResumeId]);

  useEffect(() => {
    if (!persistedResumeId) {
      setLatestAtsEntry(null);
      setLatestInterviewEntry(null);
      setLatestReadinessEntry(null);
      setPreviousReadinessEntry(null);
      return;
    }

    const record = getResumeRecord(persistedResumeId);
    setLatestAtsEntry(record?.atsHistory?.[0] || null);
    setLatestInterviewEntry(record?.interviewPrepHistory?.[0] || null);
    setLatestReadinessEntry(record?.exportReadinessHistory?.[0] || null);
    setPreviousReadinessEntry(record?.exportReadinessHistory?.[1] || null);
  }, [persistedResumeId]);

  useEffect(() => {
    if (!hasMountedAutosaveRef.current) {
      hasMountedAutosaveRef.current = true;
      const savedRecord = persistWorkspaceToRepository();

      if (savedRecord) {
        lastPersistedSnapshotRef.current = workspaceSnapshot;
        setAutosaveState('saved');
        setLastSavedAt(new Date());
      } else {
        setAutosaveState('error');
      }
      return undefined;
    }

    if (workspaceSnapshot === lastPersistedSnapshotRef.current) {
      return undefined;
    }

    setAutosaveState('saving');

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem('resume_builder_workspace_snapshot', workspaceSnapshot);
        const savedRecord = persistWorkspaceToRepository();
        if (!savedRecord) throw new Error('The resume repository did not confirm the save.');

        lastPersistedSnapshotRef.current = workspaceSnapshot;
        setAutosaveState('saved');
        setLastSavedAt(new Date());
      } catch (error) {
        console.warn('Unable to cache editor snapshot', error);
        setAutosaveState('error');
      }
      autosaveTimerRef.current = null;
    }, 900);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [persistWorkspaceToRepository, workspaceSnapshot]);

  useEffect(() => () => {
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!smartActionMessage) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSmartActionMessage('');
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [smartActionMessage]);

  useEffect(() => {
    if (!initialSmartAction) return;

    const details = initialSmartActionDetails || {};
    const trimmedSkillsMessage =
      details.trimmedSkillCount > 0
        ? `trimmed skills from ${details.initialSkillCount} to ${details.nextSkillCount}`
        : 'kept your current skills count';
    const condensedRolesMessage =
      details.condensedRoleCount > 0
        ? `condensed ${details.condensedRoleCount} older role${details.condensedRoleCount === 1 ? '' : 's'}`
        : 'kept your existing role detail';
    const entryMessageByAction = {
      'trim-skills': details.trimmedSkillCount > 0
        ? `Applied smart action: ${trimmedSkillsMessage} for a cleaner, higher-signal layout.`
        : 'Applied smart action: reviewed skills for cleaner template fit, but no trimming was needed.',
      'condense-older-roles': details.condensedRoleCount > 0
        ? `Applied smart action: ${condensedRolesMessage} to reduce page pressure.`
        : 'Applied smart action: reviewed older roles for page pressure, but they were already concise.',
      'optimize-layout':
        details.trimmedSkillCount > 0 || details.condensedRoleCount > 0
          ? `Applied smart action: ${trimmedSkillsMessage} and ${condensedRolesMessage}.`
          : 'Applied smart action: checked skills and older roles for stronger template fit, but no extra cleanup was needed.',
      'select-template': 'Applied smart action: switched you into the recommended template layout.',
    };

    setSmartActionMessage(
      entryMessageByAction[initialSmartAction] ||
        'Applied smart template recommendations to improve this resume layout.'
    );
  }, [initialSmartAction, initialSmartActionDetails]);

  useEffect(() => {
    const previewSurface = previewRef.current;
    if (!(previewSurface instanceof HTMLElement)) return;

    autoAnnotatePreviewEditableFields(previewSurface, resume);

    previewSurface.querySelectorAll('[data-edit-path]').forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.removeAttribute('data-preview-edit-active');
      if (isPreviewEditMode) {
        node.setAttribute('title', node.dataset.editLabel ? `Click to edit: ${node.dataset.editLabel}` : 'Click to edit');
      } else {
        node.removeAttribute('title');
      }
    });

    if (!isPreviewEditMode || !activePreviewField?.path) return;

    previewSurface.querySelectorAll('[data-edit-path]').forEach((node) => {
      if (node instanceof HTMLElement && node.dataset.editPath === activePreviewField.path) {
        node.dataset.previewEditActive = 'true';
      }
    });
  }, [activePreviewField, isPreviewEditMode, resume, selectedTemplate]);

  const adjustPreviewZoom = (direction) => {
    setPreviewZoomLevel((current) => {
      const next = direction === 'in' ? current + 0.1 : current - 0.1;
      return Number(Math.min(1.45, Math.max(0.75, next)).toFixed(2));
    });
  };

  const resetPreviewZoom = () => {
    setPreviewZoomLevel(1);
  };

  const togglePreviewEditMode = () => {
    setIsPreviewEditMode((prev) => {
      const next = !prev;
      if (!next) {
        setActivePreviewField(null);
      }
      return next;
    });
  };

  const handlePreviewEditableClick = (event) => {
    if (!isPreviewEditMode) return;

    const previewSurface = previewRef.current;
    if (!(previewSurface instanceof HTMLElement)) return;

    const target = event.target instanceof HTMLElement
      ? event.target.closest('[data-edit-path]')
      : null;

    if (!(target instanceof HTMLElement) || !previewSurface.contains(target)) {
      setActivePreviewField(null);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const fieldPath = target.dataset.editPath;
    if (!fieldPath) return;

    setActivePreviewField({
      path: fieldPath,
      label: target.dataset.editLabel || 'Resume Text',
      multiline: target.dataset.editMultiline === 'true',
    });
  };

  const handlePreviewFieldChange = (nextValue) => {
    if (!activePreviewField?.path) return;

    setResume((prev) => setValueAtPath(prev, activePreviewField.path, nextValue));
  };

  const activePreviewFieldValue = activePreviewField?.path
    ? getValueAtPath(resume, activePreviewField.path)
    : '';

  const handleOpenPreview = async () => {
    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    await syncPreviewBreaks();
    const savedRecord = persistWorkspaceToRepository();
    if (savedRecord?.id) {
      recordExportReadinessHistory('preview_opened', savedRecord.id);
    }
    setIsPreviewModalOpen(true);
  };

  const getPrintSourceNode = ({ preferVisiblePreview = false } = {}) => {
    const previewContainer = preferVisiblePreview && previewRef.current
      ? previewRef.current
      : exportPreviewRef.current;

    if (!(previewContainer instanceof HTMLElement)) return null;

    const sourceNode = getPreviewPrintRoot(
      previewContainer.firstElementChild || previewContainer
    );

    return sourceNode instanceof HTMLElement ? sourceNode : null;
  };

  // --- PDF / PRINT GENERATION ---
  const executePdfExport = async (sourceNode) => {
    try {
      const savedRecord = persistWorkspaceToRepository();
      if (savedRecord?.id) {
        recordExportReadinessHistory('export_started', savedRecord.id);
      }
      await exportPaginatedA4ElementToPdf({
        sourceElement: sourceNode,
        filename: `${(resume.personal.name || 'Resume').trim() || 'Resume'}.pdf`,
        onAfterPrint: () => {
          if (persistedResumeIdRef.current) {
            markResumePrinted(persistedResumeIdRef.current);
          }
        },
      });
    } catch (error) {
      console.error('PDF export failed', error);
      setSmartActionMessage(
        error instanceof Error
          ? `PDF export failed: ${error.message}`
          : 'PDF export failed. Please try again.'
      );
    }
  };

  const handleDownload = async ({ preferVisiblePreview = false } = {}) => {
    if (isCheckingPass) return;
    // Let the latest controlled-input change finish rendering before the DOM is cloned.
    await new Promise((resolve) =>
      window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
    );

    const sourceNode = getPrintSourceNode({ preferVisiblePreview });
    if (!(sourceNode instanceof HTMLElement)) return;

    await waitForEmbeddedAssets(sourceNode);
    const exportIssueCount =
      exportReadinessSummary.blockerCount + exportReadinessSummary.warningCount;

    if (exportIssueCount > 0) {
      const blockerLabel =
        exportReadinessSummary.blockerCount === 1 ? 'blocker' : 'blockers';
      const warningLabel =
        exportReadinessSummary.warningCount === 1 ? 'warning' : 'warnings';

      setSmartActionMessage(
        'Exporting with ' +
          exportReadinessSummary.blockerCount +
          ' ' +
          blockerLabel +
          ' and ' +
          exportReadinessSummary.warningCount +
          ' ' +
          warningLabel +
          '. You can still save the current resume as a PDF.'
      );
    }

    if (!user?.id) {
      pendingDownloadFnRef.current = () => executePdfExport(sourceNode);
      setIsDownloadGateOpen(true);
      return;
    }

    setIsCheckingPass(true);
    try {
      const passCheck = await checkDownloadPass(
        user.id,
        'resume_pdf',
        persistedResumeIdRef.current || 'active_resume'
      );
      if (!passCheck.canDownload) {
        pendingDownloadFnRef.current = () => executePdfExport(sourceNode);
        setIsDownloadGateOpen(true);
        return;
      }
    } catch (gateErr) {
      console.warn('[Download pass check notice]', gateErr);
    } finally {
      setIsCheckingPass(false);
    }

    await executePdfExport(sourceNode);
  };

  // --- AI ENHANCE HANDLER ---
  const openAIModal = (textToEnhance, type, applyCallback, options = {}) => {
    setAiModalConfig({
      isOpen: true,
      text: textToEnhance,
      type: type,
      onApply: applyCallback,
      contextMeta: {
        jobTitle: resume.personal.title || 'Professional',
        jdText: mode === 'tailor' ? jdText : '',
        targetTemplate: selectedTemplateMeta?.name || '',
        roleFamily: resumeInsights.roleFamily || '',
        seniorityLevel: resumeInsights.seniorityLevel || '',
        targetPages: presentationPlan.targetPages,
        ...options,
      },
    });
  };

  // Check if JD is required for action
  const handleATSClick = () => {
    if (!jdText.trim()) {
      setActiveSection('target-jd');
      setIsFormOpen(true);
      if (isMobileLayout) {
        setMobileWorkspaceView('edit');
      }
    } else {
      const savedRecord = persistWorkspaceToRepository();
      if (!latestAtsEntry && savedRecord?.atsHistory?.length) {
        setLatestAtsEntry(savedRecord.atsHistory[0]);
      }
      setIsAtsModalOpen(true);
    }
  };
  const handleInterviewClick = () => {
    if (!jdText.trim()) {
      setActiveSection('target-jd');
      setIsFormOpen(true);
      if (isMobileLayout) {
        setMobileWorkspaceView('edit');
      }
    } else {
      const savedRecord = persistWorkspaceToRepository();
      if (!latestInterviewEntry && savedRecord?.interviewPrepHistory?.length) {
        setLatestInterviewEntry(savedRecord.interviewPrepHistory[0]);
      }
      setIsInterviewModalOpen(true);
    }
  };
  const handleSaveResume = () => {
    setAutosaveState('saving');
    persistWorkspaceToRepository();
    setAutosaveState('saved');
    setLastSavedAt(new Date());
  };

  return (
    <div className="relative flex h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[linear-gradient(rgba(18,59,109,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.035)_1px,transparent_1px),radial-gradient(circle_at_82%_8%,rgba(18,59,109,0.16),transparent_34%),radial-gradient(circle_at_12%_18%,rgba(185,150,74,0.10),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#F2F5F8_100%)] bg-[size:36px_36px,36px_36px,auto,auto,auto] font-sans text-[#071426]">
      <style>{`
        .preview-edit-mode [data-edit-path] {
          cursor: text;
          border-radius: 0.4rem;
          text-decoration-line: underline;
          text-decoration-style: dotted;
          text-decoration-color: rgba(18, 59, 109, 0.48);
          text-underline-offset: 0.18em;
          transition: outline-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
        }

        .preview-edit-mode [data-edit-path]:hover {
          position: relative;
          outline: 2px solid rgba(18, 59, 109, 0.58);
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(18, 59, 109, 0.12);
          background-color: rgba(232, 238, 247, 0.78);
          transform: translateY(-1px);
        }

        .preview-edit-mode [data-edit-path]:hover::after {
          content: 'Click to edit';
          position: absolute;
          left: 50%;
          bottom: calc(100% + 0.45rem);
          transform: translateX(-50%);
          border-radius: 999px;
          background: rgba(7, 20, 38, 0.94);
          color: white;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          padding: 0.3rem 0.55rem;
          text-transform: uppercase;
          white-space: nowrap;
          pointer-events: none;
          z-index: 50;
        }

        .preview-edit-mode [data-preview-edit-active="true"] {
          outline: 2px solid rgba(18, 59, 109, 0.95);
          outline-offset: 2px;
          box-shadow: 0 0 0 5px rgba(18, 59, 109, 0.16);
          background-color: rgba(232, 238, 247, 0.72);
          text-decoration-color: rgba(18, 59, 109, 0.8);
        }

        .editor-help-target {
          position: relative !important;
          z-index: 10001 !important;
          outline: 3px solid #D6B25E !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 8px rgba(214, 178, 94, 0.18), 0 0 0 9999px rgba(7, 20, 38, 0.58) !important;
          border-radius: 0.9rem;
        }
      `}</style>
      {/* --- ALL MODALS OVERLAYS --- */}
      <AIEnhanceModal
        isOpen={aiModalConfig.isOpen}
        currentText={aiModalConfig.text}
        contextType={aiModalConfig.type}
        jobTitle={resume.personal.title || "Professional"}
        contextMeta={aiModalConfig.contextMeta}
        onClose={() => setAiModalConfig({ ...aiModalConfig, isOpen: false })}
        onSelect={(newText) => { if (aiModalConfig.onApply) aiModalConfig.onApply(newText); }}
      />
      <ATSScoreModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        resumeData={resume}
        jdText={jdText}
        existingEntry={latestAtsEntry}
        onResults={(result) => {
          const savedRecord = persistWorkspaceToRepository();
          if (savedRecord?.id) {
            const entry = appendATSResult({
              resumeId: savedRecord.id,
              jdText,
              result,
            });
            setLatestAtsEntry(entry);
          }
        }}
      />
      <InterviewPrepModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        resumeData={resume}
        jdText={jdText}
        existingEntry={latestInterviewEntry}
        onResults={(result) => {
          const savedRecord = persistWorkspaceToRepository();
          if (savedRecord?.id) {
            const entry = appendInterviewPrepResult({
              resumeId: savedRecord.id,
              jdText,
              result,
            });
            setLatestInterviewEntry(entry);
          }
        }}
      />
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071426]/78 p-3 backdrop-blur-md sm:p-6">
          <div className="flex h-[94vh] w-full max-w-[96rem] flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-white shadow-[0_28px_90px_rgba(1,18,42,0.34)]">
            <div className="flex min-h-16 shrink-0 flex-col items-start justify-between gap-3 border-b border-[#173A62] bg-[#071426] px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <div className="flex items-center gap-2 font-bold text-white">
                <Eye size={18} className="text-[#D6B25E]" />
                <div>
                  <div>A4 Print Preview</div>
                  <div className="mt-0.5 text-[10px] font-medium text-white/45">
                    Verify page flow before saving your PDF
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload({ preferVisiblePreview: true })}
                  disabled={isCheckingPass}
                  className="theme-primary-button px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-60"
                >
                  {isCheckingPass ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <Download size={16} />
                  )}
                  {isCheckingPass ? 'Preparing...' : 'Print / Save PDF'}
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 rounded-lg text-[#64748B] hover:bg-[#EEF2F7] hover:text-[#071426] transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto xl:overflow-hidden">
              <div className="mx-auto grid min-h-full max-w-[96rem] items-start xl:h-full xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
                <aside className="border-b border-[#D8E2EC] bg-[#F7F9FC] p-4 sm:p-6 xl:h-full xl:overflow-y-auto xl:border-b-0 xl:border-r">
                  <div className="flex flex-col gap-5">
                <div className="rounded-xl border border-[#B9964A]/30 bg-[#B9964A]/10 px-4 py-3 text-sm leading-6 text-[#071426]">
                  This export now uses the browser print engine, so when you choose <strong>Save as PDF</strong> you get a real PDF with selectable text instead of a flattened image.
                </div>
                <div className="rounded-xl border border-[#E1E7EF] bg-white px-4 py-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">
                        Export Readiness
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#071426]">
                        {exportReadinessSummary.ready
                          ? exportReadinessSummary.warningCount > 0
                            ? `Ready to export with ${exportReadinessSummary.warningCount} warning${exportReadinessSummary.warningCount === 1 ? '' : 's'}`
                            : 'Ready to export'
                          : `${exportReadinessSummary.blockerCount} blocker${exportReadinessSummary.blockerCount === 1 ? '' : 's'} to fix before export`}
                      </div>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                        exportReadinessSummary.ready
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {exportReadinessSummary.ready ? 'Exportable' : 'Needs fixes'}
                    </div>
                  </div>
                  {latestReadinessEntry?.createdAt ? (
                    <div className="mb-3 rounded-xl border border-[#E1E7EF] bg-[#F7F8FA] px-3 py-2 text-xs text-[#475569]">
                      Last readiness check saved {new Date(latestReadinessEntry.createdAt).toLocaleString()}.
                      {exportReadinessDelta
                        ? exportReadinessDelta.improved
                          ? ` Improved by ${Math.max(0, exportReadinessDelta.blockerDelta)} blocker${Math.max(0, exportReadinessDelta.blockerDelta) === 1 ? '' : 's'} and ${Math.max(0, exportReadinessDelta.warningDelta)} warning${Math.max(0, exportReadinessDelta.warningDelta) === 1 ? '' : 's'} since the previous check.`
                          : ' No major readiness improvements since the previous check.'
                        : ''}
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    {exportReadinessItems.map((item) => (
                      <div
                        key={`preview-${item.key}`}
                        className={`rounded-xl border px-3 py-2.5 ${
                          item.status === 'blocker'
                            ? 'border-rose-200 bg-rose-50'
                            : item.status === 'warning'
                              ? 'border-amber-200 bg-amber-50'
                              : 'border-emerald-200 bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#071426]">
                            {item.status === 'pass' ? (
                              <CheckCircle2 size={14} className="text-emerald-700" />
                            ) : (
                              <AlertTriangle size={14} className={item.status === 'blocker' ? 'text-rose-700' : 'text-amber-700'} />
                            )}
                            <span>{item.label}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                  </div>
                </aside>

                <section className="min-w-0 bg-[linear-gradient(rgba(18,59,109,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.03)_1px,transparent_1px),radial-gradient(circle_at_80%_0%,rgba(18,59,109,0.11),transparent_34%),radial-gradient(circle_at_14%_10%,rgba(185,150,74,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#F1F5F9_100%)] bg-[size:32px_32px,32px_32px,auto,auto,auto] p-4 sm:p-6 xl:h-full xl:overflow-auto xl:p-8">
                  <div className="flex min-w-max flex-col items-center gap-8">
{nativePreviewPageCount > 0 ? (
  <div className="w-[210mm]">
    <div className="mb-3 text-center text-xs font-black uppercase tracking-[0.28em] text-[#64748B]">
      {nativePreviewPageCount} A4 page{nativePreviewPageCount === 1 ? '' : 's'}
    </div>
    <ResumePreview data={resume} template={selectedTemplate} />
  </div>
) : (
  <>
                      {previewPages.map((page, index) => {
                    const totalPages = previewPages.length;
                    const isLastPage = index === totalPages - 1;

                    return (
                      <div key={`preview-page-${index}`} className="w-full flex flex-col items-center gap-3">
                        <div className="text-xs font-black uppercase tracking-[0.28em] text-[#64748B]">
                          Page {index + 1} of {totalPages}
                        </div>
                        <div className="relative w-[210mm] h-[297mm] max-w-full overflow-hidden rounded-md bg-white shadow-2xl">
                          <div
                            className="absolute left-0 top-0 w-[210mm] max-w-full overflow-hidden"
                            style={{ height: `${Math.max(0, page.visibleHeight)}px` }}
                          >
                            <div
                              className="absolute left-0 top-0 w-[210mm] max-w-full"
                              style={{ transform: `translateY(-${page.start}px)` }}
                            >
                              <ResumePreview data={resume} template={selectedTemplate} />
                            </div>
                          </div>
                        </div>
                        {!isLastPage && (
                          <div className="rounded-full border border-[#B9964A]/30 bg-[#B9964A]/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#9A7628]">
                            Actual page break after page {index + 1}
                          </div>
                        )}
                      </div>
                    );
                      })}
  </>
)}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      <BuilderNavbar
        className="shrink-0"
        currentStep="edit"
        mode={mode}
        onHelp={() => setHelpTourStep(0)}
        onHome={() => {
          handleSaveResume();
          onHome?.();
        }}
        onDashboard={onOpenRepository ? () => {
          handleSaveResume();
          onOpenRepository();
        } : null}
        onBack={() => {
          handleSaveResume();
          onBack?.();
        }}
      />

      {helpTourStep !== null ? (
        <aside
          ref={helpTourPanelRef}
          role="dialog"
          aria-label="Resume editor guided tour"
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
                Editor tour · {helpTourStep + 1} of {EDITOR_HELP_STEPS.length}
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
              {EDITOR_HELP_STEPS[helpTourStep].title}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-white/70">
              {EDITOR_HELP_STEPS[helpTourStep].description}
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
                {EDITOR_HELP_STEPS.map((step, index) => (
                  <span key={step.id} className={`h-1.5 rounded-full transition-all ${index === helpTourStep ? 'w-5 bg-[#D6B25E]' : 'w-1.5 bg-white/25'}`} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => helpTourStep === EDITOR_HELP_STEPS.length - 1
                  ? closeHelpTour()
                  : setHelpTourStep((current) => current + 1)}
                className="h-9 rounded-lg bg-[#D6B25E] px-4 text-xs font-extrabold text-[#071426] transition hover:bg-[#E4C56F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D6B25E]/30"
              >
                {helpTourStep === EDITOR_HELP_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row lg:h-full">
        {isMobileLayout && (
          <div className="border-b border-[#1E3A59] bg-[#071426] px-4 py-3 shadow-[0_8px_24px_rgba(7,20,38,0.14)] lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D6B25E]">Resume Editor</div>
                <div className="mt-1 text-sm font-bold text-white">{mobileWorkspaceView === 'edit' ? sectionOverview.heading : 'Preview and export'}</div>
              </div>
              <div className="inline-flex rounded-xl border border-[#E1E7EF] bg-[#F7F8FA] p-1">
                <button
                  type="button"
                  onClick={() => setMobileWorkspaceView('edit')}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                    mobileWorkspaceView === 'edit'
                      ? 'bg-white text-[#071426] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setMobileWorkspaceView('preview')}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition-all ${
                    mobileWorkspaceView === 'preview'
                      ? 'bg-white text-[#071426] shadow-sm'
                      : 'text-[#64748B]'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDITOR FORM AREA */}
        <div
          className={`relative z-20 min-h-0 shrink-0 overflow-y-auto overscroll-y-contain border-r border-[#D7E1EA] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] font-sans shadow-[10px_0_32px_rgba(7,20,38,0.045)] custom-scrollbar ${
            isEditorPanelResizing ? 'transition-none' : 'transition-all duration-300 ease-in-out'
          } ${
            isMobileLayout
              ? mobileWorkspaceView === 'edit'
                ? 'flex-1 w-full p-4 sm:p-5'
                : 'hidden'
              : isFormOpen
                ? 'p-4 sm:p-5 lg:p-5 opacity-100'
                : 'p-3 sm:p-4 lg:p-3 opacity-100'
          }`}
          style={
            !isMobileLayout
              ? {
                  width: isFormOpen
                    ? `${editorPanelWidth}px`
                    : `${COLLAPSED_EDITOR_PANEL_WIDTH}px`,
                }
              : undefined
          }
        >
          {isMobileLayout || isFormOpen ? (
            <div className="mx-auto w-full max-w-none pb-6">
              <div className="contents">
                <div data-help-tour="workspace-tabs" className="sticky top-0 z-30 -mx-2 mb-4 overflow-hidden rounded-[1rem] border border-[#173A62] bg-[#071426]/[0.985] p-2.5 shadow-[0_14px_32px_rgba(7,20,38,0.20)] backdrop-blur-xl">
                  <div className="mb-2 flex items-center justify-between gap-3 px-1">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#D6B25E]">
                        Resume Workspace
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold text-white/70">
                        Edit content without leaving the live canvas
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${autosaveState === 'saving' ? 'animate-pulse bg-[#D6B25E]' : autosaveState === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                        {autosaveState === 'saving' ? 'Saving' : autosaveState === 'error' ? 'Save failed' : 'Saved'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 rounded-[0.72rem] border border-white/10 bg-white/[0.055] p-1">
                    <div className="grid grid-cols-2 gap-1">
                      {EDITOR_TAB_CONFIG.map(({ id, label, icon: Icon }) => {
                        const isActive = editorTab === id;

                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleEditorTabChange(id)}
                            className={`flex min-h-9 min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 text-[0.74rem] font-bold transition-all ${
                              isActive
                                ? 'bg-white text-[#173A62] shadow-[0_3px_10px_rgba(0,0,0,0.12)]'
                                : 'text-white/55 hover:bg-white/[0.07] hover:text-white'
                            }`}
                          >
                            <Icon size={15} className="shrink-0" />
                            <span className="truncate leading-tight">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  </div>
                </div>

                {editorTab === 'data' ? (
                  <div data-help-tour="data-editor" className="mb-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#667A90]">Editing Section</label>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${activeSectionStatusMeta.pillClassName}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${activeSectionStatusMeta.dotClassName}`} />
                        {activeSectionStatusMeta.label}
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={activeSection}
                        onChange={(event) => handleSectionSelect(event.target.value)}
                        className="min-h-11 w-full appearance-none rounded-[0.75rem] border border-[#D5DFE9] bg-white px-3.5 py-2.5 pr-10 text-[13px] font-bold text-[#173A62] shadow-[0_2px_8px_rgba(7,20,38,0.045)] outline-none transition-[border-color,box-shadow] hover:border-[#C6D2DE] focus:border-[#C49A43] focus:ring-4 focus:ring-[#C49A43]/10"
                      >
                        {sectionSelectOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    </div>
                  </div>
                ) : null}

                {editorTab === 'data' && activeSection !== 'target-jd' ? (
                  <div className="mb-5 rounded-[0.9rem] border border-[#DCE4EC] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FAFC_100%)] px-3.5 py-3 shadow-[0_4px_14px_rgba(7,20,38,0.04)]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-8 w-1 shrink-0 rounded-full bg-[linear-gradient(180deg,#123B6D_0%,#B9964A_100%)]" />
                      <div className="min-w-0">
                        <div className="text-[13px] font-extrabold text-[#173A62]">
                          {sectionOverview.heading}
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-[#687C91]">
                          {sectionOverview.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeSection === 'document' ? (
                <div className="rounded-xl border border-[#E1E7EF] bg-[linear-gradient(135deg,rgba(247,248,250,0.96),rgba(232,238,247,0.96))] p-4 shadow-sm shadow-[#071426]/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#9A7628]">
                        Smart Guidance
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[#071426]">
                        {selectedTemplateMeta?.name || 'Resume'} with {resumeInsights.totalSkillCount} skills and {resumeInsights.experienceCount} roles
                      </div>
                      <div className="mt-1 text-xs leading-5 text-[#475569]">
                        {resumeInsights.roleFamily} profile, {resumeInsights.seniorityLevel} level, recommended for {resumeInsights.recommendedPageCount} page{resumeInsights.recommendedPageCount === 1 ? '' : 's'}.
                        {mode === 'tailor' && jdText.trim() ? ' Template ranking is now also reacting to the live job description.' : ''}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#B9964A]/25 bg-white/80 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#9A7628]">
                      Rank {selectedTemplateRank ? `#${selectedTemplateRank}` : '--'}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-white bg-white/85 px-3 py-2">
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">Density</div>
                      <div className="mt-1 text-xs font-semibold capitalize text-[#071426]">
                        {resumeInsights.contentDensity.replace('-', ' ')}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white bg-white/85 px-3 py-2">
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">Skills risk</div>
                      <div className="mt-1 text-xs font-semibold capitalize text-[#071426]">
                        {resumeInsights.skillsOverflowRisk}
                      </div>
                    </div>
                    <div className="rounded-lg border border-white bg-white/85 px-3 py-2">
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">Preview pages</div>
                      <div className="mt-1 text-xs font-semibold text-[#071426]">
                        {previewPages.length}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {editorGuidance.map(({ tone, icon: Icon, title, text }) => (
                      <div
                        key={title}
                        className={`rounded-lg border px-3 py-2.5 ${
                          tone === 'warning'
                            ? 'border-amber-200 bg-amber-50'
                            : tone === 'positive'
                              ? 'border-emerald-200 bg-emerald-50'
                              : 'border-[#E1E7EF] bg-white/85'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Icon
                            size={15}
                            className={
                              tone === 'warning'
                                ? 'mt-0.5 text-amber-700'
                                : tone === 'positive'
                                  ? 'mt-0.5 text-emerald-700'
                                  : 'mt-0.5 text-[#123B6D]'
                            }
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#071426]">{title}</div>
                            <div className="mt-0.5 text-xs leading-5 text-[#475569]">{text}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(resumeInsights.skillsOverflowRisk !== 'low' ||
                      resumeInsights.experienceCount > 2 ||
                      resumeInsights.summaryWords > presentationPlan.summaryTargetWords + 10) ? (
                      <button
                        type="button"
                        onClick={runSmartSafeTrimsAndRewrite}
                        className="rounded-lg bg-[#0F3158] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0B2746]"
                      >
                        Fit it + strengthen bullets
                      </button>
                    ) : null}
                    {(resumeInsights.skillsOverflowRisk !== 'low' ||
                      resumeInsights.experienceCount > 2 ||
                      resumeInsights.summaryWords > presentationPlan.summaryTargetWords + 10) ? (
                      <button
                        type="button"
                        onClick={runSmartSafeTrims}
                        className="rounded-lg bg-[#123B6D] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0F3158]"
                      >
                        Apply all safe trims
                      </button>
                    ) : null}
                    {rankedTemplates[0]?.id && rankedTemplates[0]?.id !== selectedTemplate ? (
                      <button
                        type="button"
                        onClick={runSmartTemplateSwitch}
                        className="rounded-lg border border-[#123B6D]/20 bg-white px-3 py-2 text-xs font-bold text-[#123B6D] transition hover:border-[#123B6D]/35 hover:bg-[#E8EEF7]"
                      >
                        Switch to best-fit template
                      </button>
                    ) : null}
                    {resumeInsights.skillsOverflowRisk !== 'low' ? (
                      <button
                        type="button"
                        onClick={runSmartSkillsTrim}
                        className="rounded-lg border border-[#123B6D]/20 bg-white px-3 py-2 text-xs font-bold text-[#123B6D] transition hover:border-[#123B6D]/35 hover:bg-[#E8EEF7]"
                      >
                        Trim skills automatically
                      </button>
                    ) : null}
                    {resumeInsights.experienceCount > 2 ? (
                      <button
                        type="button"
                        onClick={runSmartExperienceCondense}
                        className="rounded-lg border border-[#123B6D]/20 bg-white px-3 py-2 text-xs font-bold text-[#123B6D] transition hover:border-[#123B6D]/35 hover:bg-[#E8EEF7]"
                      >
                        Condense older roles
                      </button>
                    ) : null}
                  </div>

                  {selectedTemplateRecommendation ? (
                    <div className="mt-4 rounded-xl border border-[#B9964A]/30 bg-[#B9964A]/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#9A7628]">
                            Active Template Fit
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#071426]">
                            {selectedTemplateMeta?.name} is ranked #{selectedTemplateRank || '--'} for this resume
                          </div>
                        </div>
                        <div className="rounded-full border border-[#B9964A]/30 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9A7628]">
                          Score {Math.round(selectedTemplateRecommendation.score || 0)}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {selectedTemplateRecommendation.reasons?.slice(0, 3).map((reason) => (
                          <div key={reason} className="rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-xs leading-5 text-[#475569]">
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {mode === 'tailor' && jdText.trim() ? (
                    <div className="mt-4 rounded-xl border border-[#123B6D]/15 bg-[#E8EEF7]/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#123B6D]">
                            JD Summary Focus
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#071426]">
                            Keep the most role-relevant summary sentences
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handlePrioritizeSummaryForJd}
                          className="rounded-lg border border-[#123B6D]/20 bg-white px-3 py-2 text-xs font-bold text-[#123B6D] transition hover:border-[#123B6D]/35 hover:bg-[#F7F8FA]"
                        >
                          Prioritize JD summary
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 overflow-hidden">
                        {splitSummarySentences(resume.personal.summary).map((sentence, index) => {
                          const score = scoreTextAgainstJd(sentence, jdText);
                          const isRelevant = score > 0;

                          return (
                            <span
                              key={`summary-sentence-${index}`}
                              className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                                isRelevant
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                  : 'border-[#E1E7EF] bg-white text-[#475569]'
                              }`}
                            >
                              <span className="max-w-[15rem] truncate">{sentence}</span>
                              {isRelevant ? (
                                <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                                  JD Match
                                </span>
                              ) : null}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-lg border border-[#E1E7EF] bg-white/90 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">
                        Content Fit Audit
                      </div>
                      <div className="text-[10px] font-semibold text-[#64748B]">
                        Target {presentationPlan.targetPages} page{presentationPlan.targetPages === 1 ? '' : 's'}
                      </div>
                    </div>

                      {(resumeInsights.skillsOverflowRisk !== 'low' ||
                        resumeInsights.experienceCount > 2 ||
                        resumeInsights.summaryWords > presentationPlan.summaryTargetWords + 10) ? (
                        <button
                          type="button"
                          onClick={runSmartSafeTrimsAndRewrite}
                          className="mb-3 rounded-lg bg-[#123B6D] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0F3158]"
                        >
                          Fit it + strengthen bullets
                        </button>
                      ) : null}

                      {(resumeInsights.skillsOverflowRisk !== 'low' ||
                        resumeInsights.experienceCount > 2 ||
                        resumeInsights.summaryWords > presentationPlan.summaryTargetWords + 10) ? (
                        <button
                          type="button"
                          onClick={runSmartSafeTrims}
                          className="mb-3 rounded-lg border border-[#123B6D]/20 bg-white px-3 py-2 text-xs font-bold text-[#123B6D] transition hover:border-[#123B6D]/35 hover:bg-[#E8EEF7]"
                        >
                          Apply all safe trims
                        </button>
                      ) : null}

                    {contentFitAudit.length ? (
                      <div className="space-y-2">
                        {contentFitAudit.map((item) => (
                          <div
                            key={item.key}
                            className={`rounded-lg border px-3 py-2.5 ${
                              item.severity === 'warning'
                                ? 'border-amber-200 bg-amber-50'
                                : 'border-[#E1E7EF] bg-[#F7F8FA]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#071426]">
                                  {item.title}
                                </div>
                                <div className="mt-0.5 text-xs leading-5 text-[#475569]">
                                  {item.detail}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => runContentAuditAction(item.actionId)}
                                className="shrink-0 rounded-lg border border-[#123B6D]/20 bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#123B6D] transition hover:border-[#123B6D]/35 hover:bg-[#E8EEF7]"
                              >
                                {item.actionLabel}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                        Current resume content fits this template plan well. You are in a strong export-ready range.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-lg border border-[#E1E7EF] bg-white/90 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">
                        Export Readiness
                      </div>
                      <div
                        className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                          exportReadinessSummary.ready
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {exportReadinessSummary.ready
                          ? exportReadinessSummary.warningCount > 0
                            ? `${exportReadinessSummary.warningCount} warning${exportReadinessSummary.warningCount === 1 ? '' : 's'}`
                            : 'Ready to export'
                          : `${exportReadinessSummary.blockerCount} blocker${exportReadinessSummary.blockerCount === 1 ? '' : 's'}`}
                      </div>
                    </div>

                    {latestReadinessEntry?.createdAt ? (
                      <div className="mb-3 rounded-lg border border-[#E1E7EF] bg-[#F7F8FA] px-3 py-2 text-xs text-[#475569]">
                        Last readiness check saved {new Date(latestReadinessEntry.createdAt).toLocaleString()}.
                        {exportReadinessDelta
                          ? exportReadinessDelta.improved
                            ? ` Improved by ${Math.max(0, exportReadinessDelta.blockerDelta)} blocker${Math.max(0, exportReadinessDelta.blockerDelta) === 1 ? '' : 's'} and ${Math.max(0, exportReadinessDelta.warningDelta)} warning${Math.max(0, exportReadinessDelta.warningDelta) === 1 ? '' : 's'} since the previous check.`
                            : ' No major readiness improvements since the previous check.'
                          : ''}
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      {exportReadinessItems.map((item) => (
                        <div
                          key={item.key}
                          className={`rounded-lg border px-3 py-2.5 ${
                            item.status === 'blocker'
                              ? 'border-rose-200 bg-rose-50'
                              : item.status === 'warning'
                                ? 'border-amber-200 bg-amber-50'
                                : 'border-emerald-200 bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {item.status === 'pass' ? (
                                  <CheckCircle2 size={14} className="text-emerald-700" />
                                ) : (
                                  <AlertTriangle size={14} className={item.status === 'blocker' ? 'text-rose-700' : 'text-amber-700'} />
                                )}
                                <div className="text-xs font-bold text-[#071426]">{item.label}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {presentationPlan.sectionStrategies?.length ? (
                    <div className="mt-4 rounded-lg border border-[#E1E7EF] bg-white/90 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">
                          Section Strategy
                        </div>
                        <div className="text-[10px] font-semibold text-[#64748B]">
                          Keep, trim, or rewrite
                        </div>
                      </div>

                      <div className="space-y-2">
                        {presentationPlan.sectionStrategies.map((item) => (
                          <div
                            key={item.key}
                            className="rounded-lg border border-[#E1E7EF] bg-[#F7F8FA] px-3 py-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="text-xs font-bold text-[#071426]">
                                    {item.label}
                                  </div>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ${
                                      item.action === 'trim'
                                        ? 'bg-amber-100 text-amber-800'
                                        : item.action === 'rewrite'
                                          ? 'bg-[#E8EEF7] text-[#123B6D]'
                                          : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {item.action}
                                  </span>
                                </div>
                                <div className="mt-0.5 text-xs leading-5 text-[#475569]">
                                  {item.reason}
                                </div>
                              </div>
                              {item.actionId ? (
                                <button
                                  type="button"
                                  onClick={() => runContentAuditAction(item.actionId)}
                                  className="shrink-0 rounded-lg border border-[#123B6D]/20 bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#123B6D] transition hover:border-[#123B6D]/35 hover:bg-[#E8EEF7]"
                                >
                                  {item.actionLabel || 'Open'}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {smartActionMessage ? (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                      {smartActionMessage}
                    </div>
                  ) : null}
                </div>
                ) : null}
              </div>

              {activeSection === 'document' && (
                <div className="space-y-4">
                  <div className="border-b border-[#D8E2EC] pb-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#123B6D]">
                    Typography & Spacing
                  </div>
                  <div>
                    <SelectControl
                      label="Font Family"
                      value={resume.documentSettings?.fontFamily || 'inter'}
                      onChange={(value) => handleDocumentSettingChange('fontFamily', value)}
                      options={FONT_OPTIONS}
                    />
                    <SpacingControl
                      label="Section Spacing"
                      value={resume.documentSettings?.sectionSpacing || 28}
                      min={12}
                      max={56}
                      step={4}
                      onChange={(value) => handleDocumentSettingChange('sectionSpacing', value)}
                      leftLabel="Compact"
                      rightLabel="Airy"
                    />
                    <SpacingControl
                      label="Font Size"
                      value={Math.round((resume.documentSettings?.fontScale || 1) * 100)}
                      min={50}
                      max={200}
                      step={5}
                      suffix="%"
                      displayValue={`${Math.round((resume.documentSettings?.fontScale || 1) * 100)}%`}
                      onChange={(value) => handleDocumentSettingChange('fontScale', Number((value / 100).toFixed(2)))}
                      leftLabel="Small"
                      rightLabel="Large"
                    />
                    <SpacingControl
                      label="Line Height"
                      value={Math.round((resume.documentSettings?.lineHeight || 1.5) * 100)}
                      min={100}
                      max={200}
                      step={5}
                      suffix="%"
                      displayValue={`${(resume.documentSettings?.lineHeight || 1.5).toFixed(2)}`}
                      onChange={(value) => handleDocumentSettingChange('lineHeight', Number((value / 100).toFixed(2)))}
                      leftLabel="Dense"
                      rightLabel="Spacious"
                    />
                  </div>
                </div>
              )}

              {/* --- TARGET JOB DESCRIPTION AREA --- */}
              {activeSection === 'target-jd' && (
                  <div className="space-y-4">
                    <ResumeScorePanel
                      score={resumeInsights.resumeScore}
                      label={resumeInsights.resumeScoreLabel}
                      breakdown={resumeInsights.resumeScoreBreakdown}
                      tip={resumeInsights.resumeScoreTip}
                    />
                    {mode === 'tailor' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleATSClick}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#B9964A]/30 bg-[#B9964A]/10 px-3 py-2.5 text-xs font-bold text-[#9A7628] transition-all hover:bg-[#B9964A]/15"
                        >
                          <ScanLine size={14} />
                          ATS Scan
                        </button>
                        <button
                          onClick={handleInterviewClick}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#B9964A]/30 bg-[#B9964A]/10 px-3 py-2.5 text-xs font-bold text-[#9A7628] transition-all hover:bg-[#B9964A]/15"
                        >
                          <MessageSquare size={14} />
                          Interview
                        </button>
                      </div>
                    ) : null}
                    <div className="mb-4">
                      <label className="mb-1.5 block text-[0.78rem] font-semibold text-[#475569]">Job Description</label>
                      <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste full job description here..."
                        className="h-[360px] w-full resize-none rounded-lg border border-[#E1E7EF] bg-white px-3.5 py-2.5 text-[0.9rem] font-medium outline-none transition-all custom-scrollbar focus:border-[#B9964A] focus:ring-4 focus:ring-[#B9964A]/10"
                      />
                    </div>
                  </div>
              )}

              {/* --- LIVE TEMPLATE PREVIEW PICKER --- */}
              {activeSection === 'templates' && (
                  <div data-help-tour="template-picker" className="space-y-3">
                      <div className="flex items-center gap-3 border-b border-[#E1E7EF] pb-3">
                        <div className="shrink-0 text-[0.78rem] font-black uppercase tracking-[0.18em] text-[#64748B]">
                          Templates
                        </div>
                        <div className="relative min-w-0 flex-1">
                          <Search
                            size={14}
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                          />
                          <input
                            type="search"
                            aria-label="Search templates"
                            value={templateSearchQuery}
                            onChange={(event) => setTemplateSearchQuery(event.target.value)}
                            placeholder="Search"
                            autoComplete="off"
                            className="h-9 w-full rounded-lg border border-[#D7DEE8] bg-white pl-9 pr-8 text-xs font-semibold text-[#172033] outline-none transition-colors placeholder:font-medium placeholder:text-[#94A3B8] focus:border-[#B9964A] focus:ring-2 focus:ring-[#B9964A]/15"
                          />
                          {templateSearchQuery ? (
                            <button
                              type="button"
                              onClick={() => setTemplateSearchQuery('')}
                              aria-label="Clear template search"
                              className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#64748B] transition-colors hover:bg-[#EEF2F7] hover:text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B9964A]/40"
                            >
                              <X size={13} aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {filteredEditorTemplateList.map(tpl => (
                          <div
                              key={tpl.id}
                              onClick={() => onChangeTemplate(tpl.id)}
                              className={`
                                  group relative cursor-pointer overflow-hidden rounded-[0.9rem] border bg-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(7,20,38,0.10)]
                                  ${selectedTemplate === tpl.id ? 'border-[#123B6D] ring-2 ring-[#B9964A]/25 shadow-[0_8px_22px_rgba(7,20,38,0.09)]' : 'border-[#D9E2EB] hover:border-[#C49A43]/60'}
                              `}
                          >
                              <div className="h-40 w-full bg-[#EEF2F7] overflow-hidden relative">
                                  <div className="absolute top-0 left-0 w-[400%] h-[400%] transform scale-[0.25] origin-top-left pointer-events-none select-none bg-white">
                                      <ResumeThumbnail templateId={tpl.id} data={editorTemplatePreviewData.get(tpl.id)} />
                                  </div>
                                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors"></div>
                              </div>

	                              <div className="p-3 bg-white border-t border-[#E1E7EF]">
	                                  <div className="flex items-center justify-between gap-2">
	                                    <span className="text-xs font-bold text-[#475569] block truncate">{tpl.name}</span>
                                    {selectedTemplateRank && tpl.id === selectedTemplate && (
                                      <span className="rounded-full bg-[#B9964A]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#9A7628]">
                                        Active
	                                      </span>
	                                    )}
	                                  </div>
	                              </div>
                          </div>
                      ))}
                      </div>
                      {filteredEditorTemplateList.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-8 text-center">
                          <div className="text-sm font-bold text-[#334155]">No templates found</div>
                          <div className="mt-1 text-xs text-[#64748B]">Try another template name.</div>
                        </div>
                      ) : null}
                  </div>
              )}

              {/* PERSONAL */}
              {activeSection === 'personal' && (
                <div className="space-y-3">
                   <div className="border-b border-[#E1E7EF] pb-3">
                      <div className="mb-2.5 flex items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-[0.78rem] font-black uppercase tracking-[0.16em] text-[#64748B]">
                          <Camera size={14} />
                          Profile Picture
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E1E7EF] bg-white px-3 py-2 text-xs font-bold text-[#475569] shadow-sm transition-all hover:bg-[#F7F8FA]">
                          Upload <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-[#EEF2F7] overflow-hidden border border-[#E1E7EF] flex items-center justify-center relative group">
                              {resume.personal.photo ? <img src={resume.personal.photo} alt="Profile" className="w-full h-full object-cover" /> : <User className="text-[#64748B]" />}
                          </div>
                      </div>
                  </div>
                  <div className="border-b border-[#D8E2EC] pb-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#123B6D]">
                    Personal Variables
                  </div>
                  <Input label="Full Name" value={resume.personal.name} onChange={(v) => handlePersonalChange('name', v)} />
                  <Input label="Job Title" value={resume.personal.title} onChange={(v) => handlePersonalChange('title', v)} />
                  <Input label="Email" value={resume.personal.email} onChange={(v) => handlePersonalChange('email', v)} />
                  <Input label="Phone" value={resume.personal.phone} onChange={(v) => handlePersonalChange('phone', v)} />
                  <Input label="LinkedIn" value={resume.personal.linkedin} onChange={(v) => handlePersonalChange('linkedin', v)} />
                  <Input label="GitHub" value={resume.personal.github} onChange={(v) => handlePersonalChange('github', v)} />
                  <Input label="Portfolio" value={resume.personal.portfolio} onChange={(v) => handlePersonalChange('portfolio', v)} />
                  <Input label="Website" value={resume.personal.website} onChange={(v) => handlePersonalChange('website', v)} />
                  <Input label="Location" value={resume.personal.location} onChange={(v) => handlePersonalChange('location', v)} />
                  <AIEnhanceableTextArea
                    label="Professional Summary"
                    value={resume.personal.summary}
                    onChange={(v) => handlePersonalChange('summary', v)}
                    formattingEnabled
                    formattingDefault={LIST_MODES.PLAIN}
                    placeholder="Write a paragraph or use separate lines if you prefer."
                    onEnhanceClick={() => openAIModal(
                      resume.personal.summary,
                      "Professional Summary",
                      (newText) => handlePersonalChange('summary', newText),
                      {
                        focusLabel: 'Summary upgrade',
                        focusReason: mode === 'tailor' && jdText.trim()
                          ? 'Tighten the summary so it reads stronger in the first 10 seconds and aligns more naturally with the target job.'
                          : 'Tighten the summary so it feels more specialized, credible, and recruiter-ready in the first 10 seconds.',
                      }
                    )}
                  />
                  {SHOW_SECTION_LAYOUT_SPACING ? (
                  <div className="rounded-xl border border-[#B9964A]/30 bg-[#B9964A]/10 p-4">
                    <div className="mb-3 text-xs font-black uppercase tracking-widest text-[#9A7628]">Layout Space</div>
                    <SpacingControl
                      label="Empty Space After Personal Details"
                      value={resume.layoutSpacing?.personal || 0}
                      onChange={(value) => handleLayoutSpacingChange('personal', value)}
                    />
                  </div>
                  ) : null}
                </div>
              )}

              {/* SKILLS */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <div className="border-b border-[#D8E2EC] pb-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#123B6D]">
                    Skills
                  </div>
                  <div className="rounded-xl border border-[#B9964A]/30 bg-[#B9964A]/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#9A7628]">
                          Skill Curation
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#071426]">
                          Remove individual skills or keep the recommended ones
                        </div>
                      </div>
                      <div className="rounded-full border border-[#B9964A]/30 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9A7628]">
                        {resumeInsights.totalSkillCount} total
                      </div>
                    </div>
                    <div className="mt-3 text-xs leading-5 text-[#475569]">
                      {mode === 'tailor' && jdText.trim()
                        ? 'Highlighted skills are the strongest matches against the current job description.'
                        : 'Highlighted skills are inside the current recommended set for a cleaner resume.'}
                    </div>
                  </div>
                  <SkillAutocompleteTextArea
                    label="Technical Skills"
                    value={skillInputDrafts.technical}
                    onChange={(v) => handleSkillsChange('technical', v)}
                    selectedSkills={resume.skills.technical}
                    placeholder="Type skills separated by commas"
                  />
                  {resume.skills.technical.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.technical.map((skill) => {
                        const isRecommended = recommendedSkillLookup.has(skill.toLowerCase());

                        return (
                          <span
                            key={`technical-${skill}`}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              isRecommended
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-[#E1E7EF] bg-white text-[#475569]'
                            }`}
                          >
                            <span>{skill}</span>
                            {isRecommended ? (
                              <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                                {mode === 'tailor' && jdText.trim() ? 'JD Match' : 'Keep'}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill('technical', skill)}
                              className="rounded-full p-0.5 text-current transition hover:bg-black/5"
                              aria-label={`Remove ${skill}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                  <SkillAutocompleteTextArea
                    label="Core / Soft Skills"
                    value={skillInputDrafts.core}
                    onChange={(v) => handleSkillsChange('core', v)}
                    selectedSkills={resume.skills.core}
                    placeholder="Type skills separated by commas"
                  />
                  {resume.skills.core.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.core.map((skill) => {
                        const isRecommended = recommendedSkillLookup.has(skill.toLowerCase());

                        return (
                          <span
                            key={`core-${skill}`}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              isRecommended
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-[#E1E7EF] bg-white text-[#475569]'
                            }`}
                          >
                            <span>{skill}</span>
                            {isRecommended ? (
                              <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                                {mode === 'tailor' && jdText.trim() ? 'JD Match' : 'Keep'}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill('core', skill)}
                              className="rounded-full p-0.5 text-current transition hover:bg-black/5"
                              aria-label={`Remove ${skill}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}

              {/* LISTS */}
              {['experience', 'education', 'projects', 'languages', 'certifications', 'awards'].includes(activeSection) && (
                <div className="space-y-4">
                  <div className="border-b border-[#D8E2EC] pb-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#123B6D]">
                    {SECTION_SELECT_LABELS[activeSection] || activeSection}
                  </div>
                  {resume[activeSection].map((item) => (
                    <div key={item.id} className="relative overflow-hidden rounded-[0.9rem] border border-[#D7E1EA] bg-white p-4 shadow-[0_4px_14px_rgba(7,20,38,0.045)] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:bg-[linear-gradient(180deg,#123B6D_0%,#B9964A_100%)]">
                      <button onClick={() => removeListItem(activeSection, item.id)} className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${SECTION_SELECT_LABELS[activeSection] || activeSection} item`}><Trash2 size={16}/></button>

                      {activeSection === 'experience' && (
                        <>
                          <div className="mb-3 flex flex-wrap items-center gap-2 pr-8">
                            <span className="rounded-full border border-[#D8E2EC] bg-[#F3F6F9] px-2.5 py-1 text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-[#64748B]">
                              {splitResumeLines(item.desc).length} lines
                            </span>
                            {mode === 'tailor' && jdText.trim() ? (
                              <button
                                type="button"
                                onClick={() => handlePrioritizeExperienceForJd(item.id)}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 transition hover:bg-emerald-100"
                              >
                                Keep top JD bullets
                              </button>
                            ) : null}
                            {splitResumeLines(item.desc).length > 2 ? (
                              <button
                                type="button"
                                onClick={() => handleCondenseExperienceRole(item.id)}
                                className="rounded-full border border-[#123B6D]/20 bg-[#E8EEF7] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#123B6D] transition hover:border-[#123B6D]/35 hover:bg-[#DDE7F5]"
                              >
                                Condense this role
                              </button>
                            ) : null}
                            {item.fullDescBackup ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreExperienceRole(item.id)}
                                className="rounded-full border border-[#B9964A]/30 bg-[#B9964A]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A7628] transition hover:bg-[#B9964A]/15"
                              >
                                Restore full text
                              </button>
                            ) : null}
                          </div>
                          <Input label="Role" value={item.role} onChange={(v) => updateListItem('experience', item.id, 'role', v)} />
                          <Input label="Company" value={item.company} onChange={(v) => updateListItem('experience', item.id, 'company', v)} />
                          <Input label="Location" value={item.location} onChange={(v) => updateListItem('experience', item.id, 'location', v)} />
                          <Input label="Employment Type" value={item.employmentType} onChange={(v) => updateListItem('experience', item.id, 'employmentType', v)} />
                          <Input label="Date" value={item.date} onChange={(v) => updateListItem('experience', item.id, 'date', v)} />
                          <AIEnhanceableTextArea
                            label="Description"
                            value={item.desc}
                            onChange={(v) => updateListItem('experience', item.id, 'desc', v)}
                            formattingEnabled
                            formattingDefault={LIST_MODES.BULLET}
                            placeholder="Add achievements as bullets, numbers, or plain lines."
                            onEnhanceClick={() => openAIModal(
                              item.desc,
                              "Work Experience Bullet Points",
                              (newText) => updateListItem('experience', item.id, 'desc', newText),
                              {
                                focusLabel: item.role || 'Experience rewrite',
                                focusReason: mode === 'tailor' && jdText.trim()
                                  ? `Strengthen ${item.role || 'this role'} so the bullets sound more achievement-driven and better aligned to the target role without adding unsupported claims.`
                                  : `Strengthen ${item.role || 'this role'} so the bullets sound more achievement-driven, specific, and recruiter-worthy.`,
                              }
                            )}
                          />
                          {mode === 'tailor' && jdText.trim() ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {splitResumeLines(item.desc).map((line, index) => {
                                const score = scoreTextAgainstJd(line, jdText);
                                const isRelevant = score > 0;

                                return (
                                  <span
                                    key={`exp-line-${item.id}-${index}`}
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                                      isRelevant
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                        : 'border-[#E1E7EF] bg-white text-[#475569]'
                                    }`}
                                  >
                                    <span className="max-w-[22rem] truncate">{line}</span>
                                    {isRelevant ? (
                                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                                        JD Match
                                      </span>
                                    ) : null}
                                  </span>
                                );
                              })}
                            </div>
                          ) : null}
                        </>
                      )}

                      {activeSection === 'education' && (<><Input label="School" value={item.school} onChange={(v) => updateListItem('education', item.id, 'school', v)} /><Input label="Degree" value={item.degree} onChange={(v) => updateListItem('education', item.id, 'degree', v)} /><Input label="Specialization" value={item.specialization} onChange={(v) => updateListItem('education', item.id, 'specialization', v)} /><Input label="Grade / GPA / Percentage" value={item.grade} onChange={(v) => updateListItem('education', item.id, 'grade', v)} /><Input label="Date" value={item.date} onChange={(v) => updateListItem('education', item.id, 'date', v)} /></>)}

                      {activeSection === 'projects' && (
                        <>
                          <Input label="Project Name" value={item.name} onChange={(v) => updateListItem('projects', item.id, 'name', v)} />
                          <Input label="Project Link" value={item.url} onChange={(v) => updateListItem('projects', item.id, 'url', v)} />
                          <Input label="Repository Link" value={item.repositoryUrl} onChange={(v) => updateListItem('projects', item.id, 'repositoryUrl', v)} />
                          <AIEnhanceableTextArea
                            label="Project Description"
                            value={item.desc}
                            onChange={(v) => updateListItem('projects', item.id, 'desc', v)}
                            formattingEnabled
                            formattingDefault={LIST_MODES.PLAIN}
                            placeholder="Describe the project in a paragraph or switch to bullets or numbers."
                            onEnhanceClick={() => openAIModal(
                              item.desc,
                              "Project Details",
                              (newText) => updateListItem('projects', item.id, 'desc', newText),
                              {
                                focusLabel: item.name || 'Project upgrade',
                                focusReason: 'Clarify the project scope, tools, and impact without turning it into a generic feature list.',
                              }
                            )}
                          />
                        </>
                      )}

                      {activeSection === 'awards' && (<><Input label="Award Name" value={item.name} onChange={(v) => updateListItem('awards', item.id, 'name', v)} /><Input label="Issuer" value={item.issuer} onChange={(v) => updateListItem('awards', item.id, 'issuer', v)} /><Input label="Date" value={item.date} onChange={(v) => updateListItem('awards', item.id, 'date', v)} /></>)}
                      {activeSection === 'certifications' && (<><Input label="Certificate Name" value={item.name} onChange={(v) => updateListItem('certifications', item.id, 'name', v)} /><Input label="Issuer" value={item.issuer} onChange={(v) => updateListItem('certifications', item.id, 'issuer', v)} /><Input label="Issue Date" value={item.date} onChange={(v) => updateListItem('certifications', item.id, 'date', v)} /><Input label="Expiry Date" value={item.expiryDate} onChange={(v) => updateListItem('certifications', item.id, 'expiryDate', v)} /><Input label="Credential ID" value={item.credentialId} onChange={(v) => updateListItem('certifications', item.id, 'credentialId', v)} /><Input label="Credential URL" value={item.credentialUrl} onChange={(v) => updateListItem('certifications', item.id, 'credentialUrl', v)} /></>)}
                      {activeSection === 'languages' && (<div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Language" value={item.name} onChange={(v) => updateListItem('languages', item.id, 'name', v)} /><Input label="Level" value={item.level} onChange={(v) => updateListItem('languages', item.id, 'level', v)} /></div>)}
                    </div>
                  ))}
                  {SHOW_SECTION_LAYOUT_SPACING && activeSection === 'experience' && (
	                    <div className="rounded-xl border border-[#B9964A]/30 bg-[#B9964A]/10 p-4">
	                      <div className="mb-3 text-xs font-black uppercase tracking-widest text-[#9A7628]">Layout Space</div>
                      <SpacingControl
                        label="Empty Space Before Experience"
                        value={resume.layoutSpacing?.experience || 0}
                        onChange={(value) => handleLayoutSpacingChange('experience', value)}
                      />
                    </div>
                  )}
                  {SHOW_SECTION_LAYOUT_SPACING && activeSection === 'education' && (
	                    <div className="rounded-xl border border-[#B9964A]/30 bg-[#B9964A]/10 p-4">
	                      <div className="mb-3 text-xs font-black uppercase tracking-widest text-[#9A7628]">Layout Space</div>
                      <SpacingControl
                        label="Empty Space Before Education"
                        value={resume.layoutSpacing?.education || 0}
                        onChange={(value) => handleLayoutSpacingChange('education', value)}
                      />
                    </div>
                  )}
                  <button onClick={() => addListItem(activeSection)} className="min-h-11 w-full rounded-[0.8rem] border border-dashed border-[#AEBECD] bg-[#F9FBFC] py-2.5 text-[13px] font-bold text-[#52677F] transition-all hover:border-[#C49A43] hover:bg-[#FFF9EC] hover:text-[#8D651F]">+ Add Item</button>
                </div>
              )}

             </div>
          ) : (
            <div className="mx-auto flex h-full w-full max-w-[92px] lg:max-w-none">
              <div className="flex w-full items-center justify-between gap-4 rounded-[1.1rem] border border-[#173A62] bg-[#071426] px-4 py-3 shadow-[0_10px_28px_rgba(7,20,38,0.16)] lg:flex-col lg:justify-start lg:gap-4 lg:px-3 lg:py-5">
                <WorkspaceIconButton
                  icon={PanelLeftOpen}
                  label="Open editor"
                  onClick={() => setIsFormOpen(true)}
                  className="shrink-0"
                />
                <div className="min-w-0 lg:text-center">
                  <div className="text-[9px] font-black uppercase tracking-[0.24em] text-[#D6B25E]">Editor</div>
                  <div className="mt-1 text-sm font-bold text-white/75 lg:hidden">Open editing panel</div>
                  <div className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 lg:block [writing-mode:vertical-rl] [text-orientation:mixed]">
                    Open panel
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isMobileLayout && isFormOpen ? (
            <button
              type="button"
              aria-label="Resize editor panel"
              title="Drag to resize editor"
              onPointerDown={handleEditorPanelResizeStart}
              className={`absolute right-0 top-0 z-40 flex h-full w-2 cursor-col-resize items-center justify-center transition-colors hover:bg-[#B9964A]/10 ${
                isEditorPanelResizing ? 'bg-[#B9964A]/15' : 'bg-transparent'
              }`}
            >
              <span
                className={`h-14 w-[3px] rounded-full transition-colors ${
                  isEditorPanelResizing ? 'bg-[#B9964A]' : 'bg-[#CBD5E1]'
                }`}
              />
            </button>
          ) : null}
        </div>

	        {/* PREVIEW AREA */}
	        <div ref={previewViewportRef} style={{ overflowAnchor: 'none' }} className={`relative z-0 min-h-0 overflow-y-auto overscroll-y-contain custom-scrollbar bg-[linear-gradient(rgba(18,59,109,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.035)_1px,transparent_1px),radial-gradient(circle_at_82%_0%,rgba(18,59,109,0.13),transparent_34%),radial-gradient(circle_at_12%_10%,rgba(185,150,74,0.09),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#F1F5F9_52%,#EEF3F8_100%)] bg-[size:32px_32px,32px_32px,auto,auto,auto] ${isMobileLayout ? (mobileWorkspaceView === 'preview' ? 'flex flex-1 w-full overflow-x-auto items-start' : 'hidden') : 'flex flex-1 flex-col justify-start'}`}>
	            <div className="flex flex-col items-center w-full">
                <div className="sticky top-0 z-40 w-full border-b border-[#D7E1EA] bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(15,43,75,0.08)] backdrop-blur-xl sm:px-5 lg:px-6">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#A87922]">Live Resume Canvas</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-[12px] font-extrabold text-[#173A62]">
                          {selectedTemplateMeta?.name || 'Resume'}
                        </p>
                        <span className="text-[#A9B7C5]">•</span>
                        <span className="text-[10px] font-semibold text-[#71849A]">
                          {previewPages.length} page{previewPages.length === 1 ? '' : 's'}
                        </span>
                        <span className="text-[#A9B7C5]">•</span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#71849A]">
                          <span className={`h-1.5 w-1.5 rounded-full ${autosaveState === 'saving' ? 'animate-pulse bg-[#D6B25E]' : autosaveState === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                          {autosaveState === 'saving' ? 'Saving changes' : autosaveState === 'error' ? 'Save failed' : 'All changes saved'}
                        </span>
                      </div>
                    </div>
                    <div data-help-tour="preview-actions" className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
                      {mode === 'tailor' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleATSClick}
                            className="inline-flex h-9 items-center gap-2 rounded-[0.65rem] border border-[#D8B45E]/45 bg-[#FFF9EC] px-3 text-[11px] font-bold text-[#8D651F] transition-all hover:-translate-y-0.5 hover:border-[#C69A3D] hover:bg-[#FFF3D5]"
                            title="Scan resume against Job Description"
                          >
                            <ScanLine size={14} />
                            ATS
                          </button>
                          <button
                            type="button"
                            onClick={handleInterviewClick}
                            className="inline-flex h-9 items-center gap-2 rounded-[0.65rem] border border-[#D8B45E]/45 bg-[#FFF9EC] px-3 text-[11px] font-bold text-[#8D651F] transition-all hover:-translate-y-0.5 hover:border-[#C69A3D] hover:bg-[#FFF3D5]"
                            title="Generate Interview Questions"
                          >
                            <MessageSquare size={14} />
                            Interview
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleOpenPreview}
                        className="inline-flex h-9 items-center gap-2 rounded-[0.65rem] border border-[#CAD6E1] bg-[#F8FAFC] px-3 text-[11px] font-bold text-[#425A73] transition-all hover:-translate-y-0.5 hover:border-[#9EB0C1] hover:bg-white hover:text-[#173A62]"
                        title="Open print preview"
                      >
                        <Eye size={14} />
                        Print Preview
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isCheckingPass}
                        className="inline-flex h-9 items-center gap-2 rounded-[0.65rem] border border-[#B88A31] bg-[linear-gradient(180deg,#E4C46E_0%,#C89F47_100%)] px-3 text-[11px] font-extrabold text-[#10243E] shadow-[0_5px_14px_rgba(185,150,74,0.18)] transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
                        title="Export resume as PDF"
                      >
                        {isCheckingPass ? (
                          <Loader2 size={14} className="animate-spin text-[#10243E]" />
                        ) : (
                          <Download size={14} />
                        )}
                        {isCheckingPass ? 'Preparing...' : 'Export PDF'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveResume}
                        className="inline-flex h-9 items-center gap-2 rounded-[0.65rem] border border-[#CAD6E1] bg-white px-3 text-[11px] font-bold text-[#536A82] shadow-[0_2px_6px_rgba(15,43,75,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#9EB0C1] hover:bg-[#F8FAFC] hover:text-[#173A62]"
                        title="Save resume"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <div data-help-tour="canvas-tools" className="flex flex-wrap items-center gap-2">
                        <WorkspaceIconButton
                          icon={PencilLine}
                          label={isPreviewEditMode ? 'Turn off live edit' : 'Turn on live edit'}
                          onClick={togglePreviewEditMode}
                          active={isPreviewEditMode}
                        />
                        <WorkspaceIconButton
                          icon={ZoomOut}
                          label="Zoom out"
                          onClick={() => adjustPreviewZoom('out')}
                          disabled={previewZoomLevel <= 0.75}
                        />
                        <WorkspaceIconButton
                          icon={Maximize2}
                          label="Fit canvas"
                          onClick={resetPreviewZoom}
                          active={previewZoomLevel === 1}
                        />
                        <WorkspaceIconButton
                          icon={ZoomIn}
                          label="Zoom in"
                          onClick={() => adjustPreviewZoom('in')}
                          disabled={previewZoomLevel >= 1.45}
                        />
                      </div>
                    </div>
                  </div>
                  <CanvasTypographyControls
                    settings={resume.documentSettings}
                    onChange={handleDocumentSettingChange}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,150,74,0.28),transparent)]" />
                </div>
                {isPreviewEditMode && activePreviewField && (
                  <div className="mb-2 mt-4 w-full max-w-[820px] rounded-[1rem] border border-[#D7E1EA] bg-white/96 p-4 shadow-[0_14px_36px_rgba(15,43,75,0.12)] backdrop-blur-xl">
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.24em] text-[#B1852E]">Live Edit</div>
                        <div className="mt-0.5 text-sm font-bold text-[#173A62]">{activePreviewField.label}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePreviewField(null)}
                        className="rounded-lg border border-[#D7E1EA] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#60758B] transition-colors hover:border-[#C49A43]/50 hover:bg-[#FFF9EC] hover:text-[#173A62]"
                      >
                        Close
                      </button>
                    </div>
                    {activePreviewField.multiline ? (
                      <textarea
                        value={typeof activePreviewFieldValue === 'string' ? activePreviewFieldValue : ''}
                        onChange={(event) => handlePreviewFieldChange(event.target.value)}
                        className="h-28 w-full resize-none rounded-xl border border-[#E1E7EF] bg-[#F7F8FA] px-4 py-3 text-sm font-medium text-[#071426] outline-none transition-all focus:border-[#B9964A] focus:bg-white focus:ring-4 focus:ring-[#B9964A]/10"
                      />
                    ) : (
                      <input
                        value={typeof activePreviewFieldValue === 'string' ? activePreviewFieldValue : ''}
                        onChange={(event) => handlePreviewFieldChange(event.target.value)}
                        className="w-full rounded-xl border border-[#E1E7EF] bg-[#F7F8FA] px-4 py-3 text-sm font-medium text-[#071426] outline-none transition-all focus:border-[#B9964A] focus:bg-white focus:ring-4 focus:ring-[#B9964A]/10"
                      />
                    )}
                  </div>
                )}
		            <div
                ref={previewStageRef}
                className={`relative origin-top transition-all duration-300 px-4 py-8 sm:px-5 lg:px-10 lg:py-10 ${isPreviewEditMode ? 'preview-edit-mode' : ''}`}
                style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center' }}
              >
		                <div
		                    ref={previewRef}
		                    className="relative h-auto min-h-[297mm] w-[210mm] overflow-visible bg-white shadow-[0_24px_64px_rgba(15,43,75,0.18),0_0_0_1px_rgba(15,43,75,0.07)] transition-all duration-300"
		                    onClick={isPreviewEditMode ? handlePreviewEditableClick : undefined}
		                >
		                    <ResumePreview data={resume} template={selectedTemplate} />
		                </div>
	              </div>
	            </div>
	        </div>

      </div>

      <div ref={exportPreviewRef} className="pointer-events-none fixed -left-[10000px] top-0 z-[-1] w-[210mm]">
        <ResumePreview data={resume} template={selectedTemplate} />
      </div>

      <DownloadGateModal
        isOpen={isDownloadGateOpen}
        onClose={() => setIsDownloadGateOpen(false)}
        clerkUser={user}
        resourceType="resume_pdf"
        resourceId={persistedResumeIdRef.current || 'active_resume'}
        resourceName={`${(resume?.personal?.name || 'Resume').trim() || 'Resume'} PDF`}
        onSuccessDownload={() => {
          setIsDownloadGateOpen(false);
          if (pendingDownloadFnRef.current) {
            pendingDownloadFnRef.current();
            pendingDownloadFnRef.current = null;
          }
        }}
      />
    </div>
  );
};

export default Editor;

