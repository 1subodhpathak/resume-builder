import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  CheckCircle2,
  Layout,
  Image,
  Palette,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import ResumeThumbnail from "../resume/ResumeThumbnail";
import poojaImage from '../../assets/Pooja.png';
import { getResumeInsights, getTemplateRecommendations } from '../../utils/resumeInsights';
import BuilderNavbar from './BuilderNavbar';
import { TEMPLATES } from '../../data/templateCatalog';

// --- DUMMY DATA FOR PREVIEWS ---
const DUMMY_DATA = {
  personal: {
    name: "POOJA BANSAL",
    title: "SENIOR DATA ANALYST",
    email: "p.bansal@datasense.com",
    phone: "+91 98765 43210",
    location: "Gurgaon, India",
    photo: poojaImage,
    summary: "Strategic and detail-oriented Data Analyst with 8+ years of experience transforming raw data into actionable business insights. Proven track record in optimizing operational efficiency by 40% and driving revenue growth through predictive modeling. Expert in Python, SQL, and Tableau with strong leadership skills in mentoring junior analysts and collaborating with C-suite stakeholders."
  },
  experience: [
    {
      id: 1,
      role: "Lead Data Analyst",
      company: "TechCorp Solutions",
      date: "2020 - Present",
      desc: "• Spearheaded a team of 5 analysts to develop automated dashboards, reducing reporting time by 30%.\n• Led the migration of legacy data systems to AWS Redshift, improving query performance by 50%.\n• Collaborated with product teams to define KPIs and track feature adoption, directly influencing the Q3 product roadmap.\n• Conducted deep-dive analysis on customer churn, identifying key friction points that led to a 15% retention increase.",
      pageBreak: false
    },
    {
      id: 2,
      role: "Senior Data Analyst",
      company: "DataFlow Inc.",
      date: "2017 - 2020",
      desc: "• Built predictive models using Python (Scikit-learn) to forecast quarterly sales with 95% accuracy.\n• Designed and maintained ETL pipelines using SQL and Python, ensuring 99.9% data availability for daily operations.\n• Visualized complex datasets in Tableau to communicate trends to non-technical stakeholders, resulting in a $200k marketing budget reallocation.",
      pageBreak: false
    },
    {
      id: 3,
      role: "Junior Analyst",
      company: "Innovate Analytics",
      date: "2015 - 2017",
      desc: "• Assisted in the cleaning and preprocessing of large datasets for machine learning models.\n• Automating weekly Excel reports using VBA macros, saving 10+ hours of manual work per week.",
      pageBreak: false
    }
  ],
  education: [
    {
      id: 1,
      degree: "M.S. in Statistics",
      school: "Columbia University",
      date: "2017",
      pageBreak: false
    },
    {
      id: 2,
      degree: "B.S. in Computer Science",
      school: "Indian Institute of Technology, Delhi",
      date: "2015",
      pageBreak: false
    }
  ],
  skills: {
    core: ["Data Strategy", "Predictive Modeling", "A/B Testing", "ETL Pipelines", "Stakeholder Management"],
    technical: ["Python (Pandas, NumPy)", "SQL (PostgreSQL)", "Tableau", "PowerBI", "AWS Redshift", "Git/Jira"],
    soft: ["Leadership", "Strategic Thinking", "Communication", "Problem Solving", "Mentoring"]
  },
  projects: [
    {
      id: 1,
      name: "Customer Churn Predictor",
      desc: "Developed a Random Forest machine learning model to identify high-risk customers. The model was integrated into the CRM, allowing the support team to proactively retain 12% of at-risk accounts.",
      pageBreak: false
    },
    {
      id: 2,
      name: "Market Basket Analysis",
      desc: "Implemented association rule mining algorithms on retail transaction data to optimize product placement, boosting cross-sell revenue by $150k in the first quarter.",
      pageBreak: false
    }
  ],
  awards: [
    { id: 1, name: "Employee of the Year", issuer: "TechCorp Global", pageBreak: false },
    { id: 2, name: "Best Innovation Award", issuer: "DataFlow Inc. Hackathon", pageBreak: false }
  ],
  certifications: [
    { id: 1, name: "Google Data Analytics Professional", issuer: "Coursera", date: "2022", pageBreak: false },
    { id: 2, name: "AWS Certified Data Analytics - Specialty", issuer: "Amazon Web Services", date: "2020", pageBreak: false }
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Hindi", level: "Native" },
    { name: "Spanish", level: "Intermediate" }
  ],
  volunteering: [
    {
      id: 1,
      role: "Data Science Mentor",
      org: "Girls Who Code",
      date: "2019 - Present",
      desc: "Mentoring high school students in Python basics and data visualization concepts.",
      pageBreak: false
    }
  ]
};

