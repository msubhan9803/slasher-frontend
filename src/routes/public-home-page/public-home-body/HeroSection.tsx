import React from 'react';
import styled from 'styled-components';
import { Image } from 'react-bootstrap';
import HeroImage from '../../../images/public-home-hero-header.png';
import HorrorText from '../../../images/horror-text.png';
import DownloadStoreBadge from '../components/DownloadStoreBadge';
import {
  XXL_MEDIA_BREAKPOINT,
  XL_MEDIA_BREAKPOINT,
  LG_MEDIA_BREAKPOINT,
  MD_MEDIA_BREAKPOINT,
  SM_MEDIA_BREAKPOINT,
} from '../../../constants';

const StyleHeroSection = styled.div`
  height: 100vh;
  background: url(${HeroImage}) top center;    
  background-size: contain;
  background-repeat: no-repeat;
  .hero-container {
    top: -70px;
    left: 0;
    right: 0;
  }
  @media (min-width: ${XXL_MEDIA_BREAKPOINT}){
    height: 69vh;
    .hero-container {
      top: -10px;
    }
  }
  @media (max-width: ${XL_MEDIA_BREAKPOINT}){
    .hero-container {
      top: -20px;
    }
  }
  @media (max-width: ${LG_MEDIA_BREAKPOINT}){
    height: 50vh;
    .hero-container {
      top: 165px;
    }
  }
  @media (max-width: ${MD_MEDIA_BREAKPOINT}){
    height: 100vh;
    .hero-container {
      top: -55px;
    }
  }
  @media (max-width: ${SM_MEDIA_BREAKPOINT}){
    height: 70vh;
    .hero-container {
      top: 100px;
    }
    h1 {
      font-size: 20px !important;
    }
    .horror {
      width: 60%;
    }
  }
`;
function HeroSection() {
  return (
    <StyleHeroSection className="w-100 position-relative">
      <div className="hero-container px-3 d-flex justify-content-center align-items-center text-center flex-column position-absolute bottom-0">
        <h1>THE SOCIAL NETWORK FOR</h1>
        <Image fluid src={HorrorText} alt="horror" className="horror my-3 my-lg-4 py-lg-2" />
        <DownloadStoreBadge />
      </div>
    </StyleHeroSection>
  );
}

export default HeroSection;
