import { useState } from 'react';
import { testimonials } from '../data/landingData.jsx';

const ITEMS_PER_PAGE = 3;

export const useTestimonials = () => {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const numberOfPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);
  const currentPage = Math.floor(testimonialIndex / ITEMS_PER_PAGE);

  const showNextTestimonials = () => {
    setTestimonialIndex((currentIndex) =>
      (currentIndex + ITEMS_PER_PAGE) % testimonials.length
    );
  };

  const showPreviousTestimonials = () => {
    setTestimonialIndex((currentIndex) =>
      (currentIndex - ITEMS_PER_PAGE + testimonials.length) % testimonials.length
    );
  };

  return {
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    numberOfPages,
    showNextTestimonials,
    showPreviousTestimonials,
    testimonialIndex,
  };
};