// --- EXTENSIVE TEMPLATE LIST ---
const COLOR_OPTIONS = [
  { id: 'black', label: 'Black', swatch: '#111827' },
  { id: 'navy', label: 'Navy', swatch: '#0B1F3A' },
  { id: 'blue', label: 'Blue', swatch: '#2563EB' },
  { id: 'slate', label: 'Slate', swatch: '#475569' },
  { id: 'teal', label: 'Teal', swatch: '#0D9488' },
  { id: 'gold', label: 'Gold', swatch: '#B9964A' },
  { id: 'orange', label: 'Orange', swatch: '#EA580C' },
  { id: 'green', label: 'Green or teal', swatch: '#047857' },
  { id: 'red', label: 'Red', swatch: '#B91C1C' },
  { id: 'purple', label: 'Purple', swatch: '#7C3AED' },
];

const hexToHsl = (hexColor) => {
  const normalized = String(hexColor || '').replace('#', '').trim();
  const expanded = normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) return null;

  const red = parseInt(expanded.slice(0, 2), 16) / 255;
  const green = parseInt(expanded.slice(2, 4), 16) / 255;
  const blue = parseInt(expanded.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return { hue: 0, saturation: 0, lightness };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;

  if (max === red) hue = 60 * (((green - blue) / delta) % 6);
  else if (max === green) hue = 60 * ((blue - red) / delta + 2);
  else hue = 60 * ((red - green) / delta + 4);

  return { hue: hue < 0 ? hue + 360 : hue, saturation, lightness };
};

const getColorFamily = (hexColor) => {
  const color = hexToHsl(hexColor);
  if (!color) return 'slate';

  const { hue, saturation, lightness } = color;
  if (saturation < 0.12) {
    if (lightness < 0.2) return 'black';
    return 'slate';
  }

  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 42) return 'orange';
  if (hue < 72) return 'gold';
  if (hue < 145) return 'green';
  if (hue < 195) return 'teal';
  if (hue < 215 && lightness < 0.28) return 'navy';
  if (hue < 260) return lightness < 0.24 ? 'navy' : 'blue';
  if (hue < 345) return 'purple';
  return 'red';
};

const themeClass = {
  page: 'bg-[#F8FAFC] text-[#071426]',
  card: 'border-[#DCE4EC] bg-white',
  cardSoft: 'border-[#DCE4EC] bg-[#F8FAFC]',
  text: 'text-[#173A62]',
  textSecondary: 'text-[#52677F]',
  textMuted: 'text-[#71849A]',
  goldText: 'text-[#A87922]',
  goldBg: 'bg-[#FFF8E8]',
  goldBorder: 'border-[#D7B35C]/40',
  navyBtn: 'bg-[#123B6D] text-white hover:bg-[#0D315D]',
};

const FIT_LEVELS = ['Any', 'Good', 'Strong'];

const FIT_FILTER_CONFIG = [
  {
    key: 'contentFit',
    label: 'Content fit',
    description: 'Fits your resume length and section density.',
  },
  {
    key: 'atsFit',
    label: 'ATS safety',
    description: 'Uses a structure that applicant systems can read reliably.',
  },
  {
    key: 'jdFit',
    label: 'Job description fit',
    description: 'Matches role signals in your uploaded job description.',
  },
  {
    key: 'styleFit',
    label: 'Style fit',
    description: 'Supports the visual needs detected in your resume.',
  },
];

const FIT_SCORE_THRESHOLDS = {
  contentFit: { Good: 12, Strong: 28 },
  atsFit: { Good: 28, Strong: 48 },
  jdFit: { Good: 4, Strong: 12 },
  styleFit: { Good: 8, Strong: 16 },
};

