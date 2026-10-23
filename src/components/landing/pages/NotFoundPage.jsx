import React from 'react';
import SEO from '../../SEO';

const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] px-5 text-[#071426]">
    <SEO
      title="Page Not Found | CareerSense"
      description="The page you requested could not be found. Explore CareerSense resume examples or return to the resume builder."
      robots="noindex,follow"
    />
    <section className="max-w-xl text-center">
      <div className="text-xs font-black uppercase tracking-[0.2em] text-[#A87922]">404</div>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-[#0C2948]">This page could not be found</h1>
      <p className="mt-4 leading-7 text-[#60738A]">The link may be outdated or the address may be incorrect.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/" className="rounded-xl bg-[#0B2D52] px-5 py-3 text-sm font-black text-white">Return home</a>
        <a href="/resume-examples" className="rounded-xl border border-[#B8C7D6] bg-white px-5 py-3 text-sm font-black text-[#123B6D]">Browse resume examples</a>
      </div>
    </section>
  </main>
);

export default NotFoundPage;
