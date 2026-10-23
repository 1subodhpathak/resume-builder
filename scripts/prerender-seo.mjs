import { mkdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { URL } from 'node:url';
import {
  ALL_RESUME_SEO_EXAMPLES,
  RESUME_EXAMPLE_ROLES,
  RESUME_TEMPLATE_EXAMPLES,
  STUDENT_RESUME_EXAMPLES,
} from '../src/data/resumeExampleSeo.js';
import { RESUME_GUIDES } from '../src/data/resumeGuideSeo.js';

/* global console */

const siteUrl = String(process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://resume.careersenseai.com').replace(/\/$/, '');
const baseHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const escapeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

const renderPage = ({ path, title, description, body, schema }) => {
  const canonical = `${siteUrl}${path === '/' ? '/' : path}`;
  const head = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="CareerSense" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary" />
    <style>@keyframes cs-spin{to{transform:rotate(360deg)}}body{margin:0;background-color:#F7F8FA;}</style>
    <script type="application/ld+json">${escapeJson(schema)}</script>`;

  const prerenderBody = `
  <div id="root">
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F7F8FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #071426;">
      <div style="width: 40px; height: 40px; border: 3px solid #E1E7EF; border-top-color: #071426; border-radius: 50%; animation: cs-spin 0.8s linear infinite;"></div>
      <div style="margin-top: 14px; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; color: #475569; text-transform: uppercase;">CareerSense</div>
    </div>
  </div>
  <noscript>
    <style>
      #root { display: none !important; }
      .cs-seo-fallback {
        max-width: 960px;
        margin: 40px auto;
        padding: 24px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #071426;
        line-height: 1.6;
      }
      .cs-seo-fallback h1 { font-size: 28px; font-weight: 700; color: #071426; margin-bottom: 16px; }
      .cs-seo-fallback h2 { font-size: 20px; font-weight: 600; color: #123B6D; margin-top: 24px; margin-bottom: 12px; }
      .cs-seo-fallback h3 { font-size: 16px; font-weight: 600; color: #071426; margin-top: 16px; }
      .cs-seo-fallback p { color: #475569; margin-bottom: 16px; }
      .cs-seo-fallback a { color: #123B6D; font-weight: 600; text-decoration: underline; }
      .cs-seo-fallback ul { padding-left: 20px; margin-bottom: 20px; }
      .cs-seo-fallback li { margin-bottom: 8px; color: #334155; }
      .cs-seo-fallback nav { margin-bottom: 24px; font-size: 14px; color: #64748B; }
    </style>
    <div class="cs-seo-fallback">
      ${body}
    </div>
  </noscript>`;

  return baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta name="description"[\s\S]*?>/i, '')
    .replace(/<meta name="robots"[\s\S]*?>/i, '')
    .replace(/<link rel="canonical"[\s\S]*?>/i, '')
    .replace(/<meta property="og:[\s\S]*?>/gi, '')
    .replace('</head>', `${head}\n</head>`)
    .replace('<div id="root"></div>', prerenderBody);
};

const collections = [
  {
    path: '/resume-examples',
    title: 'Professional Resume Examples by Job',
    description: 'Explore professional resume examples by job, with relevant skills, achievement ideas, ATS guidance, and editable CareerSense templates.',
    examples: RESUME_EXAMPLE_ROLES,
  },
  {
    path: '/student-resume-examples',
    title: 'Student and Fresher Resume Examples',
    description: 'Explore editable resume samples for college students, freshers, interns, final-year candidates, and students from leading Indian institutes.',
    examples: STUDENT_RESUME_EXAMPLES,
  },
  {
    path: '/resume-templates',
    title: 'Resume Templates for Every Application',
    description: 'Choose an editable ATS-friendly, one-page, modern, professional, or academic resume template and customize it in CareerSense.',
    examples: RESUME_TEMPLATE_EXAMPLES,
  },
];

const pages = collections.map((collection) => ({
  path: collection.path,
  title: `${collection.title} | CareerSense`,
  description: collection.description,
  body: `<main><h1>${escapeHtml(collection.title)}</h1><p>${escapeHtml(collection.description)}</p><ul>${collection.examples.map((item) => `<li><a href="${item.path}">${escapeHtml(item.role)} resume example</a></li>`).join('')}</ul></main>`,
  schema: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    url: `${siteUrl}${collection.path}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.examples.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: `${item.role} Resume Example`, url: `${siteUrl}${item.path}` })),
    },
  },
}));

const guideIndexDescription = 'Practical resume writing guides for structure, ATS keywords, skills, projects, fresher objectives, job tailoring, resume length, and applications in India.';
pages.push({
  path: '/resume-guides',
  title: 'Resume Writing Guides | CareerSense',
  description: guideIndexDescription,
  body: `<main><h1>Resume writing guides</h1><p>${escapeHtml(guideIndexDescription)}</p><ul>${RESUME_GUIDES.map((guide) => `<li><a href="${guide.path}">${escapeHtml(guide.title)}</a></li>`).join('')}</ul></main>`,
  schema: {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Resume Writing Guides', url: `${siteUrl}/resume-guides`,
    mainEntity: { '@type': 'ItemList', itemListElement: RESUME_GUIDES.map((guide, index) => ({ '@type': 'ListItem', position: index + 1, name: guide.title, url: `${siteUrl}${guide.path}` })) },
  },
});

for (const guide of RESUME_GUIDES) {
  pages.push({
    path: guide.path,
    title: `${guide.title} | CareerSense`,
    description: guide.description,
    body: `<main><nav><a href="/">Home</a> / <a href="/resume-guides">Resume Guides</a></nav><article><h1>${escapeHtml(guide.title)}</h1><p>${escapeHtml(guide.intro)}</p>${guide.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.text)}</p><ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul></section>`).join('')}<h2>Related resources</h2><ul>${guide.relatedPaths.map((path) => `<li><a href="${path}">Explore related resume resource</a></li>`).join('')}</ul></article></main>`,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Article', headline: guide.title, description: guide.description, mainEntityOfPage: `${siteUrl}${guide.path}`, author: { '@type': 'Organization', name: 'CareerSense' }, publisher: { '@type': 'Organization', name: 'CareerSense' } },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Resume Guides', item: `${siteUrl}/resume-guides` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: `${siteUrl}${guide.path}` },
        ] },
      ],
    },
  });
}

for (const example of ALL_RESUME_SEO_EXAMPLES) {
  const path = example.path;
  const collectionPath = example.family === 'student' ? '/student-resume-examples' : example.family === 'template' ? '/resume-templates' : '/resume-examples';
  const collectionName = example.family === 'student' ? 'Student Resume Examples' : example.family === 'template' ? 'Resume Templates' : 'Resume Examples';
  const pageHeading = example.family === 'template' ? `${example.role} template` : `${example.role} resume example`;
  const faqAnswer = `Include a focused summary, relevant education or experience, evidence-backed achievements, and skills such as ${example.skills.slice(0, 3).join(', ')}.`;
  pages.push({
    path,
    title: example.seoTitle,
    description: example.description,
    body: `<main><nav><a href="/">Home</a> / <a href="${collectionPath}">${collectionName}</a> / ${escapeHtml(example.role)}</nav><h1>${escapeHtml(pageHeading)}</h1><p>${escapeHtml(example.description)}</p><h2>Important ${escapeHtml(example.role)} skills</h2><ul>${example.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join('')}</ul><h2>${escapeHtml(example.role)} experience examples</h2><ul>${example.experienceRoles.map((role) => `<li>${escapeHtml(role)}</li>`).join('')}</ul><h2>Frequently asked questions</h2><h3>What should a ${escapeHtml(example.role.toLowerCase())} resume include?</h3><p>${escapeHtml(faqAnswer)}</p><a href="${collectionPath}">Explore more ${collectionName.toLowerCase()}</a></main>`,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: `${example.role} Resume Example`, description: example.description, url: `${siteUrl}${path}` },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: collectionName, item: `${siteUrl}${collectionPath}` },
          { '@type': 'ListItem', position: 3, name: `${example.role} Resume`, item: `${siteUrl}${path}` },
        ] },
        { '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: `What should a ${example.role.toLowerCase()} resume include?`, acceptedAnswer: { '@type': 'Answer', text: faqAnswer } }] },
      ],
    },
  });
}

const homeDescription = 'Build, tailor, and export a professional resume with CareerSense AI, editable templates, ATS guidance, and role-specific resume examples.';
const homeHtml = renderPage({
  path: '/',
  title: 'Free AI Resume Builder | Create a Professional CV in Minutes - CareerSense',
  description: homeDescription,
  body: `<main><h1>Free AI Resume Builder</h1><p>${escapeHtml(homeDescription)}</p><nav><h2>Explore resume resources</h2><ul><li><a href="/resume-examples">Professional resume examples by job</a></li><li><a href="/student-resume-examples">Student and fresher resume examples</a></li><li><a href="/resume-templates">Resume templates</a></li><li><a href="/resume-guides">Resume writing guides</a></li></ul></nav></main>`,
  schema: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CareerSense Resume Builder',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${siteUrl}/`,
    description: homeDescription,
  },
});
await writeFile(new URL('../dist/index.html', import.meta.url), homeHtml);

for (const page of pages) {
  const directory = new URL(`../dist${page.path}/`, import.meta.url);
  await mkdir(directory, { recursive: true });
  const html = renderPage(page);
  await writeFile(new URL('index.html', directory), html);
  await writeFile(new URL(`../dist${page.path}.html`, import.meta.url), html);
}

const allPaths = ['/', ...pages.map(({ path }) => path)];
const buildDate = new Date().toISOString().slice(0, 10);
const urls = allPaths.map((path) => `  <url><loc>${siteUrl}${path}</loc><lastmod>${buildDate}</lastmod><changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq></url>`).join('\n');
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
await writeFile(new URL('../dist/sitemap.xml', import.meta.url), sitemapXml);
await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemapXml);
await writeFile(new URL('../dist/robots.txt', import.meta.url), robotsTxt);
await writeFile(new URL('../public/robots.txt', import.meta.url), robotsTxt);

