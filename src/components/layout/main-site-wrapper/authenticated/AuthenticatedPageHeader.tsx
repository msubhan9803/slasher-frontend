import React from 'react';
import {
  Navbar, Container, Nav, Image, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import slasherLogo from '../../../../images/slasher-logo-medium.png';
import IconWithTextNavLink from './IconWithTextNavLink';
import IconWithTextNavButton from './IconWithTextNavButton';
import CustomPopover from '../../../ui/CustomPopover';
import { useAppSelector } from '../../../../redux/hooks';

const StyledNavbar = styled(Navbar)`
  z-index:1;
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
  @media (min-width: 992px) {
    // We need to use an exact offset here because we're matching the width of the word "Profile"
    transform: translateX(2.3rem);
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
  const navigate = useNavigate();
  const popoverOption = ['My profile', 'Settings'];
  const userData = useAppSelector((state) => state.user);

  const handleNavigate = (selectedOption: string) => {
    if (selectedOption === 'My profile') {
      navigate(`/${userName}`);
    }
    if (selectedOption === 'Settings') {
      navigate('/account/settings');
    }
  };

  const mobileNavLinkElements = [
    <IconWithTextNavButton
      key="Menu"
      aria-controls={ariaToggleTargetId}
      label="Menu"
      icon={solid('bars')}
      iconSize="lg"
      onClick={onToggleClick}
    />,
    <IconWithTextNavLink key="Home" label="Home" icon={solid('home')} to="/home" iconSize="lg" />,
    <IconWithTextNavLink key="Notifications" label="Notifications" icon={solid('bell')} to="/notifications" iconSize="lg" badge={userData.unreadNotificationCount} />,
    <IconWithTextNavLink key="Messages" label="Messages" icon={solid('message')} to="/messages" iconSize="lg" />,
    <IconWithTextNavLink key="Search" label="Search" icon={solid('magnifying-glass')} to="/search" iconSize="lg" />,
  ];

  const desktopNavLinkElements = [
    <IconWithTextNavLink key="Home" label="Home" icon={solid('home')} to="/home" className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Friends" label="Friends" icon={solid('user-group')} to={`/${userName}/friends`} badge={userData.friendRequestCount} className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Notifications" label="Notifications" icon={solid('bell')} to="/notifications" badge={userData.unreadNotificationCount} className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Messages" label="Messages" icon={solid('message')} to="/messages" className="nav-link" iconSize="2x" />,
    <IconWithTextNavLink key="Search" label="Search" icon={solid('magnifying-glass')} to="/search" className="nav-link" iconSize="2x" />,
    <div key="me">
      <CustomPopover
        popoverOptions={popoverOption}
        onPopoverClick={handleNavigate}
        userProfileIcon={userData.user.profilePic}
      />
    </div>,
  ];

  return (
    <>
      {/* nav-bar for large & medium screen */}
      <header>
        <StyledNavbar bg="dark" variant="dark" expand={offcanvasSidebarExpandBreakPoint} className={`fixed-top py-1 mb-3 d-none d-${offcanvasSidebarExpandBreakPoint}-flex`}>
          <Container fluid="xxl" className="px-4">
            <Navbar.Brand as={Link} to="/" className="py-0">
              <StyledLogoImage src={slasherLogo} alt="Slasher logo" />
            </Navbar.Brand>
            <StyledNav className="ms-auto">
              {
                desktopNavLinkElements.map((el, index) => {
                  const uniqueId = `nav-link-${index}`;
                  return <div key={uniqueId} style={{ width: desktopTopNavIconWidth }}>{el}</div>;
                })
              }
            </StyledNav>
          </Container>
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
