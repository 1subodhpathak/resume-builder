import React from 'react';
import {
  Globe,
  Github,
  Award,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  FolderKanban,
  GraduationCap,
  Languages as LanguagesIcon,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  PieChart,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
} from 'lucide-react';
import { PRINT_STYLE_BLOCK, splitLines } from './creativeTemplateUtils';

const NAVY = '#0f172a';
const NAVY_2 = '#162033';
const TEAL = '#14b8a6';
const TEAL_LIGHT = '#5eead4';
const CYAN = '#67e8f9';
const GOLD = '#fbbf24';
const PAPER = '#f5f8fa';
const WHITE = '#ffffff';
const INK = '#1f2937';
const BODY = '#566575';
const MUTED = '#8a98a8';
const BORDER = '#dbe5eb';
const SOFT = '#f8fafc';

const toArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const InfoNavy = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
  } = data || {};

  const coreSkills = toArray(skills.core);
  const technicalSkills = toArray(skills.technical);
  const softSkills = toArray(skills.soft);
  const allSkills = [...coreSkills, ...technicalSkills, ...softSkills];
  const credentials = [...toArray(certifications), ...toArray(awards)];

  const totalSkills = Math.max(1, allSkills.length);
  const coreDeg = (coreSkills.length / totalSkills) * 360;
  const techDeg = (technicalSkills.length / totalSkills) * 360;
  const softDeg = Math.max(0, 360 - coreDeg - techDeg);

  const pageOneExperience = experience.slice(0, 3);
  const pageTwoExperience = experience.slice(3);
  const showPageTwo =
    pageTwoExperience.length > 0 ||
    projects.length > 0 ||
    certifications.length > 0 ||
    awards.length > 0 ||
    languages.length > 0;

  const Panel = ({ title, icon: Icon, right, children, className = '' }) => (
    <section
      className={`rounded-[16px] border bg-white p-[4.5mm] ${className}`}
      style={{ borderColor: BORDER, boxShadow: '0 5px 16px rgba(15,23,42,0.045)' }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
            style={{ backgroundColor: '#e9fbf8', color: TEAL }}
          >
            <Icon size={13} />
          </div>
          <h2 className="text-[9.4px] font-black uppercase tracking-[0.13em]" style={{ color: NAVY }}>
            {title}
          </h2>
        </div>
        {right ? (
          <span className="shrink-0 text-[6.8px] font-black uppercase tracking-[0.12em]" style={{ color: MUTED }}>
            {right}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );

  const Stat = ({ icon: Icon, value, label }) => (
    <div
      className="rounded-[14px] border bg-white px-[3.5mm] py-[3mm]"
      style={{ borderColor: BORDER }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-[8px]"
          style={{ backgroundColor: '#e9fbf8', color: TEAL }}
        >
          <Icon size={13} />
        </div>
        <span className="text-[5.8px] font-black uppercase tracking-[0.12em]" style={{ color: MUTED }}>
          KPI
        </span>
      </div>
      <div className="text-[17px] font-black leading-none" style={{ color: NAVY }}>{value}</div>
      <div className="mt-1 text-[6.8px] font-black uppercase tracking-[0.12em]" style={{ color: BODY }}>{label}</div>
    </div>
  );

  const SkillDonut = () => (
    <div className="flex items-center gap-4">
      <div
        className="relative h-[29mm] w-[29mm] shrink-0 rounded-full"
        style={{
          background: `conic-gradient(
            ${TEAL} 0deg ${coreDeg}deg,
            ${CYAN} ${coreDeg}deg ${coreDeg + techDeg}deg,
            ${GOLD} ${coreDeg + techDeg}deg ${coreDeg + techDeg + softDeg}deg
          )`,
        }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-[19mm] w-[19mm] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white">
          <div className="text-[15px] font-black leading-none" style={{ color: NAVY }}>{allSkills.length}</div>
          <div className="mt-1 text-[5.8px] font-black uppercase tracking-[0.1em]" style={{ color: MUTED }}>Skills</div>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {[
          { label: 'Core', value: coreSkills.length, color: TEAL },
          { label: 'Technical', value: technicalSkills.length, color: CYAN },
          { label: 'Soft', value: softSkills.length, color: GOLD },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[7.2px] font-bold" style={{ color: BODY }}>{item.label}</span>
            </div>
            <span className="text-[7.2px] font-black" style={{ color: NAVY }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const ExperienceCard = ({ item, index }) => {
    const bullets = splitLines(item.desc).slice(0, 4);
    return (
      <article className="relative pl-[6mm]">
        <div
          className="absolute left-[1.8mm] top-0 bottom-0 w-px"
          style={{ backgroundColor: BORDER }}
        />
        <div
          className="absolute left-[0.6mm] top-[1.3mm] h-2.5 w-2.5 rounded-full border-[2px] border-white"
          style={{ backgroundColor: index % 2 === 0 ? TEAL : GOLD, boxShadow: '0 0 0 1px #dbe5eb' }}
        />
        <div className="rounded-[14px] border bg-white px-[4mm] py-[3.4mm]" style={{ borderColor: BORDER }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[9.8px] font-black uppercase leading-[1.22]" style={{ color: NAVY }}>
                {item.role}
              </h3>
              {item.company ? (
                <div className="mt-1 text-[6.8px] font-black uppercase tracking-[0.11em]" style={{ color: TEAL }}>
                  {item.company}
                </div>
              ) : null}
            </div>
            {item.date ? (
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[6.2px] font-black uppercase tracking-[0.08em] text-slate-500">
                {item.date}
              </span>
            ) : null}
          </div>
          {bullets.length ? (
            <div className="mt-2.5 space-y-1.5">
              {bullets.map((line, i) => (
                <div key={`${item.id || index}-${i}`} className="flex items-start gap-2 text-[7.6px] leading-[1.43]" style={{ color: BODY }}>
                  <span className="mt-[4px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: i % 2 === 0 ? TEAL : GOLD }} />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  };

  const ResumeHeader = ({ compact = false, page = 1 }) => (
    <header
      className={compact ? 'mb-[4mm]' : 'mb-[5mm]'}
    >
      <div
        className="overflow-hidden rounded-[18px]"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_2} 100%)` }}
      >
        <div className={compact ? 'flex items-center justify-between px-[5mm] py-[3.5mm]' : 'grid grid-cols-[25mm_1fr_54mm] items-center gap-[5mm] px-[5mm] py-[4.5mm]'}>
          {!compact ? (
            <div
              className="overflow-hidden rounded-[12px] border p-1"
              style={{ borderColor: 'rgba(255,255,255,.16)', backgroundColor: 'rgba(255,255,255,.05)' }}
            >
              {personal.photo ? (
                <img src={personal.photo} alt="Profile" className="h-[23mm] w-full rounded-[9px] object-cover" />
              ) : (
                <div className="flex h-[23mm] items-center justify-center rounded-[9px] text-white/50">
                  <UserRound size={25} />
                </div>
              )}
            </div>
          ) : null}

          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded-full px-2.5 py-1 text-[5.8px] font-black uppercase tracking-[0.12em]" style={{ backgroundColor: 'rgba(20,184,166,.16)', color: TEAL_LIGHT }}>
               
              </span>
              {compact ? <span className="text-[6px] font-black uppercase tracking-[0.1em] text-white/40">Page {page}</span> : null}
            </div>
            <h1 className={compact ? 'text-[15px]' : 'text-[23px]'} style={{ color: WHITE, fontWeight: 900, lineHeight: 1 }}>
              {personal.name || 'Your Name'}
            </h1>
            {personal.title ? (
              <div className="mt-1.5 text-[7px] font-black uppercase tracking-[0.14em]" style={{ color: TEAL_LIGHT }}>
                {personal.title}
              </div>
            ) : null}
            {!compact && personal.summary ? (
              <p className="mt-2.5 max-w-[96%] text-[7.2px] leading-[1.48] text-white/70">
                {personal.summary}
              </p>
            ) : null}
          </div>

          {!compact ? (
            <div className="space-y-2 text-[6.6px] text-white/75">
              {personal.phone ? <div className="flex items-start gap-2"><Phone size={9} color={TEAL_LIGHT} className="mt-0.5 shrink-0" /><span>{personal.phone}</span></div> : null}
              {personal.email ? <div className="flex items-start gap-2 break-all"><Mail size={9} color={TEAL_LIGHT} className="mt-0.5 shrink-0" /><span>{personal.email}</span></div> : null}
              {personal.location ? <div className="flex items-start gap-2"><MapPin size={9} color={TEAL_LIGHT} className="mt-0.5 shrink-0" /><span>{personal.location}</span></div> : null}
              {personal.linkedin ? <div className="flex items-start gap-2 break-all"><Linkedin size={9} color={TEAL_LIGHT} className="mt-0.5 shrink-0" /><span>{personal.linkedin}</span></div> : null}

        {personal.github ? <div className="flex items-start gap-2 break-all"><Github size={9} color={TEAL_LIGHT} className="mt-0.5 shrink-0" /><span>{personal.github}</span></div> : null}

        {personal.portfolio ? <div className="flex items-start gap-2 break-all"><Globe size={9} color={TEAL_LIGHT} className="mt-0.5 shrink-0" /><span>{personal.portfolio}</span></div> : null}

        {personal.website ? <div className="flex items-start gap-2 break-all"><Globe size={9} color={TEAL_LIGHT} className="mt-0.5 shrink-0" /><span>{personal.website}</span></div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );

  const PageShell = ({ children, page, last = false }) => (
    <section
      className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden"
      style={{
        boxSizing: 'border-box',
        padding: '9mm 10mm 11mm',
        backgroundColor: PAPER,
        breakAfter: last ? 'auto' : 'page',
        pageBreakAfter: last ? 'auto' : 'always',
      }}
    >
      {children}
      <footer className="absolute bottom-[4mm] left-[10mm] right-[10mm] flex items-center justify-between border-t pt-1.5 text-[5.8px] font-black uppercase tracking-[0.1em]" style={{ borderColor: BORDER, color: MUTED }}>
        <span style={{ color: TEAL }}>Confidential</span>
        <span>Page {page}{showPageTwo ? ' / 2' : ' / 1'}</span>
      </footer>
    </section>
  );

  return (
    <div className="resume-preview-wrapper mx-auto w-full max-w-[210mm] bg-slate-200 print:bg-white" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <PageShell page={1} last={!showPageTwo}>
        <ResumeHeader />

        <div className="grid grid-cols-4 gap-[3mm]">
          <Stat icon={BriefcaseBusiness} value={experience.length} label="Roles" />
          <Stat icon={Database} value={allSkills.length} label="Skills" />
          <Stat icon={FolderKanban} value={projects.length} label="Projects" />
          <Stat icon={Award} value={credentials.length} label="Credentials" />
        </div>

        <div className="mt-[4mm] grid grid-cols-[1.7fr_1fr] gap-[4mm] items-start">
          <Panel title="Career Timeline" icon={TrendingUp} right={`${pageOneExperience.length} roles`}>
            <div className="space-y-[3mm]">
              {pageOneExperience.length ? (
                pageOneExperience.map((item, index) => (
                  <ExperienceCard key={item.id || `${item.role}-${index}`} item={item} index={index} />
                ))
              ) : (
                <div className="rounded-[12px] border border-dashed px-4 py-5 text-center text-[7px]" style={{ borderColor: BORDER, color: MUTED }}>
                  Add experience entries to populate the career timeline.
                </div>
              )}
            </div>
          </Panel>

          <div className="space-y-[4mm]">
            <Panel title="Skill Mix" icon={PieChart} right={`${allSkills.length} total`}>
              <SkillDonut />
              {technicalSkills.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {technicalSkills.slice(0, 7).map((skill, index) => (
                    <span key={`${skill}-${index}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-[6.2px] font-bold" style={{ color: BODY }}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
            </Panel>

            <Panel title="Education" icon={GraduationCap} right={`${education.length} records`}>
              <div className="space-y-2.5">
                {education.slice(0, 3).map((edu, index) => (
                  <div key={`${edu.degree}-${index}`} className="rounded-[10px] bg-slate-50 px-3 py-2.5">
                    <div className="text-[7.2px] font-black leading-[1.25]" style={{ color: NAVY }}>{edu.degree || edu.school}</div>
                    {edu.degree && edu.school ? <div className="mt-1 text-[6.4px]" style={{ color: BODY }}>{edu.school}</div> : null}
                    {edu.date ? <div className="mt-1 text-[6px] font-bold" style={{ color: TEAL }}>{edu.date}</div> : null}
                  </div>
                ))}
              </div>
            </Panel>

            {languages.length ? (
              <Panel title="Languages" icon={LanguagesIcon} right={`${languages.length}`}>
                <div className="space-y-2">
                  {languages.slice(0, 4).map((language, index) => (
                    <div key={`${language.name}-${index}`} className="flex items-center justify-between gap-3 rounded-[9px] bg-slate-50 px-3 py-2">
                      <span className="text-[6.7px] font-bold" style={{ color: NAVY }}>{language.name}</span>
                      <span className="rounded-full bg-white px-2 py-1 text-[5.8px] font-black" style={{ color: TEAL }}>{language.level || 'Listed'}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      </PageShell>

      {showPageTwo ? (
        <PageShell page={2} last>
          <ResumeHeader compact page={2} />

          <div className="grid grid-cols-[1.45fr_1fr] gap-[4mm] items-start">
            <div className="space-y-[4mm]">
              {pageTwoExperience.length ? (
                <Panel title="Additional Experience" icon={BriefcaseBusiness} right={`${pageTwoExperience.length} roles`}>
                  <div className="space-y-[3mm]">
                    {pageTwoExperience.map((item, index) => (
                      <ExperienceCard key={item.id || `${item.role}-${index}-more`} item={item} index={index + 3} />
                    ))}
                  </div>
                </Panel>
              ) : null}

              {projects.length ? (
                <Panel title="Strategic Projects" icon={FolderKanban} right={`${projects.length} projects`}>
                  <div className="grid grid-cols-2 gap-[3mm]">
                    {projects.map((project, index) => (
                      <article key={project.id || `${project.name}-${index}`} className="rounded-[12px] border bg-slate-50 px-3.5 py-3" style={{ borderColor: BORDER }}>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="text-[7.2px] font-black uppercase leading-[1.25]" style={{ color: NAVY }}>{project.name}</h3>
                          <CheckCircle2 size={11} color={index % 2 === 0 ? TEAL : GOLD} className="shrink-0" />
                        </div>
                        <p className="text-[6.6px] leading-[1.42]" style={{ color: BODY }}>{project.desc}</p>
                      </article>
                    ))}
                  </div>
                </Panel>
              ) : null}
            </div>

            <div className="space-y-[4mm]">
              {coreSkills.length || softSkills.length ? (
                <Panel title="Capability Map" icon={Target} right={`${coreSkills.length + softSkills.length} items`}>
                  {coreSkills.length ? (
                    <div>
                      <div className="mb-2 text-[6px] font-black uppercase tracking-[0.12em]" style={{ color: MUTED }}>Core Expertise</div>
                      <div className="flex flex-wrap gap-1.5">
                        {coreSkills.map((skill, index) => (
                          <span key={`${skill}-${index}`} className="rounded-full px-2.5 py-1 text-[6.1px] font-bold" style={{ backgroundColor: '#e9fbf8', color: TEAL }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {softSkills.length ? (
                    <div className="mt-3">
                      <div className="mb-2 text-[6px] font-black uppercase tracking-[0.12em]" style={{ color: MUTED }}>Leadership & Collaboration</div>
                      <div className="flex flex-wrap gap-1.5">
                        {softSkills.map((skill, index) => (
                          <span key={`${skill}-${index}`} className="rounded-full px-2.5 py-1 text-[6.1px] font-bold" style={{ backgroundColor: '#fff7dd', color: '#9a6a00' }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </Panel>
              ) : null}

              {certifications.length ? (
                <Panel title="Certifications" icon={Award} right={`${certifications.length}`}>
                  <div className="space-y-2.5">
                    {certifications.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="rounded-[10px] bg-slate-50 px-3 py-2.5">
                        <div className="text-[6.9px] font-black leading-[1.3]" style={{ color: NAVY }}>{item.name}</div>
                        {(item.issuer || item.date) ? <div className="mt-1 text-[6.1px]" style={{ color: BODY }}>{[item.issuer, item.date].filter(Boolean).join(' • ')}</div> : null}
                      </div>
                    ))}
                  </div>
                </Panel>
              ) : null}

              {awards.length ? (
                <Panel title="Recognition" icon={Trophy} right={`${awards.length}`}>
                  <div className="space-y-2.5">
                    {awards.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="flex items-start gap-2 rounded-[10px] bg-slate-50 px-3 py-2.5">
                        <Sparkles size={10} color={index % 2 === 0 ? TEAL : GOLD} className="mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[6.8px] font-black leading-[1.28]" style={{ color: NAVY }}>{item.name}</div>
                          {(item.issuer || item.date) ? <div className="mt-1 text-[6.1px]" style={{ color: BODY }}>{[item.issuer, item.date].filter(Boolean).join(' • ')}</div> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              ) : null}
            </div>
          </div>
        </PageShell>
      ) : null}

      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .resume-preview-wrapper { background: white !important; }
        }
      `}</style>
      <style>{PRINT_STYLE_BLOCK}</style>
    </div>
  );
};

export default InfoNavy;
