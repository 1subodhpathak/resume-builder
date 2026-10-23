import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_SITE_URL = 'https://resume.careersenseai.com';

const getSiteUrl = () => {
  const configuredUrl = import.meta.env.VITE_SITE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.origin) return window.location.origin;
  return DEFAULT_SITE_URL;
};

const toAbsoluteUrl = (value, siteUrl) => {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  image,
  robots = 'index,follow',
  schema,
}) => {
  const siteUrl = getSiteUrl();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const canonicalUrl = toAbsoluteUrl(canonical || currentPath, siteUrl);
  const imageUrl = toAbsoluteUrl(image, siteUrl);
  const schemaData = schema || {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CareerSense Resume Builder",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": description
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Social Media Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="CareerSense" />
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}

      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}

      {/* Structured Data for Google Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;
