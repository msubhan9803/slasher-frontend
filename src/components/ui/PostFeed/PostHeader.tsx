import React from 'react';
import { DateTime } from 'luxon';
import { Col, Row } from 'react-bootstrap';
import { HashLink } from 'react-router-hash-link';
import CustomPopover, { PopoverClickProps } from '../CustomPopover';
import UserCircleImage from '../UserCircleImage';
import { scrollToTop } from '../../../utils/scrollFunctions';

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
}

function PostHeader({
  id, userName, postDate, profileImage, popoverOptions, onPopoverClick, detailPage,
  content, userId, rssfeedProviderId,
}: PostHeaderProps) {
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
              to={rssfeedProviderId
                ? `/app/news/partner/${rssfeedProviderId}#`
                : `/${userName}#`}
              scroll={scrollToTop}
              className="text-decoration-none"
            >
              <div className="rounded-circle">
                <UserCircleImage size="3.313rem" src={profileImage} alt={`${userName}profile picture`} className="bg-secondary" />
              </div>
            </HashLink>
          </Col>
          <Col xs="auto" className="ps-0 align-self-center">
            {
              // Do *not* remove the trailing # in below `to` path
              // else the `scrollToTop/scrollWithOffset` won't work.
            }
            <HashLink
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
        <CustomPopover
          popoverOptions={popoverOptions!}
          onPopoverClick={onPopoverClick!}
          content={content}
          id={id}
          userId={userId}
        />
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
};

export default PostHeader;
