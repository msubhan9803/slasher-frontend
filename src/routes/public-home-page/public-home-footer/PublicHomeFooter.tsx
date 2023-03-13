import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  faFacebookF, faTwitter, faYoutube, faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import slasherLogo from '../../../images/slasher-logo-medium.png';
import HeaderLogo from '../../../components/ui/HeaderLogo';
import DownloadStoreBadge from '../components/DownloadStoreBadge';

const socialMediaSites = [
  { icon: faFacebookF, to: '/', bgColor: '#3b5998' },
  { icon: faTwitter, to: '/', bgColor: '#1da1f2' },
  { icon: faYoutube, to: '/', bgColor: '#CD201F' },
  { icon: faInstagram, to: '/', bgColor: '#AF1C9D' },
];

interface SocialMediaIcon {
  bgcolor?: string;
}

const StyledMediaIcon = styled.div <SocialMediaIcon>`
  width: 30px;
  height: 30px;
  &:hover {
    background-color: ${(prop) => prop.bgcolor} !important;
    color: var(--bs-body-color) !important;
  }
`;

const footerNavList = ['HOME', 'ADVERTICE', 'ABOUT', 'SHOP', 'HELP', 'CONTACT US'];
function PublicHomeFooter() {
  return (
    <footer>
      <div className="p-4 w-100 bottom-0">
        <Row>
          <Col md={4} lg={3} className="text-center text-md-start mb-3 mb-md-0">
            <div className="mb-3">
              <HeaderLogo logo={slasherLogo} height="8rem" />
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
          <Col md={4} className="mb-3 mb-md-0 text-center text-md-start">
            <div>
              <Row>
                {footerNavList.map((navList) => (
                  <Col xs={4} md={6} key={navList} className="my-4">
                    <Link to="/" className="text-decoration-none">
                      <h1 className="h3 m-0">{navList}</h1>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
          <Col md={4} lg={5} className="text-center text-md-end my-md-auto">
            <DownloadStoreBadge />
          </Col>
        </Row>
      </div>
    </footer>
  );
}

export default PublicHomeFooter;
