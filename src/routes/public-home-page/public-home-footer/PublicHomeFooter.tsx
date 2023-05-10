import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  faFacebookF, faTwitter, faYoutube, faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import slasherLogo from '../../../images/slasher-logo-medium.png';
import HeaderLogo from '../../../components/ui/HeaderLogo';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';
import { APP_STORE_DOWNLOAD_URL, GOOGLE_PLAY_DOWNLOAD_URL } from '../../../constants';

export const socialMediaSites = [
  { icon: faFacebookF, to: 'https://www.facebook.com/TheSlasherApp', bgColor: '#3b5998' },
  { icon: faTwitter, to: 'https://twitter.com/theslasherapp', bgColor: '#1da1f2' },
  { icon: faYoutube, to: 'https://www.youtube.com/channel/UCUcGxsG2u55zlVoe_s8TjcA', bgColor: '#CD201F' },
  { icon: faInstagram, to: 'https://www.instagram.com/theslasherapp/', bgColor: '#AF1C9D' },
];

interface SocialMediaIcon {
  bgcolor?: string;
}

const StyledFooter = styled.footer`
  padding: 0 0 30px 0;
  .nav-link {
    font-weight: 500;
  }
`;

export const StyledMediaIcon = styled.div <SocialMediaIcon>`
  width: 30px;
  height: 30px;
  &:hover {
    background-color: ${(prop) => prop.bgcolor} !important;
    color: var(--bs-body-color) !important;
  }
`;

const footerNavList = [
  { value: 'home', label: 'HOME' },
  { value: 'about', label: 'ABOUT' },
  { value: 'help', label: 'HELP' },
  { value: 'advertise', label: 'ADVERTISE' },
  { value: 'shop', label: 'SHOP' },
  { value: 'contact-us', label: 'CONTACT US' },
];
function PublicHomeFooter() {
  return (
    <StyledFooter>
      <div className="w-100 bottom-0 p-2">
        <Row className="m-0 align-items-center justify-content-center py-3">
          <Col md={3} className="me-md-5 p-2 text-center text-md-start">
            <Link to="/" className="mb-3">
              <HeaderLogo logo={slasherLogo} height="9rem" />
            </Link>
            <div className="align-items-center d-flex mb-3 justify-content-center justify-content-md-start">
              {socialMediaSites.map((site: any) => (
                <a href={site.to} key={site.icon}>
                  <StyledMediaIcon bgcolor={site.bgColor} className="m-2 align-items-center bg-white d-flex justify-content-center rounded-circle text-black">
                    <FontAwesomeIcon icon={site.icon} className="" />
                  </StyledMediaIcon>
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
          <Col xs={6} md={2} className="mb-md-3">
            <Link to="/" className="text-decoration-none px-0 px-md-4 py-3 p-md-4 nav-link fs-3">HOME</Link>
            {footerNavList.slice(1, 3).map((navList) => (
              <a key={navList.value} href={`https://pages.slasher.tv/${navList.value}`} className="text-decoration-none px-0 px-md-4 py-3 p-md-4 nav-link fs-3">
                {navList.label}
              </a>
            ))}
          </Col>
          <Col xs={6} md={3} className="mb-md-3">
            {footerNavList.slice(-3).map((navList) => (
              <a key={navList.value} href={`https://pages.slasher.tv/${navList.value}`} className="text-decoration-none px-0 px-md-4 py-3 p-md-4 nav-link fs-3">
                {navList.label}
              </a>
            ))}
          </Col>
          <Col md={3} className="p-2 mt-md-5 pt-md-0">
            <Row>
              <Col>
                <a href={APP_STORE_DOWNLOAD_URL} target="_blank" className="p-0 h-100" rel="noreferrer">
                  <Image fluid src={AppStoreImage} alt="app store" className="border rounded ios-badge" />
                </a>
              </Col>
              <Col>
                <a href={GOOGLE_PLAY_DOWNLOAD_URL} target="_blank" className="p-0 h-100" rel="noreferrer">
                  <Image fluid src={PlayStoreImage} alt="play store" className="border rounded h-100" />
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
