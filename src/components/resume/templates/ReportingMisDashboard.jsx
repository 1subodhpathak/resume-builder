import { mergeExperienceFragmentsOnPage } from '../templateSurfaceUtils';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BarChart3,
  Briefcase,
  Database,
  GraduationCap,
  LineChart,
  Mail,
  MapPin,
  Phone,
  PieChart,
  Target,
  Award,
  Linkedin,
} from 'lucide-react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^•\s*/, '').trim())
    .filter(Boolean);

const Gauge = ({ value, label, color }) => {
  const dash = 126;
  const offset = dash - (dash * value) / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-10 w-20">
        <svg
          viewBox="0 0 100 50"
          className="h-full w-full overflow-visible drop-shadow-sm"
        >
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={dash}
            strokeDashoffset={offset}
            strokeLinecap="butt"
          />
        </svg>

        <div className="absolute bottom-0 left-0 w-full text-center text-[11px] font-black leading-none text-slate-800">
          {value}%
        </div>
      </div>

      <div className="mt-1.5 text-center text-[8.5px] font-bold uppercase leading-tight tracking-wide text-slate-600">
        {label}
      </div>
    </div>
  );
};


const KpiCard = ({ icon: Icon, label, value, accent, sublabel }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <div className="text-[7.5px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}18`, color: accent }}>
        <Icon size={14} />
      </div>
    </div>
    <div className="text-[14px] font-black leading-none text-slate-800">{value}</div>
    {sublabel ? <div className="mt-1 text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">{sublabel}</div> : null}
  </div>
);

