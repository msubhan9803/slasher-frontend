/*
 *  Note: From TPD scripts we see that:
 *  `window.tpdMobile` is `false` when `window.innerWidth >= 770` = isMobile
 *  `window.tpdMobile` is `true` when `window.innerWidth < 770` = isMobile
 *  Also, we do not use `window.tpdMobile` becase the value is only initialized
 *  later when the adscript is loaded
 */
const isTpdMobile = window.innerWidth < 770;

// SLOT IDs:

// global sidebar
export const tpdAdSlotIdA = isTpdMobile ? 'mob-box-ad-a' : 'dsk-box-ad-a';
// infinite posts/rows
export const tpdAdSlotIdB = isTpdMobile ? 'mob-box-ad-b' : 'dsk-box-ad-b';
export const tpdAdSlotIdC = isTpdMobile ? 'mob-box-ad-c' : 'dsk-box-ad-c';
export const tpdAdSlotIdD = isTpdMobile ? 'mob-box-ad-d' : 'dsk-box-ad-d';
// single page ad e.g., movie-details, book-details, event-details, etc
export const tpdAdSlotIdZ = isTpdMobile ? 'mob-box-ad-z' : 'dsk-box-ad-z';

export const tpdAdSlotIdBannerA = isTpdMobile ? 'mob-banner-ad-a' : 'dsk-banner-ad-a';

const slotsForInfiniteAds = [
  tpdAdSlotIdB,
  tpdAdSlotIdC,
  tpdAdSlotIdD,
];

let index = 0;
export const getInfiniteAdSlot = () => {
  if (index === slotsForInfiniteAds.length) {
    index = 0;
  }
  const nextSlotId = slotsForInfiniteAds[index];
  index += 1;
  return nextSlotId;
};
