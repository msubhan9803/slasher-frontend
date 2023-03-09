import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { StyledNav } from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageHeader';
import HeaderLogo from '../../../components/ui/HeaderLogo';
import { LG_MEDIA_BREAKPOINT } from '../../../constants';
import SlasherLogo from '../../../images/slasher-logo-medium.png';

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

function PublicHomeHeader() {
  const navList = ['Home', 'About', 'Shop', 'Advertise', 'Help', 'Contact Us'];
  const midIndex = Math.ceil(navList.length / 2);

  const beforeBrand = navList.slice(0, midIndex);
  const afterBrand = navList.slice(midIndex);
  return (
    <header>
      <Container>
        <Navbar
          collapseOnSelect
          expand="lg"
          bg="transparent"
          variant="dark"
          className="fixed-top pt-0 px-lg-5 mb-3"
        >
          <NavbarToggle aria-controls="responsive-navbar-nav" className="border-0" />
          <Navbar.Brand as={Link} to="/" className="mx-auto pe-5 d-lg-none py-0">
            <HeaderLogo logo={SlasherLogo} height="6.5rem" />
          </Navbar.Brand>
          <StyledNavbarCollapse id="responsive-navbar-nav" className="bg-black mt-2 mt-lg-0">
            <StyledNav className="w-100 justify-content-between px-3 mx-lg-5 small-screen">
              <div className="d-lg-flex align-items-lg-center">
                {beforeBrand.map((nav) => (
                  <StyledNavLink
                    key={nav}
                    to="/app/public-home-page"
                    className="nav-link py-3 px-5 p-lg-3 mx-xl-2 text-lg-center fs-3 text-decoration-none text-white"
                  >
                    {nav}
                  </StyledNavLink>
                ))}
              </div>
              <Navbar.Brand as={Link} to="/" className="d-none d-lg-block mx-lg-auto py-0">
                <HeaderLogo logo={SlasherLogo} height="7rem" />
              </Navbar.Brand>
              <div className="d-lg-flex align-items-lg-center">
                {afterBrand.map((nav) => (
                  <StyledNavLink
                    key={nav}
                    to="/app/public-home-page"
                    className="nav-link py-3 py-lg-0 px-5 px-lg-2 mx-xl-3 text-lg-center fs-3 text-decoration-none text-white"
                  >
                    {nav}
                  </StyledNavLink>
                ))}
              </div>
            </StyledNav>
          </StyledNavbarCollapse>
        </Navbar>
      </Container>
    </header>
  );
}

export default PublicHomeHeader;
