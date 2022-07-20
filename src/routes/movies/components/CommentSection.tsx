import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Button, Col, Dropdown, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';

interface LinearIconProps {
  uniqueId?: string
}
interface Props {
  id: number;
  image: string;
  name: string;
  time: string;
  likes?: number;
  commentMention?: string;
  commentMsg?: string;
  commentImg?: string;
  likeIcon: boolean;
}
const dropdownBgColor = '#171717';

const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    background-color: ${dropdownBgColor};
    border: none;
    &:hover {
      background-color: ${dropdownBgColor};
      box-shadow: none
    }
    &:focus {
      color:red;
      background-color: ${dropdownBgColor};
      box-shadow: none
    }
    &:active&:focus {
      box-shadow: none
    }
    &:after {
      display: none;
    }
  }
  .dropdown-menu {
    background-color: ${dropdownBgColor};
    inset: auto 0.938rem 0rem  auto !important;
  }
  .dropdown-item {
    &:hover {
      background-color: var(--bs-primary) !important;
    }
    &:active {
      background-color: var(--bs-primary) !important;
    }
  }
`;
const SmallText = styled.p`
  font-size: small;
  color: #CCCCCC;
`;
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const LikesButton = styled(Button)`
  background-color: #383838;
  border: none;
  &:hover {
    background-color: #383838; 
  }
`;
const CommentBox = styled.div`
background-color: #171717;
`;
const Likes = styled.div`
  margin-top : -1.43rem;
`;
const CommentImage = styled(Image)`
  height: 2.5rem;
  width: 2.5rem;
`;

function CommentSection({
  id, image, name, time, commentMention, commentMsg, commentImg, likes, likeIcon,
}: Props) {
  return (
    <Row key={id}>
      <Col xs="auto" className="pe-0">
        <CommentImage src={image} className="me-3 rounded-circle bg-secondary" />
      </Col>
      <Col className="ps-0 pe-4">
        <CommentBox className="p-3 rounded ">
          <div className="d-flex justify-content-between align-items-center">
            <Col xs="auto" className="ps-0 align-self-center ">
              <h6 className="mb-0 ">{name}</h6>
              <SmallText className="mb-0">{time}</SmallText>
            </Col>
            <Col xs="auto" className="d-none d-md-block pe-0">
              <CustomDropDown>
                <Dropdown.Toggle className="d-flex justify-content-end pe-0">
                  <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="1" className="text-light">Report</Dropdown.Item>
                  <Dropdown.Item eventKey="2" className="text-light">Delete</Dropdown.Item>
                </Dropdown.Menu>
              </CustomDropDown>
            </Col>
          </div>
          <span className="text-primary">
            {commentMention}
          </span>
          <span className="small mb-0 ms-1">
            {commentMsg}
          </span>
          {commentImg
            && (
              <div>
                <Image src={commentImg} />
              </div>
            )}
        </CommentBox>
        <Likes className="d-flex justify-content-end">
          <LikesButton key="like-1" type="button" className="p-1 m-2 px-2 text-light rounded-pill text-white">
            <LinearIcon uniqueId="like-button">
              <FontAwesomeIcon role="button" icon={solid('heart')} size="lg" className="me-2" />
              {likes}
            </LinearIcon>
          </LikesButton>
          <svg width="0" height="0">
            <linearGradient id="like-button" x1="00%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
              <stop offset="100%" style={{ stopColor: '#FF6363', stopOpacity: '1' }} />
            </linearGradient>
          </svg>
        </Likes>
        <div className="d-flex m-2">
          <div className="p-0" role="button" aria-hidden="true">
            {
              likeIcon
                ? (
                  <LinearIcon uniqueId="like-button">
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                    Like
                  </LinearIcon>
                )
                : (
                  <>
                    <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" />
                    Like
                  </>
                )
            }
          </div>
          <div>
            <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2 ms-5" />
            Reply
          </div>
        </div>

      </Col>
    </Row>
  );
}

CommentSection.defaultProps = {
  commentMention: '',
  commentMsg: '',
  commentImg: '',
  likes: undefined,
};
export default CommentSection;
