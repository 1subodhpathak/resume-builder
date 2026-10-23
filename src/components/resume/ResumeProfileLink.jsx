import React from 'react';
import PreviewEditableField from './PreviewEditableField';

const LABELS = {
  linkedin: 'linkedin_profile',
  github: 'github_id',
  website: 'my_website',
  portfolio: 'my_portfolio',
};

const externalHref = (value, type = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^\/\//.test(raw)) return `https:${raw}`;

  if (type === 'linkedin') {
    if (/linkedin\.com/i.test(raw)) return `https://${raw.replace(/^\/+/, '')}`;
    return `https://www.linkedin.com/in/${raw.replace(/^in\//, '')}`;
  }

  if (type === 'github') {
    if (/github\.com/i.test(raw)) return `https://${raw.replace(/^\/+/, '')}`;
    return `https://github.com/${raw}`;
  }

  return `https://${raw}`;
};

const ResumeProfileLink = ({ type, value, path, measurement = false, className = '', color = '#2563eb' }) => {
  const label = LABELS[type] || value;
  if (!value) return null;
  if (measurement) return <span className={className}>{label}</span>;

  return <PreviewEditableField
    as="a"
    path={path}
    label={type === 'github' ? 'GitHub' : type === 'linkedin' ? 'LinkedIn' : type === 'portfolio' ? 'Portfolio' : 'Website'}
    className={className}
    href={externalHref(value, type)}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color, textDecoration: 'underline' }}
  >{label}</PreviewEditableField>;
};

export default ResumeProfileLink;
