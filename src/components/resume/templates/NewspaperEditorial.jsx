import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const NewspaperEditorial = ({ data }) => {
  const {
    personal = {},
    experience = [],
    education = [],
    certifications = [],
    languages = [],
    skills = {},
    awards = [],
    projects = [],
  } = data || {};

  const pageRef = useRef(null);
  const articleAreaRef = useRef(null);
  const articleInnerRef = useRef(null);

  const [contentScale, setContentScale] = useState(1);

  const allSkills = useMemo(
    () => [
      ...(skills.core || []),
      ...(skills.technical || []),
      ...(skills.soft || []),
    ].filter(Boolean),
    [skills]
  );

  const splitLines = (text = '') =>
    String(text || '')
      .split(/\r?\n/)
      .map((line) => line.replace(/^[•\-–—]\s*/, '').trim())
      .filter(Boolean);

  const splitIndex = Math.ceil(experience.length / 2);
  const experienceLeft = experience.slice(0, splitIndex);
  const experienceRight = experience.slice(splitIndex);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let cancelled = false;

    const fitToPage = () => {
      if (cancelled) return;

      window.requestAnimationFrame(() => {
        const outer = articleAreaRef.current;
        const inner = articleInnerRef.current;

        if (!outer || !inner) return;

        // Measure the natural content height. Dividing by the active zoom
        // keeps repeated measurements stable after the first fit pass.
        const naturalHeight =
          inner.scrollHeight / Math.max(contentScale, 0.01);

        const availableHeight = outer.clientHeight;

        if (!naturalHeight || !availableHeight) return;

        const nextScale = Math.max(
          0.88,
          Math.min(
            1,
            (availableHeight / naturalHeight) * 0.985
          )
        );

        if (
          Math.abs(nextScale - contentScale) > 0.005
        ) {
          setContentScale(nextScale);
        }
      });
    };

    fitToPage();

    if (
      typeof document !== 'undefined' &&
      document.fonts?.ready
    ) {
      document.fonts.ready
        .then(fitToPage)
        .catch(() => {});
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(fitToPage)
        : null;

    if (observer) {
      if (pageRef.current) {
        observer.observe(pageRef.current);
      }

      if (articleInnerRef.current) {
        observer.observe(articleInnerRef.current);
      }
    }

    window.addEventListener('resize', fitToPage);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener(
        'resize',
        fitToPage
      );
    };
  }, [contentScale]);

  const SectionRule = ({
    children,
    kicker,
  }) => (
    <div className="mb-2.5 break-inside-avoid">
      <div
        className="border-b border-t-[2px] py-1"
        style={{ borderColor: '#22211e' }}
      >
        <div
          className="text-[8px] font-black uppercase tracking-[0.16em]"
          style={{
            color: '#1f1f1c',
            fontFamily:
              'Arial, Helvetica, sans-serif',
          }}
        >
          {children}
        </div>
      </div>

      {kicker ? (
        <div
          className="mt-1 text-[6.5px] font-bold uppercase tracking-[0.12em]"
          style={{
            color: '#77736b',
            fontFamily:
              'Arial, Helvetica, sans-serif',
          }}
        >
          {kicker}
        </div>
      ) : null}
    </div>
  );

  const ExperienceStory = ({
    item,
    index,
  }) => (
    <article
      className="mb-3 break-inside-avoid"
      key={`${item.id ?? index}-${index}`}
    >
      <h3
        className="text-[11.2px] font-black leading-[1.04]"
        style={{
          color: '#1f1f1c',
          fontFamily:
            'Georgia, "Times New Roman", serif',
        }}
      >
        {item.role || 'Professional Role'}
      </h3>

      <div
        className="mt-1 text-[7px] font-black uppercase tracking-[0.08em]"
        style={{
          color: '#4d4b46',
          fontFamily:
            'Arial, Helvetica, sans-serif',
        }}
      >
        {item.company || 'Organisation'}
        {item.date ? ` · ${item.date}` : ''}
      </div>

      <div
        className="mt-1.5 space-y-1 text-justify text-[8.7px] leading-[1.38]"
        style={{
          color: '#34332f',
          fontFamily:
            'Georgia, "Times New Roman", serif',
        }}
      >
        {splitLines(item.desc).map(
          (line, lineIndex) => (
            <p key={lineIndex}>
              {line}
            </p>
          )
        )}
      </div>

      <div
        className="mt-2 h-px"
        style={{ backgroundColor: '#c9c4b8' }}
      />
    </article>
  );

  const BriefItem = ({
    title,
    meta,
    body,
  }) => (
    <article className="mb-2.5 break-inside-avoid">
      <div
        className="text-[9.4px] font-black leading-[1.08]"
        style={{
          color: '#1f1f1c',
          fontFamily:
            'Georgia, "Times New Roman", serif',
        }}
      >
        {title}
      </div>

      {meta ? (
        <div
          className="mt-1 text-[6.7px] font-bold uppercase tracking-[0.07em]"
          style={{
            color: '#77736b',
            fontFamily:
              'Arial, Helvetica, sans-serif',
          }}
        >
          {meta}
        </div>
      ) : null}

      {body ? (
        <p
          className="mt-1 text-justify text-[8.4px] leading-[1.35]"
          style={{
            color: '#3f3d38',
            fontFamily:
              'Georgia, "Times New Roman", serif',
          }}
        >
          {body}
        </p>
      ) : null}
    </article>
  );

  const DropCapSummary = () => {
    const text = String(
      personal.summary || ''
    ).trim();

    if (!text) return null;

    return (
      <p
        className="text-justify text-[8.9px] leading-[1.42]"
        style={{
          color: '#34332f',
          fontFamily:
            'Georgia, "Times New Roman", serif',
        }}
      >
        <span
          className="float-left mr-1.5 mt-[-2px] text-[34px] font-black leading-[0.8]"
          style={{
            color: '#1f1f1c',
            fontFamily:
              'Georgia, "Times New Roman", serif',
          }}
        >
          {text.charAt(0)}
        </span>
        {text.slice(1)}
      </p>
    );
  };

  return (
    <div
      className="resume-preview-wrapper mx-auto w-full max-w-[210mm]"
      style={{ backgroundColor: '#d9d9d4' }}
    >
      <section
        ref={pageRef}
        className="relative mx-auto h-[297mm] w-[210mm] overflow-hidden shadow-[0_20px_55px_rgba(0,0,0,0.16)] print:shadow-none"
        style={{
          width: '210mm',
          height: '297mm',
          padding: '7mm 10mm 9mm',
          boxSizing: 'border-box',
          backgroundColor: '#f4f0e6',
          backgroundImage:
            'radial-gradient(rgba(35,35,31,0.028) 0.45px, transparent 0.45px)',
          backgroundSize: '4px 4px',
        }}
      >
        {/* EDITION STRIP */}
        <div
          className="flex items-center justify-between border-b pb-1 text-[6.5px] font-bold uppercase tracking-[0.17em]"
          style={{
            borderColor: '#272620',
            color: '#747169',
            fontFamily:
              'Arial, Helvetica, sans-serif',
          }}
        >
          <span>
            Curriculum Vitae · Professional Edition
          </span>
          <span>
            {personal.location || 'Career Edition'}
          </span>
        </div>

        {/* MASTHEAD */}
        <header className="pt-1.5">
          <div
            className="border-b-[4px] border-t py-1.5 text-center"
            style={{ borderColor: '#22211e' }}
          >
            <div
              className="text-[28px] font-black uppercase leading-none tracking-[-0.05em]"
              style={{
                color: '#1f1f1c',
                fontFamily:
                  'Georgia, "Times New Roman", serif',
              }}
            >
              The Career Chronicle
            </div>
          </div>

          <div className="py-2 text-center">
            <h1
              className="text-[26px] font-black uppercase leading-[0.95] tracking-[-0.02em]"
              style={{
                color: '#1f1f1c',
                fontFamily:
                  'Georgia, "Times New Roman", serif',
              }}
            >
              {personal.name || 'Your Name'}
            </h1>

            <div
              className="mt-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em]"
              style={{
                color: '#3f3d38',
                fontFamily:
                  'Arial, Helvetica, sans-serif',
              }}
            >
              {personal.title ||
                'Professional Profile'}
            </div>
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 border-y py-1 text-[6.5px] font-bold"
            style={{
              borderColor: '#bdb8ad',
              color: '#706d66',
              fontFamily:
                'Arial, Helvetica, sans-serif',
            }}
          >
            {personal.phone ? (
              <span>{personal.phone}</span>
            ) : null}
            {personal.email ? (
              <span>{personal.email}</span>
            ) : null}
            {personal.location ? (
              <span>{personal.location}</span>
            ) : null}
            {personal.linkedin ? (
              <span>{personal.linkedin}</span>
            ) : null}
          </div>
        </header>

        {/* ONE-PAGE ARTICLE AREA */}
        <div
          ref={articleAreaRef}
          className="mt-3 overflow-hidden"
          style={{
            height: '239mm',
          }}
        >
          <div
            ref={articleInnerRef}
            style={{
              zoom: contentScale,
              transformOrigin: 'top left',
            }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns:
                  '58mm 58mm 58mm',
                columnGap: '5mm',
                alignItems: 'start',
              }}
            >
              {/* COLUMN 1 */}
              <div>
                <SectionRule kicker="Lead profile">
                  Front Page
                </SectionRule>

                {personal.photo ? (
                  <figure
                    className="mb-2 border bg-white p-[2px]"
                    style={{ borderColor: '#22211e' }}
                  >
                    <img
                      src={personal.photo}
                      alt="Profile"
                      className="h-[36mm] w-full object-cover grayscale"
                    />
                    <figcaption
                      className="border-t px-1 py-0.5 text-[5.7px] font-bold uppercase tracking-[0.1em]"
                      style={{
                        borderColor: '#c9c4b8',
                        color: '#77736b',
                        fontFamily:
                          'Arial, Helvetica, sans-serif',
                      }}
                    >
                      Professional portrait
                    </figcaption>
                  </figure>
                ) : null}

                <h2
                  className="mb-1.5 text-[15px] font-black leading-[1.02]"
                  style={{
                    color: '#1f1f1c',
                    fontFamily:
                      'Georgia, "Times New Roman", serif',
                  }}
                >
                  {personal.title ||
                    'Professional Profile'}{' '}
                  Brings Experience, Perspective and Results
                </h2>

                <div
                  className="mb-2 text-[6px] font-bold uppercase tracking-[0.11em]"
                  style={{
                    color: '#77736b',
                    fontFamily:
                      'Arial, Helvetica, sans-serif',
                  }}
                >
                  By Career Desk · Profile Feature
                </div>

                <DropCapSummary />

                {education.length > 0 ? (
                  <div className="mt-3">
                    <SectionRule>
                      Education Desk
                    </SectionRule>

                    {education.map(
                      (item, index) => (
                        <BriefItem
                          key={`${item.id ?? index}-${index}`}
                          title={
                            item.degree || item.school
                          }
                          meta={[
                            item.school,
                            item.date,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        />
                      )
                    )}
                  </div>
                ) : null}

                {allSkills.length > 0 ? (
                  <div className="mt-3">
                    <SectionRule>
                      Skills Index
                    </SectionRule>

                    <p
                      className="text-[8.2px] font-bold leading-[1.48]"
                      style={{
                        color: '#35342f',
                        fontFamily:
                          'Georgia, "Times New Roman", serif',
                      }}
                    >
                      {allSkills.join(' · ')}
                    </p>
                  </div>
                ) : null}

                {projects.length > 0 ? (
                  <div className="mt-3">
                    <SectionRule>
                      Special Projects
                    </SectionRule>

                    {projects.map((item, index) => (
                      <BriefItem
                        key={`${item.id ?? index}-${index}`}
                        title={item.name}
                        body={item.desc}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* COLUMN 2 */}
              <div
                className="border-l pl-[3mm]"
                style={{
                  borderColor: '#c9c4b8',
                }}
              >
                <SectionRule kicker="Career report">
                  Experience
                </SectionRule>

                {experienceLeft.map(
                  (item, index) => (
                    <ExperienceStory
                      key={`${item.id ?? index}-${index}`}
                      item={item}
                      index={index}
                    />
                  )
                )}

              </div>

              {/* COLUMN 3 */}
              <div
                className="border-l pl-[3mm]"
                style={{
                  borderColor: '#c9c4b8',
                }}
              >
                <SectionRule kicker="Continued coverage">
                  Career Report
                </SectionRule>

                {experienceRight.map(
                  (item, index) => (
                    <ExperienceStory
                      key={`${item.id ?? index}-${index}`}
                      item={item}
                      index={index}
                    />
                  )
                )}

                {certifications.length > 0 ? (
                  <div className="mt-2">
                    <SectionRule>
                      Credentials
                    </SectionRule>

                    {certifications.map(
                      (item, index) => (
                        <BriefItem
                          key={`${item.id ?? index}-${index}`}
                          title={item.name}
                          meta={[
                            item.issuer,
                            item.date,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        />
                      )
                    )}
                  </div>
                ) : null}

                {awards.length > 0 ? (
                  <div className="mt-2">
                    <SectionRule>
                      Honours & Recognition
                    </SectionRule>

                    {awards.map(
                      (item, index) => (
                        <BriefItem
                          key={`${item.id ?? index}-${index}`}
                          title={item.name}
                          meta={[
                            item.issuer,
                            item.date,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        />
                      )
                    )}
                  </div>
                ) : null}

                {languages.length > 0 ? (
                  <div className="mt-2">
                    <SectionRule>
                      Languages
                    </SectionRule>

                    {languages.map(
                      (item, index) => {
                        const name =
                          typeof item === 'string'
                            ? item
                            : item?.name ||
                              'Language';

                        const level =
                          typeof item === 'string'
                            ? ''
                            : item?.level || '';

                        return (
                          <div
                            key={
                              item?.id ||
                              `${name}-${index}`
                            }
                            className="flex items-center justify-between gap-2 border-b py-1"
                            style={{
                              borderColor:
                                '#c9c4b8',
                            }}
                          >
                            <span
                              className="text-[8px] font-bold"
                              style={{
                                color:
                                  '#1f1f1c',
                                fontFamily:
                                  'Georgia, "Times New Roman", serif',
                              }}
                            >
                              {name}
                            </span>

                            {level ? (
                              <span
                                className="text-[6px] font-bold uppercase tracking-[0.06em]"
                                style={{
                                  color:
                                    '#77736b',
                                  fontFamily:
                                    'Arial, Helvetica, sans-serif',
                                }}
                              >
                                {level}
                              </span>
                            ) : null}
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <footer
          className="absolute bottom-[4mm] left-[10mm] right-[10mm] flex items-center justify-between border-t pt-1"
          style={{
            borderColor: '#272620',
            color: '#747169',
          }}
        >
          <div
            className="text-[5.8px] font-bold uppercase tracking-[0.13em]"
            style={{
              fontFamily:
                'Arial, Helvetica, sans-serif',
            }}
          >
            Confidential
          </div>

          <div
            className="text-[5.8px] font-bold uppercase tracking-[0.13em]"
            style={{
              fontFamily:
                'Arial, Helvetica, sans-serif',
            }}
          >
            One Page Edition
          </div>
        </footer>
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

export default NewspaperEditorial;
