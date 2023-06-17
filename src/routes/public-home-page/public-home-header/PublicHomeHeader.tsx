/* eslint-disable max-len */
/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { Navbar, Offcanvas } from 'react-bootstrap';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { WORDPRESS_SITE_URL, XL_MEDIA_BREAKPOINT } from '../../../constants';

const NavbarToggle = styled(Navbar.Toggle)`
  margin-right:0px !important;
  &:focus {
    box-shadow: none !important;
  }
`;

function OffcanvasHeadingTitle({ children }: { children: React.ReactNode }) {
  return <div className="offcanvas-title h2 mb-0">{children}</div>;
}

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
const signInNavItem: NavItem = { value: '/app/sign-in', label: 'Sign In or Create An Account' };

function PublicHomeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [applySolidBackgroundToTopNav, setApplySolidBackgroundToTopNav] = useState(false);

  const isDesktopResponsiveSize = useMediaQuery({ query: `(min-width: ${XL_MEDIA_BREAKPOINT})` });
  if (isDesktopResponsiveSize && isOpen) {
    setIsOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 50) {
        if (!applySolidBackgroundToTopNav) {
          setApplySolidBackgroundToTopNav(true);
        }
      } else if (applySolidBackgroundToTopNav) {
        setApplySolidBackgroundToTopNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, [applySolidBackgroundToTopNav]);

  return (
    <div id="header" className="fixed-top">
      <nav id="main-nav" className={`navbar navbar-expand-xl navbar-dark ${applySolidBackgroundToTopNav ? 'with-background' : ''}`} aria-labelledby="main-nav-label">
        <div className="container-fluid container-xl">
          <Link to="/" className="navbar-brand custom-logo-link">
            <img width="510" height="300" src="http://pages.slasher.localhost:9000/wp-content/uploads/2023/05/slasher-logo-medium.png" className="img-fluid" alt="Slasher" decoding="async" srcSet="http://pages.slasher.localhost:9000/wp-content/uploads/2023/05/slasher-logo-medium.png 510w, http://pages.slasher.localhost:9000/wp-content/uploads/2023/05/slasher-logo-medium-300x176.png 300w" sizes="(max-width: 510px) 100vw, 510px" />
          </Link>
          <div className="toggle-button-wrapper order-first">
            <NavbarToggle onClick={() => setIsOpen(!isOpen)} aria-controls="responsive-navbar-nav" className="toggle" />
          </div>

          <div className="offcanvas offcanvas-start bg-dark" id="navbarNavOffcanvas">
            <div className="offcanvas-header justify-content-end">
              <button
                className="btn-close btn-close-white text-reset"
                type="button"
                data-bs-dismiss="offcanvas"
                aria-label="Close menu"
              />
            </div>

            <div className="offcanvas-body">
              <ul id="main-menu" className="navbar-nav justify-content-between flex-grow-1 pe-3">
                {navList.map((nav) => (
                  <li
                    key={nav.value.slice(25)} // remove `url` from key
                    className="nav-item"
                  >
                    {
                      nav.value === '/'
                        ? <Link to={nav.value} className="nav-link">{nav.label}</Link>
                        : <a href={nav.value} className="nav-link">{nav.label}</a>
                    }
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="sign-in-button-wrapper">
            <Link className="d-none d-xl-block sign-in-button btn btn-primary rounded rounded-5 fw-bold px-2 px-md-3" to={signInNavItem.value}>{signInNavItem.label}</Link>
          </div>
        </div>
        {isOpen && (
          <Offcanvas id="offcanvas-main-nav" show={isOpen} onHide={() => setIsOpen(false)}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title as={OffcanvasHeadingTitle}>Navigation</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Link className="mobile-menu-sign-in-link nav-link py-2 d-xl-none" to={signInNavItem.value}>{signInNavItem.label}</Link>
              <ul id="main-menu" className="navbar-nav justify-content-between flex-grow-1 pe-3">
                {navList.map((nav) => (
                  <li
                    key={`offcanvas-${nav.value.slice(25)}`} // remove `url` from key
                    className="nav-item"
                  >
                    <a href={nav.value} className="nav-link">{nav.label}</a>
                  </li>
                ))}
              </ul>
            </Offcanvas.Body>
          </Offcanvas>
        )}
      </nav>
    </div>
  );
}

export default PublicHomeHeader;
