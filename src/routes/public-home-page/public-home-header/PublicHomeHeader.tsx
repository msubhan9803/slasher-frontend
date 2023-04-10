import React, { useEffect, useState } from 'react';
import {
  Col, Navbar, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { StyledNav } from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageHeader';
import HeaderLogo from '../../../components/ui/HeaderLogo';
import { LG_MEDIA_BREAKPOINT, MD_MEDIA_BREAKPOINT, XL_MEDIA_BREAKPOINT } from '../../../constants';
import slasherLogo from '../../../images/slasher-logo-medium.png';

interface HeaderStyleProps {
  isOpen: boolean;
}

const NavbarToggle = styled(Navbar.Toggle)`
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
    border-top: 1px solid #252525;
    &:hover {
      background-color: var(--bs-primary) !important;
    }
  }
`;
const StyledNavbarCollapse = styled(Navbar.Collapse)`
  @media (min-width: ${LG_MEDIA_BREAKPOINT}){
    background-color: transparent !important;
  }
`;

const StyledHeader = styled.header<HeaderStyleProps>`
  height: 100px;
  z-index: 997;
  transition: all 0.5s;
  &.header-scrolled {
    background: var(--bs-secondary) !important;
    height: 82px;
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
    background:  ${({ isOpen }) => (isOpen ? 'var(--bs-secondary)' : '')} !important;  
    height: ${({ isOpen }) => (isOpen ? 'auto' : '100px')} !important;
    &.header-scrolled {
      background: var(--bs-secondary) !important;
      height: ${({ isOpen }) => (isOpen ? 'auto' : '70px')} !important;
    }
  }
`;
const navList = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'shop', label: 'Shop' },
  { value: 'advertise', label: 'Advertise' },
  { value: 'help', label: 'Help' },
  { value: 'contact-us', label: 'Contact Us' },
];
function PublicHomeHeader() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const selectHeader = document.querySelector('#header');
    const selectLoginButton = document.querySelector('.login-btn');
    const selectLogo1 = document.querySelector('.logo1');
    const selectLogo2 = document.querySelector('.logo2');
    const selectToggle = document.querySelector('.toggle');

    const headerScrolled = () => {
      if (window.pageYOffset > 120) {
        selectHeader?.classList.add('header-scrolled');
        selectLoginButton?.classList.add('mt-3');
        selectLogo1?.classList.add('mt-4');
        selectLogo2?.classList.add('mt-4');
        selectToggle?.classList.add('mt-4');
      } else {
        selectHeader?.classList.remove('header-scrolled');
        selectLoginButton?.classList.remove('mt-3');
        selectLogo1?.classList.remove('mt-4');
        selectLogo2?.classList.remove('mt-4');
        selectToggle?.classList.remove('mt-4');
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
    <StyledHeader isOpen={isOpen} id="header" className="fixed-top d-flex align-items-center bg-transparent">
      <div className="container-md position-relative">
        <Navbar
          collapseOnSelect
          expand="lg"
          bg="transparent"
          variant="dark"
          className="mb-3 d-lg-flex justify-content-lg-center"
        >
          <NavbarToggle onClick={() => setIsOpen(!isOpen)} aria-controls="responsive-navbar-nav" className="toggle border-0" />
          <Navbar.Brand as={Link} to="/" style={{ marginTop: isOpen ? '-10px' : '0' }} className={`mx-auto pe-4 ${!isOpen ? 'logo2' : ''} d-lg-none py-0`}>
            <HeaderLogo logo={slasherLogo} height="8rem" />
          </Navbar.Brand>
          <StyledNavbarCollapse id="responsive-navbar-nav" className="bg-black mt-2 mt-lg-0">
            <StyledNav className="justify-content-between px-3 small-screen w-100">
              <Row className="w-100 align-items-center">
                <Col lg={3}>
                  <Navbar.Brand as={Link} to="/" className="logo1 d-none d-lg-flex py-0">
                    <HeaderLogo logo={slasherLogo} height="9rem" />
                  </Navbar.Brand>
                </Col>
                <Col lg={8}>
                  <div className="d-lg-flex justify-content-between">
                    {navList.map((nav) => (
                      <StyledNavLink
                        key={nav.value}
                        href={nav.value === 'home' ? '/' : `https://pages.slasher.tv/${nav.value}`}
                        className="text-start w-100 rounded-0 nav-link py-3 px-5 p-lg-2 text-lg-center fs-3 text-decoration-none text-white"
                      >
                        {nav.label}
                      </StyledNavLink>
                    ))}
                    <StyledNavLink
                      href="/app/home"
                      className="text-start w-100 rounded-0 nav-link d-lg-none py-3 py-lg-0 px-5 px-lg-2 mx-xl-2 text-lg-center fs-3 text-decoration-none text-white"
                    >
                      Login In
                    </StyledNavLink>
                  </div>
                </Col>
                <Col lg={1} className="d-none d-lg-block">
                  <Link to="/app/home" className="btn btn-primary d-flex justify-content-center mx-auto px-5 rounded-pill">Login</Link>
                </Col>
              </Row>
            </StyledNav>
          </StyledNavbarCollapse>
        </Navbar>
      </div>
    </StyledHeader>
  );
}

export default PublicHomeHeader;
