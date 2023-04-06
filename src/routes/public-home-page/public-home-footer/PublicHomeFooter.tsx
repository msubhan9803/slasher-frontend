import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, Row,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  faFacebookF, faTwitter, faYoutube, faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import slasherLogo from '../../../images/slasher-logo-medium.png';
import HeaderLogo from '../../../components/ui/HeaderLogo';
import AppStoreImage from '../../../images/app-store-badge.png';
import PlayStoreImage from '../../../images/google-play-badge.png';
import { handleAppLink, handleNavLink } from '../navigate-link';

const socialMediaSites = [
  { icon: faFacebookF, to: '/', bgColor: '#3b5998' },
  { icon: faTwitter, to: '/', bgColor: '#1da1f2' },
  { icon: faYoutube, to: '/', bgColor: '#CD201F' },
  { icon: faInstagram, to: '/', bgColor: '#AF1C9D' },
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

const StyledMediaIcon = styled.div <SocialMediaIcon>`
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
  const navigate = useNavigate();
  const footerNavLink = (link: string) => {
    if (link === 'home') {
      navigate('/app/public-home-page');
    } else {
      handleNavLink(link);
    }
  };

  return (
    <StyledFooter>
      <div className="w-100 bottom-0 p-2">
        <Row className="m-0 align-items-center">
          <Col md={3} className="me-md-5 p-2 text-center text-md-start">
            <div className="mb-3">
              <HeaderLogo logo={slasherLogo} height="9rem" />
            </div>
            <div className="align-items-center d-flex mb-3 justify-content-center justify-content-md-start">
              {socialMediaSites.map((site: any) => (
                <Link to={site.to} key={site.icon}>
                  <StyledMediaIcon bgcolor={site.bgColor} className="m-2 align-items-center bg-white d-flex justify-content-center rounded-circle text-black">
                    <FontAwesomeIcon icon={site.icon} className="" />
                  </StyledMediaIcon>
                </Link>
              ))}
            </div>
            <div>
              <p className="text-light m-0 fs-5">&copy; 2022 Slasher Corp</p>
            </div>
          </Col>
          <Col xs={6} md={2} className="mb-md-3">
            {footerNavList.slice(0, 3).map((navList) => (
              <Button key={navList.value} variant="link" onClick={() => { footerNavLink(navList.value); }} className="text-decoration-none px-0 px-md-4 py-3 p-md-4 nav-link fs-3">
                {navList.label}
              </Button>
            ))}
          </Col>
          <Col xs={6} md={3} className="mb-md-3">
            {footerNavList.slice(-3).map((navList) => (
              <Button key={navList.value} variant="link" onClick={() => footerNavLink(navList.value)} className="text-decoration-none px-0 px-md-4 py-3 p-md-4 nav-link fs-3">
                {navList.label}
              </Button>
            ))}
          </Col>
          <Col md={3} className="p-2 mt-md-5 pt-md-0">
            <Row>
              <Col>
                <Button variant="link" onClick={() => handleAppLink('app-store')} className="p-0 h-100">
                  <Image fluid src={AppStoreImage} alt="app store" className="border rounded ios-badge" />
                </Button>
              </Col>
              <Col>
                <Button variant="link" onClick={() => handleAppLink('play-store')} className="p-0 h-100">
                  <Image fluid src={PlayStoreImage} alt="play store" className="border rounded h-100" />
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </StyledFooter>
  );
}

export default PublicHomeFooter;
