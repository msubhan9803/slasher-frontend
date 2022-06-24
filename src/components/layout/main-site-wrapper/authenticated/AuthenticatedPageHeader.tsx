import React from 'react';
import {
  Navbar, Container, Nav, Image,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import slasherLogo from '../../../../images/slasher-logo.svg';
import userProfileIconPlaceholder from '../../../../placeholder-images/placeholder-user.jpg';
import TopNavLink from './TopNavLink';

const UserCircleImage = styled.img`
  width:1.56rem;
`;
const UserProfileText = styled.p`
  font-size: .75rem;
`;

interface Props {
  onToggleClick: () => void;
  offcanvasSidebarExpandBreakPoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ariaToggleTargetId: string;
}

function AuthenticatedPageHeader(
  { onToggleClick, offcanvasSidebarExpandBreakPoint, ariaToggleTargetId }: Props,
) {

  return (
    <>
      {/* nav-bar for large & medium screen */}
      <Navbar bg="dark" variant="dark" expand={offcanvasSidebarExpandBreakPoint} className="mb-3 d-none d-md-flex">
        <Container className="justify-content-start">
          <Container className="d-none d-md-flex">
            <Navbar.Brand as={Link} to="/">
              <Image src={slasherLogo} alt="Slasher logo" className="mt-3" />
            </Navbar.Brand>
          </Container>
          <Nav className="me-auto flex-row ">
            <TopNavLink label="Home" icon={solid('home')} to="/" />
            <TopNavLink label="Friends" icon={solid('user-group')} to="/friends" />
            <TopNavLink label="Notifications" icon={solid('bell')} to="/notifications" badge={2} />
            <TopNavLink label="Messages" icon={solid('message')} to="/messages" />
            <TopNavLink label="Search" icon={solid('magnifying-glass')} to="/search" />
          </Nav>
          <Nav className="mw-auto flex-column p-1 d-none d-md-flex mt-0">
            <Nav.Link className="text-center text-white pb-1 pt-0">
              <UserCircleImage className="rounded-circle" src={userProfileIconPlaceholder} alt="User icon" />
            </Nav.Link>
            <UserProfileText className="mb-0 text-center">Me</UserProfileText>
          </Nav>
        </Container>
      </Navbar>

      {/* nav-bar for small screen */}
      <Navbar bg="dark" variant="dark" expand={offcanvasSidebarExpandBreakPoint} className=" d-md-none fixed-bottom">
        <Container className="">
          <Navbar.Toggle aria-controls={ariaToggleTargetId} onClick={onToggleClick} className="me-3" />
          <TopNavLink label="Home" icon={solid('home')} to="/" />
          <TopNavLink label="Friends" icon={solid('user-group')} to="/friends" />
          <TopNavLink label="Notifications" icon={solid('bell')} to="/notifications" badge={2} />
          <TopNavLink label="Messages" icon={solid('message')} to="/messages" />
          <TopNavLink label="Search" icon={solid('magnifying-glass')} to="/search" />
        </Container>
      </Navbar>
    </>
  );
}
export default AuthenticatedPageHeader;
