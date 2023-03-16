import React from 'react';
import styled from 'styled-components';
import { Image } from 'react-bootstrap';
import HeroImage from '../../../images/public-home-hero-header.png';
import HorrorText from '../../../images/horror-text.png';
import DownloadStoreBadge from '../components/DownloadStoreBadge';
import {
  XL_MEDIA_BREAKPOINT,
  LG_MEDIA_BREAKPOINT,
  SM_MEDIA_BREAKPOINT,
} from '../../../constants';

const StyleHeroSection = styled.div`
  height: 100vh;
  background: url(${HeroImage}) top center;    
  background-size: contain;
  background-repeat: no-repeat;
  .hero-container {
    top: -45px;
    left: 0;
    right: 0;
  }
  @media (max-width: ${XL_MEDIA_BREAKPOINT}){
    .hero-container {
      top: -200px;
    }
  }
  @media (max-width: ${LG_MEDIA_BREAKPOINT}){
    height: 40vh;
    .hero-container {
      top: 50px;
    }
  }
  @media (max-width: ${SM_MEDIA_BREAKPOINT}){
    height: 58vh;
    .hero-container {
      top: 100px;
    }
  }
`;
function HeroSection() {
  return (
    <StyleHeroSection className="w-100 position-relative">
      <div className="hero-container px-3 d-flex justify-content-center align-items-center text-center flex-column position-absolute bottom-0">
        <h1 className="">THE SOCIAL NETWORK FOR</h1>
        <Image fluid src={HorrorText} alt="horror" className="my-3 my-lg-4" />
        <DownloadStoreBadge />
      </div>
    </StyleHeroSection>
  );
}

export default HeroSection;
