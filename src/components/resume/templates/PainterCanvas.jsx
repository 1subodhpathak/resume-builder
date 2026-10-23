import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Mail,
  MapPin,
  Palette,
  Phone,
  Award,
  Languages,
  Wrench,
} from 'lucide-react';

const splitLines = (text = '') =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
    .filter(Boolean);

const chunkArray = (items = [], size = 6) => {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  const chunks = [];
  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }
  return chunks;
};

const PainterCanvas = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    awards = [],
    languages = [],
  } = data || {};

  const mediums = [
    ...(skills.core || []),
    ...(skills.soft || []),
  ].filter(Boolean);

  const tools = (skills.technical || []).filter(Boolean);

  const COLORS = {
    ink: '#2f2924',
    body: '#5e5348',
    muted: '#7b6d60',
    canvas: '#f5ead5',
    paper: '#fffaf1',
    border: '#cfbf9f',
    tape: '#e7d4ab',
    red: '#d05a49',
    ochre: '#d29b39',
    olive: '#72885c',
    blue: '#5a7ea3',
    plum: '#8b6f8f',
    charcoal: '#433a34',
  };

  const PAINTS = [
    COLORS.red,
    COLORS.ochre,
    COLORS.olive,
    COLORS.blue,
    COLORS.plum,
  ];

  const allRecognition = useMemo(
    () => [
      ...awards.map((item) => ({ ...item, type: 'award' })),
      ...certifications.map((item) => ({ ...item, type: 'certification' })),
    ],
    [awards, certifications]
  );

  const contentRef = useRef(null);
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const fit = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        if (cancelled) return;

        const content = contentRef.current;
        const viewport = viewportRef.current;
        if (!content || !viewport) return;

        content.style.transform = 'scale(1)';
        content.style.width = '100%';

        const contentHeight = content.scrollHeight;
        const contentWidth = content.scrollWidth;
        const viewportHeight = viewport.clientHeight;
        const viewportWidth = viewport.clientWidth;

        if (!contentHeight || !contentWidth || !viewportHeight || !viewportWidth) return;

        const heightScale = viewportHeight / contentHeight;
        const widthScale = viewportWidth / contentWidth;
        const nextScale = Math.min(1, heightScale, widthScale);
        const enforcedScale = Math.max(nextScale, 0.72);

        setScale(Number(enforcedScale.toFixed(4)));
      });
    };

    fit();

    if (document.fonts?.ready) {
      document.fonts.ready.then(fit).catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(fit)
        : null;

    if (observer) {
      if (contentRef.current) observer.observe(contentRef.current);
      if (viewportRef.current) observer.observe(viewportRef.current);
    }

    window.addEventListener('resize', fit);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [data]);

  const paintLabel = ({ title, color, small = false }) => (
    <div className={small ? 'mb-2.5' : 'mb-3.5'}>
      <div className="relative inline-flex items-center">
        <span
          className="pointer-events-none absolute left-[-4px] right-[-10px] top-1/2 -z-10"
          style={{
            height: small ? 11 : 15,
            transform: 'translateY(-50%) rotate(-1.4deg)',
            background: `linear-gradient(90deg, transparent 0%, ${color} 7%, ${color} 76%, ${color}d8 92%, transparent 100%)`,
            borderRadius: '58% 36% 52% 40% / 60% 38% 56% 42%',
            filter: 'saturate(0.95)',
          }}
        />
        <span
          className={`${small ? 'text-[6.9px]' : 'text-[8px]'} relative px-2 font-black uppercase tracking-[0.14em] text-white`}
        >
          {title}
        </span>
      </div>
    </div>
  );

  const paperCardStyle = {
    backgroundColor: 'rgba(255,250,241,0.92)',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 3px 12px rgba(66,50,28,0.06)',
  };

  const Tag = ({ label, color }) => (
    <span
      className="relative overflow-hidden rounded-[10px] border px-2.5 py-1.5 text-[6.1px] font-black uppercase tracking-[0.06em]"
      style={{
        backgroundColor: '#fffdf8',
        borderColor: `${color}55`,
        color: COLORS.ink,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute -left-4 top-1/2 h-[11px] w-[29mm] -translate-y-1/2 rotate-[-2deg] opacity-30"
        style={{
          backgroundColor: color,
          borderRadius: '60% 35% 55% 42%',
        }}
      />
      <span className="relative">{label}</span>
    </span>
  );

  const experienceCards = experience.map((item, index) => {
    const color = PAINTS[index % PAINTS.length];
    const lines = splitLines(item.desc);

    return (
      <article
        key={item.id || `experience-${index}`}
        className="relative rounded-[16px] border px-3.5 py-3"
        style={{
          ...paperCardStyle,
          breakInside: 'avoid',
        }}
      >
        <div
          className="absolute left-0 top-0 h-full w-[4px] rounded-l-[16px]"
          style={{ backgroundColor: color }}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4
              className="font-serif text-[10.3px] font-black italic leading-[1.04]"
              style={{ color: COLORS.ink }}
            >
              {item.role}
            </h4>
            {item.company ? (
              <div
                className="mt-1 text-[6.8px] font-black uppercase tracking-[0.09em]"
                style={{ color }}
              >
                {item.company}
              </div>
            ) : null}
          </div>

          {item.date ? (
            <div
              className="shrink-0 rounded-[8px] border px-2 py-[3px] text-[5.8px] font-black uppercase tracking-[0.07em]"
              style={{
                borderColor: COLORS.border,
                backgroundColor: '#fff5de',
                color: COLORS.body,
              }}
            >
              {item.date}
            </div>
          ) : null}
        </div>

        {lines.length ? (
          <div className="mt-2.5 space-y-1.2">
            {lines.map((line, lineIndex) => (
              <div
                key={`${index}-${lineIndex}`}
                className="flex items-start gap-2 text-[7.1px] font-medium leading-[1.42]"
                style={{ color: COLORS.body }}
              >
                <span
                  className="mt-[4px] h-[4px] w-[4px] shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{line}</span>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    );
  });

  const projectChunks = chunkArray(projects, 2);
  const educationChunks = chunkArray(education, 2);
  const needsContinuationPage =
    experience.length > 3 || projects.length + education.length > 4;
  const firstPageExperienceCards = needsContinuationPage
    ? experienceCards.slice(0, 3)
    : experienceCards;
  const continuationExperience = needsContinuationPage
    ? experience.slice(3)
    : [];

  return (
    <div
      className="resume-preview-wrapper mx-auto w-full max-w-[210mm] bg-stone-300 print:bg-white"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section
        className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-2xl print:shadow-none"
        style={{
          width: '210mm',
          height: '297mm',
          backgroundColor: COLORS.canvas,
          backgroundImage: `
            radial-gradient(circle at 12% 10%, rgba(208,90,73,.10), transparent 18%),
            radial-gradient(circle at 88% 12%, rgba(90,126,163,.09), transparent 18%),
            radial-gradient(circle at 84% 82%, rgba(114,136,92,.08), transparent 18%),
            repeating-linear-gradient(0deg, rgba(104,81,52,.025) 0px, rgba(104,81,52,.025) 1px, transparent 1px, transparent 4px),
            repeating-linear-gradient(90deg, rgba(104,81,52,.02) 0px, rgba(104,81,52,.02) 1px, transparent 1px, transparent 5px)
          `,
        }}
      >
        <div
          className="pointer-events-none absolute inset-[3mm]"
          style={{
            border: `1px solid ${COLORS.border}`,
            boxShadow: 'inset 0 0 22px rgba(79,58,26,0.06)',
          }}
        />

        <div
          className="pointer-events-none absolute left-[7mm] top-[14mm] h-[8mm] w-[25mm] rotate-[-7deg] opacity-22"
          style={{
            backgroundColor: COLORS.red,
            borderRadius: '58% 34% 52% 38%',
          }}
        />
        <div
          className="pointer-events-none absolute right-[10mm] top-[18mm] h-[9mm] w-[22mm] rotate-[8deg] opacity-18"
          style={{
            backgroundColor: COLORS.blue,
            borderRadius: '48% 60% 42% 55%',
          }}
        />
        <div
          className="pointer-events-none absolute right-[15mm] bottom-[18mm] h-[10mm] w-[30mm] rotate-[-5deg] opacity-16"
          style={{
            backgroundColor: COLORS.olive,
            borderRadius: '60% 40% 56% 36%',
          }}
        />

        <div
          ref={viewportRef}
          className="absolute left-[10mm] right-[10mm] top-[9mm] bottom-[12mm] overflow-hidden"
        >
          <div
            ref={contentRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${100 / scale}%`,
            }}
          >
            <div
              className="grid items-start"
              style={{
                gridTemplateColumns: '63mm 118mm',
                columnGap: '7mm',
              }}
            >
              <aside>
                <div
                  className="relative mb-3.5 rounded-[18px] border-[1.5px] p-3.5"
                  style={{
                    ...paperCardStyle,
                    borderColor: COLORS.charcoal,
                    boxShadow: '5px 6px 0 rgba(70,55,38,0.12)',
                  }}
                >
                  <div
                    className="absolute -left-1.5 -top-1.5 h-5 w-[18mm] rotate-[-7deg] opacity-90"
                    style={{ backgroundColor: COLORS.tape }}
                  />
                  <div
                    className="absolute -right-1.5 -top-1.5 h-5 w-[18mm] rotate-[8deg] opacity-90"
                    style={{ backgroundColor: COLORS.tape }}
                  />

                  {personal.photo ? (
                    <div
                      className="mx-auto w-[41mm] border-[5px] bg-white p-1"
                      style={{
                        boxShadow: '0 4px 12px rgba(41,37,36,.14)',
                      }}
                    >
                      <img
                        src={personal.photo}
                        alt="Profile"
                        className="h-[42mm] w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className={personal.photo ? 'mt-3.5 text-center' : 'text-center'}>
                    <h1
                      className="font-serif text-[15.5px] font-black italic leading-[0.96]"
                      style={{ color: COLORS.ink }}
                    >
                      {personal.name || 'Your Name'}
                    </h1>

                    {personal.title ? (
                      <div
                        className="mt-1.5 text-[6.6px] font-black uppercase tracking-[0.16em]"
                        style={{ color: COLORS.red }}
                      >
                        {personal.title}
                      </div>
                    ) : null}
                  </div>

                  <div
                    className="my-3 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.ochre}, ${COLORS.olive}, ${COLORS.blue}, transparent)`,
                    }}
                  />

                  <div
                    className="space-y-1.5 text-[6.3px] font-semibold leading-[1.35]"
                    style={{ color: COLORS.body }}
                  >
                    {personal.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone size={9} style={{ color: COLORS.red }} />
                        <span>{personal.phone}</span>
                      </div>
                    ) : null}
                    {personal.email ? (
                      <div className="flex items-center gap-2 break-all">
                        <Mail size={9} style={{ color: COLORS.blue }} />
                        <span>{personal.email}</span>
                      </div>
                    ) : null}
                    {personal.location ? (
                      <div className="flex items-center gap-2">
                        <MapPin size={9} style={{ color: COLORS.olive }} />
                        <span>{personal.location}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {personal.summary ? (
                  <div
                    className="mb-3.5 rounded-[15px] px-3 py-2.5"
                    style={paperCardStyle}
                  >
                    <div className="mb-2 flex items-center gap-1.5">
                      <Palette size={11} style={{ color: COLORS.red }} />
                      <span
                        className="text-[6.8px] font-black uppercase tracking-[0.13em]"
                        style={{ color: COLORS.ink }}
                      >
                        Artist Statement
                      </span>
                    </div>
                    <p
                      className="whitespace-pre-wrap text-[7.2px] font-medium leading-[1.46]"
                      style={{ color: COLORS.body }}
                    >
                      {personal.summary}
                    </p>
                  </div>
                ) : null}

                {mediums.length > 0 ? (
                  <div className="mb-3.5">
                    {paintLabel({ title: 'Creative Strengths', color: COLORS.red, small: true })}
                    <div className="flex flex-wrap gap-1.5">
                      {mediums.map((item, index) => (
                        <Tag
                          key={`${item}-${index}`}
                          label={item}
                          color={PAINTS[index % PAINTS.length]}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {tools.length > 0 ? (
                  <div className="mb-3.5">
                    {paintLabel({ title: 'Studio Tools', color: COLORS.plum, small: true })}
                    <div className="flex flex-wrap gap-1.5">
                      {tools.map((item, index) => (
                        <Tag
                          key={`${item}-${index}`}
                          label={item}
                          color={PAINTS[(index + 2) % PAINTS.length]}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {allRecognition.length > 0 ? (
                  <div
                    className="mb-3.5 rounded-[15px] px-3 py-2.5"
                    style={paperCardStyle}
                  >
                    <div className="mb-2 flex items-center gap-1.5">
                      <Award size={11} style={{ color: COLORS.ochre }} />
                      <span
                        className="text-[6.8px] font-black uppercase tracking-[0.13em]"
                        style={{ color: COLORS.ink }}
                      >
                        Recognition
                      </span>
                    </div>

                    <div className="space-y-1.8">
                      {allRecognition.slice(0, 8).map((item, index) => (
                        <div key={`${item.type}-${item.id ?? 'item'}-${index}`} className="flex items-start gap-2">
                          <span
                            className="mt-[1px] text-[6.8px] font-black"
                            style={{ color: item.type === 'award' ? COLORS.ochre : COLORS.olive }}
                          >
                            {item.type === 'award' ? '★' : '✓'}
                          </span>
                          <div>
                            <div
                              className="text-[6.2px] font-bold leading-[1.28]"
                              style={{ color: COLORS.ink }}
                            >
                              {item.name}
                            </div>
                            {(item.issuer || item.date) ? (
                              <div
                                className="mt-[1px] text-[5.5px] leading-[1.25]"
                                style={{ color: COLORS.muted }}
                              >
                                {[item.issuer, item.date].filter(Boolean).join(' • ')}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {languages.length > 0 ? (
                  <div
                    className="rounded-[15px] px-3 py-2.5"
                    style={paperCardStyle}
                  >
                    <div className="mb-2 flex items-center gap-1.5">
                      <Languages size={11} style={{ color: COLORS.blue }} />
                      <span
                        className="text-[6.8px] font-black uppercase tracking-[0.13em]"
                        style={{ color: COLORS.ink }}
                      >
                        Languages
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {languages.map((item, index) => (
                        <span
                          key={item.id || `language-${index}`}
                          className="rounded-full border px-2 py-1 text-[5.9px] font-bold"
                          style={{
                            borderColor: COLORS.border,
                            backgroundColor: '#fffdf8',
                            color: COLORS.ink,
                          }}
                        >
                          {item.name}
                          {item.level ? ` • ${item.level}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </aside>

              <main>
                <div className="mb-3.5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div
                        className="font-serif text-[19px] font-black italic leading-none"
                        style={{ color: COLORS.ink }}
                      >
                        Painter Canvas Resume
                      </div>
                      <div
                        className="mt-1.5 text-[6.5px] font-black uppercase tracking-[0.18em]"
                        style={{ color: COLORS.muted }}
                      >
                        Crafted like an actual painting board
                      </div>
                    </div>

                    <div
                      className="rounded-[12px] border px-2.5 py-2"
                      style={{
                        ...paperCardStyle,
                        backgroundColor: '#fff7e8',
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Wrench size={10} style={{ color: COLORS.ochre }} />
                        <span
                          className="text-[5.9px] font-black uppercase tracking-[0.11em]"
                          style={{ color: COLORS.body }}
                        >
                          Imaginative Composition
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-3 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.ochre}, ${COLORS.olive}, ${COLORS.blue}, ${COLORS.plum})`,
                    }}
                  />
                </div>

                {experience.length > 0 ? (
                  <div className="mb-3.5">
                    {paintLabel({ title: 'Experience', color: COLORS.ochre })}
                    <div className="grid grid-cols-1 gap-2.5">{firstPageExperienceCards}</div>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  {!needsContinuationPage && projects.length > 0 ? (
                    <div>
                      {paintLabel({ title: 'Featured Works', color: COLORS.red, small: true })}
                      <div className="space-y-2">
                        {projectChunks.flat().map((item, index) => {
                          const color = PAINTS[(index + 1) % PAINTS.length];
                          return (
                            <article
                              key={item.id || `project-${index}`}
                              className="relative rounded-[14px] border px-3 py-2.5"
                              style={paperCardStyle}
                            >
                              <div
                                className="absolute left-0 top-0 h-full w-[4px] rounded-l-[14px]"
                                style={{ backgroundColor: color }}
                              />
                              <div
                                className="text-[6.8px] font-black uppercase tracking-[0.08em]"
                                style={{ color: COLORS.ink }}
                              >
                                {item.name}
                              </div>
                              {item.desc ? (
                                <div
                                  className="mt-1.5 whitespace-pre-wrap text-[6.1px] font-medium leading-[1.35]"
                                  style={{ color: COLORS.body }}
                                >
                                  {item.desc}
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {!needsContinuationPage && (education.length > 0 || allRecognition.length > 0) ? (
                    <div>
                      {education.length > 0 ? paintLabel({ title: 'Education', color: COLORS.olive, small: true }) : null}
                      {education.length > 0 ? (
                        <div className="space-y-2 mb-3">
                          {educationChunks.flat().map((item, index) => {
                            const color = PAINTS[(index + 2) % PAINTS.length];
                            return (
                              <article
                                key={item.id || `education-${index}`}
                                className="relative rounded-[14px] border px-3 py-2.5"
                                style={paperCardStyle}
                              >
                                <div
                                  className="absolute left-0 top-0 h-full w-[4px] rounded-l-[14px]"
                                  style={{ backgroundColor: color }}
                                />
                                <div
                                  className="text-[6.9px] font-black leading-[1.28]"
                                  style={{ color: COLORS.ink }}
                                >
                                  {item.school || item.degree}
                                </div>
                                {item.school && item.degree ? (
                                  <div
                                    className="mt-1 text-[6.2px] font-bold leading-[1.28]"
                                    style={{ color }}
                                  >
                                    {item.degree}
                                  </div>
                                ) : null}
                                {item.date ? (
                                  <div
                                    className="mt-1 text-[5.5px] font-bold uppercase tracking-[0.07em]"
                                    style={{ color: COLORS.muted }}
                                  >
                                    {item.date}
                                  </div>
                                ) : null}
                              </article>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </main>
            </div>
          </div>
        </div>

        <footer
          className="absolute bottom-[3.5mm] left-[10mm] right-[10mm] flex items-center justify-between border-t pt-1.5 text-[5.7px] font-black uppercase tracking-[0.09em]"
          style={{
            borderColor: COLORS.border,
            color: COLORS.muted,
          }}
        >
          <span
            className="font-serif italic normal-case tracking-normal"
            style={{ color: COLORS.ink }}
          >
            Confidential
          </span>
          <span>Page 1 / {needsContinuationPage ? 2 : 1}</span>
        </footer>
      </section>

      {needsContinuationPage ? (
        <section
          className="relative mx-auto mt-5 h-[297mm] w-[210mm] overflow-hidden shadow-2xl print:mt-0 print:shadow-none"
          style={{
            width: '210mm',
            height: '297mm',
            padding: '10mm 12mm 14mm',
            boxSizing: 'border-box',
            backgroundColor: COLORS.canvas,
            backgroundImage: `
              radial-gradient(circle at 10% 12%, rgba(208,90,73,.08), transparent 20%),
              radial-gradient(circle at 90% 82%, rgba(90,126,163,.08), transparent 20%),
              repeating-linear-gradient(0deg, rgba(104,81,52,.025) 0px, rgba(104,81,52,.025) 1px, transparent 1px, transparent 4px)
            `,
            breakBefore: 'page',
            pageBreakBefore: 'always',
          }}
        >
          <header className="mb-[5mm] flex items-end justify-between border-b-2 pb-[3mm]" style={{ borderColor: COLORS.border }}>
            <div>
              <div className="font-serif text-[18px] font-black italic leading-none" style={{ color: COLORS.ink }}>
                {personal.name || 'Your Name'}
              </div>
              <div className="mt-1.5 text-[6.5px] font-black uppercase tracking-[0.16em]" style={{ color: COLORS.red }}>
                Painter Canvas · Continued Portfolio
              </div>
            </div>
            <div className="rounded-[10px] border bg-white/60 px-3 py-1.5 text-[6px] font-black uppercase tracking-[0.12em]" style={{ borderColor: COLORS.border, color: COLORS.body }}>
              Page 2 / 2
            </div>
          </header>

          <div className="grid grid-cols-2 items-start gap-[6mm]">
            <main>
              {continuationExperience.length > 0 ? (
                <section>
                  {paintLabel({ title: 'Experience · Continued', color: COLORS.ochre })}
                  <div className="space-y-2.5">
                    {experienceCards.slice(3)}
                  </div>
                </section>
              ) : null}

              {projects.length > 0 ? (
                <section className={continuationExperience.length ? 'mt-4' : ''}>
                  {paintLabel({ title: 'Featured Works', color: COLORS.red })}
                  <div className="space-y-2.5">
                    {projects.map((item, index) => (
                      <article key={item.id || `continued-project-${index}`} className="relative rounded-[14px] border px-3.5 py-3" style={paperCardStyle}>
                        <div className="absolute left-0 top-0 h-full w-[4px] rounded-l-[14px]" style={{ backgroundColor: PAINTS[(index + 1) % PAINTS.length] }} />
                        <div className="text-[7.2px] font-black uppercase tracking-[0.07em]" style={{ color: COLORS.ink }}>{item.name}</div>
                        {item.desc ? <div className="mt-1.5 whitespace-pre-wrap text-[6.5px] font-medium leading-[1.4]" style={{ color: COLORS.body }}>{item.desc}</div> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </main>

            <aside>
              {education.length > 0 ? (
                <section>
                  {paintLabel({ title: 'Education', color: COLORS.olive })}
                  <div className="space-y-2.5">
                    {education.map((item, index) => (
                      <article key={item.id || `continued-education-${index}`} className="relative rounded-[14px] border px-3.5 py-3" style={paperCardStyle}>
                        <div className="absolute left-0 top-0 h-full w-[4px] rounded-l-[14px]" style={{ backgroundColor: PAINTS[(index + 2) % PAINTS.length] }} />
                        <div className="text-[7.3px] font-black leading-[1.3]" style={{ color: COLORS.ink }}>{item.school || item.degree}</div>
                        {item.school && item.degree ? <div className="mt-1 text-[6.5px] font-bold" style={{ color: COLORS.olive }}>{item.degree}</div> : null}
                        {item.date ? <div className="mt-1 text-[5.8px] font-bold uppercase tracking-[0.07em]" style={{ color: COLORS.muted }}>{item.date}</div> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {allRecognition.length > 0 ? (
                <section className="mt-4">
                  {paintLabel({ title: 'Recognition & Credentials', color: COLORS.plum })}
                  <div className="space-y-2">
                    {allRecognition.map((item, index) => (
                      <div key={`${item.type}-${item.id || index}-continued`} className="rounded-[12px] border px-3 py-2.5" style={paperCardStyle}>
                        <div className="text-[6.8px] font-bold leading-[1.3]" style={{ color: COLORS.ink }}>{item.name}</div>
                        {(item.issuer || item.date) ? <div className="mt-1 text-[5.8px]" style={{ color: COLORS.muted }}>{[item.issuer, item.date].filter(Boolean).join(' • ')}</div> : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>
          </div>

          <footer className="absolute bottom-[3.5mm] left-[12mm] right-[12mm] flex items-center justify-between border-t pt-1.5 text-[5.7px] font-black uppercase tracking-[0.09em]" style={{ borderColor: COLORS.border, color: COLORS.muted }}>
            <span className="font-serif italic normal-case tracking-normal" style={{ color: COLORS.ink }}>Confidential</span>
            <span>Page 2 / 2</span>
          </footer>
        </section>
      ) : null}

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

export default PainterCanvas;
