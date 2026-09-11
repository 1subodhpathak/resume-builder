import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  image,
  robots = 'index,follow',
  schema,
}) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const canonicalUrl = canonical?.startsWith('http')
    ? canonical
    : `${origin}${canonical || currentPath}`;
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
      {image ? <meta property="og:image" content={image} /> : null}

      {/* Structured Data for Google Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;
