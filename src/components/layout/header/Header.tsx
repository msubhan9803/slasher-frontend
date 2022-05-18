import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import {
  Navbar, Container, Nav, Form, FormControl,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import slasherLogoSmall from '../../../images/slasher-logo-small.png';
import userProfileIconPlaceholder from '../../../placeholder-images/placeholder-user.jpg';
import TopNavLink from './TopNavLink';

const NavbarLogoImage = styled.img`
  height: 75px;
`;

const UserCircleImage = styled.img`
  border-radius: 50%;
  height:50px;
  width:50px;
  border: 1px solid #fff;
`;

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="text-white">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <NavbarLogoImage src={slasherLogoSmall} alt="Slasher logo" />
        </Navbar.Brand>
        <Form className="me-auto d-flex">
          <FormControl
            type="search"
            placeholder="Search"
            className="me-2"
            aria-label="Find people, hashtags, movies..."
          />
        </Form>
        <Nav className="flex-row">
          <TopNavLink label="Home" icon={solid('home')} to="/" />
          <TopNavLink label="Friends" icon={solid('users')} to="/friends" />
          <TopNavLink label="Messages" icon={solid('comment-dots')} to="/messages" />
          <TopNavLink label="Notifications" icon={solid('bell')} to="/notifications" />
        </Nav>
        <Nav className="mw-auto">
          <Navbar.Text>
            Jane Doe
            <UserCircleImage className="ms-3" src={userProfileIconPlaceholder} alt="User icon" />
          </Navbar.Text>
        </Nav>
      </Container>
    </Navbar>
  );
}
export default Header;
