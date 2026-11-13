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

// ==========================================
// SHARED CSS (CAREERSENSE BRAND STYLING)
// ==========================================
const getSharedCss = () => `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background-color: #F7F8FA;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #071426;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  a { text-decoration: none; color: inherit; }

  /* NAVBAR */
  .cs-navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid #E1E7EF;
    box-shadow: 0 4px 18px rgba(7, 20, 38, 0.07);
  }
  .cs-nav-inner {
    max-width: 1420px;
    margin: 0 auto;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .cs-nav-left-group {
    display: flex;
    align-items: center;
    gap: 32px;
  }
  .cs-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cs-logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
    filter: drop-shadow(0 5px 10px rgba(7, 20, 38, 0.14));
  }
  .cs-brand-title {
    font-size: 23px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.045em;
    color: #071426;
  }
  .cs-brand-blue { color: #123B6D; }
  .cs-brand-sub {
    font-size: 9.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.28em;
    color: #9A7628;
    margin-top: 3px;
  }
  .cs-nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  @media (max-width: 900px) {
    .cs-nav-links { display: none; }
  }
  .cs-nav-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    transition: all 0.2s;
  }
  .cs-nav-link:hover {
    background: #E8EEF7;
    color: #071426;
  }
  .cs-chevron-icon {
    width: 14px;
    height: 14px;
    color: #64748B;
  }

  /* BREADCRUMBS */
  .cs-breadcrumbs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #7387A0;
    margin-bottom: 24px;
  }
  .cs-breadcrumbs a {
    color: #7387A0;
    transition: color 0.2s;
  }
  .cs-breadcrumbs a:hover {
    color: #123C69;
  }
  .cs-breadcrumbs-sep {
    color: #94A3B8;
    font-size: 12px;
  }
  .cs-breadcrumbs-curr {
    color: #173D69;
    font-weight: 700;
  }

  /* PAGE HERO */
  .cs-page-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(115deg, #FBF9F5 0%, #F7F9FC 46%, #E5EEF9 100%);
    border-bottom: 1px solid #D7E1EC;
    padding: 44px 24px 52px 24px;
  }
  .cs-page-hero-inner {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }
  .cs-pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    border: 1px solid #DFC998;
    background: #FFF8E9;
    color: #A2731D;
    margin-bottom: 18px;
    box-shadow: 0 4px 14px rgba(167, 117, 28, 0.08);
  }
  .cs-page-h1 {
    font-size: clamp(30px, 3.8vw, 48px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.04em;
    color: #0C2C53;
    margin: 0 0 16px 0;
    max-width: 820px;
  }
  .cs-h1-gold {
    background: linear-gradient(110deg, #DFB95C 0%, #B8862C 58%, #966A20 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .cs-page-intro {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.75;
    color: #516987;
    max-width: 720px;
    margin: 0 0 26px 0;
  }
  .cs-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 28px;
  }
  .cs-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 50px;
    padding: 12px 28px;
    border-radius: 14px;
    border: 1px solid #244C78;
    background: linear-gradient(180deg, #315E90 0%, #153B68 47%, #061B35 100%);
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 800;
    box-shadow: 0 12px 26px rgba(9, 39, 77, 0.20);
    transition: all 0.2s;
  }
  .cs-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 50px;
    padding: 12px 26px;
    border-radius: 14px;
    border: 1px solid #D6AA4C;
    background: #FFFDF8;
    color: #12365E;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 6px 18px rgba(196, 148, 57, 0.12);
    transition: all 0.2s;
  }
  .cs-benefit-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin-top: 24px;
    max-width: 720px;
  }
  .cs-benefit-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid #DFE6EE;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(25, 56, 90, 0.04);
  }
  .cs-benefit-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #FAF4E9;
    border: 1px solid #E7D3A8;
    color: #B17E26;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cs-benefit-title {
    font-size: 11px;
    font-weight: 800;
    color: #17375D;
    letter-spacing: 0.04em;
  }
  .cs-benefit-desc {
    font-size: 11px;
    color: #64748B;
  }

  /* CONTENT CONTAINER */
  .cs-content-container {
    max-width: 1400px;
    margin: 40px auto;
    padding: 0 24px;
  }
  .cs-two-col-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 36px;
    align-items: start;
  }
  @media (min-width: 1024px) {
    .cs-two-col-layout {
      grid-template-columns: 1.6fr 1fr;
      gap: 40px;
    }
  }

  /* SECTION CARDS */
  .cs-card {
    background: #FFFFFF;
    border: 1px solid #E1E7EF;
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 4px 16px rgba(7, 20, 38, 0.04);
    margin-bottom: 28px;
  }
  .cs-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .cs-card-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #FAF5E8;
    border: 1px solid #E9DCB8;
    color: #9A7628;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cs-card-title {
    font-size: 20px;
    font-weight: 800;
    color: #071426;
    margin: 0;
  }
  .cs-card-desc {
    font-size: 14.5px;
    line-height: 1.7;
    color: #475569;
    margin: 0 0 16px 0;
  }

  /* SKILL CLOUD */
  .cs-skill-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  .cs-skill-pill {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 9999px;
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    color: #123B6D;
    font-weight: 700;
    font-size: 13px;
  }

  /* BULLETS */
  .cs-bullet-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0 0 0;
    padding: 0;
    list-style: none;
  }
  .cs-bullet-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 14.5px;
    line-height: 1.6;
    color: #334155;
  }
  .cs-bullet-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    color: #2563EB;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* FAQS */
  .cs-faq-box {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 12px;
  }
  .cs-faq-q {
    font-size: 15px;
    font-weight: 800;
    color: #0F172A;
    margin: 0 0 8px 0;
  }
  .cs-faq-a {
    font-size: 14px;
    line-height: 1.65;
    color: #475569;
    margin: 0;
  }

  /* STICKY SIDEBAR CTA */
  .cs-sidebar-cta {
    background: linear-gradient(135deg, #FFFFFF 0%, #FAF8F2 100%);
    border: 2px solid #E9DCB8;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 16px 36px rgba(183, 137, 46, 0.12);
    position: sticky;
    top: 90px;
  }
  .cs-sidebar-eyebrow {
    font-size: 9.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #9A7628;
    margin-bottom: 10px;
  }
  .cs-sidebar-title {
    font-size: 22px;
    font-weight: 800;
    color: #071426;
    line-height: 1.2;
    margin: 0 0 12px 0;
  }
  .cs-sidebar-desc {
    font-size: 13.5px;
    line-height: 1.65;
    color: #556980;
    margin: 0 0 20px 0;
  }
  .cs-sidebar-btns {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 22px;
  }
  .cs-sidebar-checks {
    border-top: 1px solid #E9DCB8;
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
  }

  /* GRID CARDS */
  .cs-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }
  .cs-grid-card {
    background: #FFFFFF;
    border: 1px solid #E1E7EF;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 4px 14px rgba(7, 20, 38, 0.04);
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
  }
  .cs-grid-card:hover {
    border-color: #B9964A;
    box-shadow: 0 8px 24px rgba(7, 20, 38, 0.08);
  }
  .cs-grid-card-title {
    font-size: 15px;
    font-weight: 800;
    color: #071426;
    margin-bottom: 8px;
  }
  .cs-grid-card-desc {
    font-size: 12.5px;
    line-height: 1.6;
    color: #64748B;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .cs-grid-card-link {
    margin-top: auto;
    font-size: 12px;
    font-weight: 700;
    color: #123B6D;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  /* CATEGORY PILLS BAR */
  .cs-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 24px 0 32px 0;
  }
  .cs-filter-pill {
    padding: 9px 18px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid #D1DCE8;
    background: #FFFFFF;
    color: #334155;
    transition: all 0.2s;
  }
  .cs-filter-pill.active {
    background: #123B6D;
    color: #FFFFFF;
    border-color: #123B6D;
  }

  /* FOOTER */
  .cs-footer {
    background: #F8F7F3;
    border-top: 1px solid #D8E0EA;
    margin-top: 60px;
  }
  .cs-footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 56px 24px 36px 24px;
  }
  .cs-footer-grid {
    display: grid;
    grid-template-columns: 1.3fr 0.8fr 0.8fr 1.1fr;
    gap: 40px;
    padding-bottom: 40px;
    border-bottom: 1px solid #CCD7E2;
  }
  @media (max-width: 900px) {
    .cs-footer-grid { grid-template-columns: 1fr; gap: 32px; }
  }
  .cs-footer-about {
    font-size: 12px;
    line-height: 1.7;
    color: #5F7288;
    max-width: 380px;
    margin: 16px 0 20px 0;
  }
  .cs-footer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .cs-footer-btn-primary {
    display: inline-flex;
    align-items: center;
    background: #123B6D;
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 800;
    padding: 9px 16px;
    border-radius: 8px;
  }
  .cs-footer-btn-secondary {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.6);
    color: #315D88;
    border: 1px solid #C9D6E2;
    font-size: 11px;
    font-weight: 700;
    padding: 9px 16px;
    border-radius: 8px;
  }
  .cs-footer-heading {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #9A7628;
    margin: 0 0 16px 0;
  }
  .cs-footer-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cs-footer-links a {
    font-size: 12px;
    font-weight: 600;
    color: #5F7288;
    transition: color 0.2s;
  }
  .cs-footer-links a:hover {
    color: #123B6D;
  }
  .cs-trust-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .cs-trust-item strong {
    display: block;
    font-size: 11px;
    font-weight: 800;
    color: #173A62;
  }
  .cs-trust-item p {
    margin: 2px 0 0 0;
    font-size: 10.5px;
    line-height: 1.6;
    color: #667A91;
  }
  .cs-footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    font-size: 11px;
    color: #71849A;
  }
  .cs-back-top {
    font-weight: 700;
    color: #315D88;
  }
`;

