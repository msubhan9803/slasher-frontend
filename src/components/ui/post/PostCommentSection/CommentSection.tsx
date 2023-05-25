/* eslint-disable max-lines */
import React, {
  useEffect, useRef, useState,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Button } from 'react-bootstrap';
import { HashLink } from 'react-router-hash-link';
import { DateTime } from 'luxon';
import linkifyHtml from 'linkify-html';
import styled from 'styled-components';
import UserCircleImage from '../../UserCircleImage';
import CustomPopover, { PopoverClickProps } from '../../CustomPopover';
import { defaultLinkifyOpts } from '../../../../utils/linkify-utils';
import { decryptMessage, escapeHtmlSpecialCharacters, newLineToBr } from '../../../../utils/text-utils';
import CustomSwiper from '../../CustomSwiper';
import { LikeShareModalResourceName, LikeShareModalTabName } from '../../../../types';
import { LG_MEDIA_BREAKPOINT, topToDivHeight } from '../../../../constants';

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
  commentImg?: any;
  onIconClick: (value: string) => void;
  likeIcon: boolean;
  popoverOptions: string[];
  onPopoverClick: (value: string, popoverClickProps: PopoverClickProps) => void,
  feedCommentId?: string;
  message?: string;
  userId?: string;
  userName?: string;
  handleSeeCompleteList?: (
    id: string,
    name: string,
    replyId: string,
    scrollId: string,
    index?: number,
    userId?: string,
  ) => void;
  likeCount?: number;
  active?: boolean;
  isReply?: boolean;
  setIsReply?: (value: boolean) => void;
  replyCommentIndex?: number;
  handleLikeModal: (
    modalTabNameValue: LikeShareModalTabName,
    modaResourceNameValue: LikeShareModalResourceName,
    modalResourceIdValue: string,
    modalLikeCountValue: number,
  ) => void;
}
interface ImageList {
  image_path: string;
  _id: string;
}
const CommentMessage = styled.div`
  color: #CCCCCC;
  a {
    display: inline-block;
  }
`;
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const LikesButton = styled(Button)`
  min-width: 3.81rem;
  height: 1.875rem;
  background-color: #383838;
  border: none;
  &:hover {
    background-color: #383838;
  }
  .like-count {
    position: relative;
    top: -1px;
  }
`;
const Likes = styled.div`
  right:.063rem;
`;

const userCircleImageSizeInRems = 2.5;

function CommentSection({
  id, image, name, time, commentMention, commentMsg, commentImg,
  onIconClick, likeIcon, popoverOptions, onPopoverClick,
  feedCommentId, message, userId, userName, handleSeeCompleteList,
  likeCount, active, isReply, setIsReply, replyCommentIndex, handleLikeModal,
}: Props) {
  const [images, setImages] = useState<ImageList[]>([]);
  const highlightRef = useRef<any>();

  useEffect(() => {
    setImages(commentImg);
  }, [commentImg]);

  useEffect(() => {
    if (highlightRef.current) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: highlightRef.current.offsetTop - (
            window.innerWidth >= parseInt(LG_MEDIA_BREAKPOINT.replace('px', ''), 10)
              ? topToDivHeight
              : 10
          ),
          behavior: 'instant' as any,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handleReply = () => {
    if (setIsReply) { setIsReply(true); }
    const scrollId = isReply ? `reply-${id}` : `comment-${id}`;
    if (handleSeeCompleteList) {
      handleSeeCompleteList(feedCommentId || id, name, isReply ? id : '', scrollId, replyCommentIndex, userId);
    }
  };

  const handleLikeCountClick = () => {
    // Note: isReply = true then `id` = `replyId` else `id` = `commentId`
    handleLikeModal?.('like', isReply ? 'reply' : 'comment', id, Number(likeCount));
  };

  return (
    <div key={id}>
      <div className={`position-absolute ps-1 ${!commentMention && 'mt-0 mt-md-3'} ${commentMention && 'ms-md-1'}`}>
        <HashLink to={`/${name}#`} className="d-block rounded-circle">
          <UserCircleImage size={`${userCircleImageSizeInRems}rem`} src={image} alt="user picture" className="rounded-circle d-flex bg-secondary" />
        </HashLink>
      </div>
      <div style={{ marginLeft: `${userCircleImageSizeInRems + 0.5}rem` }}>
        <div
          className={`text-break ms-3 pt-3 pb-4 px-3 bg-dark rounded ${active ? 'border border-primary' : ''}`}
          ref={active ? highlightRef : null}
        >
          <div className="d-flex justify-content-between">
            <div className="ps-0 align-self-center mb-2">
              <HashLink to={`/${name}#`} className="d-block text-decoration-none">
                <h1 className="mb-0 h3">{name}</h1>
              </HashLink>
              <p className="fs-6 text-light mb-0">
                {DateTime.fromISO(time).toFormat('MM/dd/yyyy t')}
              </p>
            </div>
            <div className="d-block pe-0">
              <CustomPopover
                popoverOptions={popoverOptions}
                onPopoverClick={onPopoverClick}
                message={message}
                id={id}
                userId={userId}
                userName={userName}
                postImages={commentImg}
              />
            </div>
          </div>
          <span className="text-primary">
            {commentMention}
          </span>

          <CommentMessage
            className={images?.length > 0 ? 'mb-3' : ''}
            dangerouslySetInnerHTML={
              {
                __html: newLineToBr(
                  // eslint-disable-next-line max-len
                  linkifyHtml(decryptMessage(escapeHtmlSpecialCharacters(commentMsg)), defaultLinkifyOpts),
                ),
              }
            }
          />
          <div>
            {images?.length > 0 && (
              <CustomSwiper
                context="comment"
                images={
                  images.map((imageData: any) => ({
                    imageUrl: imageData.image_path,
                    imageId: imageData.videoKey ? imageData.videoKey : imageData._id,
                    imageDescription: imageData.description,
                  }))
                }
              />
            )}
          </div>
          {
            likeCount! > 0
            && (
              <Likes className="d-flex position-relative justify-content-end">
                <LikesButton onClick={handleLikeCountClick} className="py-1 btn-filter text-light me-2 mt-2 rounded-pill text-white position-absolute">
                  <LinearIcon uniqueId="comment-like-count">
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-1" />
                    <span className="like-count fs-5">{likeCount}</span>
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
        </div>
        <div className="mt-2 mb-3 ms-md-4 ms-4">
          <div className="p-0 d-flex me-2" aria-hidden="true">
            <Button variant="link" className="me-2" onClick={() => onIconClick(id)}>
              {
                likeIcon
                  ? (
                    <>
                      <LinearIcon uniqueId="like-button-comment">
                        <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                        <span className="fs-5">Like</span>
                      </LinearIcon>
                      <svg width="0" height="0" className="d-block">
                        <linearGradient id="like-button-comment" x1="00%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                          <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                        </linearGradient>
                      </svg>
                    </>
                  )
                  : (
                    <>
                      <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" />
                      <span className="fs-5">Like</span>
                    </>
                  )
              }
            </Button>
            <Button
              variant="link"
              onClick={handleReply}
              className="d-flex"
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
  feedCommentId: '',
  message: null,
  userId: null,
  userName: null,
  handleSeeCompleteList: undefined,
  likeCount: 0,
  active: false,
  isReply: false,
  setIsReply: undefined,
  replyCommentIndex: 0,
};
export default CommentSection;
