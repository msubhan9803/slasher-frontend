export const scrollWithOffset = (el: any) => {
  el.scrollIntoView({ behavior: 'smooth' });
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