// ==========================================
// SHARED NAVBAR & FOOTER HTML
// ==========================================
const getSharedNavbarHtml = () => `
  <header class="cs-navbar">
    <div class="cs-nav-inner">
      <div class="cs-nav-left-group">
        <a href="/" class="cs-brand">
          <img src="/cs_logo.png" alt="CareerSense Logo" class="cs-logo" />
          <div class="cs-brand-text">
            <div class="cs-brand-title"><span>Career</span><span class="cs-brand-blue">Sense</span></div>
            <div class="cs-brand-sub">Resume Builder</div>
          </div>
        </a>
        <nav class="cs-nav-links">
          <a href="https://careersenseai.com/#career-tools" class="cs-nav-link">
            <span>CareerSense Tools</span>
            <svg class="cs-chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </a>
          <a href="/#features" class="cs-nav-link">Features</a>
          <a href="/templates" class="cs-nav-link">Templates</a>
          <a href="/#faqs" class="cs-nav-link">FAQs</a>
          <a href="https://careersenseai.com/pricing" class="cs-nav-link">Pricing</a>
        </nav>
      </div>
    </div>
  </header>`;

const getSharedFooterHtml = () => `
  <footer class="cs-footer">
    <div class="cs-footer-container">
      <div class="cs-footer-grid">
        <div class="cs-footer-brand-col">
          <a href="/" class="cs-brand">
            <img src="/cs_logo.png" alt="CareerSense Logo" class="cs-logo" />
            <div class="cs-brand-text">
              <div class="cs-brand-title"><span>Career</span><span class="cs-brand-blue">Sense</span></div>
              <div class="cs-brand-sub">Resume Builder</div>
            </div>
          </a>
          <p class="cs-footer-about">
            Build, import, tailor, review, and export a professional resume from one guided workspace.
          </p>
          <div class="cs-footer-actions">
            <a href="/select" class="cs-footer-btn-primary">Create a resume &rarr;</a>
            <a href="/dashboard" class="cs-footer-btn-secondary">Open dashboard</a>
          </div>
        </div>

        <div class="cs-footer-col">
          <h3 class="cs-footer-heading">Product</h3>
          <ul class="cs-footer-links">
            <li><a href="/select">Resume builder</a></li>
            <li><a href="/templates">Resume templates</a></li>
            <li><a href="/upload">Exact Import</a></li>
            <li><a href="/#how-it-works">How it works</a></li>
            <li><a href="https://ats.careersenseai.com/">ATS Score Checker</a></li>
          </ul>
        </div>

        <div class="cs-footer-col">
          <h3 class="cs-footer-heading">Resources</h3>
          <ul class="cs-footer-links">
            <li><a href="/resume-examples">Resume examples</a></li>
            <li><a href="/resume-examples">Examples by job</a></li>
            <li><a href="/student-resume-examples">Student &amp; fresher resumes</a></li>
            <li><a href="/resume-templates">Resume template library</a></li>
            <li><a href="/resume-guides">Resume writing guides</a></li>
            <li><a href="/#faqs">Help and FAQ</a></li>
          </ul>
        </div>

        <div class="cs-footer-col">
          <h3 class="cs-footer-heading">What to expect</h3>
          <div class="cs-trust-box">
            <div class="cs-trust-item">
              <strong>Supported files:</strong>
              <p>Upload PDF, DOCX, or TXT resumes and review extracted fields before export.</p>
            </div>
            <div class="cs-trust-item">
              <strong>Transparent AI usage:</strong>
              <p>Point estimates appear before AI-assisted flows and vary with document length.</p>
            </div>
            <div class="cs-trust-item">
              <strong>You stay in control:</strong>
              <p>Imported and AI-assisted content remains editable throughout the builder.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="cs-footer-bottom">
        <span>&copy; ${new Date().getFullYear()} CareerSense. All rights reserved.</span>
        <a href="#top" class="cs-back-top">Back to top &uarr;</a>
      </div>
    </div>
  </footer>`;

// ==========================================
// 1. TEMPLATES GALLERY PAGE (/templates)
// ==========================================
const FEATURED_TEMPLATES = [
  { id: 'ats', name: 'ATS Single-Column', role: 'ATS-Compliant', desc: 'Standard single-column format verified for 100% parse rates in Workday, Greenhouse, and Taleo.' },
  { id: 'executive', name: 'Executive Leader', role: 'Executive', desc: 'Sleek corporate layout with executive summary, board seats, and P&L impact highlights.' },
  { id: 'modern', name: 'Modern Professional', role: 'Corporate', desc: 'Clean two-column design balancing chronological experience with core competencies.' },
  { id: 'software-engineer', name: 'Developer Console', role: 'Engineering', desc: 'Technical format highlighting GitHub projects, languages, frameworks, and architecture.' },
  { id: 'reporting-mis', name: 'Data Analyst & Reporting', role: 'Analytics', desc: 'Metrics-driven structure emphasizing SQL, BI dashboards, data modeling, and business results.' },
  { id: 'student-notes', name: 'Fresher & Campus', role: 'Students', desc: 'Education-forward layout emphasizing academic coursework, projects, internships, and extracurricular achievements.' },
  { id: 'product-manager', name: 'Product Leader', role: 'Product', desc: 'Roadmap and product metrics format with cross-functional leadership and growth outcomes.' },
  { id: 'chartered-accountant', name: 'Finance & Audit', role: 'Accounting', desc: 'Structured financial reporting, compliance, taxation, and statutory audit showcase.' },
];

