import React from 'react';
import styled from 'styled-components';
import HeroImage from '../../../images/public-home-hero-header.png';
// import DownloadStoreBadge from '../components/DownloadStoreBadge';
import {
  MD_MEDIA_BREAKPOINT,
  SM_MEDIA_BREAKPOINT,
  XL_MEDIA_BREAKPOINT,
} from '../../../constants';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import DownloadStoreBadge from '../components/DownloadStoreBadge';

const StyleHeroSection = styled.div`
  padding: 200px 0 70px 0;
  background: url(${HeroImage}) top center;
  background-size: cover;
  background-repeat: no-repeat;
    left: 0;
    right: 0;
  .horror {
    color: #FF1800;
    font-family: SearsTower;
    font-size: 150px;
    font-weight: 400;
    text-transform: uppercase;
  }
  @media (max-width: ${XL_MEDIA_BREAKPOINT}){
    padding: 180px 0 70px 0;
  }
  @media (max-width: ${MD_MEDIA_BREAKPOINT}){
    padding: 160px 0 60px 0;

    .horror {
      font-size: 84px;
    }
  }
  @media (max-width: ${SM_MEDIA_BREAKPOINT}){

    h1 {
      font-size: var(--fs-2) !important;
    }
  }
`;
function HeroSection() {
  return (
    <StyleHeroSection className="hero-container px-3 d-flex justify-content-center align-items-center text-center flex-column bottom-0">
      <h1 className="m-0 fw-bold">THE SOCIAL NETWORK FOR</h1>
      <h2 className="horror m-0">Horror</h2>
      <div className="mb-4 mb-xl-0">
        <DownloadStoreBadge />
      </div>
      <div className="text-center d-xl-none">
        <RoundButtonLink variant="primary" className="text-uppercase" to="/app/sign-in">Sign in or create an account</RoundButtonLink>
      </div>
    </StyleHeroSection>
  );
}

export default HeroSection;