const getAtsSafetyScore = (template, recommendation) => {
  const templateProfile = recommendation || template;
  const graphics = String(templateProfile.graphics || '').toLowerCase();
  let score = templateProfile.atsSafety === 'high' ? 24 : 12;

  if (String(templateProfile.columns || '') === '1') score += 14;
  if (graphics === 'low') score += 12;
  if (!templateProfile.hasHeadshot) score += 10;

  return score;
};

const getTemplateFitScore = (fitKey, template, recommendation) => {
  if (fitKey === 'atsFit') {
    return getAtsSafetyScore(template, recommendation);
  }

  return Number(recommendation?.breakdown?.[fitKey] || 0);
};

const meetsFitLevel = (fitKey, level, template, recommendation) => {
  if (level === 'Any') return true;
  const threshold = FIT_SCORE_THRESHOLDS[fitKey]?.[level] || 0;
  return getTemplateFitScore(fitKey, template, recommendation) >= threshold;
};

const FilterSection = ({ title, icon: Icon, children }) => (
  <section className="overflow-hidden rounded-[0.9rem] border border-[#DCE4EC] bg-white shadow-[0_4px_14px_rgba(15,43,75,0.035)]">
    <div className="flex items-center gap-2 border-b border-[#E5EBF0] bg-[#FAFBFC] px-3 py-2.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#173A62]">
      <div className="flex h-6 w-6 items-center justify-center rounded-[0.55rem] border border-[#D7B35C]/35 bg-[#FFF8E8] text-[#A87922]">
        <Icon size={12} />
      </div>
      {title}
    </div>
    <div className="space-y-0.5 p-2.5">{children}</div>
  </section>
);

const CheckboxItem = ({ label, checked, onChange, hint }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onChange}
    className={`group flex w-full items-center justify-between gap-3 rounded-[0.7rem] px-2.5 py-2 text-left transition ${
      checked
        ? 'border border-[#D7B35C]/40 bg-[#FFF8E8] text-[#173A62] shadow-[0_2px_8px_rgba(185,150,74,0.06)]'
        : 'border border-transparent text-[#60758B] hover:border-[#DCE4EC] hover:bg-[#F8FAFC] hover:text-[#173A62]'
    }`}
  >
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${
          checked
            ? 'border-[#123B6D] bg-[#123B6D]'
            : 'border-[#C9D4DF] bg-white'
        }`}
      >
        {checked && <CheckCircle2 size={11} className="text-[#B9964A]" />}
      </span>

      <span className="truncate text-[10.5px] font-semibold">{label}</span>
    </span>

    {hint ? (
      <span className="shrink-0 text-[8px] font-black uppercase tracking-[0.12em] text-[#8A99AA]">
        {hint}
      </span>
    ) : null}
  </button>
);

const FitLevelFilter = ({ label, description, value, onChange, disabled = false, unavailableText = '' }) => (
  <div className="border-b border-[#E5EBF0] py-2.5 first:pt-0 last:border-b-0 last:pb-0">
    <div className="text-[10.5px] font-bold text-[#173A62]">{label}</div>
    <p className="mt-1 text-[9px] font-medium leading-[1.45] text-[#7A8CA0]">
      {disabled ? unavailableText : description}
    </p>
    <div
      className="mt-2 grid grid-cols-3 gap-1 rounded-[0.65rem] bg-[#F1F4F7] p-1"
      role="radiogroup"
      aria-label={label + ' level'}
    >
      {FIT_LEVELS.map((level) => {
        const isSelected = value === level;

        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(level)}
            className={[
              'min-h-9 rounded-[0.55rem] px-1.5 text-[9px] font-bold transition',
              isSelected
                ? 'bg-[#123B6D] text-white shadow-[0_2px_7px_rgba(18,59,109,0.14)]'
                : 'text-[#6F8195] hover:bg-white hover:text-[#173A62]',
              'disabled:cursor-not-allowed disabled:opacity-45',
            ].join(' ')}
          >
            {level}
          </button>
        );
      })}
    </div>
  </div>
);

const ColorSwatch = ({ color, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative h-6 w-6 rounded-full border transition ${
      active
        ? 'border-[#173A62] ring-2 ring-[#D6B25E]/35'
        : 'border-white ring-1 ring-[#C9D4DF] hover:ring-[#123B6D]/30'
    }`}
    style={{ backgroundColor: color }}
    title={label}
    aria-label={`Filter by ${label}`}
    aria-pressed={active}
  >
    {active && (
      <span className="absolute inset-0 flex items-center justify-center">
        <CheckCircle2 size={13} className="text-white drop-shadow" />
      </span>
    )}
  </button>
);

