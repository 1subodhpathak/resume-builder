import React from 'react';
import FormattedTextBlock from '../FormattedTextBlock';

type SectionId =
  | 'personal'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'awards'
  | 'languages'
  | 'volunteering';

type RenderCtx = {
  data: any;
  atsMode?: boolean;
  // you can optionally pass enabledSections later
  enabledSections?: Record<string, boolean>;
};

const isOn = (ctx: RenderCtx, id: SectionId) => {
  if (!ctx.enabledSections) return true;
  return ctx.enabledSections[id] !== false;
};

export const Sections = {
  personal: (ctx: RenderCtx) => {
    const p = ctx.data.personal;
    if (!p) return null;

    // ATS: avoid icons/images if you want
    return (
      <div>
        <div className={`${ctx.atsMode ? 'text-black' : ''}`}>
          <div className="text-3xl font-bold">{p.name}</div>
          <div className="text-sm text-slate-600">{p.title}</div>
          <div className="text-xs text-slate-600 mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
        </div>

        {p.summary && (
          <FormattedTextBlock
            text={p.summary}
            plainClassName="mt-4 text-sm text-slate-700 whitespace-pre-wrap"
            unorderedListClassName="mt-4 list-disc pl-5 space-y-1.5 text-sm text-slate-700"
            orderedListClassName="mt-4 list-decimal pl-5 space-y-1.5 text-sm text-slate-700"
          />
        )}
      </div>
    );
  },

  experience: (ctx: RenderCtx) => {
    const list = ctx.data.experience ?? [];
    if (!list.length) return null;
    return (
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">
          Experience
        </div>
        <div className="space-y-4">
          {list.map((e: any) => (
            <div key={e.id}>
              <div className="flex justify-between gap-4">
                <div className="font-bold">{e.role}</div>
                <div className="text-xs text-slate-500 font-semibold">{e.date}</div>
              </div>
              <div className="text-xs text-slate-600 font-semibold">{e.company}</div>
              <FormattedTextBlock
                text={e.desc}
                plainClassName="mt-1 text-sm text-slate-700 whitespace-pre-wrap"
                unorderedListClassName="mt-1 list-disc pl-5 space-y-1.5 text-sm text-slate-700"
                orderedListClassName="mt-1 list-decimal pl-5 space-y-1.5 text-sm text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>
    );
  },

  projects: (ctx: RenderCtx) => {
    const list = ctx.data.projects ?? [];
    if (!list.length) return null;
    return (
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">
          Projects
        </div>
        <div className="space-y-3">
          {list.map((p: any) => (
            <div key={p.id}>
              <div className="font-bold">{p.name}</div>
              <FormattedTextBlock
                text={p.desc}
                plainClassName="text-sm text-slate-700 whitespace-pre-wrap"
                unorderedListClassName="list-disc pl-5 space-y-1.5 text-sm text-slate-700"
                orderedListClassName="list-decimal pl-5 space-y-1.5 text-sm text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>
    );
  },

  education: (ctx: RenderCtx) => {
    const list = ctx.data.education ?? [];
    if (!list.length) return null;
    return (
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">
          Education
        </div>
        <div className="space-y-3">
          {list.map((e: any) => (
            <div key={e.id}>
              <div className="font-bold">{e.degree}</div>
              <div className="text-xs text-slate-600">{e.school}</div>
              <div className="text-xs text-slate-500">{e.date}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },

  skills: (ctx: RenderCtx) => {
    const s = ctx.data.skills ?? { technical: [], core: [], soft: [] };
    const tech = s.technical ?? [];
    const core = s.core ?? [];
    const soft = s.soft ?? [];
    if (!tech.length && !core.length && !soft.length) return null;

    const Tag = ({ text }: { text: string }) => (
      <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-[11px] font-semibold">
        {text}
      </span>
    );

    return (
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">
          Skills
        </div>

        {tech.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Technical</div>
            <div className="flex flex-wrap gap-2">{tech.map((x: string, i: number) => <Tag key={i} text={x} />)}</div>
          </div>
        )}

        {core.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Core</div>
            <div className="flex flex-wrap gap-2">{core.map((x: string, i: number) => <Tag key={i} text={x} />)}</div>
          </div>
        )}

        {soft.length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase mb-2">Soft</div>
            <div className="flex flex-wrap gap-2">{soft.map((x: string, i: number) => <Tag key={i} text={x} />)}</div>
          </div>
        )}
      </div>
    );
  },

  certifications: (ctx: RenderCtx) => {
    const list = ctx.data.certifications ?? [];
    if (!list.length) return null;
    return (
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">
          Certifications
        </div>
        <div className="space-y-2">
          {list.map((c: any) => (
            <div key={c.id} className="text-sm">
              <span className="font-bold">{c.name}</span>
              {c.issuer ? <span className="text-slate-600"> · {c.issuer}</span> : null}
            </div>
          ))}
        </div>
      </div>
    );
  },

  awards: (ctx: RenderCtx) => {
    const list = ctx.data.awards ?? [];
    if (!list.length) return null;
    return (
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">
          Awards
        </div>
        <div className="space-y-2">
          {list.map((a: any) => (
            <div key={a.id} className="text-sm">
              <span className="font-bold">{a.name}</span>
              {a.issuer ? <span className="text-slate-600"> · {a.issuer}</span> : null}
            </div>
          ))}
        </div>
      </div>
    );
  },

  languages: (ctx: RenderCtx) => {
    const list = ctx.data.languages ?? [];
    if (!list.length) return null;
    return (
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">
          Languages
        </div>
        <div className="space-y-1">
          {list.map((l: any) => (
            <div key={l.id} className="text-sm text-slate-700">
              {l.name}{l.level ? <span className="text-slate-500"> · {l.level}</span> : null}
            </div>
          ))}
        </div>
      </div>
    );
  },

  volunteering: (ctx: RenderCtx) => {
    const list = ctx.data.volunteering ?? [];
    if (!list.length) return null;
    return (
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">
          Volunteering
        </div>
        <div className="space-y-3">
          {list.map((v: any) => (
            <div key={v.id}>
              <div className="font-bold">{v.role}</div>
              <div className="text-xs text-slate-600">{v.org} {v.date ? `· ${v.date}` : ''}</div>
              <FormattedTextBlock
                text={v.desc}
                plainClassName="text-sm text-slate-700 whitespace-pre-wrap"
                unorderedListClassName="list-disc pl-5 space-y-1.5 text-sm text-slate-700"
                orderedListClassName="list-decimal pl-5 space-y-1.5 text-sm text-slate-700"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export function renderSectionsByOrder(
  sectionOrder: string[],
  ctx: RenderCtx,
  opts?: { gapClass?: string }
) {
  const order = (sectionOrder?.length ? sectionOrder : ([
    'personal','experience','projects','education','skills','certifications','awards','languages','volunteering'
  ] as SectionId[])) as SectionId[];

  return (
    <div className={opts?.gapClass ?? 'space-y-7'}>
      {order.map((id) => {
        if (!isOn(ctx, id)) return null;
        const fn = (Sections as any)[id];
        if (!fn) return null;
        return <div key={id}>{fn(ctx)}</div>;
      })}
    </div>
  );
}
