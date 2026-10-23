import { writeFile } from 'node:fs/promises';
import process from 'node:process';
import { URL } from 'node:url';
import { ALL_RESUME_SEO_EXAMPLES } from '../src/data/resumeExampleSeo.js';
import { RESUME_GUIDES } from '../src/data/resumeGuideSeo.js';

/* global console */

const siteUrl = String(process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://resume.careersenseai.com').replace(/\/$/, '');

const paths = [
  '/',
  '/resume-examples',
  '/student-resume-examples',
  '/resume-templates',
  '/resume-guides',
  ...ALL_RESUME_SEO_EXAMPLES.map(({ path }) => path),
  ...RESUME_GUIDES.map(({ path }) => path),
];
const buildDate = new Date().toISOString().slice(0, 10);
const urls = paths.map((path) => `  <url><loc>${siteUrl}${path}</loc><lastmod>${buildDate}</lastmod><changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq></url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap);
await writeFile(
  new URL('../public/robots.txt', import.meta.url),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
);

try {
  await writeFile(new URL('../dist/sitemap.xml', import.meta.url), sitemap);
  await writeFile(
    new URL('../dist/robots.txt', import.meta.url),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  );
} catch {
  // dist directory does not exist yet; will be written on build
}

console.log(`Generated ${paths.length} sitemap URLs for ${siteUrl}`);