const buildTemplatesPageBody = () => `
  <section class="cs-page-hero">
    <div class="cs-page-hero-inner">
      <nav class="cs-breadcrumbs">
        <a href="/">Home</a>
        <span class="cs-breadcrumbs-sep">/</span>
        <span class="cs-breadcrumbs-curr">Resume Templates</span>
      </nav>
      <div class="cs-pill-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        100+ Professional Designs
      </div>
      <h1 class="cs-page-h1">Free ATS Resume Templates &amp; <span class="cs-h1-gold">Builder Gallery</span></h1>
      <p class="cs-page-intro">Browse 100+ professional, modern, and ATS-friendly resume templates. Pick an editable design, customize sections with AI, and export print-ready PDFs.</p>
      <div class="cs-hero-actions">
        <a href="/select" class="cs-btn-primary">
          <span>Start Building with AI</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/upload" class="cs-btn-secondary">
          <span>Upload Existing Resume</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9M16 16l-4-4-4 4"/></svg>
        </a>
      </div>
      <div class="cs-filter-bar">
        <span class="cs-filter-pill active">All Templates (100+)</span>
        <span class="cs-filter-pill">ATS-Compliant</span>
        <span class="cs-filter-pill">Professional &amp; Executive</span>
        <span class="cs-filter-pill">Modern &amp; Creative</span>
        <span class="cs-filter-pill">Student &amp; Entry-Level</span>
        <span class="cs-filter-pill">Academic</span>
      </div>
    </div>
  </section>

  <main class="cs-content-container">
    <div class="cs-cards-grid" style="margin-bottom: 40px;">
      ${FEATURED_TEMPLATES.map((tpl) => `
        <div class="cs-card" style="margin-bottom: 0;">
          <div class="cs-card-header">
            <div class="cs-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            </div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #9A7628; text-transform: uppercase; letter-spacing: 0.1em;">${escapeHtml(tpl.role)}</div>
              <h2 class="cs-card-title" style="font-size: 17px;">${escapeHtml(tpl.name)}</h2>
            </div>
          </div>
          <p class="cs-card-desc">${escapeHtml(tpl.desc)}</p>
          <a href="/select" class="cs-grid-card-link">Use This Template &rarr;</a>
        </div>
      `).join('')}
    </div>

    <div class="cs-card">
      <h2 class="cs-card-title">Why CareerSense Templates Pass Every ATS</h2>
      <p class="cs-card-desc">Every layout in our gallery follows strict ATS-compliance standards so your resume gets in front of human hiring managers:</p>
      <ul class="cs-bullet-list">
        <li class="cs-bullet-item">
          <span class="cs-bullet-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span><strong>Machine-Readable Single &amp; Two-Column Architecture:</strong> Content streams sequentially through parsing algorithms without columns merging.</span>
        </li>
        <li class="cs-bullet-item">
          <span class="cs-bullet-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span><strong>Selectable Vector Text:</strong> No flattened images, raster icons, or tables that block OCR scanning.</span>
        </li>
        <li class="cs-bullet-item">
          <span class="cs-bullet-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
          <span><strong>Standardized Section Headings:</strong> Universal labels (Experience, Skills, Education) that recruiting software immediately recognizes.</span>
        </li>
      </ul>
    </div>
  </main>`;

// ==========================================
// 2. COLLECTION INDEX PAGES
// ==========================================
const buildCollectionPageBody = (collection) => `
  <section class="cs-page-hero">
    <div class="cs-page-hero-inner">
      <nav class="cs-breadcrumbs">
        <a href="/">Home</a>
        <span class="cs-breadcrumbs-sep">/</span>
        <span class="cs-breadcrumbs-curr">${escapeHtml(collection.title)}</span>
      </nav>
      <div class="cs-pill-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        Curated Library
      </div>
      <h1 class="cs-page-h1">${escapeHtml(collection.title)}</h1>
      <p class="cs-page-intro">${escapeHtml(collection.description)}</p>
      <div class="cs-hero-actions">
        <a href="/select" class="cs-btn-primary">
          <span>Start Building with AI</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/templates" class="cs-btn-secondary">
          <span>View All 100+ Templates</span>
        </a>
      </div>
    </div>
  </section>

  <main class="cs-content-container">
    <div class="cs-cards-grid">
      ${collection.examples.map((item) => `
        <a href="${item.path}" class="cs-grid-card">
          <div class="cs-grid-card-title">${escapeHtml(item.role)}</div>
          <div class="cs-grid-card-desc">ATS-friendly resume sample, important keywords, skills, and editable template for ${escapeHtml(item.role.toLowerCase())} roles.</div>
          <div class="cs-skill-cloud" style="margin-bottom: 16px;">
            ${(item.skills || []).slice(0, 3).map((s) => `<span class="cs-skill-pill" style="font-size: 11px; padding: 4px 10px;">${escapeHtml(s)}</span>`).join('')}
          </div>
          <span class="cs-grid-card-link">
            <span>View Example &amp; Template</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </a>
      `).join('')}
    </div>
  </main>`;

// ==========================================
// 3. RESUME GUIDES INDEX (/resume-guides)
// ==========================================
const buildGuidesIndexBody = () => `
  <section class="cs-page-hero">
    <div class="cs-page-hero-inner">
      <nav class="cs-breadcrumbs">
        <a href="/">Home</a>
        <span class="cs-breadcrumbs-sep">/</span>
        <span class="cs-breadcrumbs-curr">Resume Writing Guides</span>
      </nav>
      <div class="cs-pill-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Expert Advice
      </div>
      <h1 class="cs-page-h1">Resume Writing Guides &amp; <span class="cs-h1-gold">Best Practices</span></h1>
      <p class="cs-page-intro">Practical resume writing guides for structure, ATS keywords, skills, projects, fresher objectives, job tailoring, resume length, and applications in India.</p>
      <div class="cs-hero-actions">
        <a href="/select" class="cs-btn-primary">
          <span>Start Building with AI</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </section>

  <main class="cs-content-container">
    <div class="cs-cards-grid">
      ${RESUME_GUIDES.map((guide) => `
        <a href="${guide.path}" class="cs-grid-card">
          <div class="cs-grid-card-title">${escapeHtml(guide.title)}</div>
          <div class="cs-grid-card-desc">${escapeHtml(guide.description)}</div>
          <span class="cs-grid-card-link">
            <span>Read Complete Guide</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </a>
      `).join('')}
    </div>
  </main>`;

