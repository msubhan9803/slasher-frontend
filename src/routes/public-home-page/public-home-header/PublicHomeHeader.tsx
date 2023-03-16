import React, { useEffect, useState } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { StyledNav } from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageHeader';
import HeaderLogo from '../../../components/ui/HeaderLogo';
import RoundButton from '../../../components/ui/RoundButton';
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

const StyledNavLink = styled(Link)`
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
    height: 70px;
  }
  .login-btn{
    top: 48px;
    right: -20px;
  }
  @media (max-width: ${XL_MEDIA_BREAKPOINT}){
  .login-btn{
    top: 48px;
    right: -30px;
  }
  }
  @media (max-width: ${MD_MEDIA_BREAKPOINT}){
    height: ${({ isOpen }) => (isOpen ? 'auto' : '100px')} !important;
    &.header-scrolled {
      background: var(--bs-secondary) !important;
      height: ${({ isOpen }) => (isOpen ? 'auto' : '70px')} !important;
    }
  }
`;
function PublicHomeHeader() {
  const navList = ['Home', 'About', 'Shop', 'Advertise', 'Help', 'Contact Us'];
  const midIndex = Math.ceil(navList.length / 2);
  const [isOpen, setIsOpen] = useState(false);
  const beforeBrand = navList.slice(0, midIndex);
  const afterBrand = navList.slice(midIndex);

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
      <Container className="position-relative">
        <Navbar
          collapseOnSelect
          expand="lg"
          bg="transparent"
          variant="dark"
          className="mb-3"
        >
          <NavbarToggle onClick={() => setIsOpen(!isOpen)} aria-controls="responsive-navbar-nav" className="toggle border-0" />
          <Navbar.Brand as={Link} to="/" className="logo1 mx-auto pe-5 d-lg-none py-0">
            <HeaderLogo logo={slasherLogo} height="6.5rem" />
          </Navbar.Brand>
          <StyledNavbarCollapse id="responsive-navbar-nav" className="bg-black mt-2 mt-lg-0">
            <StyledNav className="w-100 justify-content-between px-3 mx-lg-5 small-screen">
              <div className="before-link d-lg-flex align-items-lg-center">
                {beforeBrand.map((nav) => (
                  <StyledNavLink
                    key={nav}
                    to="/app/public-home-page"
                    className="nav-link py-3 px-5 p-lg-3 text-lg-center fs-3 text-decoration-none text-white"
                  >
                    {nav}
                  </StyledNavLink>
                ))}
              </div>
              <Navbar.Brand as={Link} to="/" className="logo2 d-none d-lg-block mx-lg-auto py-0">
                <HeaderLogo logo={slasherLogo} height="8rem" />
              </Navbar.Brand>
              <div className="after-link me-lg-1 d-lg-flex align-items-lg-center">
                {afterBrand.map((nav) => (
                  <StyledNavLink
                    key={nav}
                    to="/app/public-home-page"
                    className="nav-link py-3 py-lg-0 px-5 px-lg-2 mx-xl-2 text-lg-center fs-3 text-decoration-none text-white"
                  >
                    {nav}
                  </StyledNavLink>
                ))}
                <StyledNavLink
                  to="/app/public-home-page"
                  className="nav-link d-lg-none py-3 py-lg-0 px-5 px-lg-2 mx-xl-2 text-lg-center fs-3 text-decoration-none text-white"
                >
                  Login In
                </StyledNavLink>
              </div>
            </StyledNav>
          </StyledNavbarCollapse>
        </Navbar>
        <RoundButton className="login-btn d-none d-lg-block px-4 position-absolute">Login</RoundButton>
      </Container>
    </StyledHeader>
  );
}

export default PublicHomeHeader;
