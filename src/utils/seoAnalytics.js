const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initializeSeoAnalytics = () => {
  if (!measurementId || typeof window === 'undefined') return false;
  if (window.gtag) return true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  return true;
};

export const trackSeoPageView = (path, title) => {
  if (!measurementId || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_title: title || document.title,
    page_location: window.location.href,
    page_path: path,
  });
};

export const trackSeoConversion = (eventName, details = {}) => {
  if (!measurementId || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, details);
};
