import React, { memo, useEffect, useRef, useState } from 'react';
import ResumePreview from './ResumePreview';

const ResumeThumbnail = ({ data, templateId }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: '320px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Standard A4 width in pixels at 96 DPI is approximately 794px (210mm)
        // We calculate the scale ratio to fit the container width
        const standardA4Width = 794; 
        const newScale = containerWidth / standardA4Width;
        setScale(newScale);
      }
    };

    // Calculate immediately
    handleResize();

    // Recalculate on window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-hidden relative bg-white pointer-events-none select-none"
    >
      {/* 1. transform-origin-top-left: Anchors the resume to the top-left corner.
          2. We scale based on the ratio of "Current Container Width" / "A4 Width".
      */}
      {isNearViewport ? (
        <div
          className="origin-top-left shadow-sm"
          style={{
            width: '210mm', // Physical A4 width
            minHeight: '297mm', // Physical A4 height
            transform: `scale(${scale})`,
          }}
        >
          <ResumePreview data={data} template={templateId} />
        </div>
      ) : null}
      
      {/* Overlay to prevent interaction (optional, keeps it as a thumbnail) */}
      <div className="absolute inset-0 bg-transparent z-10" />
    </div>
  );
};

export default memo(ResumeThumbnail);
