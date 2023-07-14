/* eslint-disable max-len */
/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { Container, Navbar, Offcanvas } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { WORDPRESS_SITE_URL, XL_MEDIA_BREAKPOINT } from '../../../constants';
import slasherLogoMedium from '../../../images/slasher-logo-medium.png';
import { socialMediaIcons } from '../../../utils/socialMediaIcons';

function OffcanvasHeadingTitle({ id, children }: { id: string, children: React.ReactNode }) {
  return <div id={id} className="offcanvas-title h2 mb-0">{children}</div>;
}

type NavItem = { value: string, label: string };
const navList: NavItem[] = [
  { value: '/', label: 'Home' },
  { value: `${WORDPRESS_SITE_URL}/about`, label: 'About' },
  { value: `${WORDPRESS_SITE_URL}/news`, label: 'News' },
  { value: `${WORDPRESS_SITE_URL}/shop`, label: 'Shop' },
  { value: `${WORDPRESS_SITE_URL}/advertise`, label: 'Advertise' },
  { value: `${WORDPRESS_SITE_URL}/help`, label: 'Help' },
  { value: `${WORDPRESS_SITE_URL}/contact`, label: 'Contact Us' },
];
const signInNavItem: NavItem = { value: '/app/sign-in', label: 'Sign in or Create an account' };

function PublicHomeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [applySolidBackgroundToTopNav, setApplySolidBackgroundToTopNav] = useState(false);

  const isDesktopResponsiveSize = useMediaQuery({ query: `(min-width: ${XL_MEDIA_BREAKPOINT})` });
  if (isDesktopResponsiveSize && isOpen) {
    setIsOpen(false);
  }

  useEffect(() => {
    const handleCurrentScrollPosition = () => {
      if (window.scrollY > 50) {
        if (!applySolidBackgroundToTopNav) {
          setApplySolidBackgroundToTopNav(true);
        }
      } else if (applySolidBackgroundToTopNav) {
        setApplySolidBackgroundToTopNav(false);
      }
    };

    // Fire once on component mount, in case the component mounts while page is not scrolled to the top
    handleCurrentScrollPosition();

    window.addEventListener('scroll', handleCurrentScrollPosition);
    return () => { window.removeEventListener('scroll', handleCurrentScrollPosition); };
  }, [applySolidBackgroundToTopNav]);

  return (
    <div id="header" className="fixed-top">
      <Navbar id="main-nav" expand="xl" variant="dark" expanded={isOpen} onToggle={() => { setIsOpen(!isOpen); }} className={`mb-3 ${applySolidBackgroundToTopNav ? 'with-background' : ''}`}>
        <Container fluid className="container-xl justify-content-center">
          <Link to="/" className="navbar-brand custom-logo-link">
            <img width="510" height="300" src={slasherLogoMedium} className="img-fluid" alt="Slasher" />
          </Link>
          <div className="toggle-button-wrapper order-first position-fixed">
            <Navbar.Toggle aria-controls="navbarNavOffcanvas" />
          </div>
          <Navbar.Offcanvas
            id="navbarNavOffcanvas"
            aria-labelledby="offcanvasNavbarLabel-expand"
            placement="start"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title
                id="offcanvasNavbarLabel-expand"
                as={OffcanvasHeadingTitle}
              >
                Navigation
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Link className="mobile-menu-sign-in-link fw-bold nav-link py-2 d-xl-none" to={signInNavItem.value}>{signInNavItem.label}</Link>
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
              <div className="d-flex mt-4 d-xl-none">
                {socialMediaIcons.map((icon: any) => (
                  <a key={icon.to} className="social-network-icon-group-link rounded-circle d-flex align-items-center justify-content-center rounded-circle" href={icon.to}>
                    <img src={icon.svg} alt={icon.label} />
                  </a>
                ))}
              </div>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
          <div className="sign-in-button-wrapper">
            <Link className="d-none d-xl-block sign-in-button btn btn-primary rounded rounded-5 fw-bold px-2 px-md-3" to={signInNavItem.value}>{signInNavItem.label}</Link>
          </div>
        </Container>
      </Navbar>
    </div>
  );
}

export default PublicHomeHeader;
