import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Award,
  Camera,
  Clapperboard,
  Film,
  GraduationCap,
  Mail,
  MapPin,
  Mic2,
  Phone,
  Star,
  Theater,
  Video,
} from 'lucide-react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const ActorSpotlight = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    awards = [],
    projects = [],
    certifications = [],
    languages = [],
  } = data || {};

  const { core = [], technical = [], soft = [] } = skills;

  const PAGE_WIDTH = '210mm';
  const PAGE_HEIGHT = '297mm';

  const PAPER = '#fbfaf7';
  const BLACK = '#111111';
  const GREY = '#6d6a65';
  const BORDER = '#d9d3c9';
  const CRIMSON = '#8f1d2c';
  const GOLD = '#b79355';

  const bodyAreaRef = useRef(null);
  const bodyInnerRef = useRef(null);
  const [bodyScale, setBodyScale] = useState(1);

  const actingSkills = useMemo(
    () => [...core, ...soft].filter(Boolean),
    [core, soft]
  );

  const productionSkills = useMemo(
    () => technical.filter(Boolean),
    [technical]
  );

  const portfolioHighlights = useMemo(
    () =>
      [...projects.map((item) => item.name), ...awards.map((item) => item.name)]
        .filter(Boolean)
        .slice(0, 6),
    [projects, awards]
  );

  const splitIndex = Math.ceil(experience.length / 2);
  const firstHalf = experience.slice(0, splitIndex);
  const secondHalf = experience.slice(splitIndex);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const fitBody = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        const outer = bodyAreaRef.current;
        const inner = bodyInnerRef.current;

        if (!outer || !inner) return;

        const activeScale = Math.max(bodyScale, 0.01);
        const naturalHeight = inner.scrollHeight / activeScale;
        const availableHeight = outer.clientHeight;

        if (!naturalHeight || !availableHeight) return;

        const nextScale = Math.min(1, (availableHeight / naturalHeight) * 0.988);
        const safeScale = Math.max(0.78, nextScale);

        if (Math.abs(safeScale - bodyScale) > 0.005) {
          setBodyScale(safeScale);
        }
      });
    };

    fitBody();

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(fitBody).catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fitBody) : null;

    if (observer) {
      if (bodyAreaRef.current) observer.observe(bodyAreaRef.current);
      if (bodyInnerRef.current) observer.observe(bodyInnerRef.current);
    }

    window.addEventListener('resize', fitBody);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', fitBody);
    };
  }, [bodyScale]);

  const CoverBadge = ({ icon: Icon, children }) => (
    <div
      className="inline-flex items-center gap-2 border px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.17em]"
      style={{
        borderColor: 'rgba(255,255,255,0.45)',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.20)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <Icon size={11} />
      {children}
    </div>
  );

  const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-3">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center border"
          style={{ borderColor: BLACK, color: BLACK }}
        >
          <Icon size={14} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="text-[9.4px] font-black uppercase tracking-[0.18em]"
            style={{ color: BLACK }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              className="mt-0.5 text-[6.5px] font-bold uppercase tracking-[0.14em]"
              style={{ color: GREY }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div className="h-px flex-1" style={{ backgroundColor: BORDER }} />
      </div>
    </div>
  );

  const CreditItem = ({ item, index }) => {
    const bullets = splitLines(item.desc);

    return (
      <article className="mb-3 break-inside-avoid">
        <div className="border-b pb-3" style={{ borderColor: BORDER }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div
                className="text-[10.2px] font-black uppercase leading-tight"
                style={{ color: BLACK }}
              >
                {item.role || 'Role'}
              </div>
              {item.company ? (
                <div
                  className="mt-1 text-[7.4px] font-black uppercase tracking-[0.12em]"
                  style={{ color: CRIMSON }}
                >
                  {item.company}
                </div>
              ) : null}
            </div>

            {item.date ? (
              <div
                className="shrink-0 text-[6.7px] font-black uppercase tracking-[0.09em]"
                style={{ color: GREY }}
              >
                {item.date}
              </div>
            ) : null}
          </div>

          {bullets.length ? (
            <div className="mt-2 space-y-1">
              {bullets.map((line, lineIndex) => (
                <div
                  key={`${index}-${lineIndex}`}
                  className="flex items-start gap-2 text-[8.05px] leading-[1.42]"
                  style={{ color: '#58544f' }}
                >
                  <span style={{ color: CRIMSON }}>—</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  };

  const SmallCard = ({ title, meta, body, icon: Icon }) => (
    <article
      className="mb-2.5 border px-3 py-2.5 break-inside-avoid"
      style={{ borderColor: BORDER, backgroundColor: '#ffffff' }}
    >
      <div className="flex items-start gap-2">
        {Icon ? (
          <Icon size={12} className="mt-0.5 shrink-0" style={{ color: CRIMSON }} />
        ) : null}

        <div className="min-w-0">
          <div
            className="text-[8.4px] font-black uppercase leading-[1.2]"
            style={{ color: BLACK }}
          >
            {title}
          </div>

          {meta ? (
            <div
              className="mt-1 text-[6.7px] font-bold uppercase tracking-[0.06em]"
              style={{ color: GREY }}
            >
              {meta}
            </div>
          ) : null}

          {body ? (
            <div
              className="mt-1.5 text-[7.4px] leading-[1.38]"
              style={{ color: '#625e58' }}
            >
              {body}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );

  const CompactList = ({ items = [], icon: Icon, color = BLACK }) => (
    <div className="space-y-1.5">
      {items.map((item, index) => (
        <div
          key={`${String(item)}-${index}`}
          className="flex items-start gap-1.5 text-[7px] font-bold uppercase leading-[1.25] tracking-[0.06em]"
          style={{ color: BLACK }}
        >
          {Icon ? <Icon size={8} className="mt-0.5 shrink-0" style={{ color }} /> : null}
          <span>{item}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="resume-preview-wrapper mx-auto w-full max-w-[210mm] font-sans"
      style={{ backgroundColor: '#d8d5d0' }}
    >
      <div className="space-y-5 print:space-y-0">
        {/* PAGE 1 */}
        <section
          className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(0,0,0,0.18)] print:shadow-none"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            backgroundColor: BLACK,
            breakAfter: 'page',
            pageBreakAfter: 'always',
          }}
        >
          <div className="absolute inset-0">
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Actor portrait"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#2d2d2d,#111111)' }}
              >
                <Camera size={64} color="#777" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black via-black/68 to-transparent" />
          </div>

          <div className="relative z-10 flex h-full flex-col px-[11mm] pb-[15mm] pt-[10mm]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[7px] font-black uppercase tracking-[0.3em] text-white">
                  Actor Portfolio
                </div>
                <div className="mt-1 text-[6px] font-bold uppercase tracking-[0.18em] text-[#d6d1ca]">
                  Film · Television · Theatre · Editorial
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <CoverBadge icon={Clapperboard}>Screen</CoverBadge>
                <CoverBadge icon={Theater}>Stage</CoverBadge>
              </div>
            </div>

            <div className="mt-[28mm] w-[48%]">
              <div
                className="mb-3 inline-block px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.18em] text-white"
                style={{ backgroundColor: CRIMSON }}
              >
                Casting Profile
              </div>

              <h1
                className="text-[46px] font-black uppercase leading-[0.82] tracking-[-0.055em] text-white"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {personal.name || 'Your Name'}
              </h1>

              <div
                className="mt-4 max-w-[90%] text-[10px] font-black uppercase leading-[1.25] tracking-[0.08em]"
                style={{ color: GOLD }}
              >
                {personal.title || 'Actor'}
              </div>

              <div
                className="mt-6 max-w-[86%] text-[8.2px] font-medium leading-[1.55] text-[#ded8d0]"
              >
                {personal.summary ||
                  'Screen and stage performer with a distinctive visual presence, versatile range, and professional on-set discipline.'}
              </div>
            </div>

            <div className="absolute bottom-[66mm] right-[10mm] w-[39%]">
              {portfolioHighlights.length > 0 ? (
                <>
                  <div className="mb-2 text-right text-[6.8px] font-black uppercase tracking-[0.2em] text-white">
                    Featured
                  </div>

                  <div className="space-y-1.5 text-right">
                    {portfolioHighlights.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="text-[8px] font-black uppercase leading-[1.18] tracking-[0.06em]"
                        style={{ color: index % 2 === 0 ? '#ffffff' : GOLD }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-auto">
              <div className="flex flex-wrap gap-2">
                {actingSkills.slice(0, 6).map((skill, index) => (
                  <div
                    key={`${skill}-${index}`}
                    className="border px-2.5 py-1 text-[6.6px] font-black uppercase tracking-[0.13em] text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.35)' }}
                  >
                    {skill}
                  </div>
                ))}
              </div>

              <div
                className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3 text-[6.7px] font-bold uppercase tracking-[0.1em] text-[#d6d1ca]"
                style={{ borderColor: 'rgba(255,255,255,0.25)' }}
              >
                {personal.phone ? (
                  <span className="flex items-center gap-1.5">
                    <Phone size={9} />
                    {personal.phone}
                  </span>
                ) : null}
                {personal.email ? (
                  <span className="flex items-center gap-1.5 break-all">
                    <Mail size={9} />
                    {personal.email}
                  </span>
                ) : null}
                {personal.location ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={9} />
                    {personal.location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* PAGE 2 */}
        <section
          className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_18px_55px_rgba(0,0,0,0.14)] print:shadow-none"
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            padding: '9mm 11mm 13mm',
            boxSizing: 'border-box',
            backgroundColor: PAPER,
          }}
        >
          <header className="mb-3">
            <div className="flex items-end justify-between border-b-[3px] pb-2" style={{ borderColor: BLACK }}>
              <div>
                <div className="text-[6px] font-black uppercase tracking-[0.2em]" style={{ color: CRIMSON }}>
                  Casting Book · Page 02
                </div>
                <div
                  className="mt-1 text-[24px] font-black uppercase leading-none tracking-[-0.04em]"
                  style={{ color: BLACK, fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Credits & Portfolio
                </div>
              </div>

              <div className="text-right text-[7px] font-black uppercase tracking-[0.13em]" style={{ color: GREY }}>
                {personal.name || 'Your Name'}
              </div>
            </div>
          </header>

          <div ref={bodyAreaRef} className="overflow-hidden" style={{ height: '253mm' }}>
            <div ref={bodyInnerRef} style={{ zoom: bodyScale, transformOrigin: 'top left' }}>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '94mm 89mm',
                  columnGap: '5mm',
                  alignItems: 'start',
                }}
              >
                {/* LEFT COLUMN */}
                <div>
                  <SectionTitle icon={Film} title="Film & Television" subtitle="Selected credits" />
                  {firstHalf.map((item, index) => (
                    <CreditItem key={`left-credit-${item.id ?? index}-${index}`} item={item} index={index} />
                  ))}

                  {education.length > 0 ? (
                    <section className="mt-4">
                      <SectionTitle
                        icon={GraduationCap}
                        title="Training"
                        subtitle="Education & performance study"
                      />
                      {education.map((item, index) => (
                        <SmallCard
                          key={`edu-${item.id ?? index}-${index}`}
                          icon={GraduationCap}
                          title={item.degree || item.school}
                          meta={[item.school, item.date].filter(Boolean).join(' · ')}
                        />
                      ))}
                    </section>
                  ) : null}

                  {projects.length > 0 ? (
                    <section className="mt-4">
                      <SectionTitle
                        icon={Theater}
                        title="Stage / Portfolio"
                        subtitle="Selected projects"
                      />
                      {projects.map((item, index) => (
                        <SmallCard
                          key={`project-${item.id ?? index}-${index}`}
                          icon={Theater}
                          title={item.name}
                          body={item.desc}
                        />
                      ))}
                    </section>
                  ) : null}
                </div>

                {/* RIGHT COLUMN */}
                <div className="border-l pl-[4mm]" style={{ borderColor: BORDER }}>
                  <SectionTitle
                    icon={Clapperboard}
                    title="Additional Credits"
                    subtitle="Screen, stage & commercial work"
                  />
                  {secondHalf.map((item, index) => (
                    <CreditItem
                      key={`right-credit-${item.id ?? index}-${index}`}
                      item={item}
                      index={splitIndex + index}
                    />
                  ))}

                  {actingSkills.length > 0 ? (
                    <section className="mt-4">
                      <SectionTitle icon={Star} title="Performance" subtitle="Acting strengths" />
                      <CompactList items={actingSkills} icon={Star} color={CRIMSON} />
                    </section>
                  ) : null}

                  {productionSkills.length > 0 ? (
                    <section className="mt-4">
                      <SectionTitle icon={Video} title="Production" subtitle="Creative / technical" />
                      <div className="flex flex-wrap gap-1.5">
                        {productionSkills.map((item, index) => (
                          <span
                            key={`prod-${item}-${index}`}
                            className="border px-1.5 py-1 text-[6.2px] font-black uppercase tracking-[0.05em]"
                            style={{ borderColor: BORDER, color: GREY }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {(awards.length > 0 || certifications.length > 0) ? (
                    <section className="mt-4">
                      <SectionTitle icon={Award} title="Recognition" subtitle="Awards & credentials" />
                      {awards.map((item, index) => (
                        <SmallCard
                          key={`award-${item.id ?? index}-${index}`}
                          icon={Award}
                          title={item.name}
                          meta={[item.issuer, item.date].filter(Boolean).join(' · ')}
                        />
                      ))}
                      {certifications.map((item, index) => (
                        <SmallCard
                          key={`cert-${item.id ?? index}-${index}`}
                          icon={Mic2}
                          title={item.name}
                          meta={[item.issuer, item.date].filter(Boolean).join(' · ')}
                        />
                      ))}
                    </section>
                  ) : null}

                  {languages.length > 0 ? (
                    <section className="mt-4">
                      <SectionTitle icon={Mic2} title="Languages" subtitle="Speech & fluency" />
                      <div className="space-y-1.5">
                        {languages.map((item, index) => {
                          const name = typeof item === 'string' ? item : item?.name || 'Language';
                          const level = typeof item === 'string' ? '' : item?.level || '';
                          return (
                            <div
                              key={item?.id || `lang-${name}-${index}`}
                              className="border-b pb-1 text-[6.9px]"
                              style={{ borderColor: BORDER }}
                            >
                              <div className="font-black uppercase tracking-[0.06em]" style={{ color: BLACK }}>
                                {name}
                              </div>
                              {level ? <div className="mt-0.5" style={{ color: GREY }}>{level}</div> : null}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <footer
            className="absolute bottom-[5mm] left-[11mm] right-[11mm] flex items-center justify-between border-t pt-1.5 text-[5.8px] font-black uppercase tracking-[0.12em]"
            style={{ borderColor: BLACK, color: GREY }}
          >
            <span>Confidential</span>
            <span>Page 2 / 2</span>
          </footer>
        </section>
      </div>

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

export default ActorSpotlight;