const TemplateCard = ({ template, onSelect }) => (
  <div data-help-tour="template-card" className="group min-w-0">
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className="block w-full text-left outline-none"
      aria-label={`Use ${template.name} template`}
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-0.5">
        <h3 className="truncate text-[12px] font-black tracking-[-0.02em] text-[#173A62] transition-colors group-hover:text-[#A87922] sm:text-[13px]">
          {template.name}
        </h3>

        {template.recommended ? (
          <span className="shrink-0 rounded-full border border-[#D7B35C]/35 bg-[#FFF8E8] px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.1em] text-[#9A7225]">
            Recommended
          </span>
        ) : null}
      </div>

      <div className="relative mx-auto aspect-[210/297] w-full overflow-hidden rounded-[0.55rem] bg-white ring-1 ring-[#CBD7E2] shadow-[0_12px_32px_rgba(15,43,75,0.11)] transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-[#D2AA50]/55 group-hover:shadow-[0_20px_48px_rgba(15,43,75,0.16)]">
        <div className="pointer-events-none h-[308%] w-[308%] origin-top-left scale-[0.325] select-none bg-white">
          <ResumeThumbnail templateId={template.id} data={DUMMY_DATA} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#123B6D_0%,#B9964A_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-[linear-gradient(180deg,transparent_68%,rgba(7,20,38,0.54)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="mb-3 rounded-full border border-white/20 bg-white/95 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-[#173A62] shadow-lg">
            Use Template
          </div>
        </div>
      </div>
    </button>
  </div>
);

