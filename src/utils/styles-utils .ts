import { MOBILE_NAVBAR, bottomForCommentOrReplyInputOnMobile, bottomMobileAdHeight } from '../constants';

export function setGlobalCssProperty(name: string, value: any) {
  if (!name.startsWith('--')) { throw new Error('A CSS variable must start be prefixed with --'); }
  document.documentElement.style.setProperty(name, value);
}

export function getGlobalCssProperty(name: string) {
  if (!name.startsWith('--')) { throw new Error('A CSS variable must start be prefixed with --'); }
  const style = getComputedStyle(document.body);
  return style.getPropertyValue('--scroll-bar-width');
}

export function removeGlobalCssProperty(name: string) {
  document.documentElement.style.removeProperty(name);
}

export const onKeyboardOpen = () => {
  const mobileNavBarElement = document.querySelector<HTMLElement>(`#${MOBILE_NAVBAR}`);
  if (mobileNavBarElement) {
    // Hide mobile-navbar when keyboard is opened`
    mobileNavBarElement.style.display = 'none';
    // Set botom position for the comment or rely input on post-details page when keyboard is opened
    setGlobalCssProperty('--bottomForCommentOrReplyInputOnMobile', `${bottomMobileAdHeight}px`);
  }
};

export const onKeyboardClose = () => {
  const mobileNavBarElement = document.querySelector<HTMLElement>(`#${MOBILE_NAVBAR}`);
  if (mobileNavBarElement) {
    // Show mobile-navbar when keyboard is closed
    mobileNavBarElement.style.display = 'flex';
    // Set botom position for the comment or rely input on post-details page when keyboard is opened
    setGlobalCssProperty('--bottomForCommentOrReplyInputOnMobile', bottomForCommentOrReplyInputOnMobile);
  }
};
