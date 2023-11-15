// Slot Ids provided:

// Note: From TPD scripts we see that:
// `window.tpdMobile` is `false` when `window.innerWidth >= 770` = isMobile
// `window.tpdMobile` is `true` when `window.innerWidth < 770` = isMobile
// Also, we do not use `window.tpdMobile` becase the value is only initialized
// later when the adscript is loaded
const isTpdMobile = window.innerWidth < 770;

export const tpdAdSlotIdA = isTpdMobile ? 'mob-box-ad-a' : 'dsk-box-ad-a'; // (global sidebar)
export const tpdAdSlotIdB = isTpdMobile ? 'mob-box-ad-b' : 'dsk-box-ad-b'; // (infinite posts/rows)
export const tpdAdSlotIdC = isTpdMobile ? 'mob-box-ad-c' : 'dsk-box-ad-c'; // (infinite posts/rows)
export const tpdAdSlotIdD = isTpdMobile ? 'mob-box-ad-d' : 'dsk-box-ad-d'; // (infinite posts/rows)
export const tpdAdSlotIdZ = isTpdMobile ? 'mob-box-ad-z' : 'dsk-box-ad-z'; // (infinite posts/rows)

// const getRandomIndex = (arrayLength: number) => Math.floor(Math.random() * arrayLength) + 1;

// export const getRandomAdSlot = () => {
//   const slots = [
//     tpdAdSlotIdB,
//     tpdAdSlotIdC,
//     tpdAdSlotIdD,
//     tpdAdSlotIdZ,
//   ];

//   // Possible return values (n=4): 0, 1, 2, 3
//   const index = getRandomIndex(slots.length);
//   const randomeSlotId = slots[index];
//   return randomeSlotId;
// };
