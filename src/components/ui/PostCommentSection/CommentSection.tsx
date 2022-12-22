/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Button } from 'react-bootstrap';
import { DateTime } from 'luxon';
import linkifyHtml from 'linkify-html';
import styled from 'styled-components';
import CustomPopover, { PopoverClickProps } from '../CustomPopover';
import UserCircleImage from '../UserCircleImage';

interface LinearIconProps {
  uniqueId?: string
}
interface Props {
  id: string;
  image: string;
  name: string;
  time: string;
  commentMention?: string;
  commentMsg: string;
  commentImg?: ImageList[];
  onIconClick: (value: string) => void;
  likeIcon: boolean;
  popoverOptions: string[];
  onPopoverClick: (value: string, popoverClickProps: PopoverClickProps) => void,
  setIsReply?: (value: boolean) => void;
  setReplyId?: (value: string) => void;
  setReplyUserName?: (value: string) => void;
  feedCommentId?: string;
  content?: string;
  userId?: string;
  userName?: string;
  handleSeeCompleteList?: () => void;
  likeCount?: number;
  active?: boolean;
}
interface ImageList {
  image_path: string;
  _id: string;
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
const Content = styled.div`
  white-space: pre-line;
`;

const decryptMessage = (content: string) => {
  const found = content ? content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '') : '';
  return found;
};
function CommentSection({
  id, image, name, time, commentMention, commentMsg, commentImg,
  onIconClick, likeIcon, popoverOptions, onPopoverClick, setIsReply,
  setReplyId, feedCommentId, setReplyUserName, content, userId, userName,
  handleSeeCompleteList, likeCount, active,
}: Props) {
  const [images, setImages] = useState<ImageList[]>([]);
  const highlightRef = useRef<any>();

  useEffect(() => {
    if (commentImg && commentImg.length > 0) {
      setImages(commentImg);
    }
  }, [commentImg]);

  const handleReply = (replyId: string, replyName: string) => {
    if (setIsReply) setIsReply(true);
    if (setReplyId) setReplyId(replyId);
    if (setReplyUserName) setReplyUserName(replyName);
    if (handleSeeCompleteList) handleSeeCompleteList();
  };

  useEffect(() => {
    const tabs = highlightRef.current;
    if (tabs) {
      tabs.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        Inline: 'center',
      });
    }
  }, []);

  return (
    <div key={id} className="d-flex">
      <div className={`${!commentMention && 'mt-0 mt-md-3'} ${commentMention && 'ms-md-1'}`}>
        <UserCircleImage size="2.5rem" src={image} className="me-0 me-md-3 bg-secondary" />
      </div>
      <div className="w-100">
        <CommentBox
          className={`ms-3 ms-md-0 pt-3 px-3 pb-4 rounded position-relative ${active ? 'border border-primary' : ''}`}
          ref={active ? highlightRef : null}
        >
          <div className="d-flex justify-content-between">
            <div className="ps-0 align-self-center mb-2">
              <h3 className="mb-0 ">{name}</h3>
              <p className="fs-6 text-light mb-0">
                {DateTime.fromISO(time).toFormat('MM/dd/yyyy t')}
              </p>
            </div>
            <div className="d-block pe-0">
              <CustomPopover
                popoverOptions={popoverOptions}
                onPopoverClick={onPopoverClick}
                content={content}
                id={id}
                userId={userId}
                userName={userName}
              />
            </div>
          </div>
          <span className="text-primary">
            {commentMention}
          </span>

          <CommentMessage className="mb-0 fs-4">
            <Content dangerouslySetInnerHTML={
              { __html: linkifyHtml(decryptMessage(commentMsg)) }
            }
            />
          </CommentMessage>
          <div className="d-flex flex-wrap">
            {images && images.length > 0 && images.map((imageC: ImageList) => (
              /* eslint no-underscore-dangle: 0 */
              <div key={imageC._id} className="me-3">
                <UserCircleImage size="5.625rem" src={imageC.image_path} className="mt-2 rounded" />
              </div>
            ))}
          </div>
          {
            likeCount! > 0
            && (
              <Likes className="rounded d-flex justify-content-end position-absolute">
                <LikesButton className="p-1 px-2 text-light me-2 mt-1 rounded-pill text-white">
                  <LinearIcon uniqueId="comment-like-count">
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                    <span className="fs-5">{likeCount}</span>
                  </LinearIcon>
                </LikesButton>
                <svg width="0" height="0">
                  <linearGradient id="comment-like-count" x1="00%" y1="0%" x2="0%" y2="100%">
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
                  <>
                    <LinearIcon uniqueId="like-button-comment">
                      <Button variant="link" className="shadow-none me-2" onClick={() => onIconClick(id)}>
                        <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                        <span className="fs-5">Like</span>
                      </Button>
                    </LinearIcon>
                    <svg width="0" height="0">
                      <linearGradient id="like-button-comment" x1="00%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                        <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                      </linearGradient>
                    </svg>
                  </>
                )
                : (
                  <Button variant="link" className="shadow-none me-2" onClick={() => onIconClick(id)}>
                    <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" />
                    <span className="fs-5">Like</span>
                  </Button>
                )
            }
            <Button
              variant="link"
              className="shadow-none"
              onClick={() => handleReply(feedCommentId || id, name)}
            >
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
  commentImg: [],
  setIsReply: undefined,
  setReplyId: undefined,
  setReplyUserName: undefined,
  feedCommentId: '',
  content: null,
  userId: null,
  userName: null,
  handleSeeCompleteList: undefined,
  likeCount: 0,
  active: false,
};
export default CommentSection;
