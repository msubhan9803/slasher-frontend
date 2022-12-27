import React from 'react';
import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import CustomPopover, { PopoverClickProps } from '../CustomPopover';
import UserCircleImage from '../UserCircleImage';

interface PostHeaderProps {
  userName: string;
  id: string;
  postDate: string;
  profileImage: string;
  popoverOptions: string[];
  onPopoverClick: (value: string, popoverClickProps: PopoverClickProps) => void,
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
            {detailPage
              ? (
                <div className="rounded-circle">
                  <UserCircleImage size="3.313rem" src={profileImage} className="bg-secondary" />
                </div>
              )
              : (
                <Link
                  to={rssfeedProviderId
                    ? `/news/partner/${rssfeedProviderId}/posts/${id}`
                    : `/${userName}/posts/${id}`}
                  className="text-decoration-none"
                >
                  <div className="rounded-circle">
                    <UserCircleImage size="3.313rem" src={profileImage} className="bg-secondary" />
                  </div>
                </Link>
              )}
          </Col>
          <Col xs="auto" className="ps-0 align-self-center">
            {detailPage
              ? (
                <>
                  <h1 className="mb-0 h3 text-capitalize">{userName}</h1>
                  <p className="mb-0 fs-6 text-light">
                    {DateTime.fromISO(postDate).toFormat('MM/dd/yyyy t')}
                  </p>
                </>
              )
              : (
                <Link
                  to={rssfeedProviderId
                    ? `/news/partner/${rssfeedProviderId}/posts/${id}`
                    : `/${userName}/posts/${id}`}
                  className="text-decoration-none"
                >
                  <h1 className="mb-0 h3 text-capitalize">{userName}</h1>
                  <p className="mb-0 fs-6 text-light">
                    {DateTime.fromISO(postDate).toFormat('MM/dd/yyyy t')}
                  </p>
                </Link>
              )}
          </Col>
        </Row>
      </Col>
      <Col xs="auto" className="d-block">
        <CustomPopover
          popoverOptions={popoverOptions}
          onPopoverClick={onPopoverClick}
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
};

export default PostHeader;
