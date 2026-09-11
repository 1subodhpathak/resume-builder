import { writeFile } from 'node:fs/promises';
import { RESUME_EXAMPLE_ROLES } from '../src/data/resumeExampleSeo.js';

const siteUrl = String(process.env.SITE_URL || '').replace(/\/$/, '');

if (!siteUrl) {
  throw new Error('SITE_URL is required. Example: SITE_URL=https://www.example.com npm run seo:sitemap');
}

const paths = ['/', '/resume-examples', ...RESUME_EXAMPLE_ROLES.map(({ slug }) => `/resume-examples/${slug}`)];
const urls = paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n');
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

console.log(`Generated ${paths.length} sitemap URLs for ${siteUrl}`);
