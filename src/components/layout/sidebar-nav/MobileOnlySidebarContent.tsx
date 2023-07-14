import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Container, Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import UserCircleImage from '../../ui/UserCircleImage';
import { useAppSelector } from '../../../redux/hooks';
import { deletePageStateCache } from '../../../pageStateCache';
import { scrollToTop } from '../../../utils/scrollFunctions';

const SpecificHeightLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface Props {
  className?: string;
  onToggleCanvas: () => void;
}

const redirectHelpClick = (e: React.MouseEvent) => {
  e.preventDefault();
  window.open('https://pages.slasher.tv/help/', '_blank');
};

function MobileOnlySidebarContent({ className, onToggleCanvas }: Props) {
  const loggedinUserName = useAppSelector((state) => state.user.user.userName);
  const userProfilePic = useAppSelector((state) => state.user.user.profilePic);

  const handleRefresh = (to: string) => {
    // Similarly we clear pageStateCache on desktop navItem `onClick` too: file:///./../main-site-wrapper/authenticated/IconWithTextNavLink.tsx:
    deletePageStateCache(to);
    scrollToTop('instant');
  };

  const mePagePath = `/${loggedinUserName}`;
  const friendsPagePath = `/${loggedinUserName}/friends`;

  return (
    <div className={className}>
      <Container fluid className="px-0">
        <Row>
          <Col xs={3}>
            <SpecificHeightLink to={mePagePath} className="btn btn-dark btn-sidebar w-100 pt-2" onClick={() => { onToggleCanvas(); handleRefresh(mePagePath); }}>
              <UserCircleImage size="1.25em" className="mb-1" src={userProfilePic} alt="User icon" />
              Me
            </SpecificHeightLink>
          </Col>
          <Col xs={3}>
            <SpecificHeightLink to={friendsPagePath} className="btn btn-dark btn-sidebar w-100 pt-2" onClick={() => { onToggleCanvas(); handleRefresh(friendsPagePath); }}>
              <FontAwesomeIcon icon={solid('user-group')} size="lg" className="mb-1" />
              Friends
            </SpecificHeightLink>
          </Col>
          <Col xs={3}>
            <SpecificHeightLink to="/app/account" className="btn btn-dark btn-sidebar w-100 pt-2" onClick={onToggleCanvas}>
              <FontAwesomeIcon icon={solid('gear')} size="lg" className="mb-1" />
              Settings
            </SpecificHeightLink>
          </Col>
          <Col xs={3}>
            <SpecificHeightLink to="/app/help" className="btn btn-dark btn-sidebar w-100 pt-2" onClick={(e) => { onToggleCanvas(); redirectHelpClick(e); }}>
              <FontAwesomeIcon icon={solid('circle-question')} size="lg" className="mb-1" />
              Help
            </SpecificHeightLink>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

MobileOnlySidebarContent.defaultProps = {
  className: '',
};

export default MobileOnlySidebarContent;
