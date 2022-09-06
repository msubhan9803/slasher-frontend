import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import UserCircleImage from '../UserCircleImage';

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
  popoverOptions: string[];
  onPopoverClick: (value: string) => void;
}
const CommentMessage = styled.span`
  color: #CCCCCC;
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
  right:.063rem;
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
const StyledPopover = styled.div`
  .btn[aria-describedby="popover-basic"]{
    svg{
      color: var(--bs-primary);
    }
  }
`;
function CommentSection({
  id, image, name, time, commentMention, commentMsg, commentImg,
  likes, onIconClick, likeIcon, popoverOptions, onPopoverClick,
}: Props) {
  const popover = (
    <CustomPopover id="popover-basic" className="fs-5 py-2 rounded-2">
      {popoverOptions.map((option) => <PopoverText role="button" onClick={() => onPopoverClick(option)} key={option} className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light">{option}</PopoverText>)}
    </CustomPopover>
  );
  return (
    <div key={id} className="d-flex">
      <div className={`${!commentMention && 'mt-0 mt-md-3'} ${commentMention && 'ms-md-1'}`}>
        <UserCircleImage size="2.5rem" src={image} className="me-0 me-md-3 bg-secondary" />
      </div>
      <div className="w-100">
        <CommentBox className="ms-3 ms-md-0 pt-3 px-3 pb-4 rounded position-relative">
          <div className="d-flex justify-content-between">
            <div className="ps-0 align-self-center mb-2">
              <h3 className="mb-0 ">{name}</h3>
              <p className="fs-6 text-light mb-0">{time}</p>
            </div>
            <div className="d-block pe-0">
              <StyledPopover>
                <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                  <Button className="text-white bg-transparent shadow-none border-0 pt-0 pe-0">
                    <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                  </Button>
                </OverlayTrigger>
              </StyledPopover>
            </div>
          </div>
          <span className="text-primary">
            {commentMention}
          </span>
          <CommentMessage className="mb-0 fs-4">
            {commentMsg}
          </CommentMessage>
          {
            commentImg
            && (
              <div>
                <UserCircleImage size="5.625rem" src={commentImg} className="mt-2 rounded" />
              </div>
            )
          }
          {
            likes
            && (
              <Likes className="rounded d-flex justify-content-end position-absolute">
                <LikesButton className="p-1 px-2 text-light me-2 mt-1 rounded-pill text-white">
                  <LinearIcon uniqueId="like-button-comment">
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                    <span className="fs-5">{likes}</span>
                  </LinearIcon>
                </LikesButton>
                <svg width="0" height="0">
                  <linearGradient id="like-button-comment" x1="00%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                  </linearGradient>
                </svg>
              </Likes>
            )
          }
        </CommentBox>
        <div className="mb-3 ms-md-1 ms-4">
          <div className="p-0 d-flex me-2" aria-hidden="true">
            {
              likeIcon
                ? (
                  <LinearIcon uniqueId="like-button-comment">
                    <Button variant="link" className="text-decoration-none me-2 shadow-none" onClick={() => onIconClick(id)}>
                      <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                      <span className="fs-5">Like</span>
                    </Button>
                  </LinearIcon>
                )
                : (
                  <Button variant="link" className="text-decoration-none me-2 shadow-none" onClick={() => onIconClick(id)}>
                    <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" />
                    <span className="fs-5">Like</span>
                  </Button>
                )
            }
            <Button variant="link" className="text-decoration-none shadow-none">
              <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
              <span className="fs-5">Reply</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
CommentSection.defaultProps = {
  commentMention: '',
  commentMsg: '',
  commentImg: '',
  likes: undefined,
};
export default CommentSection;
