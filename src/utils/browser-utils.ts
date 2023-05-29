/**
 * Returns true if the user agent indicates that this is a mobile browser.
*/
export const isMobile = () => /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
