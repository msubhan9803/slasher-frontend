/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import {
  Button,
  Col, Navbar, Offcanvas, Row,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { StyledNav } from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageHeader';
import HeaderLogo from '../../../components/ui/HeaderLogo';
import {
  LG_MEDIA_BREAKPOINT, MD_MEDIA_BREAKPOINT, WORDPRESS_SITE_URL, XL_MEDIA_BREAKPOINT,
} from '../../../constants';
import slasherLogo from '../../../images/slasher-logo-medium.png';
import RoundButton from '../../../components/ui/RoundButton';
import { StyledMediaIcon, socialMediaSites } from '../public-home-footer/PublicHomeFooter';
import { enableDevFeatures } from '../../../utils/configEnvironment';

interface HeaderStyleProps {
  isOpen: boolean;
}

const NavbarToggle = styled(Navbar.Toggle)`
  margin-right:0px !important;
  &:focus {
    box-shadow: none !important;
  }
`;

const StyledNavLink = styled.a`
  @media (min-width: ${LG_MEDIA_BREAKPOINT}){
    text-transform: uppercase;
    font-weight: bold;
    &:hover {
      color: var(--bs-primary) !important;
    }
  }
  @media (max-width: ${LG_MEDIA_BREAKPOINT}){
    &:hover {
      color:var(--bs-primary) !important;
    }
  }
`;
const StyledNavbarCollapse = styled(Navbar.Collapse)`
  margin-right: 0px !important;
  @media (min-width: ${LG_MEDIA_BREAKPOINT}){
    background-color: transparent !important;
  }
`;

const StyledHeader = styled.header<HeaderStyleProps>`
  height: 100px;
  z-index: 997;
  transition: all 0.5s;
  padding-right: 0px !important;
  &.header-scrolled {
    background: var(--bs-secondary) !important;
    height: 140px;
  }
  .login-btn{
    top: 48px;
    right: -20px;
  }
  @media (max-width: ${XL_MEDIA_BREAKPOINT}){
    .login-btn{
      right: -30px;
    }
  }
  @media only screen and (max-width: ${LG_MEDIA_BREAKPOINT}){
    height: ${({ isOpen }) => (isOpen ? 'auto' : '100px')} !important;
    &.header-scrolled {
      background: var(--bs-secondary) !important;
      height: ${({ isOpen }) => (isOpen ? 'auto' : '70px')} !important;
    }
  }
  @media (max-width: ${MD_MEDIA_BREAKPOINT}){
    height: auto !important;
    &.header-scrolled {
      background: var(--bs-secondary) !important;
      height: ${({ isOpen }) => (isOpen ? 'auto' : '138px')} !important;
    }
  }
  .header__wrapper{
    width: 100%;
    max-width: 1263px;
    margin: auto;
  }
  .nav__items__container {
    padding-top: 0px;
    padding-right: 30px;
    @media (max-width: ${XL_MEDIA_BREAKPOINT}){
      padding-left: 20px !important;
    }
  }
  .mobile__logo{
    padding-left: 50px;
    @media (max-width: 480px){
      padding-left: 20px;
    }
  }
  .mobile__signin{
    padding-right: 30px;
    padding-bottom: 15px;
    @media (max-width: 480px){
      padding-right: 8px;
    }
  }
`;

const StyledOffcanvas = styled(Offcanvas)`
  background-color: #171718;
  .btn-close {
    background: #3A3B46;
    border-radius: 0.625rem;
  }
  .offcanvas-header button{
    background: rgb(58, 59, 70);
    border-radius: 0.625rem;
  }
  .offcanvas-title{
    font-size: 1.25rem;
    font-weight: normal
  }
`;
type NavItem = { value: string, label: string };
const navList: NavItem[] = [
  { value: '/', label: 'Home' },
  { value: `${WORDPRESS_SITE_URL}/about`, label: 'About' },
  { value: `${WORDPRESS_SITE_URL}/news`, label: 'News' },
  { value: `${WORDPRESS_SITE_URL}/shop`, label: 'Shop' },
  { value: `${WORDPRESS_SITE_URL}/advertise`, label: 'Advertise' },
  { value: `${WORDPRESS_SITE_URL}/help`, label: 'Help' },
  { value: `${WORDPRESS_SITE_URL}/contact-us`, label: 'Contact Us' },
];
const signInNavItem: NavItem = { value: '/app/sign-in', label: 'Sign in' };

function PublicHomeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const selectHeader = document.querySelector('#header');
    const selectLoginButton = document.querySelector('.login-btn');

    const headerScrolled = () => {
      if (window.pageYOffset > 50) {
        selectHeader?.classList.add('header-scrolled');
        selectLoginButton?.classList.add('mt-3');
      } else {
        selectHeader?.classList.remove('header-scrolled');
        selectLoginButton?.classList.remove('mt-3');
      }
    };

    window.addEventListener('load', headerScrolled);
    window.onscroll = () => {
      headerScrolled();
    };

    return () => {
      window.removeEventListener('load', headerScrolled);
      window.onscroll = null;
    };
  }, []);

  return (
    <StyledHeader isOpen={isOpen} id="header" className="fixed-top d-flex align-items-center bg-transparent pe-0">
      <div
        className="position-relative header__wrapper"
      >
        <Navbar
          collapseOnSelect
          expand="lg"
          bg="transparent"
          variant="dark"
          className=" d-lg-flex justify-content-lg-center pt-0"
        >
          <NavbarToggle onClick={() => setIsOpen(!isOpen)} aria-controls="responsive-navbar-nav" className="toggle border-0" />
          <Navbar.Brand as={Link} to="/" className="mobile__logo d-lg-none me-0">
            {/* This header is only shown on mobile screens */}
            <HeaderLogo logo={slasherLogo} height="8rem" style={{ marginLeft: 5 }} />
          </Navbar.Brand>
          <div className={`${enableDevFeatures ? '' : 'invisible'} d-lg-none mobile__signin`}>
            <RoundButton onClick={() => navigate('/app/sign-in')}>SIGN IN</RoundButton>
          </div>
          <StyledNavbarCollapse id="responsive-navbar-nav" className="bg-black mt-2 mt-lg-0 d-none">
            <StyledNav className="justify-content-between px-3 small-screen w-100">
              <Row className="w-100 align-items-center pt-4 m-0">
                <Col lg={2}>
                  <Navbar.Brand as={Link} to="/" className="logo1 d-none d-lg-flex py-0 justify-content-center me-0">
                    {/* This header is only shown on desktop screen (not on tablet and mobile)  */}
                    <HeaderLogo
                      logo={slasherLogo}
                      height="8rem"
                      style={{ marginTop: -10, marginLeft: 16 }}
                    />
                  </Navbar.Brand>
                </Col>
                <Col lg={10}>
                  <div className="d-none d-lg-flex justify-content-between align-items-center nav__items__container">
                    {navList.map((nav) => (
                      <StyledNavLink
                        key={nav.value.slice(25)} // remove `url` from key
                        href={nav.value}
                        className="text-start w-100 rounded-0 nav-link py-3 px-5 px-lg-2 py-lg-0 text-lg-center fs-3 text-decoration-none text-white text-nowrap"
                      >
                        {nav.label}
                      </StyledNavLink>
                    ))}
                    <Link
                      to="/app/sign-in"
                      className={`${enableDevFeatures ? '' : 'd-none'} btn btn-primary d-flex justify-content-center rounded-pill fs-3 text-nowrap mx-4 px-4 py-2`}
                    >
                      SIGN IN
                    </Link>
                  </div>
                </Col>
              </Row>
            </StyledNav>
          </StyledNavbarCollapse>
        </Navbar>
        {isOpen && (
          <StyledOffcanvas
            id="1"
            show
            onHide={() => setIsOpen(!isOpen)}
            className="w-100"
          >
            <Offcanvas.Header>
              <Offcanvas.Title>Navigation</Offcanvas.Title>
              <Button className="border-0 py-1" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon icon={solid('xmark')} size="lg" className="mt-1" />
              </Button>
            </Offcanvas.Header>
            <Offcanvas.Body className="pt-0">
              {[...navList, ...(enableDevFeatures ? [signInNavItem] : [])].map((nav) => (
                <StyledNavLink
                  key={nav.value.slice(25)} // remove `url` from key
                  href={nav.value}
                  className="text-start w-100 rounded-0 nav-link py-3 p-lg-2 text-lg-center fs-3 text-decoration-none text-white"
                >
                  {nav.label}
                </StyledNavLink>
              ))}
              <div className="align-items-center d-flex mt-4">
                {socialMediaSites.map((site: any) => (
                  <a href={site.to} key={site.icon}>
                    <StyledMediaIcon style={{ height: '32px', width: '32px' }} bgcolor={site.bgColor} className="me-3 align-items-center bg-white d-flex justify-content-center rounded-circle text-black">
                      <FontAwesomeIcon icon={site.icon} className="" />
                    </StyledMediaIcon>
                  </a>
                ))}
              </div>
            </Offcanvas.Body>
          </StyledOffcanvas>
        )}
      </div>
    </StyledHeader>
  );
}

export default PublicHomeHeader;
