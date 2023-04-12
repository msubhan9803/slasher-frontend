import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import { MD_MEDIA_BREAKPOINT } from '../../../constants';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';

export const StyledBadge = styled.div`
/* TODO: Check if how this media breakpoint works - Sahil --- */
  @media (min-width: ${MD_MEDIA_BREAKPOINT}) {
    .ios-badge{
      width: 204px;
      height: 61px !important;
    } 
  }
`;

const imageStyle = {
  border: '1px solid white',
  borderRadius: 15,
};

function DownloadStoreBadge() {
  return (
    <StyledBadge className="d-flex flex-column flex-sm-row">
      <a href="https://apps.apple.com/app/id1458216326" target="_blank" className="mb-3 mb-md-0 me-0 me-md-3" rel="noreferrer">
        <Image style={imageStyle} fluid src={AppStoreImage} alt="app store" className="ios-badge" />
      </a>
      <a href="https://play.google.com/store/apps/details?id=com.sdei.slasher&hl=en&pli=1" target="_blank" rel="noreferrer">
        <Image style={imageStyle} fluid src={PlayStoreImage} alt="play store" />
      </a>
    </StyledBadge>
  );
}

export default DownloadStoreBadge;
