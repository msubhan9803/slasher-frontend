import React from 'react';
import {
  Navbar, Container, Nav, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import IconWithTextNavLink from './IconWithTextNavLink';
import IconWithTextNavButton from './IconWithTextNavButton';
import { useAppSelector } from '../../../../redux/hooks';
import { LG_MEDIA_BREAKPOINT } from '../../../../constants';
import HeaderLogo from '../../../ui/HeaderLogo';

const SOLID_BLACK_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const StyledNavbar = styled(Navbar)`
  z-index:1;
  // background-color: #101010 !important;
  .nav-link {
    min-width: 5rem;
    padding-left: .25rem;
    padding-right: .25rem;
  }
`;

const MobileNavbar = styled(Navbar)`
  border-top: 5px solid #1F1F1F;
  p {
    font-size: .8rem;
  }
`;
const StyledNav = styled(Nav)`
  font-size: .875em;
  @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
    // We need to use an exact offset here because we're matching the width of the word "Me"
    transform: translateX(0.7rem);
    overflow: hidden;

  }
  .profile-link svg {
    visibility: hidden;
  }
`;
interface Props {
  userName: string;
  onToggleClick: () => void;
  offcanvasSidebarExpandBreakPoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ariaToggleTargetId: string;
}

const desktopTopNavIconWidth = '6.7rem';

function AuthenticatedPageHeader(
  {
    userName, onToggleClick, offcanvasSidebarExpandBreakPoint, ariaToggleTargetId,
  }: Props,
) {
  const userData = useAppSelector((state) => state.user);

  const mobileNavLinkElements = [
    <IconWithTextNavButton
      key="Menu"
      aria-controls={ariaToggleTargetId}
      label="Menu"
      icon={solid('bars')}
      iconSize="lg"
      onClick={onToggleClick}
    />,
    <IconWithTextNavLink key="Home" label="Home" icon={solid('home')} to="/app/home" iconSize="lg" />,
    <IconWithTextNavLink key="Notifications" label="Notifications" icon={solid('bell')} to="/app/notifications" iconSize="lg" badge={userData.unreadNotificationCount} />,
    <IconWithTextNavLink key="Messages" label="Messages" icon={solid('message')} to="/app/messages" iconSize="lg" badge={userData.unreadMessageCount} />,
    <IconWithTextNavLink key="Search" label="Search" icon={solid('magnifying-glass')} to="/app/search" iconSize="lg" />,
  ];

  const desktopNavLinkElements = [
    <IconWithTextNavLink key="Home" label="Home" icon={solid('home')} to="/app/home" className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Friends" label="Friends" icon={solid('user-group')} to={`/${userName}/friends`} badge={userData.friendRequestCount} className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Notifications" label="Notifications" icon={solid('bell')} to="/app/notifications" badge={userData.unreadNotificationCount} className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Messages" label="Messages" icon={solid('message')} to="/app/messages" badge={userData.unreadMessageCount} className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Search" label="Search" icon={solid('magnifying-glass')} to="/app/search" className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Me" label="Me" userProfileIcon={userData.user.profilePic || SOLID_BLACK_IMAGE_BASE64} to={`/${userName}`} className="nav-link" userProfileIconSize="1.5rem" />,
  ];

  return (
    <>
      {/* nav-bar for large & medium screen */}
      <header>
        <StyledNavbar bg="black" variant="dark" expand={offcanvasSidebarExpandBreakPoint} className={`fixed-top py-1 mb-3 d-none d-${offcanvasSidebarExpandBreakPoint}-flex`}>
          <div className="w-100 d-flex px-4 container-xxl">
            <Navbar.Brand as={Link} to="/" className="py-0">
              <HeaderLogo />
            </Navbar.Brand>
            <StyledNav className="ms-auto">
              {
                desktopNavLinkElements.map((el, index) => {
                  const uniqueId = `nav-link-${index}`;
                  return (
                    <div
                      key={uniqueId}
                      style={{ width: desktopTopNavIconWidth, paddingTop: 6 }}
                    >
                      {el}
                    </div>
                  );
                })
              }
            </StyledNav>
          </div>
        </StyledNavbar>

        {/* nav-bar for small screen */}
        <MobileNavbar bg="dark" variant="dark" className={`d-${offcanvasSidebarExpandBreakPoint}-none fixed-bottom pt-3`}>
          <Container fluid className="px-0">
            <Row className="w-100">
              {
                mobileNavLinkElements.map((el, index) => {
                  const uniqueId = `nav-link-${index}`;
                  return <Col key={uniqueId} style={{ maxWidth: `${100 / mobileNavLinkElements.length}%` }}>{el}</Col>;
                })
              }
            </Row>
          </Container>
        </MobileNavbar>
      </header>
    </>
  );
}
export default AuthenticatedPageHeader;