const TemplateGallery = ({
  onSelectTemplate,
  onBack,
  resumeData = null,
  mode = 'scratch',
  jdText = '',
  onHome,
  onOpenRepository,
}) => {
  const TEMPLATE_HELP_STEPS = [
    { target: 'template-overview', title: 'Find the right starting layout', description: 'Recommended templates are ranked for your resume when content is available. Search by template name to narrow the gallery quickly.' },
    { target: 'template-filters', title: 'Refine the gallery', description: 'Filter by content fit, ATS safety, job-description fit, columns, photo support, graphics, and color. Unavailable fit filters explain what data is needed.' },
    { target: 'template-gallery', title: 'Compare full-page previews', description: 'Scroll through the gallery to compare structure, density, and visual style without changing your resume content.' },
    { target: 'template-card', title: 'Choose and continue', description: 'Click any template preview to apply it and move into the editor. You can switch templates again later without losing your content.' },
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [helpTourStep, setHelpTourStep] = useState(null);
  const [helpTourPosition, setHelpTourPosition] = useState(null);
  const helpTourPanelRef = useRef(null);
  const helpTourDragRef = useRef({ offsetX: 0, offsetY: 0 });
  const [filters, setFilters] = useState({
    contentFit: 'Any',
    atsFit: 'Any',
    jdFit: 'Any',
    styleFit: 'Any',
    headshot: 'All',
    graphics: 'All',
    columns: 'All',
    color: null,
  });

  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  const closeHelpTour = useCallback(() => setHelpTourStep(null), []);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    if (helpTourStep === 1) setIsFiltersCollapsed(false);
    const step = TEMPLATE_HELP_STEPS[helpTourStep];
    let target = null;
    const timer = window.setTimeout(() => {
      target = document.querySelector(`[data-help-tour="${step.target}"]`);
      target?.classList.add('template-help-target');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 120);
    return () => {
      window.clearTimeout(timer);
      target?.classList.remove('template-help-target');
    };
  }, [helpTourStep]);

  useEffect(() => {
    if (helpTourStep === null) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeHelpTour();
      if (event.key === 'ArrowRight') setHelpTourStep((step) => Math.min(TEMPLATE_HELP_STEPS.length - 1, step + 1));
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

  const rankedTemplates = useMemo(
    () => getTemplateRecommendations(resumeData, TEMPLATES, mode, jdText),
    [jdText, mode, resumeData]
  );
  const resumeInsights = useMemo(
    () => getResumeInsights(resumeData || DUMMY_DATA),
    [resumeData]
  );

  const recommendationMap = useMemo(
    () =>
      new Map(
        rankedTemplates.map((template, index) => [
          template.id,
          { ...template, rank: index + 1 },
        ])
      ),
    [rankedTemplates]
  );

  const hasImportedResume = Boolean(resumeData);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    FIT_FILTER_CONFIG.some(({ key }) => filters[key] !== 'Any') ||
    filters.headshot !== 'All' ||
    filters.graphics !== 'All' ||
    filters.columns !== 'All' ||
    Boolean(filters.color);

  const handleFilterChange = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category] === value ? 'All' : value,
    }));
  };

  const handleFitLevelChange = (fitKey, level) => {
    setFilters((prev) => ({
      ...prev,
      [fitKey]: level,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      contentFit: 'Any',
      atsFit: 'Any',
      jdFit: 'Any',
      styleFit: 'Any',
      headshot: 'All',
      graphics: 'All',
      columns: 'All',
      color: null,
    });
    setSearchTerm('');
  };

  const handleTemplateSelect = (templateId) => {
    onSelectTemplate(templateId);
  };

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      const searchableText = [
        template.name,
        template.seoName,
        template.id,
        ...(template.searchAliases || []),
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = searchableText.includes(searchTerm.toLowerCase());

      const matchesHeadshot = filters.headshot === 'All' ||
        (filters.headshot === 'Yes'
          ? template.hasHeadshot
          : !template.hasHeadshot);

      const matchesGraphics =
        filters.graphics === 'All' ||
        String(template.graphics || '').toLowerCase() ===
          String(filters.graphics || '').toLowerCase();

      const matchesColumns =
        filters.columns === 'All' ||
        String(template.columns || '') === String(filters.columns || '');

      const matchesColor =
        !filters.color || getColorFamily(template.color) === filters.color;
      const recommendation = recommendationMap.get(template.id);
      const matchesFitLevels = FIT_FILTER_CONFIG.every(({ key }) => {
        const needsResume = key === 'contentFit' || key === 'styleFit';
        const needsJobDescription = key === 'jdFit';
        const isAvailable =
          (!needsResume || hasImportedResume) &&
          (!needsJobDescription || (mode === 'tailor' && Boolean(jdText.trim())));

        return !isAvailable || meetsFitLevel(key, filters[key], template, recommendation);
      });

      return (
        matchesSearch &&
        matchesHeadshot &&
        matchesGraphics &&
        matchesColumns &&
        matchesColor &&
        matchesFitLevels
      );
    }).sort((a, b) => {
      const recommendationDelta =
        (recommendationMap.get(b.id)?.score || 0) -
        (recommendationMap.get(a.id)?.score || 0);

      if (recommendationDelta !== 0) return recommendationDelta;

      if (a.recommended !== b.recommended) {
        return a.recommended ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });
  }, [filters, hasImportedResume, jdText, mode, recommendationMap, searchTerm]);

  const topRecommendations = useMemo(
    () =>
      filteredTemplates
        .slice(0, 3)
        .map((template) => recommendationMap.get(template.id) || template),
    [filteredTemplates, recommendationMap]
  );

  const atsFriendlyCount = useMemo(
    () =>
      TEMPLATES.filter(
        (template) =>
          template.columns === '1' &&
          String(template.graphics || '').toLowerCase() === 'low'
      ).length,
    []
  );
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(rgba(18,59,109,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,59,109,0.03)_1px,transparent_1px),radial-gradient(circle_at_84%_4%,rgba(18,59,109,0.12),transparent_33%),radial-gradient(circle_at_10%_12%,rgba(185,150,74,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#F2F5F8_100%)] bg-[size:36px_36px,36px_36px,auto,auto,auto] font-sans text-[#071426]">
      <style>{`
        .template-help-target {
          position: relative !important;
          z-index: 10001 !important;
          outline: 3px solid #D6B25E !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 0 8px rgba(214,178,94,.18), 0 0 0 9999px rgba(7,20,38,.58) !important;
          border-radius: 1rem;
        }
      `}</style>
      <BuilderNavbar
        currentStep="template"
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
          aria-label="Template gallery guided tour"
          className="fixed bottom-4 left-4 right-4 z-[10002] overflow-hidden rounded-[1rem] border border-[#D6B25E]/45 bg-[#071426] text-white shadow-[0_24px_70px_rgba(2,12,28,0.42)] sm:left-auto sm:right-6 sm:w-[390px]"
          style={helpTourPosition ? { left: helpTourPosition.x, top: helpTourPosition.y, right: 'auto', bottom: 'auto', width: helpTourPosition.width } : undefined}
        >
          <div onPointerDown={startTourDrag} onPointerMove={dragTour} onPointerUp={endTourDrag} onPointerCancel={endTourDrag} className="flex touch-none cursor-grab items-center justify-between border-b border-white/10 px-4 py-3 active:cursor-grabbing" title="Drag to move this help window">
            <div className="flex items-center gap-2.5">
              <span className="grid grid-cols-2 gap-0.5 text-white/35" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((dot) => <span key={dot} className="h-1 w-1 rounded-full bg-current" />)}
              </span>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E4C56F]">Template tour · {helpTourStep + 1} of {TEMPLATE_HELP_STEPS.length}</div>
            </div>
            <button type="button" onClick={closeHelpTour} aria-label="Close help tour" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"><X size={16} /></button>
          </div>
          <div className="px-4 py-4">
            <h2 className="text-base font-extrabold">{TEMPLATE_HELP_STEPS[helpTourStep].title}</h2>
            <p className="mt-2 text-[13px] leading-5 text-white/70">{TEMPLATE_HELP_STEPS[helpTourStep].description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setHelpTourStep((step) => Math.max(0, step - 1))} disabled={helpTourStep === 0} className="h-9 rounded-lg border border-white/15 px-3 text-xs font-bold transition hover:bg-white/10 disabled:opacity-35">Back</button>
              <div className="flex gap-1.5" aria-hidden="true">{TEMPLATE_HELP_STEPS.map((step, index) => <span key={step.target} className={`h-1.5 rounded-full ${index === helpTourStep ? 'w-5 bg-[#D6B25E]' : 'w-1.5 bg-white/25'}`} />)}</div>
              <button type="button" onClick={() => helpTourStep === TEMPLATE_HELP_STEPS.length - 1 ? closeHelpTour() : setHelpTourStep((step) => step + 1)} className="h-9 rounded-lg bg-[#D6B25E] px-4 text-xs font-extrabold text-[#071426] hover:bg-[#E4C56F]">{helpTourStep === TEMPLATE_HELP_STEPS.length - 1 ? 'Finish' : 'Next'}</button>
            </div>
          </div>
        </aside>
      ) : null}

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-[12%] top-[0%] h-[560px] w-[560px] rounded-full bg-[#123B6D]/[0.05] blur-[130px]" />
        <div className="absolute -right-[10%] top-[1%] h-[520px] w-[520px] rounded-full bg-[#B9964A]/[0.05] blur-[125px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-full flex-col items-start overflow-x-hidden lg:flex-row">
        <aside
          data-help-tour="template-filters"
          className={`shrink-0 self-start transition-all duration-300 ${
            isFiltersCollapsed ? 'lg:w-[66px]' : 'lg:w-[268px] xl:w-[278px]'
          }`}
        >
          {isFiltersCollapsed ? (
            <div className="hidden flex-col items-center justify-between gap-8 px-3 pb-3 pt-2 lg:flex">
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFiltersCollapsed(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-[0.7rem] border border-[#DCE4EC] bg-white text-[#71849A] shadow-[0_3px_10px_rgba(15,43,75,0.04)] transition hover:border-[#C49A43]/45 hover:bg-[#FFF9EC] hover:text-[#A87922]"
                  title="Expand filters"
                >
                  <PanelLeftOpen size={18} />
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-[0.7rem] border border-[#DCE4EC] bg-white text-[#71849A] shadow-[0_3px_10px_rgba(15,43,75,0.04)]">
                  <SlidersHorizontal size={18} />
                </div>

                <div className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                  Filters
                </div>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#64748B] transition hover:border-[#123B6D]/35 hover:bg-[#E8EEF7] hover:text-[#071426]"
                  title="Clear filters"
                >
                  <SlidersHorizontal size={16} />
                </button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-3 pb-4 pt-3 sm:px-3.5">
              <div className="rounded-[0.95rem] border border-[#173A62] bg-[linear-gradient(145deg,#071426_0%,#102D4F_58%,#173F69_100%)] p-3.5 text-white shadow-[0_10px_26px_rgba(7,20,38,0.14)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#E1BC68]">
                      Template Filters
                    </p>

                    <h2 className="mt-1 text-[14px] font-black tracking-[-0.02em] text-white">
                      Refine your gallery
                    </h2>

                    <p className="mt-1.5 text-[9.5px] font-medium leading-[1.55] text-white/55">
                      Narrow results by fit, structure and visual style.
                    </p>
                  </div>

                  
                </div>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-3 w-full rounded-[0.65rem] border border-[#D6B25E]/30 bg-[#D6B25E]/10 px-4 py-2 text-[10px] font-bold text-[#E7C86E] transition hover:bg-[#D6B25E]/15"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>

              <FilterSection title="Minimum match" icon={SlidersHorizontal}>
                {FIT_FILTER_CONFIG.map((fitFilter) => {
                  const needsResume =
                    fitFilter.key === 'contentFit' || fitFilter.key === 'styleFit';
                  const needsJobDescription = fitFilter.key === 'jdFit';
                  const disabled =
                    (needsResume && !hasImportedResume) ||
                    (needsJobDescription && (mode !== 'tailor' || !jdText.trim()));
                  const unavailableText = needsJobDescription
                    ? 'Upload a job description to use this filter.'
                    : 'Add resume content to use this filter.';

                  return (
                    <FitLevelFilter
                      key={fitFilter.key}
                      label={fitFilter.label}
                      description={fitFilter.description}
                      value={filters[fitFilter.key]}
                      disabled={disabled}
                      unavailableText={unavailableText}
                      onChange={(level) => handleFitLevelChange(fitFilter.key, level)}
                    />
                  );
                })}
              </FilterSection>

              <FilterSection title="Layout" icon={Layout}>
                <CheckboxItem
                  label="Single Column"
                  hint="ATS"
                  checked={filters.columns === '1'}
                  onChange={() => handleFilterChange('columns', '1')}
                />

                <CheckboxItem
                  label="Two Columns"
                  hint="Modern"
                  checked={filters.columns === '2'}
                  onChange={() => handleFilterChange('columns', '2')}
                />
              </FilterSection>

              <FilterSection title="Style" icon={Image}>
                <CheckboxItem
                  label="With Photo"
                  checked={filters.headshot === 'Yes'}
                  onChange={() => handleFilterChange('headshot', 'Yes')}
                />

                <CheckboxItem
                  label="Without Photo"
                  checked={filters.headshot === 'No'}
                  onChange={() => handleFilterChange('headshot', 'No')}
                />

                <CheckboxItem
                  label="Graphic Heavy"
                  checked={filters.graphics === 'High'}
                  onChange={() => handleFilterChange('graphics', 'High')}
                />

                <CheckboxItem
                  label="Minimal / Low Graphics"
                  checked={filters.graphics === 'Low'}
                  onChange={() => handleFilterChange('graphics', 'Low')}
                />
              </FilterSection>

              <FilterSection title="Color Palette" icon={Palette}>
                <div className="grid grid-cols-6 gap-2.5">
                  {COLOR_OPTIONS.map((color) => (
                    <ColorSwatch
                      key={color.id}
                      color={color.swatch}
                      label={color.label}
                      active={filters.color === color.id}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          color: prev.color === color.id ? null : color.id,
                        }))
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              <div className="rounded-[0.9rem] border border-[#E5D19C] bg-[#FFF9EC] p-3 text-[9.5px] font-medium leading-[1.55] text-[#5F7084]">
                <div className="mb-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#9A7628]">
                  Resume Tip
                </div>

                {hasImportedResume
                  ? 'Recommended templates are ranked using your uploaded resume content.'
                  : 'Clean one-column templates are usually safest for job applications.'}
              </div>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden px-3 pb-5 pt-3 sm:px-4 lg:px-4 xl:px-5 2xl:px-6">
          <section data-help-tour="template-overview" className="sticky top-[1px] z-30 mb-4 w-full max-w-full overflow-hidden rounded-[1rem] border border-[#DCE4EC] bg-white/95 p-4 shadow-[0_8px_24px_rgba(15,43,75,0.055)] backdrop-blur-xl">
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,500px)] xl:items-center">
              <div className="min-w-0">
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-[#C49A43]/30 bg-[#FFF8E9] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#94691F]">
                    Resume templates
                  </span>

                  <span className="rounded-md bg-[#F5F8FA] px-2.5 py-1 text-[8.5px] font-semibold text-[#60748A] ring-1 ring-[#DDE5EC]">
                    {filteredTemplates.length} results
                  </span>

                  <span className="rounded-md bg-[#F5F8FA] px-2.5 py-1 text-[8.5px] font-semibold text-[#60748A] ring-1 ring-[#DDE5EC]">
                    {atsFriendlyCount} ATS safe
                  </span>
                </div>

                <h1 className="text-[1.5rem] font-black tracking-[-0.04em] text-[#173A62] sm:text-[1.78rem]">
                  Choose your resume <span className="text-[#A87922]">template</span>
                </h1>

                <p className="mt-1.5 max-w-2xl text-[10.5px] font-medium leading-[1.6] text-[#6F8195]">
                  Pick a layout that fits your experience, role, and content density. Your resume content stays unchanged.
                </p>
              </div>

              <div className="min-w-0">
                <div className="mb-3">
                  <div className="mb-2 text-xs font-semibold text-[#64748B]">
                    Recommended templates
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {topRecommendations.map((template, index) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template.id)}
                        className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-[0.65rem] border border-[#D7B35C]/35 bg-[#FFF8E8] px-2.5 py-1.5 text-left text-[9px] font-extrabold text-[#173A62] transition hover:-translate-y-0.5 hover:border-[#C49A43] hover:bg-[#FFF3D4]"
                      >
                        <Star size={12} fill="currentColor" className="shrink-0" />
                        <span className="min-w-0 truncate">{template.name}</span>
                        <span className="shrink-0 text-[10px] opacity-70">
                          #{index + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex min-w-0 gap-2">
                  <div className="group relative min-w-0 flex-1">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] transition group-focus-within:text-[#123B6D]"
                      size={18}
                    />

                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="h-10 w-full rounded-[0.72rem] border border-[#D6E0EA] bg-white pl-10 pr-4 text-[11px] font-semibold text-[#173A62] shadow-[0_1px_2px_rgba(7,20,38,0.035)] outline-none transition placeholder:text-[#98A7B6] hover:border-[#C6D2DE] focus:border-[#C49A43] focus:ring-4 focus:ring-[#C49A43]/10"
                    />
                  </div>

                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="h-11 shrink-0 rounded-lg border border-[#E1E7EF] bg-white px-4 text-xs font-semibold text-[#475569] transition hover:border-[#123B6D]/35 hover:bg-[#E8EEF7] hover:text-[#071426]"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {filteredTemplates.length > 0 ? (
            <section data-help-tour="template-gallery" className="grid w-full max-w-full min-w-0 grid-cols-1 gap-x-4 gap-y-7 pb-16 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateSelect}
                />
              ))}
            </section>
          ) : (
            <section className="rounded-[1rem] border border-[#DCE4EC] bg-white/95 px-6 py-14 text-center shadow-[0_10px_28px_rgba(15,43,75,0.055)] backdrop-blur-xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#F2F6FB] text-[#CBD5E1]">
                <Search size={32} />
              </div>

              <h3 className="text-xl font-semibold tracking-tight text-[#071426]">
                No templates found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                Try removing one filter or searching with a broader template name.
              </p>

              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-6 rounded-[0.72rem] bg-[#123B6D] px-5 py-2.5 text-[12px] font-extrabold text-white shadow-[0_5px_14px_rgba(18,59,109,0.14)] transition hover:-translate-y-0.5 hover:bg-[#0D315D]"
              >
                Show all templates
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default TemplateGallery;
