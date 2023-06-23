import { MOBILE_NAVBAR, bottomForCommentOrReplyInputOnMobile } from '../constants';

export function setGlobalCssProperty(name: string, value: any) {
  if (!name.startsWith('--')) { throw new Error('A CSS variable must start be prefixed with --'); }
  document.documentElement.style.setProperty(name, value);
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
    setGlobalCssProperty('--bottomForCommentOrReplyInputOnMobile', '0px');
  }
};

export const onKeyboardClose = () => {
  const mobileNavBarElement = document.querySelector<HTMLElement>(`#${MOBILE_NAVBAR}`);
  if (mobileNavBarElement) {
    // Show mobile-navbar when keyboard is shown
    mobileNavBarElement.style.display = 'flex';
    // Set botom position for the comment or rely input on post-details page when keyboard is opened
    setGlobalCssProperty('--bottomForCommentOrReplyInputOnMobile', bottomForCommentOrReplyInputOnMobile);
  }
};