// ==========================================
// 4. INDIVIDUAL RESUME GUIDE
// ==========================================
const buildGuidePageBody = (guide) => `
  <section class="cs-page-hero">
    <div class="cs-page-hero-inner">
      <nav class="cs-breadcrumbs">
        <a href="/">Home</a>
        <span class="cs-breadcrumbs-sep">/</span>
        <a href="/resume-guides">Resume Guides</a>
        <span class="cs-breadcrumbs-sep">/</span>
        <span class="cs-breadcrumbs-curr">${escapeHtml(guide.title)}</span>
      </nav>
      <div class="cs-pill-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
        5 Min Read • ATS Best Practice
      </div>
      <h1 class="cs-page-h1">${escapeHtml(guide.title)}</h1>
      <p class="cs-page-intro">${escapeHtml(guide.intro)}</p>
      <div class="cs-hero-actions">
        <a href="/select" class="cs-btn-primary">
          <span>Apply in Resume Builder</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/templates" class="cs-btn-secondary">
          <span>Browse ATS Templates</span>
        </a>
      </div>
    </div>
  </section>

  <main class="cs-content-container">
    <div class="cs-two-col-layout">
      <article>
        ${guide.sections.map((section) => `
          <div class="cs-card">
            <h2 class="cs-card-title">${escapeHtml(section.heading)}</h2>
            <p class="cs-card-desc" style="margin-top: 12px;">${escapeHtml(section.text)}</p>
            <ul class="cs-bullet-list">
              ${section.bullets.map((bullet) => `
                <li class="cs-bullet-item">
                  <span class="cs-bullet-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <span>${escapeHtml(bullet)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}

        <div class="cs-card">
          <h2 class="cs-card-title">Related Resources</h2>
          <div class="cs-cards-grid" style="margin-top: 16px;">
            ${guide.relatedPaths.map((path) => `
              <a href="${path}" class="cs-grid-card" style="padding: 16px;">
                <span class="cs-grid-card-link">
                  <span>${escapeHtml(path.split('/').pop().replaceAll('-', ' '))}</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </a>
            `).join('')}
          </div>
        </div>
      </article>

      <aside>
        <div class="cs-sidebar-cta">
          <div class="cs-sidebar-eyebrow">Interactive Builder</div>
          <h3 class="cs-sidebar-title">Put This Guide into Practice</h3>
          <p class="cs-sidebar-desc">Create your ATS-optimized resume using CareerSense AI. Pre-loaded with smart bullet suggestions and certified layouts.</p>
          <div class="cs-sidebar-btns">
            <a href="/select" class="cs-btn-primary" style="justify-content: center;">
              <span>Create My Resume Now</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="/upload" class="cs-btn-secondary" style="justify-content: center;">
              <span>Upload Existing File</span>
            </a>
          </div>
          <div class="cs-sidebar-checks">
            <div>&check; 100% ATS Verified formatting</div>
            <div>&check; Built-in AI bullet points</div>
            <div>&check; Free instant PDF export</div>
          </div>
        </div>
      </aside>
    </div>
  </main>`;

// ==========================================
// 5. INDIVIDUAL ROLE/EXAMPLE PAGE
// ==========================================
const buildExamplePageBody = (example, collectionPath, collectionName) => {
  const descriptor = example.family === 'student'
    ? 'STUDENT & FRESHER RESUME'
    : example.family === 'template'
      ? 'PROFESSIONAL RESUME TEMPLATE'
      : 'PROFESSION-BASED RESUME EXAMPLE';
  const headlineAccent = example.family === 'template' ? 'Template' : 'Resume Example';
  const faqAnswer = `Include a focused summary, relevant education or experience, evidence-backed achievements, and skills such as ${example.skills.slice(0, 3).join(', ')}.`;

  return `
  <section class="cs-page-hero">
    <div class="cs-page-hero-inner">
      <nav class="cs-breadcrumbs">
        <a href="/">Home</a>
        <span class="cs-breadcrumbs-sep">/</span>
        <a href="${collectionPath}">${collectionName}</a>
        <span class="cs-breadcrumbs-sep">/</span>
        <span class="cs-breadcrumbs-curr">${escapeHtml(example.role)}</span>
      </nav>
      <div class="cs-pill-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        ${descriptor}
      </div>
      <h1 class="cs-page-h1">${escapeHtml(example.role)} <span class="cs-h1-gold">${headlineAccent}</span></h1>
      <p class="cs-page-intro">${escapeHtml(example.description)}</p>
      <div class="cs-hero-actions">
        <a href="/select" class="cs-btn-primary">
          <span>Use This Template Now</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/upload" class="cs-btn-secondary">
          <span>Upload &amp; Tailor My Resume</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9M16 16l-4-4-4 4"/></svg>
        </a>
      </div>
      <div class="cs-benefit-row">
        <div class="cs-benefit-card">
          <div class="cs-benefit-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div class="cs-benefit-title">ATS-READABLE</div>
            <div class="cs-benefit-desc">Passes recruiter filters</div>
          </div>
        </div>
        <div class="cs-benefit-card">
          <div class="cs-benefit-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>
          </div>
          <div>
            <div class="cs-benefit-title">TRUE A4 FORMAT</div>
            <div class="cs-benefit-desc">Clean print-ready layout</div>
          </div>
        </div>
        <div class="cs-benefit-card">
          <div class="cs-benefit-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div>
            <div class="cs-benefit-title">FULLY EDITABLE</div>
            <div class="cs-benefit-desc">AI-assisted customization</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <main class="cs-content-container">
    <div class="cs-two-col-layout">
      <div>
        <div class="cs-card">
          <div class="cs-card-header">
            <div class="cs-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <h2 class="cs-card-title">Important ${escapeHtml(example.role)} Skills</h2>
          </div>
          <p class="cs-card-desc">Highlight core hard and soft skills that hiring managers and applicant tracking systems search for when evaluating candidates for ${escapeHtml(example.role.toLowerCase())} roles.</p>
          <div class="cs-skill-cloud">
            ${example.skills.map((skill) => `<span class="cs-skill-pill">${escapeHtml(skill)}</span>`).join('')}
          </div>
        </div>

        <div class="cs-card">
          <div class="cs-card-header">
            <div class="cs-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h2 class="cs-card-title">${escapeHtml(example.role)} Experience &amp; Impact Examples</h2>
          </div>
          <p class="cs-card-desc">Targeted sample roles and impact statements you can adapt for your background:</p>
          <ul class="cs-bullet-list">
            ${example.experienceRoles.map((role) => `
              <li class="cs-bullet-item">
                <span class="cs-bullet-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <div>
                  <strong>${escapeHtml(role)}:</strong> Led projects, drove quantitative improvements, and collaborated cross-functionally using modern industry practices.
                </div>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="cs-card">
          <div class="cs-card-header">
            <div class="cs-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </div>
            <h2 class="cs-card-title">Frequently Asked Questions</h2>
          </div>
          <div class="cs-faq-box">
            <h3 class="cs-faq-q">What should a ${escapeHtml(example.role.toLowerCase())} resume include?</h3>
            <p class="cs-faq-a">${escapeHtml(faqAnswer)}</p>
          </div>
          <div class="cs-faq-box">
            <h3 class="cs-faq-q">How do I make this resume ATS-friendly?</h3>
            <p class="cs-faq-a">Use standard section headings, match truthful keywords from the target job posting, keep important details as selectable text, and quantify results where possible.</p>
          </div>
        </div>
      </div>

      <aside>
        <div class="cs-sidebar-cta">
          <div class="cs-sidebar-eyebrow">CareerSense AI</div>
          <h3 class="cs-sidebar-title">Build Your ${escapeHtml(example.role)} Resume</h3>
          <p class="cs-sidebar-desc">Start with pre-loaded ${escapeHtml(example.role.toLowerCase())} skills and verified formatting. Export ATS-ready PDF in 5 minutes.</p>
          <div class="cs-sidebar-btns">
            <a href="/select" class="cs-btn-primary" style="justify-content: center;">
              <span>Use This Template Now</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="/upload" class="cs-btn-secondary" style="justify-content: center;">
              <span>Upload Existing Resume</span>
            </a>
          </div>
          <div class="cs-sidebar-checks">
            <div>&check; Pre-loaded with ${escapeHtml(example.skills[0] || 'core')} skills</div>
            <div>&check; 100% ATS score verified</div>
            <div>&check; Vector PDF export with clean fonts</div>
          </div>
        </div>
      </aside>
    </div>
  </main>`;
};

// ==========================================
// UNIFIED PAGE RENDERER
// ==========================================
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
    <meta name="twitter:card" content="summary_large_image" />
    <style id="cs-page-styles">
      ${getSharedCss()}
    </style>
    <script type="application/ld+json">${escapeJson(schema)}</script>`;

  const prerenderBody = `
    ${getSharedNavbarHtml()}
    ${body}
    ${getSharedFooterHtml()}
  `;

  return baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta name="description"[\s\S]*?>/i, '')
    .replace(/<meta name="robots"[\s\S]*?>/i, '')
    .replace(/<link rel="canonical"[\s\S]*?>/i, '')
    .replace(/<meta property="og:[\s\S]*?>/gi, '')
    .replace(/<meta name="twitter:[\s\S]*?>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace('</head>', `${head}\n</head>`)
    .replace(/<div id="root">[\s\S]*<\/div>(?=\s*<script|\s*<\/body>)/i, `<div id="root">${prerenderBody}</div>`);
};

// ==========================================
// BUILD PAGE INVENTORY
// ==========================================
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
  body: buildCollectionPageBody(collection),
  schema: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    url: `${siteUrl}${collection.path}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.examples.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${item.role} Resume Example`,
        url: `${siteUrl}${item.path}`,
      })),
    },
  },
}));

