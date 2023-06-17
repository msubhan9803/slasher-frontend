import React from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import slasherLogo from '../../../images/slasher-logo-medium.png';
import HeaderLogo from '../../../components/ui/HeaderLogo';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';
import {
  APP_STORE_DOWNLOAD_URL, GOOGLE_PLAY_DOWNLOAD_URL, MD_MEDIA_BREAKPOINT, WORDPRESS_SITE_URL,
} from '../../../constants';
import { socialMediaIcons } from '../../../utils/socialMediaIcons';

const StyledFooter = styled.footer`
  .nav-link {
    font-weight: 500;
  }
  .store__links__container{
    @media(max-width: ${MD_MEDIA_BREAKPOINT}){
      width: 74%;
      margin: auto;
      display: flex;
      justify-content: space-between !important;
    }
    & > .col {
      max-width: 292px;
      margin-right: 10px;
      @media(max-width: ${MD_MEDIA_BREAKPOINT}){
        max-width: 160px;
      }
    }
    & > .col + .col {
      margin-left: 15px;
    }
  }
  .footer__links {
    text-align: left;
    @media(max-width: ${MD_MEDIA_BREAKPOINT}){
      padding: 0px !important;
      text-align: center;
    }
    & > a {
      width: 44%;
      display: inline-block;
      @media(max-width: ${MD_MEDIA_BREAKPOINT}){
        width: 30%;
      }
    }
  }
`;

const footerNavList = [
  { value: '', label: 'HOME' },
  { value: 'shop', label: 'SHOP' },
  { value: 'about', label: 'ABOUT' },
  { value: 'news', label: 'NEWS' },
  { value: 'help', label: 'HELP' },
  { value: 'contact-us', label: 'CONTACT US' },
  { value: 'advertise', label: 'ADVERTISE' },
];
function PublicHomeFooter() {
  return (
    <StyledFooter>
      <div className="w-100 bottom-0">
        <Row className="m-0 align-items-start justify-content-between pt-4 pb-2">
          <Col md={3} className="p-2 text-center text-md-start">
            <Link to="/" className="mb-3">
              <HeaderLogo logo={slasherLogo} height="8.6rem" style={{ marginTop: 25 }} />
            </Link>
            <div style={{ marginTop: 10, marginLeft: -4 }} className="align-items-center d-flex mb-3 justify-content-center justify-content-md-start">
              {socialMediaIcons.map((icon) => (
                <a key={icon.to} className="mobile-nav-menu-icon-link rounded-circle d-flex align-items-center justify-content-center rounded-circle" href={icon.to}>
                  <img src={icon.svg} alt={icon.label} />
                </a>
              ))}
            </div>
            <div>
              <p className="text-light m-0 fs-5">
                &copy;
                {' '}
                {new Date().getFullYear()}
                {' '}
                Slasher Corp
              </p>
            </div>
          </Col>
          <Col md={5} className="footer__links pe-5 mb-md-3">
            <Link to="/" className="text-decoration-none px-0 px-md-4 py-3 p-md-4 nav-link fs-3">HOME</Link>
            {footerNavList.slice(1).map((navList) => (
              <a key={navList.value} href={`${WORDPRESS_SITE_URL}/${navList.value}`} className="text-decoration-none px-0 px-md-4 py-3 p-md-4 nav-link fs-3">
                {navList.label}
              </a>
            ))}
          </Col>
          <Col md={4} className="p-2 pt-md-0" style={{ marginTop: 32 }}>
            <Row className="store__links__container g-0 justify-content-end align-items-center">
              <Col>
                <a href={APP_STORE_DOWNLOAD_URL} target="_blank" className="p-0 h-100 d-block w-100" rel="noreferrer">
                  <Image fluid style={{ border: '3px solid gray' }} src={AppStoreImage} alt="app store" className="rounded-4 w-100 ios-badge" />
                </a>
              </Col>
              <Col>
                <a href={GOOGLE_PLAY_DOWNLOAD_URL} target="_blank" className="p-0 h-100 d-block w-100" rel="noreferrer">
                  <Image fluid style={{ border: '3px solid gray' }} src={PlayStoreImage} alt="play store" className="rounded-4 w-100 h-100" />
                </a>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </StyledFooter>
  );
}

export default PublicHomeFooter;
