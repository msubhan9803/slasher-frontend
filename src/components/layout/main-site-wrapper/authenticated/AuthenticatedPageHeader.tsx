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

const UserCircleImage = styled.img`
  // 2em is the size of a font-awesome 2x icon,
  // so we're matching the size of the other nav icons.
  width: 2em;
  height: 2em;
`;
const StyledNavbar = styled(Navbar)`
  font-size: .8rem;
  .nav-link {
    min-width: 5rem;
    padding-left: .25rem;
    padding-right: .25rem;
  }
`;

const StyledLogoImage = styled(Image)`
  height: 6rem;
`;

const MobileNavbar = styled(Navbar)`
  border-top: 5px solid #1F1F1F;
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
      aria-controls={ariaToggleTargetId}
      label="Menu"
      icon={solid('bars')}
      iconSize="lg"
      onClick={onToggleClick}
    />,
    <GlobalNavLink label="Home" icon={solid('home')} to="/" iconSize="lg" />,
    <GlobalNavLink label="Notifications" icon={solid('bell')} to="/notifications" iconSize="lg" badge={2} />,
    <GlobalNavLink label="Messages" icon={solid('message')} to="/messages" iconSize="lg" />,
    <GlobalNavLink label="Search" icon={solid('magnifying-glass')} to="/search" iconSize="lg" />,
  ];

  return (
    <>
      {/* nav-bar for large & medium screen */}
      <StyledNavbar bg="dark" variant="dark" expand={offcanvasSidebarExpandBreakPoint} className={`py-0 mb-3 d-none d-${offcanvasSidebarExpandBreakPoint}-flex`}>
        <Container>
          <Navbar.Brand as={Link} to="/" className="py-0">
            <StyledLogoImage src={slasherLogo} alt="Slasher logo" />
          </Navbar.Brand>
          <Nav className="ms-auto">
            <GlobalNavLink label="Home" icon={solid('home')} to="/" className="nav-link" iconSize="2x" />
            <GlobalNavLink label="Friends" icon={solid('user-group')} to="/friends" className="nav-link" iconSize="2x" />
            <GlobalNavLink label="Notifications" icon={solid('bell')} to="/notifications" badge={2} className="nav-link" iconSize="2x" />
            <GlobalNavLink label="Messages" icon={solid('message')} to="/messages" className="nav-link" iconSize="2x" />
            <GlobalNavLink label="Search" icon={solid('magnifying-glass')} to="/search" className="nav-link" iconSize="2x" />
            <Nav.Link className="d-flex flex-column justify-content-evenly text-white">
              <UserCircleImage className="rounded-circle m-auto" src={userProfileIconPlaceholder} alt="User icon" />
              <p className="mt-2 mb-0 text-center">Profile</p>
            </Nav.Link>
          </Nav>
        </Container>
      </StyledNavbar>

      {/* nav-bar for small screen */}
      <MobileNavbar bg="dark" variant="dark" className="d-md-none fixed-bottom pt-3">
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
