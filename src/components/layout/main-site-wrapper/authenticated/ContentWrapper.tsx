import styled, { css } from 'styled-components';
import { LG_MEDIA_BREAKPOINT } from '../../../../constants';

export const ContentSidbarWrapper = styled.div`
  display: flex;
`;

interface Props {
  $isKeyboardOpen?: boolean;
}
export const ContentPageWrapper = styled.div<Props>`
    // For mobile sizes, add bottom padding to account for persistent bottom nav buttons
  ${(props) => !props.$isKeyboardOpen && css`
    padding-bottom: 5.25em;
  `}

  // For desktop sizes, reduce bottom padding
  @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
    padding-bottom: 1em;
  }
  width: 100%;
  @media (min-width: 980px) {
    width: calc(100% - 319px);
    padding-right: 1rem;
  }
`;
