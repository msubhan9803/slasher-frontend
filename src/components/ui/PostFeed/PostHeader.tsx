import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, OverlayTrigger, Popover, Row,
} from 'react-bootstrap';
import styled from 'styled-components';

interface PostHeaderProps {
  userName: string;
  postDate: string;
  profileImage: string;
}
const ProfileImage = styled(Image)`
  height:3.313rem;
  width:3.313rem;
`;
const StyledPopover = styled.div`
  .btn[aria-describedby="popover-basic"]{
    svg{
      color: var(--bs-primary);
    }
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: red;
  }
`;
const CustomPopover = styled(Popover)`
  z-index :1;
  background:rgb(27,24,24);
  border: 1px solid rgb(56,56,56);
  position:absolute;
  top: 0px !important;
  .popover-arrow{
    &:after{
      border-left-color:rgb(56,56,56);
    }
  }
`;

function PostHeader({ userName, postDate, profileImage }: PostHeaderProps) {
  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Edit</PopoverText>
      <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Delete</PopoverText>
    </CustomPopover>
  );
  return (
    <Row className="justify-content-between">
      <Col xs="auto">
        <Row className="d-flex">
          <Col className="my-auto rounded-circle" xs="auto">
            <div className="rounded-circle">
              <ProfileImage src={profileImage} className="rounded-circle bg-secondary" />
            </div>
          </Col>
          <Col xs="auto" className="ps-0 align-self-center">
            <h1 className="mb-0 h3">{userName}</h1>
            <p className="mb-0 fs-6 text-light">{postDate}</p>
          </Col>
        </Row>
      </Col>
      <Col xs="auto" className="d-block">
        <StyledPopover>
          <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
            <Button className="bg-transparent shadow-none border-0 pe-1">
              <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
            </Button>
          </OverlayTrigger>
        </StyledPopover>
      </Col>
    </Row>
  );
}

export default PostHeader;
