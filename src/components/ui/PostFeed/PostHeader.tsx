import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import CustomPopover from '../CustomPopover';

interface PostHeaderProps {
  userName: string;
  postDate: string;
  profileImage: string;
  popoverOptions: string[];
}
const ProfileImage = styled(Image)`
  height:3.313rem;
  width:3.313rem;
`;

function PostHeader({
  userName, postDate, profileImage, popoverOptions,
}: PostHeaderProps) {
  const navigate = useNavigate();
  const handlePopoverOption = (value: string) => {
    navigate(`/${value}`);
  };
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
        <CustomPopover popoverOptions={popoverOptions} onPopoverClick={handlePopoverOption} />
      </Col>
    </Row>
  );
}

export default PostHeader;
