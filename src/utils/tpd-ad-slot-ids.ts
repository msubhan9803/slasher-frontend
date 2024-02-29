import { isNativePlatform } from '../constants';

/*
 *  Note: From TPD scripts we see that:
 *  `window.tpdMobile` is `false` when `window.innerWidth >= 770` = isMobile
 *  `window.tpdMobile` is `true` when `window.innerWidth < 770` = isMobile
 *  Also, we do not use `window.tpdMobile` becase the value is only initialized
 *  later when the adscript is loaded
 */
const isTpdMobileWeb = window.innerWidth < 770;

let adSlotIdA = '';
let adSlotIdB = '';
let adSlotIdC = '';
let adSlotIdD = '';
let adSlotIdZ = '';
let adSlotIdBannerA = '';

if (isNativePlatform) {
  // app-box-ad-a, app-box-ad-b, app-box-ad-c, app-box-ad-d
  adSlotIdA = 'app-box-ad-a';
  adSlotIdB = 'app-box-ad-b';
  adSlotIdC = 'app-box-ad-c';
  adSlotIdD = 'app-box-ad-d';
  // we do not have `app-box-ad-z` for app yet (date: 13 Dec 2023)
  adSlotIdZ = 'app-box-ad-d';
  // we do not render bottom-stiky-banner-ad
  adSlotIdBannerA = '';
}

if (isTpdMobileWeb) {
  adSlotIdA = 'mob-box-ad-a';
  adSlotIdB = 'mob-box-ad-b';
  adSlotIdC = 'mob-box-ad-c';
  adSlotIdD = 'mob-box-ad-d';
  adSlotIdZ = 'mob-box-ad-z';
  // we do not render bottom-stiky-banner-ad
  adSlotIdBannerA = '';
}

const isDesktopWeb = !isNativePlatform && !isTpdMobileWeb;
if (isDesktopWeb) {
  adSlotIdA = 'dsk-box-ad-a';
  adSlotIdB = 'dsk-box-ad-b';
  adSlotIdC = 'dsk-box-ad-c';
  adSlotIdD = 'dsk-box-ad-d';
  adSlotIdZ = 'dsk-box-ad-z';
  adSlotIdBannerA = 'dsk-banner-ad-a';
}

// SLOT IDs:
// global sidebar
export const tpdAdSlotIdA = adSlotIdA;
// infinite posts/rows
export const tpdAdSlotIdB = adSlotIdB;
export const tpdAdSlotIdC = adSlotIdC;
export const tpdAdSlotIdD = adSlotIdD;
// single page ad e.g., movie-details, book-details, event-details, etc
export const tpdAdSlotIdZ = adSlotIdZ;
// bottom sticky banner
export const tpdAdSlotIdBannerA = adSlotIdBannerA;

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
