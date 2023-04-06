export const handleNavLink = (link: string) => {
  window.location.href = `https://slasher.tv/pages/${link}`;
};

export const handleAppLink = (type: string) => {
  if (type === 'app-store') {
    window.open('https://apps.apple.com/app/id1458216326', '_blank');
  } else if (type === 'play-store') {
    window.open('https://play.google.com/store/apps/details?id=com.sdei.slasher&hl=en&pli=1', '_blank');
  }
};
