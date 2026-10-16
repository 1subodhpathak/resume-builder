import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Globe,
  Github,
  Award,
  Braces,
  ChevronRight,
  Code2,
  FileCode2,
  FolderGit2,
  FolderOpen,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ServerCog,
  TerminalSquare,
  UserRound,
} from 'lucide-react';

const cleanLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const safeIdentifier = (value = '', fallback = 'Item') => {
  const cleaned = String(value || '')
    .replace(/[^a-zA-Z0-9_$]/g, '')
    .replace(/^[0-9]+/, '');

  return cleaned || fallback;
};

const ClassFileResume = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    certifications = [],
    projects = [],
    languages = [],
    awards = [],
  } = data || {};

  const {
    core = [],
    technical = [],
    soft = [],
  } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  // One-page geometry: reduced header + tighter page padding.
  const PAGE_PAD_X = '8mm';
  const PAGE_PAD_TOP = '7mm';
  const PAGE_PAD_BOTTOM = '8mm';

  const INNER_WIDTH = '194mm';
  const EXPLORER_WIDTH = '52mm';
  const EDITOR_WIDTH = '134mm';
  const COLUMN_GAP = '8mm';
  const BODY_HEIGHT = '248mm';

  const BG = '#0d1117';
  const APP_BAR = '#0b0f14';
  const PANEL = '#11161d';
  const PANEL_2 = '#161b22';
  const EDITOR = '#0f141a';
  const BORDER = '#2a333d';

  const TEXT = '#d7dee7';
  const MUTED = '#8190a0';
  const FAINT = '#4f5b67';

  const CYAN = '#82d2ff';
  const GREEN = '#7ee787';
  const RED = '#ffaaa5';
  const PURPLE = '#c4a7ff';
  const YELLOW = '#f3cc65';
  const ORANGE = '#ffb86b';

  const naturalRef = useRef(null);
  const [fitScale, setFitScale] = useState(1);

  const allSkills = useMemo(
    () => [...core, ...technical, ...soft].filter(Boolean),
    [core, technical, soft]
  );

  const MainTitle = ({ icon: Icon, label, color }) => (
    <div className="mb-2 flex items-center gap-2">
      <Icon size={10} style={{ color }} />
      <div
        className="text-[7.4px] font-black uppercase tracking-[0.11em]"
        style={{ color }}
      >
        public class {label}
      </div>
      <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
    </div>
  );

  const SideTitle = ({ icon: Icon, label, color }) => (
    <div
      className="mb-2 flex items-center gap-2 border-b pb-1.5"
      style={{ borderColor: BORDER }}
    >
      <Icon size={9} style={{ color }} />
      <div
        className="text-[6.7px] font-black uppercase tracking-[0.11em]"
        style={{ color }}
      >
        folder {label}
      </div>
    </div>
  );

  const Line = ({ number, children, color = TEXT }) => (
    <div className="grid grid-cols-[15px_1fr] gap-2 text-[7.1px] leading-[1.35]">
      <span
        className="select-none text-right"
        style={{ color: FAINT }}
      >
        {number}
      </span>
      <span style={{ color, overflowWrap: 'anywhere' }}>
        {children}
      </span>
    </div>
  );

  const CompactHeader = () => (
    <header className="mb-3">
      <div
        className="overflow-hidden rounded-[8px] border"
        style={{
          backgroundColor: APP_BAR,
          borderColor: BORDER,
          boxShadow: '0 7px 18px rgba(0,0,0,0.2)',
        }}
      >
        {/* Ultra-compact IDE chrome */}
        <div
          className="flex items-center justify-between border-b px-3 py-1.5"
          style={{ borderColor: BORDER }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff5f56]" />
            <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
            <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
          </div>

          <div
            className="flex items-center gap-2 text-[6px] font-bold uppercase tracking-[0.12em]"
            style={{ color: MUTED }}
          >
            <Code2 size={8} style={{ color: CYAN }} />
            ResumeWorkspace
          </div>

          <div className="text-[5.8px]" style={{ color: FAINT }}>
            Profile.cs
          </div>
        </div>

        <div
          className="grid grid-cols-[17mm_1fr] items-center gap-3 px-3 py-2.5"
          style={{ backgroundColor: PANEL }}
        >
          <div
            className="overflow-hidden rounded-[6px] border p-[2px]"
            style={{
              borderColor: BORDER,
              backgroundColor: BG,
            }}
          >
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Profile"
                className="h-[14mm] w-full rounded-[4px] object-cover"
              />
            ) : (
              <div
                className="flex h-[14mm] items-center justify-center rounded-[4px]"
                style={{
                  backgroundColor: PANEL_2,
                  color: FAINT,
                }}
              >
                <UserRound size={18} />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <h1
                className="break-words text-[18px] font-black leading-none tracking-[-0.025em]"
                style={{ color: TEXT }}
              >
                {personal.name || 'Your Name'}
              </h1>

              {personal.title ? (
                <div
                  className="pb-[1px] text-[7.5px] font-bold"
                  style={{ color: CYAN }}
                >
                  {'// '}
                  {personal.title}
                </div>
              ) : null}
            </div>

            <div
              className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[6.1px]"
              style={{ color: MUTED }}
            >
              {personal.email ? (
                <span className="flex items-center gap-1 break-all">
                  <Mail size={7} style={{ color: CYAN }} />
                  {personal.email}
                </span>
              ) : null}

              {personal.phone ? (
                <span className="flex items-center gap-1">
                  <Phone size={7} style={{ color: GREEN }} />
                  {personal.phone}
                </span>
              ) : null}

              {personal.location ? (
                <span className="flex items-center gap-1">
                  <MapPin size={7} style={{ color: PURPLE }} />
                  {personal.location}
                </span>
              ) : null}

              {personal.linkedin ? (
                <span className="flex items-center gap-1 break-all">
                  <Linkedin size={7} style={{ color: CYAN }} />
                  {personal.linkedin}
                </span>
              ) : null}

        {personal.github ? (
                <span className="flex items-center gap-1 break-all">
                  <Github size={7} style={{ color: CYAN }} />
                  {personal.github}
                </span>
              ) : null}

        {personal.portfolio ? (
                <span className="flex items-center gap-1 break-all">
                  <Globe size={7} style={{ color: CYAN }} />
                  {personal.portfolio}
                </span>
              ) : null}

        {personal.website ? (
                <span className="flex items-center gap-1 break-all">
                  <Globe size={7} style={{ color: CYAN }} />
                  {personal.website}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  const SummaryBlock = () => {
    if (!personal.summary?.trim()) return null;

    const lines = cleanLines(personal.summary);
    const summaryLines = lines.length ? lines : [personal.summary];

    return (
      <section className="mb-2.5">
        <MainTitle icon={Code2} label="PROFILE" color={GREEN} />
        <div
          className="rounded-[6px] border py-2 pr-2.5"
          style={{
            backgroundColor: EDITOR,
            borderColor: BORDER,
          }}
        >
          <Line number="1" color={GREEN}>
            {'/// <summary>'}
          </Line>

          {summaryLines.map((line, index) => (
            <Line
              key={`summary-${index}`}
              number={index + 2}
              color={GREEN}
            >
              {'/// '}
              {line}
            </Line>
          ))}

          <Line number={summaryLines.length + 2} color={GREEN}>
            {'/// </summary>'}
          </Line>
        </div>
      </section>
    );
  };

  const ExperienceBlock = () => (
    <section>
      <MainTitle
        icon={TerminalSquare}
        label="EXPERIENCE"
        color={CYAN}
      />

      <div className="space-y-2">
        {experience.map((item, index) => {
          const methodName = safeIdentifier(
            item.role,
            `Role${index + 1}`
          );
          const descLines = cleanLines(item.desc);

          let lineNo = 1;

          return (
            <article
              key={item.id || `experience-${index}`}
              className="break-inside-avoid"
            >
              <div
                className="rounded-[6px] border py-2 pr-2.5"
                style={{
                  backgroundColor: EDITOR,
                  borderColor: BORDER,
                }}
              >
                <Line number={lineNo++}>
                  <span style={{ color: CYAN }}>
                    public async Task
                  </span>{' '}
                  <span style={{ color: YELLOW }}>
                    {methodName}
                  </span>
                  {'() {'}
                </Line>

                {item.company ? (
                  <Line number={lineNo++}>
                    {'  '}
                    <span style={{ color: PURPLE }}>var</span>{' '}
                    company ={' '}
                    <span style={{ color: RED }}>
                      &quot;{item.company}&quot;
                    </span>
                    ;
                  </Line>
                ) : null}

                {item.date ? (
                  <Line number={lineNo++}>
                    {'  '}
                    <span style={{ color: PURPLE }}>var</span>{' '}
                    period ={' '}
                    <span style={{ color: RED }}>
                      &quot;{item.date}&quot;
                    </span>
                    ;
                  </Line>
                ) : null}

                {descLines.map((line, descIndex) => (
                  <Line
                    key={`${item.id || index}-${descIndex}`}
                    number={lineNo++}
                    color={GREEN}
                  >
                    {'  // '}
                    {line}
                  </Line>
                ))}

                <Line number={lineNo++}>{'}'}</Line>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );

  const SidebarContent = () => (
    <aside
      className="h-full rounded-[7px] border p-[2.5mm]"
      style={{
        backgroundColor: PANEL,
        borderColor: BORDER,
      }}
    >
      <div
        className="mb-2 flex items-center gap-2 border-b pb-1.5 text-[6.2px] font-bold uppercase tracking-[0.12em]"
        style={{
          borderColor: BORDER,
          color: MUTED,
        }}
      >
        <FolderOpen size={8} style={{ color: CYAN }} />
        Explorer
      </div>

      {allSkills.length > 0 && (
        <section className="mb-3">
          <SideTitle icon={Braces} label="STACK" color={PURPLE} />

          <div className="grid grid-cols-1 gap-1">
            {allSkills.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-1.5 text-[6.4px]"
                style={{ color: TEXT }}
              >
                <ChevronRight size={7} style={{ color: FAINT }} />
                <Code2 size={7} style={{ color: CYAN }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-3">
          <SideTitle
            icon={GraduationCap}
            label="EDUCATION"
            color={GREEN}
          />

          <div className="space-y-2">
            {education.map((item, index) => (
              <article key={item.id || `education-${index}`}>
                <div className="flex items-start gap-1.5">
                  <FileCode2
                    size={8}
                    className="mt-0.5 shrink-0"
                    style={{ color: GREEN }}
                  />

                  <div className="min-w-0">
                    <div
                      className="text-[6.6px] font-bold leading-[1.2]"
                      style={{ color: TEXT }}
                    >
                      {item.degree || item.school}
                    </div>

                    {item.degree && item.school ? (
                      <div
                        className="mt-0.5 text-[6px] leading-[1.25]"
                        style={{ color: MUTED }}
                      >
                        {item.school}
                      </div>
                    ) : null}

                    {item.date ? (
                      <div
                        className="mt-0.5 text-[5.8px]"
                        style={{ color: GREEN }}
                      >
                        {'// '}
                        {item.date}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mb-3">
          <SideTitle
            icon={FolderGit2}
            label="PROJECTS"
            color={ORANGE}
          />

          <div className="space-y-1.5">
            {projects.map((item, index) => (
              <article
                key={item.id || `project-${index}`}
                className="rounded-[5px] border px-2 py-1.5"
                style={{
                  backgroundColor: PANEL_2,
                  borderColor: BORDER,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <FolderOpen size={8} style={{ color: ORANGE }} />
                  <div
                    className="text-[6.4px] font-bold"
                    style={{ color: TEXT }}
                  >
                    {item.name}
                  </div>
                </div>

                {item.desc ? (
                  <div
                    className="mt-1 text-[5.8px] leading-[1.25]"
                    style={{ color: MUTED }}
                  >
                    {'// '}
                    {item.desc}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="mb-3">
          <SideTitle
            icon={Award}
            label="CERTIFICATIONS"
            color={YELLOW}
          />

          <div className="space-y-1.5">
            {certifications.map((item, index) => (
              <article
                key={item.id || `certification-${index}`}
                className="flex items-start gap-1.5"
              >
                <Award
                  size={7}
                  className="mt-0.5 shrink-0"
                  style={{ color: YELLOW }}
                />

                <div>
                  <div
                    className="text-[6.2px] font-bold leading-[1.2]"
                    style={{ color: TEXT }}
                  >
                    {item.name}
                  </div>

                  {(item.issuer || item.date) ? (
                    <div
                      className="mt-0.5 text-[5.7px]"
                      style={{ color: MUTED }}
                    >
                      {[item.issuer, item.date]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {languages.length > 0 && (
        <section className="mb-3">
          <SideTitle
            icon={LanguagesIcon}
            label="LANGUAGES"
            color={CYAN}
          />

          <div className="space-y-1">
            {languages.map((item, index) => {
              const name =
                typeof item === 'string'
                  ? item
                  : item?.name || 'Language';

              const level =
                typeof item === 'string'
                  ? ''
                  : item?.level || '';

              return (
                <div
                  key={item?.id || `${name}-${index}`}
                  className="flex items-center justify-between gap-2 text-[6.1px]"
                >
                  <span style={{ color: TEXT }}>{name}</span>
                  {level ? (
                    <span style={{ color: PURPLE }}>{level}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {awards.length > 0 && (
        <section>
          <SideTitle icon={Award} label="AWARDS" color={RED} />

          <div className="space-y-1.5">
            {awards.map((item, index) => (
              <article
                key={item.id || `award-${index}`}
                className="flex items-start gap-1.5"
              >
                <Award
                  size={7}
                  className="mt-0.5 shrink-0"
                  style={{ color: RED }}
                />

                <div>
                  <div
                    className="text-[6.2px] font-bold leading-[1.2]"
                    style={{ color: TEXT }}
                  >
                    {item.name}
                  </div>

                  {(item.issuer || item.date) ? (
                    <div
                      className="mt-0.5 text-[5.7px]"
                      style={{ color: MUTED }}
                    >
                      {[item.issuer, item.date]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </aside>
  );

  const ResumeBody = () => (
    <div
      className="grid"
      style={{
        width: INNER_WIDTH,
        gridTemplateColumns: `${EXPLORER_WIDTH} ${EDITOR_WIDTH}`,
        columnGap: COLUMN_GAP,
        alignItems: 'start',
      }}
    >
      <SidebarContent />

      <main>
        <SummaryBlock />
        <ExperienceBlock />
      </main>
    </div>
  );

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled || !naturalRef.current) return;

      const naturalHeight =
        naturalRef.current.getBoundingClientRect().height || 0;

      const availablePx =
        (parseFloat(BODY_HEIGHT) / 25.4) * 96;

      if (!naturalHeight || !availablePx) {
        setFitScale(1);
        return;
      }

      const requiredScale =
        Math.min(1, availablePx / naturalHeight);

      // Preserve readability. Header compaction should do most of the work;
      // scaling is only a final one-page safety mechanism.
      setFitScale(
        Math.max(0.82, Number(requiredScale.toFixed(3)))
      );
    };

    const run = () =>
      window.requestAnimationFrame(measure);

    run();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready.then(run).catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(run)
        : null;

    if (observer && naturalRef.current) {
      observer.observe(naturalRef.current);
    }

    window.addEventListener('resize', run);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [
    BODY_HEIGHT,
    personal,
    experience,
    education,
    allSkills,
    projects,
    certifications,
    languages,
    awards,
  ]);

  return (
    <div
      className="resume-preview-wrapper relative mx-auto w-full max-w-[210mm]"
      style={{
        backgroundColor: '#c9d1d9',
        fontFamily:
          '"JetBrains Mono", "IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
      }}
    >
      {/* Natural-height measurement */}
      <div
        className="pointer-events-none absolute left-[-99999px] top-0 opacity-0"
        aria-hidden="true"
        style={{ width: INNER_WIDTH }}
      >
        <CompactHeader />
        <div ref={naturalRef}>
          <ResumeBody />
        </div>
      </div>

      {/* Strict one-page A4 */}
      <section
        className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_20px_58px_rgba(0,0,0,0.30)] print:shadow-none"
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          padding: `${PAGE_PAD_TOP} ${PAGE_PAD_X} ${PAGE_PAD_BOTTOM}`,
          boxSizing: 'border-box',
          backgroundColor: BG,
          color: TEXT,
        }}
      >
        <CompactHeader />

        <div
          style={{
            height: BODY_HEIGHT,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: INNER_WIDTH,
              transform: `scale(${fitScale})`,
              transformOrigin: 'top left',
            }}
          >
            <ResumeBody />
          </div>
        </div>

        <div
          className="absolute bottom-[3.5mm] left-[8mm] right-[8mm] flex items-center justify-between rounded-[4px] px-3 py-1 text-[5.7px] font-bold"
          style={{
            backgroundColor: '#0969da',
            color: '#ffffff',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FolderGit2 size={7} />
              main*
            </span>
            <span className="flex items-center gap-1">
              <ServerCog size={7} />
              UTF-8
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>{'Ln 1, Col 1'}</span>
            <span>{'Spaces: 2'}</span>
            <span>1 / 1</span>
          </div>
        </div>
      </section>

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html,
          body {
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

export default ClassFileResume;
