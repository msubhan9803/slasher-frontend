import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { Button, Col, Row } from 'react-bootstrap';
import { HashLink } from 'react-router-hash-link';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import CustomPopover, { PopoverClickProps } from '../../CustomPopover';
import { scrollToTop } from '../../../../utils/scrollFunctions';
import UserCircleImage from '../../UserCircleImage';
import ShareLinkButton from '../../ShareLinkButton';
import BorderButton from '../../BorderButton';

interface PostHeaderProps {
  userName: string;
  id: string;
  postDate: string;
  profileImage: string;
  popoverOptions?: string[];
  onPopoverClick?: (value: string, popoverClickProps: PopoverClickProps) => void,
  detailPage: boolean | undefined;
  content?: string;
  userId?: string;
  rssfeedProviderId?: string;
  onSelect?: (value: string) => void;
  postType?: string;
}
interface StyledSavedProps {
  saved: boolean;
}
const StyledSaveButton = styled(Button) <StyledSavedProps>`
  width: 85px;
  height: 28px;
  svg {
    ${(props) => (props.saved ? 'color: #FFC700' : '')};
  }
`;
function PostHeader({
  id, userName, postDate, profileImage, popoverOptions, onPopoverClick, detailPage,
  content, userId, rssfeedProviderId, onSelect, postType,
}: PostHeaderProps) {
  const [notificationOn, setNotificationOn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bgColor, setBgColor] = useState<boolean>(false);
  return (
    <Row className="justify-content-between">
      <Col xs="auto">
        <Row className="d-flex">
          <Col className="my-auto rounded-circle" xs="auto">
            {
              // Do *not* remove the trailing # in below `to` path
              // else the `scrollToTop/scrollWithOffset` won't work.
            }
            <HashLink
              onClick={() => onSelect!(rssfeedProviderId || id)}
              to={rssfeedProviderId
                ? `/app/news/partner/${rssfeedProviderId}#`
                : `/${userName}#`}
              scroll={scrollToTop}
              className="text-decoration-none"
            >
              <div className="rounded-circle">
                <UserCircleImage size="3.313rem" src={profileImage} alt={`${userName} profile picture`} className="bg-secondary" />
              </div>
            </HashLink>
          </Col>
          <Col xs="auto" className="ps-0 align-self-center">
            {
              // Do *not* remove the trailing # in below `to` path
              // else the `scrollToTop/scrollWithOffset` won't work.
            }
            <HashLink
              onClick={() => onSelect!(rssfeedProviderId || id)}
              to={rssfeedProviderId
                ? `/app/news/partner/${rssfeedProviderId}#`
                : `/${userName}#`}
              scroll={scrollToTop}
              className="text-decoration-none"
            >
              <h1 className="mb-0 h3 text-capitalize">{userName}</h1>
            </HashLink>
            {
              // Do *not* remove the trailing # in below `to` path
              // else the `scrollToTop/scrollWithOffset` won't work.
              detailPage ? (
                <p className="mb-0 fs-6 text-light">
                  {DateTime.fromISO(postDate).toFormat('MM/dd/yyyy t')}
                </p>
              ) : (
                <HashLink
                  onClick={() => onSelect!(rssfeedProviderId || id)}
                  to={rssfeedProviderId
                    ? `/app/news/partner/${rssfeedProviderId}/posts/${id}#`
                    : `/${userName}/posts/${id}#`}
                  className="text-decoration-none"
                >
                  <p className="mb-0 fs-6 text-light">
                    {DateTime.fromISO(postDate).toFormat('MM/dd/yyyy t')}
                  </p>
                </HashLink>
              )
            }
          </Col>
        </Row>
      </Col>
      <Col xs="auto" className="d-block">
        <div className="d-flex align-items-center">
          {postType === 'group-post' && (
            <div className="d-flex align-items-center">
              <Button aria-label="notificatio bell" size="sm" className="me-2 pe-2" variant="link" onClick={() => setNotificationOn(!notificationOn)}>
                <FontAwesomeIcon size="lg" className={`${notificationOn ? 'me-0' : 'me-1'} `} icon={notificationOn ? regular('bell-slash') : regular('bell')} />
              </Button>
              <div className="d-none d-md-flex d-lg-none d-xl-flex align-items-center">
                <BorderButton
                  customButtonCss="width: 125px;"
                  buttonClass={`${bgColor ? 'text-black' : 'text-white'} py-2`}
                  variant="sm"
                  toggleBgColor={bgColor}
                  handleClick={() => setBgColor(!bgColor)}
                  toggleButton
                />
                <StyledSaveButton aria-label="save button" saved={saved} size="sm" className="mx-2 pe-2 d-flex align-items-center" variant="link" onClick={() => setSaved(!saved)}>
                  <FontAwesomeIcon size="lg" icon={saved ? solid('bookmark') : regular('bookmark')} />
                  <p className="m-0 ms-2 fs-3">{saved ? 'Unsave' : 'Save'}</p>
                </StyledSaveButton>
              </div>
            </div>
          )}
          {postType !== 'group-post' && (
            <div className="d-md-none d-lg-block d-xl-none me-2">
              <ShareLinkButton />
            </div>
          )}
          <CustomPopover
            popoverOptions={popoverOptions!}
            onPopoverClick={onPopoverClick!}
            content={content}
            id={id}
            userId={userId}
          />
        </div>
      </Col>
    </Row>
  );
}

PostHeader.defaultProps = {
  content: null,
  userId: null,
  rssfeedProviderId: null,
  // Remove after Podcast popover implementation
  onPopoverClick: undefined,
  popoverOptions: null,
  onSelect: undefined,
  postType: '',
};

export default PostHeader;