const guideIndexDescription = 'Practical resume writing guides for structure, ATS keywords, skills, projects, fresher objectives, job tailoring, resume length, and applications in India.';
pages.push({
  path: '/resume-guides',
  title: 'Resume Writing Guides | CareerSense',
  description: guideIndexDescription,
  body: buildGuidesIndexBody(),
  schema: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Resume Writing Guides',
    url: `${siteUrl}/resume-guides`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: RESUME_GUIDES.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: guide.title,
        url: `${siteUrl}${guide.path}`,
      })),
    },
  },
});

const templatesPageDescription = 'Browse 100+ professional, modern, and ATS-friendly resume templates. Pick a design and start building your resume with AI.';
pages.push({
  path: '/templates',
  title: 'Free ATS Resume Templates & Builder Gallery | CareerSense',
  description: templatesPageDescription,
  body: buildTemplatesPageBody(),
  schema: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Free ATS Resume Templates & Builder Gallery',
        description: templatesPageDescription,
        url: `${siteUrl}/templates`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Templates', item: `${siteUrl}/templates` },
        ],
      },
    ],
  },
});

for (const guide of RESUME_GUIDES) {
  pages.push({
    path: guide.path,
    title: `${guide.title} | CareerSense`,
    description: guide.description,
    body: buildGuidePageBody(guide),
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          mainEntityOfPage: `${siteUrl}${guide.path}`,
          author: { '@type': 'Organization', name: 'CareerSense' },
          publisher: { '@type': 'Organization', name: 'CareerSense' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'Resume Guides', item: `${siteUrl}/resume-guides` },
            { '@type': 'ListItem', position: 3, name: guide.title, item: `${siteUrl}${guide.path}` },
          ],
        },
      ],
    },
  });
}

for (const example of ALL_RESUME_SEO_EXAMPLES) {
  const path = example.path;
  const collectionPath = example.family === 'student' ? '/student-resume-examples' : example.family === 'template' ? '/resume-templates' : '/resume-examples';
  const collectionName = example.family === 'student' ? 'Student Resume Examples' : example.family === 'template' ? 'Resume Templates' : 'Resume Examples';
  const faqAnswer = `Include a focused summary, relevant education or experience, evidence-backed achievements, and skills such as ${example.skills.slice(0, 3).join(', ')}.`;

  pages.push({
    path,
    title: example.seoTitle,
    description: example.description,
    body: buildExamplePageBody(example, collectionPath, collectionName),
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: `${example.role} Resume Example`, description: example.description, url: `${siteUrl}${path}` },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
            { '@type': 'ListItem', position: 2, name: collectionName, item: `${siteUrl}${collectionPath}` },
            { '@type': 'ListItem', position: 3, name: `${example.role} Resume`, item: `${siteUrl}${path}` },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `What should a ${example.role.toLowerCase()} resume include?`,
              acceptedAnswer: { '@type': 'Answer', text: faqAnswer },
            },
          ],
        },
      ],
    },
  });
}

