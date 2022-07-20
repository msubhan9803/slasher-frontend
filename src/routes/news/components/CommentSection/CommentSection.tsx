import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Dropdown, Image, Row,
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
  onIconClick: (value: number) => void;
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
    border: 1px solid #383838;
    background-color: ${dropdownBgColor};
    inset: auto 30px 38px auto;
  }
  .dropdown-item {
   
    height:2.813rem;
    &:hover {
      background-color: var(--bs-primary) !important;
    }
    &:active {
      background-color: var(--bs-primary) !important;
    }
  }
`;
const SmallText = styled.p`
  font-size: .75rem;
  color: #CCCCCC;
`;
const CommentMessage = styled.span`
 color: #CCCCCC;
`;
const CommentReplyImage = styled(Image)`
  height : 5.625rem;
  width: 5.625rem;
`;
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const LikesButton = styled.div`
  width: 3.81rem; 
  height: 1.875rem;
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
  height: 3.125rem;
  width: 3.125rem;
`;
const LinearGradientStop = styled.stop`
  stop-color: #FF1800;
  stop-opacity: 1;
`;

function CommentSection({
  id, image, name, time, commentMention, commentMsg, commentImg, likes, onIconClick, likeIcon,
}: Props) {
  return (
    <Row key={id}>
      <Col xs="auto" className="px-0">
        <CommentImage src={image} className="me-3 rounded-circle bg-secondary" />
      </Col>
      <Col className="ps-2">
        <CommentBox className="pt-3 px-3 pb-4 rounded">
          <div className="d-flex justify-content-between">
            <Col xs="auto" className="ps-0 align-self-center mb-2">
              <h6 className="mb-0 ">{name}</h6>
              <SmallText className="mb-0">{time}</SmallText>
            </Col>
            <Col xs="auto" className="d-block pe-0">
              <CustomDropDown>
                <Dropdown.Toggle className="d-flex justify-content-end pe-0 pt-0">
                  <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="1" className="text-light">Report</Dropdown.Item>
                  <Dropdown.Item eventKey="2" className="text-light">Block user</Dropdown.Item>
                </Dropdown.Menu>
              </CustomDropDown>
            </Col>
          </div>
          <span className="text-primary">
            {commentMention}
          </span>
          <CommentMessage className="small mb-0">
            {commentMsg}
          </CommentMessage>
          {commentImg
            && (
              <div>
                <CommentReplyImage src={commentImg} className="mt-2 rounded" />
              </div>
            )}
        </CommentBox>
        <Likes className="rounded d-flex justify-content-end">
          <LikesButton key="like-1" className="p-1 px-2 text-light me-3 mt-1 rounded-pill text-white">
            <LinearIcon uniqueId="like-button">
              <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
              <small>{likes}</small>
            </LinearIcon>
          </LikesButton>
          <svg width="0" height="0">
            <linearGradient id="like-1" x1="00%" y1="0%" x2="0%" y2="100%">
              <LinearGradientStop offset="0%" />
              <LinearGradientStop offset="100%" />
            </linearGradient>
          </svg>
        </Likes>
        <div className="mb-3 mt-2">
          <div className="p-0 d-flex" role="button" aria-hidden="true">
            {
              likeIcon
                ? (
                  <LinearIcon uniqueId="like-button">
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" onClick={() => onIconClick(id)} />
                    Like
                  </LinearIcon>
                )
                : (
                  <div>
                    <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" onClick={() => onIconClick(id)} />
                    Like
                  </div>
                )
            }
            <div>
              <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2 ms-4" />
              Reply
            </div>
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
