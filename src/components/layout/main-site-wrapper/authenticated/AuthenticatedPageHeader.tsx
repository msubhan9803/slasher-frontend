import React from 'react';
import {
  Navbar, Container, Form, FormControl, Nav, InputGroup, Image,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import slasherLogo from '../../../../images/slasher-logo.svg';
import userProfileIconPlaceholder from '../../../../placeholder-images/placeholder-user.jpg';
import TopNavLink from './TopNavLink';

const UserCircleImage = styled.img`
width:1.56rem;
`;
const UserProfileText = styled.p`
font-size: .75rem;
`;

const SearchInputGroup = styled(InputGroup)`
.form-control {
  border-left: .06rem solid var(--bs-input-border-color);
  border-top-right-radius: 1.56rem !important;
  border-bottom-right-radius: 1.56rem !important;
  padding:0rem;
  flex-wrap:inherit !important;
}
.input-group-text {
  background-color: rgb(31, 31, 31);
  border-color: #3a3b46;
  border-radius:1.56rem;
  width: 2.5rem
}
svg {
  color: var(--bs-primary);
   min-width: 1.87rem;
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
  return (
    <Navbar collapseOnSelect expand={offcanvasSidebarExpandBreakPoint} bg="dark" variant="dark">
      <Container className="d-none d-md-flex ms-md-5">
        <Navbar.Brand as={Link} to="/">
          <Image src={slasherLogo} alt="Slasher logo" className="mt-1" />
        </Navbar.Brand>
        <Form className="me-auto w-50">
          <SearchInputGroup className="mb-3">
            <InputGroup.Text id="search">
              <FontAwesomeIcon icon={solid('magnifying-glass')} size="sm" className="text-white" />
            </InputGroup.Text>
            <FormControl
              placeholder="Find people, hashtags, movies..."
              aria-label="search"
              aria-describedby="search"
              type="search"
            />
          </SearchInputGroup>
        </Form>
      </Container>
      <Container className="justify-content-around justify-content-md-end justify-content-sm-between me-md-5">
        <Navbar.Toggle aria-controls={ariaToggleTargetId} onClick={onToggleClick} />
        <Nav className="flex-row mt-3">
          <TopNavLink label="Home" icon={solid('home')} to="/" linkClassNames="px-3" />
          <TopNavLink label="Friends" icon={solid('user-group')} to="/friends" linkClassNames="px-3" />
          <TopNavLink label="Messages" icon={solid('message')} to="/messages" linkClassNames="px-3" />
          <TopNavLink label="Notifications" icon={solid('bell')} to="/notifications" linkClassNames="px-3" badge={{ top: '.18rem', right: '2.12rem', count: 2 }} />
          <TopNavLink label="Search" icon={solid('search')} to="/search" linkClassNames="d-block d-md-none px-3" />
        </Nav>
        <Nav className="mw-auto flex-column p-1 d-none d-md-flex mt-3">
          <Nav.Link className="text-center text-white pb-1 pt-0">
            <UserCircleImage className="rounded-circle" src={userProfileIconPlaceholder} alt="User icon" />
          </Nav.Link>
          <UserProfileText className="mb-0 text-center">Me</UserProfileText>
        </Nav>
      </Container>
    </Navbar>
  );
}
export default AuthenticatedPageHeader;