// ==========================================
// 6. REAL HOMEPAGE CONTENT (FULL EDITORIAL)
// ==========================================
const renderFullHomepage = () => {
  const canonical = `${siteUrl}/`;
  const title = 'Free AI Resume Builder | Create a Professional CV in Minutes - CareerSense';
  const description = 'Build, tailor, and export a professional resume with CareerSense AI, editable templates, ATS guidance, and role-specific resume examples.';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CareerSense Resume Builder',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${siteUrl}/`,
    description,
  };

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
    <meta name="twitter:card" content="summary_large_image" />
    <style id="cs-home-styles">
      ${getSharedCss()}

      /* HERO SECTION */
      .cs-hero {
        position: relative;
        overflow: hidden;
        background-color: #F7F8FA;
        background-image:
          radial-gradient(circle at 12% 18%, rgba(185, 150, 74, 0.15), transparent 28%),
          radial-gradient(circle at 82% 12%, rgba(18, 59, 109, 0.30), transparent 34%),
          radial-gradient(circle at 72% 85%, rgba(11, 31, 58, 0.18), transparent 36%),
          linear-gradient(135deg, #F7F8FA 0%, #FFFFFF 42%, #E8EEF7 70%, #0B1F3A 100%);
        border-bottom: 1px solid #E1E7EF;
        padding: 48px 24px 48px 24px;
      }
      .cs-hero-grid-bg {
        position: absolute;
        inset: 0;
        opacity: 0.35;
        background-image:
          linear-gradient(to right, rgba(203, 213, 225, 0.42) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(203, 213, 225, 0.42) 1px, transparent 1px);
        background-size: 32px 32px;
        pointer-events: none;
        mask-image: radial-gradient(ellipse 95% 95% at 50% 50%, black 22%, transparent 100%);
        -webkit-mask-image: radial-gradient(ellipse 95% 95% at 50% 50%, black 22%, transparent 100%);
      }
      .cs-hero-container {
        position: relative;
        z-index: 10;
        max-width: 1400px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
        gap: 40px;
      }
      @media (min-width: 1024px) {
        .cs-hero-container {
          grid-template-columns: 1.05fr 0.95fr;
          gap: 40px;
        }
      }
      .cs-hero-eyebrow {
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.25em;
        margin-bottom: 16px;
        background: linear-gradient(90deg, #8E651D 0%, #B78A32 50%, #D5B15E 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .cs-hero-h1 {
        font-size: clamp(34px, 4.2vw, 55px);
        font-weight: 800;
        line-height: 1.04;
        letter-spacing: -0.045em;
        margin: 0 0 20px 0;
      }
      .cs-h1-gradient-navy {
        background: linear-gradient(180deg, #294D7D 0%, #112F58 50%, #06172C 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .cs-h1-gradient-gold {
        background: linear-gradient(180deg, #E8C76F 0%, #BB8D32 50%, #886018 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .cs-hero-desc {
        font-size: 16px;
        font-weight: 500;
        line-height: 1.7;
        color: #465A76;
        max-width: 560px;
        margin: 0 0 28px 0;
      }
      .cs-hero-ctas {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 28px;
      }
      .cs-btn-hero-primary {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: linear-gradient(180deg, #264B78 0%, #102D52 50%, #06172C 100%);
        color: #FFFFFF;
        font-size: 14px;
        font-weight: 800;
        min-height: 50px;
        padding: 13px 44px;
        border-radius: 15px;
        border: 1px solid #183A66;
        box-shadow: 0 10px 24px rgba(6, 23, 44, 0.18);
      }
      .cs-btn-hero-secondary {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: #FFFDF7;
        color: #102D52;
        font-size: 14px;
        font-weight: 700;
        min-height: 50px;
        padding: 13px 28px;
        border-radius: 15px;
        border: 1px solid #D4A843;
        box-shadow: 0 6px 18px rgba(212, 168, 67, 0.12);
      }

      /* 3 PATH CARDS */
      .cs-path-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-bottom: 24px;
      }
      .cs-path-card {
        background: #FFFFFF;
        border: 1px solid #E1E7EF;
        border-radius: 14px;
        padding: 16px;
        box-shadow: 0 4px 14px rgba(7, 20, 38, 0.04);
        display: flex;
        flex-direction: column;
        min-height: 170px;
      }
      .cs-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cs-card-icon-tile {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #FAF5E8;
        border: 1px solid #E9DCB8;
        color: #9A7628;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-card-arrow {
        color: #B78A32;
      }
      .cs-path-card-title {
        font-size: 14px;
        font-weight: 800;
        color: #071426;
        margin-top: 18px;
        line-height: 1.2;
      }
      .cs-path-card-desc {
        font-size: 11.5px;
        color: #64748B;
        margin-top: 6px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .cs-card-action {
        margin-top: auto;
        padding-top: 14px;
        font-size: 11.5px;
        font-weight: 700;
        color: #8293A6;
      }

      /* 4 STATS ROW */
      .cs-stats-row {
        border-top: 1px solid #D6DEE8;
        padding-top: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      .cs-stat-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cs-stat-icon-tile {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: #FFFFFF;
        border: 1px solid #E1E7EF;
        color: #9A7628;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(7, 20, 38, 0.04);
      }
      .cs-stat-value {
        font-size: 19px;
        font-weight: 800;
        color: #071426;
        line-height: 1;
      }
      .cs-stat-label {
        font-size: 9.5px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #64748B;
        margin-top: 3px;
      }

      /* RIGHT COLUMN MOCKUP */
      .cs-hero-right {
        display: none;
      }
      @media (min-width: 1024px) {
        .cs-hero-right {
          display: block;
          position: relative;
          height: 440px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.55);
          padding: 10px;
          box-shadow: 0 24px 60px rgba(6, 23, 44, 0.13);
          backdrop-filter: blur(2px);
        }
      }
      .cs-mockup-inner {
        height: 100%;
        border-radius: 16px;
        border: 1px solid #E1E7EF;
        background: #F7F8FA;
        display: flex;
        overflow: hidden;
      }
      .cs-mockup-sidebar {
        width: 176px;
        flex-shrink: 0;
        background: #FFFFFF;
        border-right: 1px solid #E1E7EF;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cs-mockup-brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cs-mockup-brand-icon {
        width: 20px;
        height: 20px;
        border-radius: 5px;
        background: #071426;
        color: #FFF;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-mockup-brand-title {
        font-size: 12px;
        font-weight: 700;
        color: #071426;
        letter-spacing: -0.02em;
      }
      .cs-mockup-progress-lbl {
        font-size: 8px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #64748B;
      }
      .cs-mockup-progress-bar {
        height: 4px;
        width: 100%;
        background: #E1E7EF;
        border-radius: 9999px;
        overflow: hidden;
        margin-top: 6px;
      }
      .cs-mockup-progress-fill {
        height: 100%;
        width: 45%;
        background: #B9964A;
      }
      .cs-mockup-gauge-box {
        background: #071426;
        border: 1px solid #0B1F3A;
        border-radius: 14px;
        padding: 12px;
        text-align: center;
        box-shadow: 0 12px 30px rgba(11, 18, 32, 0.2);
      }
      .cs-mockup-gauge-title {
        font-size: 8px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #CBD5E1;
        margin-bottom: 8px;
      }
      .cs-mockup-gauge-dial {
        position: relative;
        width: 64px;
        height: 64px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-mockup-score-num {
        position: absolute;
        font-size: 18px;
        font-weight: 900;
        color: #FFFFFF;
      }
      .cs-mockup-checklist {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 10px;
      }
      .cs-mockup-check-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #475569;
      }
      .cs-check-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        border: 1px solid #CBD5E1;
      }

      /* RIGHT DOCUMENT PREVIEW */
      .cs-mockup-canvas {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #F7F8FA;
        background-image:
          linear-gradient(to right, rgba(203, 213, 225, 0.38) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(203, 213, 225, 0.32) 1px, transparent 1px);
        background-size: 28px 28px;
        padding: 20px;
      }
      .cs-mockup-doc {
        position: relative;
        z-index: 5;
        width: 260px;
        background: #FFFFFF;
        border-radius: 10px;
        padding: 24px 20px;
        box-shadow: 0 16px 40px rgba(7, 20, 38, 0.08);
        border: 1px solid #E1E7EF;
      }
      .cs-doc-name {
        font-size: 16px;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: #071426;
        text-transform: uppercase;
      }
      .cs-doc-line {
        height: 1.5px;
        width: 100%;
        background: #071426;
        margin: 10px 0 14px 0;
      }
      .cs-doc-section-title {
        font-size: 9px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: #64748B;
        margin-bottom: 8px;
      }
      .cs-doc-bar {
        height: 6px;
        border-radius: 3px;
        background: #E8EEF5;
        margin-bottom: 6px;
      }
      .cs-mockup-cursor {
        position: absolute;
        top: 140px;
        left: 30px;
        z-index: 10;
        color: #071426;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
      }
    </style>
    <script type="application/ld+json">${escapeJson(schema)}</script>`;

  const body = `
  ${getSharedNavbarHtml()}

  <main class="cs-main">
    <section class="cs-hero">
      <div class="cs-hero-grid-bg"></div>
      <div class="cs-hero-container">
        <!-- LEFT COLUMN -->
        <div class="cs-hero-left">
          <div class="cs-hero-eyebrow">Professional AI Resume Builder</div>
          <h1 class="cs-hero-h1">
            <span class="cs-h1-gradient-navy">Build</span>
            <span class="cs-h1-gradient-gold">Tailored</span>
            <br />
            <span class="cs-h1-gradient-navy">Resumes with AI</span>
          </h1>
          <p class="cs-hero-desc">
            CareerSense helps you import existing resumes, tailor them to job descriptions, and export polished PDFs using intelligent AI suggestions and 100+ professional templates.
          </p>
          <div class="cs-hero-ctas">
            <a href="/select" class="cs-btn-hero-primary">
              <span>Start Building</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="/templates" class="cs-btn-hero-secondary">
              <span>View Templates</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </a>
          </div>

          <!-- 3 PATH CARDS -->
          <div class="cs-path-cards">
            <a href="/select" class="cs-path-card">
              <div class="cs-card-top">
                <div class="cs-card-icon-tile">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                </div>
                <svg class="cs-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <div class="cs-path-card-title">Build from scratch</div>
              <div class="cs-path-card-desc">Go straight into template selection and write every section yourself with full...</div>
              <div class="cs-card-action">Start empty draft</div>
            </a>

            <a href="/upload" class="cs-path-card">
              <div class="cs-card-top">
                <div class="cs-card-icon-tile">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                </div>
                <svg class="cs-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <div class="cs-path-card-title">Import Resume</div>
              <div class="cs-path-card-desc">Upload PDF, DOCX, or TXT and choose between Exact or AI Optimized starting...</div>
              <div class="cs-card-action">Upload your file</div>
            </a>

            <a href="/tailor" class="cs-path-card">
              <div class="cs-card-top">
                <div class="cs-card-icon-tile">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <svg class="cs-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <div class="cs-path-card-title">Tailor to Role</div>
              <div class="cs-path-card-desc">Combine your base resume with a JD to build a highly aligned, ATS-ready...</div>
              <div class="cs-card-action">Open JD tailor</div>
            </a>
          </div>

          <!-- 4 STATS ROW -->
          <div class="cs-stats-row">
            <div class="cs-stat-item">
              <div class="cs-stat-icon-tile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div>
                <div class="cs-stat-value">60%</div>
                <div class="cs-stat-label">Faster</div>
              </div>
            </div>

            <div class="cs-stat-item">
              <div class="cs-stat-icon-tile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div>
                <div class="cs-stat-value">100+</div>
                <div class="cs-stat-label">Pro Templates</div>
              </div>
            </div>

            <div class="cs-stat-item">
              <div class="cs-stat-icon-tile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-2 3.5c0 1.6.9 3 2.2 3.7A4 4 0 0 0 9 19h6a4 4 0 0 0 1.8-3.8c1.3-.7 2.2-2.1 2.2-3.7A4 4 0 0 0 17 8V7a5 5 0 0 0-5-5Z"/></svg>
              </div>
              <div>
                <div class="cs-stat-value">ATS</div>
                <div class="cs-stat-label">Optimized</div>
              </div>
            </div>

            <div class="cs-stat-item">
              <div class="cs-stat-icon-tile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div>
                <div class="cs-stat-value">JOB</div>
                <div class="cs-stat-label">Ready</div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN MOCKUP -->
        <div class="cs-hero-right">
          <div class="cs-mockup-inner">
            <div class="cs-mockup-sidebar">
              <div class="cs-mockup-brand">
                <div class="cs-mockup-brand-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
                <span class="cs-mockup-brand-title">CareerSense AI</span>
              </div>

              <div>
                <div class="cs-mockup-progress-lbl">Progress</div>
                <div class="cs-mockup-progress-bar">
                  <div class="cs-mockup-progress-fill"></div>
                </div>
              </div>

              <div class="cs-mockup-gauge-box">
                <div class="cs-mockup-gauge-title">Live ATS Score</div>
                <div class="cs-mockup-gauge-dial">
                  <svg width="64" height="64" viewBox="0 0 64 64" style="transform: rotate(-90deg);">
                    <circle cx="32" cy="32" r="26" stroke="#0B1F3A" stroke-width="4.5" fill="none" />
                    <circle cx="32" cy="32" r="26" stroke="#B91C1C" stroke-width="4.5" fill="none" stroke-dasharray="163" stroke-dashoffset="128" stroke-linecap="round" />
                  </svg>
                  <span class="cs-mockup-score-num">21</span>
                </div>
              </div>

              <div class="cs-mockup-checklist">
                <div class="cs-mockup-check-item">
                  <span>Structure</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#123B6D" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="cs-mockup-check-item">
                  <span>Keywords</span>
                  <span class="cs-check-dot"></span>
                </div>
                <div class="cs-mockup-check-item">
                  <span>Formatting</span>
                  <span class="cs-check-dot"></span>
                </div>
              </div>
            </div>

            <div class="cs-mockup-canvas">
              <div class="cs-mockup-doc">
                <div class="cs-doc-name">Pooja Bansal</div>
                <div class="cs-doc-line"></div>
                <div class="cs-doc-section-title">Experience</div>
                <div class="cs-doc-bar" style="width: 95%;"></div>
                <div class="cs-doc-bar" style="width: 80%;"></div>
                <div class="cs-doc-bar" style="width: 88%;"></div>
                <div class="cs-doc-section-title" style="margin-top: 14px;">Skills</div>
                <div class="cs-doc-bar" style="width: 70%;"></div>
                <div class="cs-doc-bar" style="width: 85%;"></div>
              </div>
              <svg class="cs-mockup-cursor" width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#071426" stroke-width="1.8">
                <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- POPULAR TEMPLATES SECTION -->
    <section class="cs-content-container" style="margin-top: 60px;">
      <div style="text-align: center; max-width: 720px; margin: 0 auto 40px auto;">
        <div class="cs-pill-badge">100+ Professional Templates</div>
        <h2 style="font-size: 32px; font-weight: 800; color: #0C2C53; margin: 0 0 12px 0;">Recruiter-Approved Resume Formats</h2>
        <p style="font-size: 16px; color: #516987; margin: 0;">Choose from single-column ATS layouts, executive corporate designs, and modern portfolio styles.</p>
      </div>

      <div class="cs-cards-grid">
        ${FEATURED_TEMPLATES.slice(0, 6).map((tpl) => `
          <div class="cs-card" style="margin-bottom: 0;">
            <div class="cs-card-header">
              <div class="cs-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div>
                <div style="font-size: 10px; font-weight: 800; color: #9A7628; text-transform: uppercase; letter-spacing: 0.1em;">${escapeHtml(tpl.role)}</div>
                <h3 class="cs-card-title" style="font-size: 16px;">${escapeHtml(tpl.name)}</h3>
              </div>
            </div>
            <p class="cs-card-desc">${escapeHtml(tpl.desc)}</p>
            <a href="/select" class="cs-grid-card-link">Use Template &rarr;</a>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center; margin-top: 28px;">
        <a href="/templates" class="cs-btn-secondary">Explore All 100+ Templates &rarr;</a>
      </div>
    </section>

    <!-- FEATURES & ATS TOOLS SECTION -->
    <section class="cs-content-container" style="margin-top: 60px;">
      <div class="cs-card" style="padding: 40px;">
        <div style="max-width: 640px; margin-bottom: 32px;">
          <div class="cs-pill-badge">Full CareerSense Platform</div>
          <h2 style="font-size: 28px; font-weight: 800; color: #0C2C53; margin: 0 0 10px 0;">Everything You Need to Get Hired</h2>
          <p style="font-size: 15px; color: #516987; margin: 0;">From parsing your original PDF to matching keywords against real job postings, CareerSense keeps you in control.</p>
        </div>

        <div class="cs-cards-grid" style="margin-top: 0;">
          <div style="padding: 16px; border: 1px solid #E1E7EF; border-radius: 12px; background: #F8FAFC;">
            <h3 style="font-size: 16px; font-weight: 800; color: #17375D; margin: 0 0 8px 0;">Exact Resume Import</h3>
            <p style="font-size: 13px; color: #64748B; margin: 0; line-height: 1.6;">Upload PDF, DOCX, or TXT while preserving your authentic work history and formatting.</p>
          </div>
          <div style="padding: 16px; border: 1px solid #E1E7EF; border-radius: 12px; background: #F8FAFC;">
            <h3 style="font-size: 16px; font-weight: 800; color: #17375D; margin: 0 0 8px 0;">Intelligent Job Tailoring</h3>
            <p style="font-size: 13px; color: #64748B; margin: 0; line-height: 1.6;">Paste a target JD to instantly see missing keywords and receive quantified bullet point suggestions.</p>
          </div>
          <div style="padding: 16px; border: 1px solid #E1E7EF; border-radius: 12px; background: #F8FAFC;">
            <h3 style="font-size: 16px; font-weight: 800; color: #17375D; margin: 0 0 8px 0;">Live ATS Scoring</h3>
            <p style="font-size: 13px; color: #64748B; margin: 0; line-height: 1.6;">Test your resume against applicant tracking rules for layout, headings, and readability in seconds.</p>
          </div>
          <div style="padding: 16px; border: 1px solid #E1E7EF; border-radius: 12px; background: #F8FAFC;">
            <h3 style="font-size: 16px; font-weight: 800; color: #17375D; margin: 0 0 8px 0;">1-Click Vector PDF Export</h3>
            <p style="font-size: 13px; color: #64748B; margin: 0; line-height: 1.6;">Download crisp, selectable vector PDFs with standardized A4 margins accepted by global employers.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS SECTION -->
    <section class="cs-content-container" style="margin-top: 60px;">
      <div style="text-align: center; max-width: 680px; margin: 0 auto 36px auto;">
        <div class="cs-pill-badge">Verified Outcomes</div>
        <h2 style="font-size: 28px; font-weight: 800; color: #0C2C53; margin: 0 0 10px 0;">Trusted by Professionals at Top Companies</h2>
      </div>

      <div class="cs-cards-grid">
        <div class="cs-card" style="margin-bottom: 0;">
          <p style="font-size: 14px; line-height: 1.7; color: #334155; font-style: italic; margin-bottom: 16px;">
            "CareerSense made my job hunt so much easier. The AI tailoring helped me land interviews at three top tech firms in just two weeks."
          </p>
          <div style="font-size: 13px; font-weight: 800; color: #071426;">Pooja Bansal</div>
          <div style="font-size: 11px; color: #64748B;">Business Intelligence Leader</div>
        </div>

        <div class="cs-card" style="margin-bottom: 0;">
          <p style="font-size: 14px; line-height: 1.7; color: #334155; font-style: italic; margin-bottom: 16px;">
            "The ATS scoring is a game changer. I could finally see why my resume was being filtered out and fixed it instantly."
          </p>
          <div style="font-size: 13px; font-weight: 800; color: #071426;">Rohan Mehta</div>
          <div style="font-size: 11px; color: #64748B;">Software Engineer @ Google</div>
        </div>

        <div class="cs-card" style="margin-bottom: 0;">
          <p style="font-size: 14px; line-height: 1.7; color: #334155; font-style: italic; margin-bottom: 16px;">
            "The templates are stunning and professional. I love how I can switch designs without re-entering my work history."
          </p>
          <div style="font-size: 13px; font-weight: 800; color: #071426;">Anjali Sharma</div>
          <div style="font-size: 11px; color: #64748B;">Product Manager @ Zomato</div>
        </div>
      </div>
    </section>

    <!-- FAQS SECTION -->
    <section class="cs-content-container" style="margin-top: 60px;">
      <div class="cs-card" style="padding: 40px;">
        <div style="max-width: 640px; margin-bottom: 28px;">
          <div class="cs-pill-badge">Help &amp; Answers</div>
          <h2 style="font-size: 28px; font-weight: 800; color: #0C2C53; margin: 0 0 10px 0;">Frequently Asked Questions</h2>
        </div>

        <div class="cs-faq-box">
          <h3 class="cs-faq-q">Which files can I upload into CareerSense?</h3>
          <p class="cs-faq-a">You can upload PDF, DOCX, DOC, and TXT files. The builder extracts your content into editable resume sections before you choose a template.</p>
        </div>
        <div class="cs-faq-box">
          <h3 class="cs-faq-q">What is the difference between Exact Import and AI Optimized?</h3>
          <p class="cs-faq-a">Exact Import preserves the wording from your existing resume as closely as possible. AI Optimized builds a stronger draft with impact verbs and metrics while keeping you in full editorial control.</p>
        </div>
        <div class="cs-faq-box">
          <h3 class="cs-faq-q">Can I switch templates after importing my resume?</h3>
          <p class="cs-faq-a">Yes. Your content stays completely intact while you switch across our 100+ templates, allowing you to test multiple visual formats without starting over.</p>
        </div>
        <div class="cs-faq-box">
          <h3 class="cs-faq-q">How does PDF export work?</h3>
          <p class="cs-faq-a">The builder uses a true A4 vector layout engine to render crisp, selectable text that passes all applicant tracking systems and prints cleanly.</p>
        </div>
      </div>
    </section>
  </main>

  ${getSharedFooterHtml()}`;

  return baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta name="description"[\s\S]*?>/i, '')
    .replace(/<meta name="robots"[\s\S]*?>/i, '')
    .replace(/<link rel="canonical"[\s\S]*?>/i, '')
    .replace(/<meta property="og:[\s\S]*?>/gi, '')
    .replace(/<meta name="twitter:[\s\S]*?>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace('</head>', `${head}\n</head>`)
    .replace(/<div id="root">[\s\S]*<\/div>(?=\s*<script|\s*<\/body>)/i, `<div id="root">${body}</div>`);
};

// ==========================================
// FILE WRITING & DEPLOYMENT PREPARATION
// ==========================================

// 1. APP ROUTES (CLEAN SPA SHELL WITH CENTERED CIRCULAR LOADER)
// Generates clean SPA shells for all internal/authenticated views.
// These views (dashboard, builder, upload, etc.) are blocked from SEO and display
// the centered circular CareerSense loader on frame 1 until React mounts.
// All 64 SEO pages continue to receive 100% full semantic content with ZERO loader.
const APP_ROUTES = [
  '/dashboard',
  '/repository',
  '/select',
  '/selection',
  '/create',
  '/upload',
  '/upload-options',
  '/tailor',
  '/target',
  '/jd-upload',
  '/review',
  '/builder',
  '/editor',
];

const appShellLoader = '<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #F7F8FA;"><div style="width: 36px; height: 36px; border: 3.5px solid #E2E8F0; border-top-color: #123B6D; border-radius: 50%; animation: cs-spin 0.8s linear infinite;"></div></div>';
const appShellStyles = '<style>@keyframes cs-spin { to { transform: rotate(360deg); } }</style>';
const appShellHtml = baseHtml
  .replace('</head>', `${appShellStyles}\n</head>`)
  .replace('<div id="root"></div>', `<div id="root">${appShellLoader}</div>`);

for (const appRoute of APP_ROUTES) {
  const dir = new URL(`../dist${appRoute}/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), appShellHtml);
  await writeFile(new URL(`../dist${appRoute}.html`, import.meta.url), appShellHtml);
}
await writeFile(new URL('../dist/app.html', import.meta.url), appShellHtml);

// 2. PRE-RENDER HOMEPAGE (dist/index.html)
const homeHtml = renderFullHomepage();
await writeFile(new URL('../dist/index.html', import.meta.url), homeHtml);

// 3. PRE-RENDER ALL 63 CANONICAL SEO AND GUIDE PAGES
// Writes both /path/index.html and /path.html so URLs with and without trailing slash resolve directly from disk.
for (const page of pages) {
  const html = renderPage(page);

  // Directory with index.html (e.g. /resume-examples/software-engineer/index.html)
  const canonicalDir = new URL(`../dist${page.path}/`, import.meta.url);
  await mkdir(canonicalDir, { recursive: true });
  await writeFile(new URL('index.html', canonicalDir), html);

  // Flat .html file (e.g. /resume-examples/software-engineer.html)
  await writeFile(new URL(`../dist${page.path}.html`, import.meta.url), html);
}

// 4. SITEMAP & ROBOTS
const allPaths = ['/', ...pages.map(({ path }) => path)];
const buildDate = new Date().toISOString().slice(0, 10);
const urls = allPaths.map((path) => `  <url><loc>${siteUrl}${path}</loc><lastmod>${buildDate}</lastmod><changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq></url>`).join('\n');
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /builder
Disallow: /editor
Disallow: /review
Disallow: /upload
Disallow: /upload-options
Disallow: /tailor
Disallow: /target
Disallow: /jd-upload
Disallow: /select

Sitemap: ${siteUrl}/sitemap.xml
`;
await writeFile(new URL('../dist/robots.txt', import.meta.url), robotsTxt);
await writeFile(new URL('../public/robots.txt', import.meta.url), robotsTxt);
await writeFile(new URL('../dist/sitemap.xml', import.meta.url), sitemapXml);
await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemapXml);
await writeFile(new URL('../dist/robots.txt', import.meta.url), robotsTxt);
await writeFile(new URL('../public/robots.txt', import.meta.url), robotsTxt);

// 5. INVENTORY CSV
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

// 6. PRIORITY URLS
const priorityPaths = [
  '/',
  '/templates',
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
