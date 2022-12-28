export const scrollWithOffset = (el: any) => {
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -120;
  setTimeout(() => {
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
  }, 500);
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
