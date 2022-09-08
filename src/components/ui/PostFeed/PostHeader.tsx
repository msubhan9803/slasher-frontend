import React from 'react';
import { Col, Row } from 'react-bootstrap';
import CustomPopover from '../CustomPopover';
import UserCircleImage from '../UserCircleImage';

interface PostHeaderProps {
  userName: string;
  postDate: string;
  profileImage: string;
  popoverOptions: string[];
  onPopoverClick: (value: string) => void;
}

function PostHeader({
  userName, postDate, profileImage, popoverOptions, onPopoverClick,
}: PostHeaderProps) {
  return (
    <Row className="justify-content-between">
      <Col xs="auto">
        <Row className="d-flex">
          <Col className="my-auto rounded-circle" xs="auto">
            <div className="rounded-circle">
              <UserCircleImage size="3.313rem" src={profileImage} className="bg-secondary" />
            </div>
          </Col>
          <Col xs="auto" className="ps-0 align-self-center">
            <h1 className="mb-0 h3">{userName}</h1>
            <p className="mb-0 fs-6 text-light">{postDate}</p>
          </Col>
        </Row>
      </Col>
      <Col xs="auto" className="d-block">
        <CustomPopover popoverOptions={popoverOptions} onPopoverClick={onPopoverClick} />
      </Col>
    </Row>
  );
}

export default PostHeader;
