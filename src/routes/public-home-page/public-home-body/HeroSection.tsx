import React from 'react';
import styled from 'styled-components';
import HeroImage from '../../../images/public-home-hero-header.png';
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
    top: -40px;
    left: 0;
    right: 0;
  }
  .horror {
    color: #FF1800;
    font-family: SearsTower;
    font-size: 150px;
    font-weight: 400;
    text-transform: uppercase;
  }
  @media (min-width: ${XXL_MEDIA_BREAKPOINT}){
    height: 60vh;
    .hero-container {
      top: -10px;
    }
  }
  @media (max-width: ${XL_MEDIA_BREAKPOINT}){
    .hero-container {
      top: -80px;
    }
  }
  @media (max-width: ${LG_MEDIA_BREAKPOINT}){
    height: 50vh;
    .hero-container {
      top: 200px;
    }
  }
  @media (max-width: ${MD_MEDIA_BREAKPOINT}){
    height: 50vh;
    .hero-container {
      top: -70px;
    }
    .horror {
      font-size: 84px;
    }
  }
  @media (max-width: ${SM_MEDIA_BREAKPOINT}){
    height: 70vh;
    .hero-container {
      top: -140px;
    }
    h1 {
      font-size: 20px !important;
    }
  }
`;
function HeroSection() {
  return (
    <StyleHeroSection className="w-100 position-relative">
      <div className="hero-container px-3 d-flex justify-content-center align-items-center text-center flex-column position-absolute bottom-0">
        <h1 className="m-0">THE SOCIAL NETWORK FOR</h1>
        <h2 className="horror m-0">Horror</h2>
        <DownloadStoreBadge />
      </div>
    </StyleHeroSection>
  );
}

export default HeroSection;
