import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

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
  height: 2.5rem;
  width: 2.5rem;
`;
const LinearGradientStop = styled.stop`
  stop-color: #FF1800;
  stop-opacity: 1;
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
const PopoverText = styled.p`
  &:hover {
    background: var(--bs-primary);
  }
`;
function CommentSection({
  id, image, name, time, commentMention, commentMsg, commentImg, likes, onIconClick, likeIcon,
}: Props) {
  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0" role="button">Report</PopoverText>
      <PopoverText className="ps-4 pb-2 pe-5 pt-2  mb-0" role="button">Block user</PopoverText>
    </CustomPopover>
  );
  return (
    <Row key={id}>
      <Col xs="auto" className={`px-1 ${!commentMention && 'mt-3'}`}>
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
              <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                <div>
                  <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                </div>
              </OverlayTrigger>
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
        <div className={`mb-3 mt-2 ${commentMention ? 'ms-3 ms--0' : 'ms-3'}`}>
          <div className="p-0 d-flex" role="button" aria-hidden="true">
            {
              likeIcon
                ? (
                  <LinearIcon uniqueId="like-button">
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" onClick={() => onIconClick(id)} />
                    <small>Like</small>
                  </LinearIcon>
                )
                : (
                  <div>
                    <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" onClick={() => onIconClick(id)} />
                    <small>Like</small>
                  </div>
                )
            }
            <div>
              <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2 ms-4" />
              <small>Reply</small>
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
