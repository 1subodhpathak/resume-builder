import { useEffect, useState } from 'react';
import coraAnimation from '../../../assets/cora/cora.gif';
import coraStill from '../../../assets/cora/cora-original-concept.png';

const getReducedMotionPreference = () => (
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

const CoraAssistant = ({ state = 'idle', className = '' }) => {
  const [reduceMotion, setReduceMotion] = useState(getReducedMotionPreference);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(motionPreference.matches);

    motionPreference.addEventListener?.('change', updatePreference);
    return () => motionPreference.removeEventListener?.('change', updatePreference);
  }, []);

  return (
    <span
      className={`cora-character relative block aspect-square overflow-hidden ${className}`}
      role="img"
      aria-label={`Cora assistant is ${state}`}
    >
      <img
        src={reduceMotion ? coraStill : coraAnimation}
        alt=""
        aria-hidden="true"
        draggable="false"
        className="pointer-events-none h-full w-full select-none object-contain"
      />
    </span>
  );
};

export default CoraAssistant;
