export const scrollWithOffset = (el: any) => {
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -120;
  setTimeout(() => {
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
  }, 500);
};
export const scrollToTop = (behavior: 'instant' | 'smooth') => {
  window.scrollTo({ top: 0, behavior: behavior as any });
};
