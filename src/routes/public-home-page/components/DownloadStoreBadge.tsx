import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import { APP_STORE_DOWNLOAD_URL, GOOGLE_PLAY_DOWNLOAD_URL, MD_MEDIA_BREAKPOINT } from '../../../constants';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';

export const StyledBadge = styled.div`
  @media (min-width: ${MD_MEDIA_BREAKPOINT}) {
    .ios-badge{
      width: 204px;
      height: 55px !important;
    }
  }
`;

const imageStyle = {
  border: '1px solid white',
  borderRadius: 10,
  width: 165,
  height: 50,
};
function DownloadStoreBadge() {
  return (
    <StyledBadge className="d-flex flex-column flex-sm-row">
      <a href={APP_STORE_DOWNLOAD_URL} target="_blank" className="mb-3 mb-md-0 me-0 me-md-3" rel="noreferrer">
        <Image style={imageStyle} fluid src={AppStoreImage} alt="app store" className="ios-badge" />
      </a>
      <a href={GOOGLE_PLAY_DOWNLOAD_URL} target="_blank" rel="noreferrer">
        <Image style={imageStyle} fluid src={PlayStoreImage} alt="play store" />
      </a>
    </StyledBadge>
  );
}

export default DownloadStoreBadge;
