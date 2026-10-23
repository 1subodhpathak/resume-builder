# CareerSense SEO deployment checklist

## Before deployment

- Set `VITE_SITE_URL` to the exact public origin, without a trailing slash.
- Set `VITE_GA_MEASUREMENT_ID` to the GA4 web-stream ID. Leave it unset if analytics must remain disabled.
- Run `npm run build`.
- Confirm the build reports 62 prerendered SEO pages and 63 sitemap URLs.
- Inspect `dist/sitemap.xml`, `dist/robots.txt`, and a representative page under `dist/resume-guides/`.

## After deployment

1. Open the production homepage and confirm the canonical uses the production domain.
2. Confirm these return public HTML and load successfully:
   - `/sitemap.xml`
   - `/robots.txt`
   - `/resume-examples/software-engineer`
   - `/student-resume-examples/iit-resume`
   - `/resume-guides/resume-format-india`
3. Add or verify the domain property in Google Search Console.
4. Submit `https://YOUR-DOMAIN/sitemap.xml` in Search Console.
5. Use URL Inspection for the URLs listed in `dist/search-console-priority-urls.txt` and request indexing where available.
6. In GA4 Realtime, verify a `page_view` event appears.
7. Start from an SEO page and verify either `seo_resume_start` or `seo_template_use` appears.

## Weekly review

- Export Search Console queries and pages for the previous 28 days.
- Prioritize pages with impressions and average positions from 5 to 20.
- Improve titles when impressions grow but click-through rate remains low.
- Expand content only when a query introduces a new intent, not merely a wording variation.
- Check indexed-page totals against `dist/seo-url-inventory.csv`.
- Track resume starts and template uses by `content_group`, `content_slug`, and `template_id`.

## Generated deployment artifacts

- `dist/sitemap.xml`: complete XML sitemap.
- `dist/robots.txt`: crawler rules and sitemap declaration.
- `dist/seo-url-inventory.csv`: canonical URL, cluster, title, and indexing inventory.
- `dist/search-console-priority-urls.txt`: first URLs to inspect after launch.
