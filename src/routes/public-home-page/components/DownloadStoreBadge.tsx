import React from 'react';
import { Button, Image } from 'react-bootstrap';
import styled from 'styled-components';
import { MD_MEDIA_BREAKPOINT } from '../../../constants';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';
import { handleAppLink } from '../navigate-link';

export const StyledBadge = styled.div`
  @media (min-width: ${MD_MEDIA_BREAKPOINT})
    .ios-badge{
      width: 204px;
      height: 61px !important;
    } 
  }
`;

function DownloadStoreBadge() {
  return (
    <StyledBadge className="d-flex flex-column flex-sm-row">
      <Button variant="link" onClick={() => handleAppLink('app-store')} className="mb-3 mb-md-0 me-0 me-md-3">
        <Image fluid src={AppStoreImage} alt="app store" className="ios-badge" />
      </Button>
      <Button variant="link" onClick={() => handleAppLink('play-store')}>
        <Image fluid src={PlayStoreImage} alt="play store" />
      </Button>
    </StyledBadge>
  );
}

export default DownloadStoreBadge;
