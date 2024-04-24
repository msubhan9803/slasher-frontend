import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Container, Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Share } from '@capacitor/share';
import UserCircleImage from '../../ui/UserCircleImage';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { deletePageStateCache } from '../../../pageStateCache';
import { scrollToTop } from '../../../utils/scrollFunctions';
import { setScrollToTabsPosition } from '../../../redux/slices/scrollPositionSlice';
import { LinearIcon } from '../../ui/FavoriteLinearIcon';
import SupportSlasher from '../../../images/support-slasher.svg';
import Slasher from '../../../images/slasher.svg';
import { WORDPRESS_SITE_URL, isNativePlatform } from '../../../constants';

const SpecificHeightLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%
`;

const BadgeSpan = styled.span`
  font-size: xx-small;
  padding-top: 5px;
`;

interface Props {
  className?: string;
  onToggleCanvas: () => void;
}

const links: any = {
  help: `${WORDPRESS_SITE_URL}/help/`,
  shop: `${WORDPRESS_SITE_URL}/shop/`,
  support: 'https://www.patreon.com/theslasherapp',
  advertise: `${WORDPRESS_SITE_URL}/advertise`,
};

function MobileOnlySidebarContent({ className, onToggleCanvas }: Props) {
  const loggedinUserName = useAppSelector((state) => state.user.user.userName);
  const userProfilePic = useAppSelector((state) => state.user.user.profilePic);
  const userData = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleRefresh = (to: string) => {
    // Similarly we clear pageStateCache on desktop navItem `onClick` too: file:///./../main-site-wrapper/authenticated/IconWithTextNavLink.tsx:
    deletePageStateCache(to);
    const isProfileFriendsPage = to.endsWith('/friends');
    if (isProfileFriendsPage) {
      dispatch(setScrollToTabsPosition(true));
    } else {
      scrollToTop('instant');
    }
  };

  const redirectClick = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    window.open(links[type], '_blank');
  };

  const shareSlasher = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNativePlatform) {
      await Share.share({
        text: 'I found the best app for horror fans and thought you\'d be into it! Check it out!',
        url: 'https://www.slasher.tv',
        dialogTitle: 'Share with buddies',
      });
    }
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
            <SpecificHeightLink to={friendsPagePath} className="btn btn-dark btn-sidebar w-100 pt-2 position-relative" onClick={() => { onToggleCanvas(); handleRefresh(friendsPagePath); }}>
              <FontAwesomeIcon icon={solid('user-group')} size="lg" className="mb-1" />
              Friends
              {userData.friendRequestCount !== 0 && (
                <BadgeSpan className="text-black top-0 start-50 translate-middle-y badge rounded-pill bg-primary position-absolute">
                  {userData.friendRequestCount}
                </BadgeSpan>
              )}
            </SpecificHeightLink>
          </Col>
          <Col xs={3}>
            <SpecificHeightLink to="/app/account" className="btn btn-dark btn-sidebar w-100 pt-2" onClick={onToggleCanvas}>
              <FontAwesomeIcon icon={solid('gear')} size="lg" className="mb-1" />
              Settings
            </SpecificHeightLink>
          </Col>
          <Col xs={3}>
            <SpecificHeightLink to="/app/help" className="btn btn-dark btn-sidebar w-100 pt-2" onClick={(e) => { onToggleCanvas(); redirectClick(e, 'help'); }}>
              <FontAwesomeIcon icon={solid('circle-question')} size="lg" className="mb-1" />
              Help
            </SpecificHeightLink>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col xs={3}>
            <SpecificHeightLink
              to={{ pathname: links.shop }}
              target="_blank"
              className="btn btn-dark btn-sidebar w-100 pt-2"
              onClick={(e) => {
                onToggleCanvas();
                redirectClick(e, 'shop');
              }}
            >
              <UserCircleImage size="1.25em" className="mb-1" src={Slasher} alt="User icon" />
              Slasher Shop
            </SpecificHeightLink>
          </Col>
          <Col xs={3}>
            <SpecificHeightLink
              to={{ pathname: 'https://www.patreon.com/theslasherapp' }}
              target="_blank"
              className="btn btn-dark btn-sidebar w-100 pt-2 position-relative"
              onClick={(e) => {
                onToggleCanvas();
                redirectClick(e, 'support');
              }}
            >
              <UserCircleImage size="1.25em" className="mb-1" src={SupportSlasher} alt="User icon" />
              Support Slasher
            </SpecificHeightLink>
          </Col>
          <Col xs={3}>
            <SpecificHeightLink
              to={{ pathname: links.advertise }}
              target="_blank"
              className="btn btn-dark btn-sidebar w-100 pt-2"
              onClick={(e) => {
                onToggleCanvas();
                redirectClick(e, 'advertise');
              }}
            >
              <LinearIcon uniqueId="icon-11">
                <FontAwesomeIcon icon={solid('bullhorn')} size="lg" className="mb-1" />
              </LinearIcon>
              <svg width="0" height="0">
                <linearGradient id="icon-11" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#B412AE', stopOpacity: '1' }} />
                  <stop offset="100%" style={{ stopColor: '#E25ED2', stopOpacity: '1' }} />
                </linearGradient>
              </svg>
              Advertise
            </SpecificHeightLink>
          </Col>
          <Col xs={3}>
            <SpecificHeightLink
              to="#"
              className="btn btn-dark btn-sidebar w-100 pt-2"
              onClick={(e) => {
                onToggleCanvas();
                shareSlasher(e);
              }}
            >
              <FontAwesomeIcon color="#FF1800" icon={solid('share-alt')} size="lg" className="mb-1" />
              Share Slasher
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