const MiniTrendChart = ({ points = [], color = '#1a4b8c' }) => {
  if (!points.length) return null;

  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);

  const plotted = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 80 - ((point - min) / range) * 60;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-700">Reporting Trend</div>
          <div className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">Snapshot of consistency & delivery</div>
        </div>
        <div className="rounded-md bg-slate-100 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-slate-500">QoQ</div>
      </div>
      <svg viewBox="0 0 100 84" className="h-[14mm] w-full overflow-visible">
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
        ))}
        <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={plotted} />
        {points.map((point, index) => {
          const x = (index / Math.max(points.length - 1, 1)) * 100;
          const y = 80 - ((point - min) / range) * 60;
          return (
            <g key={`${point}-${index}`}>
              <circle cx={x} cy={y} r="2.8" fill="white" stroke={color} strokeWidth="2" />
              <text x={x} y={82} textAnchor="middle" className="fill-slate-400 text-[5px] font-bold">Q{index + 1}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const DonutChart = ({ segments = [] }) => {
  if (!segments.length) return null;

  const gradient = `conic-gradient(${segments
    .map((segment, index) => {
      const start = segments
        .slice(0, index)
        .reduce((sum, item) => sum + item.value, 0);
      const end = start + segment.value;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(', ')})`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-700">Dashboard Mix</div>
          <div className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">Graphical capability split</div>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[#1a4b8c]">
          <PieChart size={14} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-[22mm] w-[22mm] shrink-0 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-white text-center">
            <div>
              <div className="text-[11px] font-black leading-none text-slate-800">100%</div>
              <div className="mt-0.5 text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">Focus</div>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          {segments.map((segment, index) => (
            <div key={`${segment.label}-${index}`} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                <span className="truncate text-[7.5px] font-black uppercase tracking-[0.08em] text-slate-600">{segment.label}</span>
              </div>
              <span className="text-[7.5px] font-black text-slate-400">{segment.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title }) => (
  <div className="mb-2.5 w-full rounded-r-md border-l-4 border-[#fbbd08] bg-[#1a4b8c] px-3 py-1 text-[8.5px] font-black uppercase tracking-[0.13em] text-white shadow-sm">
    {title}
  </div>
);

const ReportingMisDashboard = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
  } = data || {};

  const NAVY = '#1a4b8c';
  const GOLD = '#fbbd08';

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const CONTENT_WIDTH = '194mm';
  const COLUMN_WIDTH = '90mm';
  const FIRST_PAGE_CONTENT_HEIGHT = '211mm';
  const CONTINUATION_CONTENT_HEIGHT = '250mm';

  const nameParts = personal.name
    ? personal.name.split(' ')
    : ['JOHNATHAN', 'SMITH'];

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  const coreSkills = [
    ...(skills.core || []),
    ...(skills.soft || []),
  ].filter(Boolean);

  const technicalTools = (skills.technical || []).filter(Boolean);

  const gaugeData = useMemo(
    () =>
      coreSkills.map((skill, index) => ({
        label: skill,
        value:
          90 - index * 5 > 60
            ? 90 - index * 5
            : 75 + (index % 3) * 5,
        color: [NAVY, GOLD, '#0ea5e9', '#f97316'][index % 4],
      })),
    [coreSkills]
  );


  const dashboardKpis = useMemo(
    () => [
      {
        label: 'Roles Covered',
        value: String(experience.length || 0).padStart(2, '0'),
        sublabel: 'work history',
        icon: Briefcase,
        accent: NAVY,
      },
      {
        label: 'Projects',
        value: String(projects.length || 0).padStart(2, '0'),
        sublabel: 'delivery blocks',
        icon: Target,
        accent: GOLD,
      },
      {
        label: 'Tools',
        value: String(technicalTools.length || 0).padStart(2, '0'),
        sublabel: 'reporting stack',
        icon: Database,
        accent: '#0ea5e9',
      },
      {
        label: 'Credentials',
        value: String((certifications.length || 0) + (awards.length || 0)).padStart(2, '0'),
        sublabel: 'awards & certs',
        icon: Award,
        accent: '#f97316',
      },
    ],
    [awards.length, certifications.length, experience.length, projects.length, technicalTools.length]
  );

  const trendSeries = useMemo(() => {
    const base = 68 + Math.min(experience.length, 5) * 2;
    return [base - 6, base - 2, base + 1, base + 3, base + 6, Math.min(base + 9, 96)];
  }, [experience.length]);

  const mixSegments = useMemo(() => {
    const analytics = Math.max(24, Math.min(36, 18 + technicalTools.length * 2));
    const reporting = Math.max(20, Math.min(30, 18 + experience.length * 2));
    const automation = Math.max(18, Math.min(24, 14 + Math.ceil((projects.length || 1) * 2)));
    const strategy = Math.max(16, 100 - analytics - reporting - automation);

    const normalized = [
      { label: 'Analytics', value: analytics, color: NAVY },
      { label: 'Reporting', value: reporting, color: GOLD },
      { label: 'Automation', value: automation, color: '#0ea5e9' },
      { label: 'Strategy', value: strategy, color: '#f97316' },
    ];

    const total = normalized.reduce((sum, item) => sum + item.value, 0) || 1;
    let running = 0;

    return normalized.map((item, index) => {
      const raw = Math.round((item.value / total) * 100);
      running += raw;
      const value = index === normalized.length - 1 ? raw + (100 - running) : raw;
      return { ...item, value };
    });
  }, [experience.length, projects.length, technicalTools.length, NAVY, GOLD]);

  const leftMeasureRefs = useRef({});
  const rightMeasureRefs = useRef({});
  const leftSectionHeaderRefs = useRef({});
  const rightSectionHeaderRefs = useRef({});

  const leftFirstHeightMeasureRef = useRef(null);
  const leftContinuationHeightMeasureRef = useRef(null);
  const rightFirstHeightMeasureRef = useRef(null);
  const rightContinuationHeightMeasureRef = useRef(null);

  const firstBodyHeaderMeasureRef = useRef(null);
  const continuationBodyHeaderMeasureRef = useRef(null);

  const [leftPages, setLeftPages] = useState([]);
  const [rightPages, setRightPages] = useState([]);

  const chunkArray = useCallback((items = [], size = 4) => {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks.length ? chunks : [[]];
  }, []);

  const leftBlocks = useMemo(() => {
    const next = [];

    next.push({
      id: 'analytics-overview',
      section: 'analytics',
      type: 'analytics',
    });

    chunkArray(gaugeData, 6).forEach((items, index) => {
      if (!items.length) return;

      next.push({
        id: `gauges-${index}`,
        section: 'skills',
        type: 'gauges',
        items,
        continuation: index > 0,
      });
    });

    experience.forEach((item, index) => {
      const chunks = chunkArray(splitLines(item.desc), 5);

      chunks.forEach((lines, chunkIndex) => {
        next.push({
          id: `experience-${index}-${item.id || 'item'}-${chunkIndex}`,
          section: 'experience',
          type: 'experience',
          item,
          lines,
          continuation: chunkIndex > 0,
          forceBreak: Boolean(item.pageBreak && chunkIndex === 0),
        });
      });
    });

    return next;
  }, [
    chunkArray,
    experience,
    gaugeData,
  ]);

  const rightBlocks = useMemo(() => {
    const next = [];

    next.push({
      id: 'capability-mix',
      section: 'charts',
      type: 'mixChart',
    });

    chunkArray(technicalTools, 7).forEach((items, index) => {
      if (!items.length) return;

      next.push({
        id: `tools-${index}`,
        section: 'tools',
        type: 'tools',
        items,
        startIndex: index * 7,
        continuation: index > 0,
      });
    });

    education.forEach((item, index) => {
      next.push({
        id: `education-${index}-${item.id || 'item'}`,
        section: 'education',
        type: 'education',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    projects.forEach((item, index) => {
      next.push({
        id: `project-${index}-${item.id || 'item'}`,
        section: 'projects',
        type: 'project',
        item,
        index,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    certifications.forEach((item, index) => {
      next.push({
        id: `credential-certification-${index}-${item.id || 'item'}`,
        section: 'certifications',
        type: 'credential',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    awards.forEach((item, index) => {
      next.push({
        id: `credential-award-${index}-${item.id || 'item'}`,
        section: 'certifications',
        type: 'credential',
        item,
        forceBreak: Boolean(item.pageBreak),
      });
    });

    return next;
  }, [
    awards,
    certifications,
    chunkArray,
    education,
    projects,
    technicalTools,
  ]);

  const Header = () => (
    <>
      <header className="relative bg-[#1a4b8c] px-[8mm] pb-[9mm] pt-[6mm] text-white shadow-md">
        <div className="pointer-events-none absolute bottom-3 right-8 flex items-end gap-1.5 opacity-20">
          <div className="h-8 w-3 rounded-t-sm bg-white" />
          <div className="h-12 w-3 rounded-t-sm bg-white" />
          <div className="h-10 w-3 rounded-t-sm bg-[#fbbd08]" />
          <div className="h-14 w-3 rounded-t-sm bg-white" />
          <div className="ml-3 h-8 w-8 rounded-full border-[3px] border-[#fbbd08]" />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-[27px] font-black uppercase leading-none tracking-tight drop-shadow-md">
              {firstName}{' '}
              <span className="text-[#fbbd08]">
                {lastName}
              </span>
            </h1>

            <div className="mt-2 inline-block border-b-[2px] border-white pb-1 text-[9.5px] font-bold uppercase tracking-[0.18em]">
              {personal.title || 'Power BI Developer'}
            </div>
          </div>

          <div className="min-w-[48mm] shrink-0 rounded-xl border border-white/10 bg-[#12366b] p-3 text-[8px] font-medium shadow-inner">
            <div className="mb-1 border-b border-white/20 pb-1 text-[8px] font-black uppercase tracking-wider text-[#fbbd08]">
              Contact Info
            </div>

            <div className="space-y-1.5">
              {personal.phone ? (
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-white/10 p-1">
                    <Phone size={8} className="text-[#fbbd08]" />
                  </div>
                  <span>{personal.phone}</span>
                </div>
              ) : null}

              {personal.email ? (
                <div className="flex items-center gap-2 break-all">
                  <div className="rounded-full bg-white/10 p-1">
                    <Mail size={8} className="text-[#fbbd08]" />
                  </div>
                  <span>{personal.email}</span>
                </div>
              ) : null}

              {personal.location ? (
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-white/10 p-1">
                    <MapPin size={8} className="text-[#fbbd08]" />
                  </div>
                  <span>{personal.location}</span>
                </div>
              ) : null}

              {personal.linkedin ? (
                <div className="flex items-center gap-2 break-all">
                  <div className="rounded-full bg-white/10 p-1">
                    <Linkedin size={8} className="text-[#fbbd08]" />
                  </div>
                  <span>{personal.linkedin}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-20 -mt-[5mm] mb-[2.5mm] flex gap-4 px-[8mm]">
        <div className="h-[22mm] w-[22mm] shrink-0 overflow-hidden rounded-md border-[3px] border-white bg-white shadow-xl">
          {personal.photo ? (
            <img
              src={personal.photo}
              alt="Profile"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-[8px] font-bold text-slate-400">
              PHOTO
            </div>
          )}
        </div>

        <div className="flex-1 pt-[6mm]">
          <div className="relative rounded-b-xl rounded-tr-xl border-t-[4px] border-[#fbbd08] bg-white p-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 overflow-hidden opacity-10">
              <PieChart
                size={70}
                className="-mr-3 -mt-3 text-[#1a4b8c]"
              />
            </div>

            <div className="mb-1 text-[9px] font-black uppercase tracking-wide text-[#1a4b8c]">
              Overview
              <span className="mx-2 text-slate-300">•</span>
              
            </div>

            <div className="text-[8.2px] font-medium leading-[1.38] text-slate-600">
              {personal.summary ||
                'Skilled in creating interactive dashboards, reports, and data solutions to drive business insights and operational efficiency.'}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const FirstBodyHeader = ({
    measureRef = null,
  }) => (
    <div ref={measureRef} className="pb-1.5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
        <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[#1a4b8c]">
          Dashboard Details
        </div>
        <div className="text-[7.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
Graphs · KPIs · Tools · Education · Projects
        </div>
      </div>
    </div>
  );

  const ContinuationBodyHeader = ({ measureRef = null }) => (
    <div ref={measureRef} className="h-[2.5mm]" />
  );

  const renderLeftBlock = (block) => {
    if (!block) return null;

    if (block.type === 'analytics') {
      return (
        <div className="pb-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {dashboardKpis.map((item) => (
              <KpiCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
                accent={item.accent}
                sublabel={item.sublabel}
              />
            ))}
          </div>

          <div className="mt-2.5">
            <MiniTrendChart points={trendSeries} color={NAVY} />
          </div>
        </div>
      );
    }

    if (block.type === 'gauges') {
      return (
        <div className="pb-2.5">
          {block.continuation ? (
            <div className="mb-2 text-[7.5px] font-black uppercase tracking-[0.1em] text-slate-400">
              Skills continued
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
              {block.items.map((skill, index) => (
                <Gauge
                  key={`${block.id}-${index}`}
                  label={skill.label}
                  value={skill.value}
                  color={skill.color}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'experience') {
      const item = block.item;

      return (
        <div className="pb-2.5">
          <article className="relative ml-1 border-l-2 border-slate-300 pl-3.5">
            <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-[3px] border-[#1a4b8c] bg-white shadow-sm" />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-black uppercase leading-tight tracking-wide text-[#1a4b8c]">
                  {item.role}
                  {block.continuation ? (
                    <span className="ml-1 text-[7.5px] font-medium italic normal-case tracking-normal text-slate-400">
                      continued
                    </span>
                  ) : null}
                </div>

                {!block.continuation && item.company ? (
                  <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#d39e00]">
                    {item.company}
                  </div>
                ) : null}
              </div>

              {!block.continuation && item.date ? (
                <div className="shrink-0 rounded border border-slate-200 bg-slate-100 px-2 py-1 text-[7.5px] font-black uppercase tracking-[0.07em] text-slate-600">
                  {item.date}
                </div>
              ) : null}
            </div>

            {block.lines.length ? (
              <div className="mt-1.5 space-y-0.5 text-[8px] font-medium leading-[1.32] text-slate-600">
                {block.lines.map((line, index) => (
                  <p key={`${block.id}-${index}`}>
                    • {line}
                  </p>
                ))}
              </div>
            ) : null}
          </article>
        </div>
      );
    }

    return null;
  };

  const renderRightBlock = (block) => {
    if (!block) return null;

    if (block.type === 'mixChart') {
      return (
        <div className="pb-2.5">
          <DonutChart segments={mixSegments} />
        </div>
      );
    }

    if (block.type === 'tools') {
      return (
        <div className="pb-2.5">
          {block.continuation ? (
            <div className="mb-2 text-[7.5px] font-black uppercase tracking-[0.1em] text-slate-400">
              Tools continued
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="space-y-1.5">
              {block.items.map((tool, index) => {
                const absoluteIndex =
                  block.startIndex + index;

                const percentage =
                  95 - absoluteIndex * 4 > 60
                    ? 95 - absoluteIndex * 4
                    : 75;

                const color = [
                  GOLD,
                  NAVY,
                  '#0ea5e9',
                  '#22c55e',
                  '#6366f1',
                ][absoluteIndex % 5];

                return (
                  <div
                    key={`${block.id}-${tool}-${index}`}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-100 text-slate-600">
                      {absoluteIndex % 3 === 0 ? (
                        <BarChart3 size={11} />
                      ) : absoluteIndex % 3 === 1 ? (
                        <Database size={11} />
                      ) : (
                        <LineChart size={11} />
                      )}
                    </div>

                    <div className="w-[24mm] shrink-0 truncate pr-1 text-[8px] font-black uppercase text-slate-700">
                      {tool}
                    </div>

                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'education') {
      const item = block.item;

      return (
        <div className="pb-2.5">
          <article className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#f4f7fb] text-[#1a4b8c]">
              <GraduationCap size={15} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-black uppercase text-slate-800">
                {item.degree}
              </div>

              {item.school ? (
                <div className="mt-0.5 text-[8px] font-bold text-slate-500">
                  {item.school}
                </div>
              ) : null}

              {item.date ? (
                <div className="mt-1 text-[7.5px] font-bold text-[#d39e00]">
                  {item.date}
                </div>
              ) : null}
            </div>
          </article>
        </div>
      );
    }

    if (block.type === 'project') {
      const item = block.item;

      return (
        <div className="pb-2.5">
          <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-[#f4f7fb] p-2 shadow-sm">
            <div className="absolute left-0 top-0 h-full w-1 bg-[#1a4b8c]" />

            <div className="text-[9px] font-black uppercase leading-tight text-[#1a4b8c]">
              {item.name}
            </div>

            {item.desc ? (
              <div className="mt-1 whitespace-pre-wrap text-[7.7px] font-medium leading-[1.35] text-slate-600">
                {item.desc}
              </div>
            ) : null}
          </article>
        </div>
      );
    }

    if (block.type === 'credential') {
      const item = block.item;

      return (
        <div className="pb-2.5">
          <article className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-[#f4f7fb] p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#fbbd08] text-white shadow-sm">
              <Award size={15} />
            </div>

            <div className="min-w-0">
              <div className="text-[8.5px] font-black uppercase leading-tight text-slate-800">
                {item.name}
              </div>

              <div className="mt-0.5 text-[7.5px] font-medium text-slate-500">
                {item.issuer || item.date}
              </div>
            </div>
          </article>
        </div>
      );
    }

    return null;
  };

  const paginateColumn = useCallback(
    ({
      blocks,
      blockRefs,
      sectionHeaderRefs,
      firstHeightRef,
      continuationHeightRef,
      firstHeaderRef,
      continuationHeaderRef,
      footerReserve = 0,
    }) => {
      const firstContentHeight =
        firstHeightRef.current?.getBoundingClientRect().height || 0;

      const continuationContentHeight =
        continuationHeightRef.current?.getBoundingClientRect().height || 0;

      const firstHeaderHeight =
        firstHeaderRef.current?.getBoundingClientRect().height || 0;

      const continuationHeaderHeight =
        continuationHeaderRef.current?.getBoundingClientRect().height || 0;

      if (!firstContentHeight || !continuationContentHeight) return [];

      if (!blocks.length) {
        return [{ blocks: [] }];
      }

      const pages = [];
      let pageIndex = 0;
      let pageBlocks = [];
      let usedHeight = 0;
      let activeSection = null;

      const getLimit = () => {
        const contentHeight =
          pageIndex === 0
            ? firstContentHeight
            : continuationContentHeight;

        const headerHeight =
          pageIndex === 0
            ? firstHeaderHeight
            : continuationHeaderHeight;

        return Math.max(
          0,
          contentHeight - headerHeight - footerReserve
        );
      };

      const commit = () => {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
        pageIndex += 1;
        pageBlocks = [];
        usedHeight = 0;
        activeSection = null;
      };

      blocks.forEach((block) => {
        if (block.forceBreak && pageBlocks.length) {
          commit();
        }

        const blockHeight =
          blockRefs.current[
            block.id
          ]?.getBoundingClientRect().height || 0;

        const getSectionHeight = () => {
          if (
            !block.section ||
            activeSection === block.section
          ) {
            return 0;
          }

          return (
            sectionHeaderRefs.current[
              block.section
            ]?.getBoundingClientRect().height || 0
          );
        };

        let sectionHeight = getSectionHeight();
        let requiredHeight =
          sectionHeight + blockHeight;

        if (
          pageBlocks.length &&
          usedHeight + requiredHeight > getLimit()
        ) {
          commit();

          sectionHeight =
            block.section
              ? sectionHeaderRefs.current[
                  block.section
                ]?.getBoundingClientRect().height || 0
              : 0;

          requiredHeight =
            sectionHeight + blockHeight;
        }

        pageBlocks.push(block);
        usedHeight += requiredHeight;
        activeSection =
          block.section || activeSection;
      });

      if (pageBlocks.length || !pages.length) {
        pages.push({ blocks: mergeExperienceFragmentsOnPage(pageBlocks) });
      }

      return pages;
    },
    []
  );

  const paginate = useCallback(() => {
    const nextLeft = paginateColumn({
      blocks: leftBlocks,
      blockRefs: leftMeasureRefs,
      sectionHeaderRefs: leftSectionHeaderRefs,
      firstHeightRef: leftFirstHeightMeasureRef,
      continuationHeightRef: leftContinuationHeightMeasureRef,
      firstHeaderRef: firstBodyHeaderMeasureRef,
      continuationHeaderRef: continuationBodyHeaderMeasureRef,
      footerReserve: 10,
    });

    const nextRight = paginateColumn({
      blocks: rightBlocks,
      blockRefs: rightMeasureRefs,
      sectionHeaderRefs: rightSectionHeaderRefs,
      firstHeightRef: rightFirstHeightMeasureRef,
      continuationHeightRef: rightContinuationHeightMeasureRef,
      firstHeaderRef: firstBodyHeaderMeasureRef,
      continuationHeaderRef: continuationBodyHeaderMeasureRef,
      footerReserve: 10,
    });

    setLeftPages(nextLeft);
    setRightPages(nextRight);
  }, [
    leftBlocks,
    paginateColumn,
    rightBlocks,
  ]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (!cancelled) {
          paginate();
        }
      });
    };

    run();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready
        .then(run)
        .catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer) {
      Object.values(leftMeasureRefs.current).forEach((node) => node && observer.observe(node));
      Object.values(rightMeasureRefs.current).forEach((node) => node && observer.observe(node));
      if (firstBodyHeaderMeasureRef.current) observer.observe(firstBodyHeaderMeasureRef.current);
      if (continuationBodyHeaderMeasureRef.current) observer.observe(continuationBodyHeaderMeasureRef.current);
    }

    window.addEventListener('resize', run);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [paginate]);

  const visibleLeftPages =
    leftPages.length
      ? leftPages
      : [{ blocks: leftBlocks }];

  const visibleRightPages =
    rightPages.length
      ? rightPages
      : [{ blocks: rightBlocks }];

  const pageCount = Math.max(
    visibleLeftPages.length,
    visibleRightPages.length,
    1
  );

  const leftHeaders = {
    analytics: <SectionHeader title="Dashboard KPIs" />,
    skills: <SectionHeader title="Skills" />,
    experience: <SectionHeader title="Experience" />,
  };

  const rightHeaders = {
    charts: <SectionHeader title="Graphs & Charts" />,
    tools: <SectionHeader title="Tools" />,
    education: <SectionHeader title="Education" />,
    projects: <SectionHeader title="Project Highlights" />,
    certifications: <SectionHeader title="Certifications" />,
  };

  return (
    <div className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm] font-sans">
      {/* =====================================================
          HIDDEN MEASUREMENT LAYER
      ===================================================== */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={leftFirstHeightMeasureRef}
          style={{ width: COLUMN_WIDTH, height: FIRST_PAGE_CONTENT_HEIGHT }}
        />
        <div
          ref={leftContinuationHeightMeasureRef}
          style={{ width: COLUMN_WIDTH, height: CONTINUATION_CONTENT_HEIGHT }}
        />
        <div
          ref={rightFirstHeightMeasureRef}
          style={{ width: COLUMN_WIDTH, height: FIRST_PAGE_CONTENT_HEIGHT }}
        />
        <div
          ref={rightContinuationHeightMeasureRef}
          style={{ width: COLUMN_WIDTH, height: CONTINUATION_CONTENT_HEIGHT }}
        />

        <div style={{ width: COLUMN_WIDTH }}>
          <FirstBodyHeader
            measureRef={firstBodyHeaderMeasureRef}
          />

          <ContinuationBodyHeader
            measureRef={continuationBodyHeaderMeasureRef}
            pageNumber={2}
          />

          <div
            ref={(node) => {
              leftSectionHeaderRefs.current.analytics = node;
            }}
          >
            <SectionHeader title="Dashboard KPIs" />
          </div>

          <div
            ref={(node) => {
              leftSectionHeaderRefs.current.skills = node;
            }}
          >
            <SectionHeader title="Skills" />
          </div>

          <div
            ref={(node) => {
              leftSectionHeaderRefs.current.experience = node;
            }}
          >
            <SectionHeader title="Experience" />
          </div>

          {leftBlocks.map((block) => (
            <div
              key={`measure-left-${block.id}`}
              ref={(node) => {
                leftMeasureRefs.current[block.id] = node;
              }}
            >
              {renderLeftBlock(block)}
            </div>
          ))}
        </div>

        <div style={{ width: COLUMN_WIDTH }}>
          <div
            ref={(node) => {
              rightSectionHeaderRefs.current.charts = node;
            }}
          >
            <SectionHeader title="Graphs & Charts" />
          </div>

          <div
            ref={(node) => {
              rightSectionHeaderRefs.current.tools = node;
            }}
          >
            <SectionHeader title="Tools" />
          </div>

          <div
            ref={(node) => {
              rightSectionHeaderRefs.current.education = node;
            }}
          >
            <SectionHeader title="Education" />
          </div>

          <div
            ref={(node) => {
              rightSectionHeaderRefs.current.projects = node;
            }}
          >
            <SectionHeader title="Project Highlights" />
          </div>

          <div
            ref={(node) => {
              rightSectionHeaderRefs.current.certifications = node;
            }}
          >
            <SectionHeader title="Certifications" />
          </div>

          {rightBlocks.map((block) => (
            <div
              key={`measure-right-${block.id}`}
              ref={(node) => {
                rightMeasureRefs.current[block.id] = node;
              }}
            >
              {renderRightBlock(block)}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          REAL A4 PAGES
      ===================================================== */}
      <div className="space-y-4 print:space-y-0">
        {Array.from({ length: pageCount }).map(
          (_, pageIndex) => {
            const leftPage =
              visibleLeftPages[pageIndex] || {
                blocks: [],
              };

            const rightPage =
              visibleRightPages[pageIndex] || {
                blocks: [],
              };

            return (
              <section
                key={`reporting-mis-page-${pageIndex}`}
                className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-[#f4f7fb] shadow-[0_18px_55px_rgba(15,23,42,0.14)] print:shadow-none"
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  breakAfter: pageIndex < pageCount - 1 ? 'page' : 'auto',
                  pageBreakAfter: pageIndex < pageCount - 1 ? 'always' : 'auto',
                }}
              >
                {pageIndex === 0 ? (
                  <Header />
                ) : (
                  <div className="bg-[#1a4b8c] px-[8mm] py-[3.5mm] text-white">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-[0.08em]">
                          {personal.name || 'Your Name'}
                        </div>
                        {personal.title ? (
                          <div className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-blue-100">
                            {personal.title}
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[7.5px] font-black uppercase tracking-[0.1em]">
                        Page {pageIndex + 1} / {pageCount}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className="px-[8mm]"
                  style={{ width: CONTENT_WIDTH }}
                >
                  {pageIndex === 0 ? (
                    <FirstBodyHeader />
                  ) : (
                    <div className="h-[2.5mm]" />
                  )}

                  <div className="grid grid-cols-2 gap-[7mm]">
                    {/* LEFT COLUMN */}
                    <div>
                      {leftPage.blocks.map(
                        (block, blockIndex) => {
                          const previous =
                            leftPage.blocks[
                              blockIndex - 1
                            ];

                          const showHeader =
                            blockIndex === 0 ||
                            previous?.section !==
                              block.section;

                          return (
                            <React.Fragment
                              key={`${pageIndex}-left-${block.id}`}
                            >
                              {showHeader
                                ? leftHeaders[
                                    block.section
                                  ]
                                : null}

                              <div
                                style={{
                                  breakInside: 'avoid',
                                  pageBreakInside:
                                    'avoid',
                                }}
                              >
                                {renderLeftBlock(
                                  block
                                )}
                              </div>
                            </React.Fragment>
                          );
                        }
                      )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div>
                      {rightPage.blocks.map(
                        (block, blockIndex) => {
                          const previous =
                            rightPage.blocks[
                              blockIndex - 1
                            ];

                          const showHeader =
                            blockIndex === 0 ||
                            previous?.section !==
                              block.section;

                          return (
                            <React.Fragment
                              key={`${pageIndex}-right-${block.id}`}
                            >
                              {showHeader
                                ? rightHeaders[
                                    block.section
                                  ]
                                : null}

                              <div
                                style={{
                                  breakInside: 'avoid',
                                  pageBreakInside:
                                    'avoid',
                                }}
                              >
                                {renderRightBlock(
                                  block
                                )}
                              </div>
                            </React.Fragment>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-[#1a4b8c] py-1 text-center text-[6.5px] font-black uppercase tracking-[0.16em] text-white">
                  <span>Data-Driven</span>
                  <span className="mx-3 text-[#fbbd08]">
                    |
                  </span>
                  <span>Insight-Focused</span>
                  <span className="mx-3 text-[#fbbd08]">
                    |
                  </span>
                  <span>Results-Oriented</span>
                </div>

                <div className="absolute bottom-[1.8mm] right-[8mm] text-[6px] font-black uppercase tracking-[0.08em] text-blue-100">
                  {pageIndex + 1} / {pageCount}
                </div>
              </section>
            );
          }
        )}
      </div>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .resume-preview-wrapper {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportingMisDashboard;
