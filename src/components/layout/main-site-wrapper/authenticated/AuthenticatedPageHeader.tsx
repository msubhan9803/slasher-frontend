import React from 'react';
import {
  Navbar, Container, Nav, Image, Col,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import slasherLogo from '../../../../images/slasher-logo-medium.png';
import userProfileIconPlaceholder from '../../../../placeholder-images/placeholder-user.jpg';
import GlobalNavLink from './GlobalNavLink';
import GlobalNavButton from './GlobalNavButton';

const UserCircleImageContainer = styled.div`
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  img {
    width: 2.2em;
    height: 2.2em;
    position: relative;
    top: -1.09em;
  }
`;
const StyledNavbar = styled(Navbar)`
  background-color: #101010 !important;
  .nav-link {
    min-width: 5rem;
    padding-left: .25rem;
    padding-right: .25rem;
  }
`;

const StyledLogoImage = styled(Image)`
  height: 6.6rem;
`;

const MobileNavbar = styled(Navbar)`
  border-top: 5px solid #1F1F1F;
  p {
    font-size: .8rem;
  }
`;

const StyledNav = styled(Nav)`
  font-size: .875em;
  @media (min-width: 960px) {
    overflow: hidden;
    .nav-link {
      position: relative;
      // We need to use an exact offset here because we're matching the width of the word "Profile"
      right: -2em;
    }
  }
  .profile-link svg {
    visibility: hidden;
  }
`;

interface Props {
  onToggleClick: () => void;
  offcanvasSidebarExpandBreakPoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ariaToggleTargetId: string;
}

function AuthenticatedPageHeader(
  { onToggleClick, offcanvasSidebarExpandBreakPoint, ariaToggleTargetId }: Props,
) {
  const navLinkElements = [
    <GlobalNavButton
      key="Menu"
      aria-controls={ariaToggleTargetId}
      label="Menu"
      icon={solid('bars')}
      iconSize="lg"
      onClick={onToggleClick}
    />,
    <GlobalNavLink key="Home" label="Home" icon={solid('home')} to="/" iconSize="lg" />,
    <GlobalNavLink key="Notifications" label="Notifications" icon={solid('bell')} to="/notifications" iconSize="lg" badge={2} />,
    <GlobalNavLink key="Messages" label="Messages" icon={solid('message')} to="/messages" iconSize="lg" />,
    <GlobalNavLink key="Search" label="Search" icon={solid('magnifying-glass')} to="/search" iconSize="lg" />,
  ];

  return (
    <>
      {/* nav-bar for large & medium screen */}
      <StyledNavbar bg="dark" variant="dark" expand={offcanvasSidebarExpandBreakPoint} className={`py-1 mb-3 d-none d-${offcanvasSidebarExpandBreakPoint}-flex`}>
        <Container fluid="xxl" className="px-4">
          <Navbar.Brand as={Link} to="/" className="py-0">
            <StyledLogoImage src={slasherLogo} alt="Slasher logo" />
          </Navbar.Brand>
          <StyledNav className="ms-auto">
            <GlobalNavLink label="Home" icon={solid('home')} to="/" className="nav-link mt-1" iconSize="2x" />
            <GlobalNavLink label="Friends" icon={solid('user-group')} to="/friends" className="nav-link mt-1" iconSize="2x" />
            <GlobalNavLink label="Notifications" icon={solid('bell')} to="/notifications" badge={2} className="nav-link mt-1" iconSize="2x" />
            <GlobalNavLink label="Messages" icon={solid('message')} to="/messages" className="nav-link mt-1" iconSize="2x" />
            <GlobalNavLink label="Search" icon={solid('magnifying-glass')} to="/search" className="nav-link mt-1" iconSize="2x" />
            <GlobalNavLink
              label="Me"
              icon={solid('circle')}
              to="/profile"
              className="nav-link mt-1 position-relative profile-link"
              iconSize="2x"
            >
              <UserCircleImageContainer className="position-absolute d-flex">
                <img
                  className="rounded-circle m-auto"
                  src={userProfileIconPlaceholder}
                  alt="User icon"
                />
              </UserCircleImageContainer>
            </GlobalNavLink>
            {/* <Nav.Link className="d-flex flex-column justify-content-evenly text-white mt-1">
              <UserCircleImage
                className="rounded-circle m-auto position-absolute"
                src={userProfileIconPlaceholder}
                alt="User icon"
              />
              <p className="mt-2 mb-0 text-center">Me</p>
            </Nav.Link> */}
          </StyledNav>
        </Container>
      </StyledNavbar>

      {/* nav-bar for small screen */}
      <MobileNavbar bg="dark" variant="dark" className={`d-${offcanvasSidebarExpandBreakPoint}-none fixed-bottom pt-3`}>
        <Container fluid className="px-0">
          {
            navLinkElements.map((el, index) => {
              const uniqueId = `nav-link-${index}`;
              return <Col key={uniqueId} style={{ maxWidth: `${100 / navLinkElements.length}%` }}>{el}</Col>;
            })
          }
        </Container>
      </MobileNavbar>
    </>
  );
}
export default AuthenticatedPageHeader;