const csvEscape = (value = '') => `"${String(value).replaceAll('"', '""')}"`;
const inventoryRows = [
  ['URL', 'Cluster', 'Title', 'Indexing'],
  [`${siteUrl}/`, 'homepage', 'Free AI Resume Builder', 'index'],
  ...pages.map((page) => [
    `${siteUrl}${page.path}`,
    page.path.startsWith('/resume-guides') ? 'guide' : page.path.startsWith('/student-resume-examples') ? 'student' : page.path.startsWith('/resume-templates') ? 'template' : 'role',
    page.title,
    'index',
  ]),
];
await writeFile(
  new URL('../dist/seo-url-inventory.csv', import.meta.url),
  `${inventoryRows.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`
);

const priorityPaths = [
  '/',
  '/resume-examples',
  '/student-resume-examples',
  '/resume-templates',
  '/resume-guides',
  '/student-resume-examples/iit-resume',
  '/student-resume-examples/iim-resume',
  '/student-resume-examples/fresher-resume',
  '/student-resume-examples/internship-resume',
  '/resume-templates/ats-resume-template',
  '/resume-examples/software-engineer',
  '/resume-examples/data-analyst',
  '/resume-examples/business-analyst',
  '/resume-guides/resume-format-india',
  '/resume-guides/how-to-make-a-resume',
];
await writeFile(
  new URL('../dist/search-console-priority-urls.txt', import.meta.url),
  `${priorityPaths.map((path) => `${siteUrl}${path}`).join('\n')}\n`
);

console.log(`Prerendered ${pages.length} SEO pages and generated ${allPaths.length} sitemap URLs for ${siteUrl}`);
