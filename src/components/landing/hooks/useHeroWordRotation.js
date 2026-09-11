import { useEffect, useState } from 'react';
import { HERO_WORDS } from '../data/landingData.jsx';

export const useHeroWordRotation = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    let transitionTimeoutId;
    const rotationIntervalId = window.setInterval(() => {
      setWordVisible(false);
      transitionTimeoutId = window.setTimeout(() => {
        setWordIndex((currentIndex) => (currentIndex + 1) % HERO_WORDS.length);
        setWordVisible(true);
      }, 350);
    }, 2600);

    return () => {
      window.clearInterval(rotationIntervalId);
      window.clearTimeout(transitionTimeoutId);
    };
  }, []);

  return { wordIndex, wordVisible };
};
