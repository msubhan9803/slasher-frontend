import React from 'react';
import styled from 'styled-components';
import { Image } from 'react-bootstrap';
import HeroImage from '../../../images/public-home-hero-header.png';
import HorrorText from '../../../images/horror-text.png';
import DownloadStoreBadge from '../components/DownloadStoreBadge';

const StyleHeroSection = styled.div`
  height: 100vh;
  background: url(${HeroImage}) top center;    
  background-size: cover;
  .hero-container {
    left: 0;
    right: 0;
  }
`;
function HeroSection() {
  return (
    <StyleHeroSection className="w-100 position-relative">
      <div className="hero-container px-3 d-flex justify-content-center align-items-center text-center flex-column position-absolute bottom-0 top-0">
        <h1 className="mt-5 pt-5">THE SOCIAL NETWORK FOR</h1>
        <Image fluid src={HorrorText} alt="horror" className="my-5" />
        <DownloadStoreBadge />
      </div>
    </StyleHeroSection>
  );
}

export default HeroSection;
