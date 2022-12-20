export const scrollWithOffset = (el: any) => {
  // alert('scrollWithOffset?');
  const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -80; // for desktop
  // const yOffset = 0;
  window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
