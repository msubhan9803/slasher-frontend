import React from 'react';
import { useLocation } from 'react-router-dom';
import { BREAK_POINTS } from '../constants';
import { isConversationPage } from '../utils/url-utils';

export const useShowSticyBannerAdDesktopOnly = () => {
  const { pathname } = useLocation();
  const isDesktop = window.innerWidth >= BREAK_POINTS.lg;
  const isNotConversationPage = !isConversationPage(pathname);
  return isDesktop && isNotConversationPage;
};

// We are adding additional space so that the bottom-sticky ad does not
// cover content of website. Refer: `sticky-bottom-ad` in
// file://./components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper.tsx
function SticyBannerAdSpaceCompensation() {
  const showSticyBannerAdDesktopOnly = useShowSticyBannerAdDesktopOnly();

  // NOTE: We are giving id to below tag only to easily locate
  // this element in Browser > Elements tab for debugging purpose.
  return (
    <div id="sticy-banner-ad-space-compensation" className={`${showSticyBannerAdDesktopOnly ? 'py-5' : ''}`} />
  );
}

export default SticyBannerAdSpaceCompensation;
