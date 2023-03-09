import React from 'react';
import styled from 'styled-components';
import { Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import HeroImage from '../../../images/public-home-hero-header.png';
import HorrorText from '../../../images/horror-text.png';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';

const StyleHeroSection = styled.div`
  background-image: url(${HeroImage});    
  background-position: top center;
  background-repeat: no-repeat;
  // background-size: contain;
  transition: background-color 0.3s ease-in-out;
`;
function HeroSection() {
  return (
    <StyleHeroSection className="p-5 d-flex flex-column justify-content-center align-items-center">
      <h1 className="mt-5 pt-5 mb-3">THE SOCIAL NETWORK FOR</h1>
      <Image fluid src={HorrorText} alt="horror" className="mb-3" />
      <div className="d-flex flex-column flex-md-row">
        <Link to="/" className="mb-3 mb-md-0 me-0 me-md-3 ms-2 ms-md-0">
          <Image fluid src={AppStoreImage} alt="app store" />
        </Link>
        <Link to="/">
          <Image fluid src={PlayStoreImage} alt="play store" />
        </Link>
      </div>
    </StyleHeroSection>
  );
}

export default HeroSection;
