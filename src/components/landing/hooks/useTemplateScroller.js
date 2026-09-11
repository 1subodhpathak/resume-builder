import { useRef } from 'react';

const SCROLL_DISTANCE = 350;

export const useTemplateScroller = () => {
  const scrollRef = useRef(null);

  const scrollTemplates = (direction, targetRef = scrollRef) => {
    targetRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_DISTANCE : SCROLL_DISTANCE,
      behavior: 'smooth',
    });
  };

  return { scrollRef, scrollTemplates };
};
