import React from 'react';
import { Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { MD_MEDIA_BREAKPOINT } from '../../../constants';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';

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
      <Link to="/" className="mb-3 mb-md-0 me-0 me-md-3">
        <Image fluid src={AppStoreImage} alt="app store" className="ios-badge" />
      </Link>
      <Link to="/">
        <Image fluid src={PlayStoreImage} alt="play store" />
      </Link>
    </StyledBadge>
  );
}

export default DownloadStoreBadge;
