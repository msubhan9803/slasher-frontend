export const scrollWithOffset = (el: any) => {
  // alert('scrollWithOffset?');
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -120; // for desktop
  setTimeout(() => {
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
  }, 500);
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
