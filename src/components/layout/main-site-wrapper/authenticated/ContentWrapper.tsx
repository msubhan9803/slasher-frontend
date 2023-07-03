import styled from 'styled-components';
import { LG_MEDIA_BREAKPOINT } from '../../../../constants';

export const ContentSidbarWrapper = styled.div`
  display: flex;
`;

export const ContentPageWrapper = styled.div`
  // For MOBILE and TABLET
  // Note: We add bottom padding to account for persistent bottom nav buttons
  // Note: We add addition padding using css variable 'heightOfCommentOrReplyInputOnMobile' to account for comment/reply text input
  padding-bottom: calc(5.25em + var(--heightOfCommentOrReplyInputOnMobile,0px)); // Note: 5.25em*15px = 78.75px (approximate height of "mobile-bottom-navbar")
  width: 100%;

  // For DESKTOP
  @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
    padding-bottom: 1em;
    width: calc(100% - 319px);
    padding-right: 1rem;
  }
`;
