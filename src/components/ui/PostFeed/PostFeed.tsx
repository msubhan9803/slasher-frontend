/* eslint-disable max-lines */
import React, { useState, useEffect } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Row,
} from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import linkifyHtml from 'linkify-html';
import 'swiper/swiper-bundle.css';
import Cookies from 'js-cookie';
import InfiniteScroll from 'react-infinite-scroller';
import PostFooter from './PostFooter';
import { CommentValue, Post } from '../../../types';
import LikeShareModal from '../LikeShareModal';
import PostCommentSection from '../PostCommentSection/PostCommentSection';
import PostHeader from './PostHeader';
import CustomSwiper from '../CustomSwiper';
import 'linkify-plugin-mention';
import { PopoverClickProps } from '../CustomPopover';

interface LinearIconProps {
  uniqueId?: string
}

interface Props {
  popoverOptions: string[];
  postFeedData: any[];
  commentsData?: any[];
  isCommentSection?: boolean;
  onPopoverClick: (value: string, popoverClickProps: PopoverClickProps) => void;
  setCommentValue?: (value: CommentValue) => void;
  detailPage?: boolean;
  removeComment?: () => void;
  setCommentID?: (value: string) => void;
  setCommentReplyID?: (value: string) => void;
  commentID?: string;
  commentReplyID?: string;
  otherUserPopoverOptions?: string[];
  setIsEdit?: (value: boolean) => void;
  setRequestAdditionalPosts?: (value: boolean) => void;
  noMoreData?: boolean;
  loadingPosts?: boolean;
  isEdit?: boolean;
  onLikeClick?: (value: string) => void;
  isNewsPartnerPost?: boolean;
  newsPostPopoverOptions?: string[];
  loadNewerComment?: () => void;
  previousCommentsAvailable?: boolean;
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const Content = styled.div`
  white-space: pre-line;
`;
const StyledBorder = styled.div`
  border-top: 1px solid #3A3B46
`;
const StyledPostFeed = styled.div`
  @media(max-width: 767px) {
    .post {
      border-bottom: 1px solid #3A3B46;
    }
    .post:last-of-type {
      border-bottom: none;
    }
  }
`;

const decryptMessage = (content: string) => {
  const found = content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '');
  return found;
};

function PostFeed({
  postFeedData, popoverOptions, isCommentSection, onPopoverClick, detailPage,
  setCommentValue, commentsData, removeComment,
  setCommentID, setCommentReplyID, commentID, commentReplyID, otherUserPopoverOptions,
  setIsEdit, setRequestAdditionalPosts, noMoreData, isEdit,
  loadingPosts, onLikeClick, isNewsPartnerPost, newsPostPopoverOptions,
  loadNewerComment, previousCommentsAvailable,
}: Props) {
  const [postData, setPostData] = useState<Post[]>([]);
  const [openLikeShareModal, setOpenLikeShareModal] = useState<boolean>(false);
  const [buttonClick, setButtonClck] = useState<string>('');
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('imageId');
  const loginUserId = Cookies.get('userId');

  useEffect(() => {
    setPostData(postFeedData);
  }, [postFeedData]);

  const openDialogue = (click: string) => {
    setOpenLikeShareModal(true);
    setButtonClck(click);
  };

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        commentsData && commentsData.length > 0
          ? 'No more comments' : ''
      }
    </p>
  );

  const renderLoadingIndicator = () => (
    <p className="text-center">Loading...</p>
  );

  const imageLinkUrl = (post: any, imageId: string) => {
    if (post.rssfeedProviderId) {
      return `/news/partner/${post.rssfeedProviderId}/posts/${post.id}?imageId=${imageId}`;
    }
    return `/${post.userName}/posts/${post.id}?imageId=${imageId}`;
  };

  const showPopoverOption = (postDetail: any) => {
    if (postDetail && !postDetail.userId && newsPostPopoverOptions?.length) {
      return newsPostPopoverOptions;
    }
    if (postDetail?.userId && loginUserId !== postDetail?.userId) {
      return otherUserPopoverOptions!;
    }
    return popoverOptions;
  };

  return (
    <StyledPostFeed>
      {postData.map((post: any) => (
        <div key={post.id} className="post">
          <Card className="bg-mobile-transparent border-0 rounded-3 mb-md-4 bg-dark mb-0 pt-md-3 px-sm-0 px-md-4">
            <Card.Header className="border-0 px-0 bg-transparent">
              <PostHeader
                detailPage={detailPage}
                id={post.id}
                userName={post.userName || post.title}
                postDate={post.postDate}
                profileImage={post.profileImage || post.rssFeedProviderLogo}
                popoverOptions={showPopoverOption(post)}
                onPopoverClick={onPopoverClick}
                content={post.content}
                userId={post.userId}
                rssfeedProviderId={post.rssfeedProviderId}
              />
            </Card.Header>
            <Card.Body className="px-0 pt-3">
              <div>
                <Content dangerouslySetInnerHTML={
                  {
                    __html: isNewsPartnerPost
                      ? post.content
                      : linkifyHtml(decryptMessage(post.content
                        .replaceAll('&', '&amp;')
                        .replaceAll('<', '&lt;')
                        .replaceAll('>', '&gt;')
                        .replaceAll('"', '&quot;')
                        .replaceAll("'", '&#039;'))),
                  }
                }
                />
                {post.hashTag?.map((hashtag: string) => (
                  <span role="button" key={hashtag} tabIndex={0} className="fs-4 text-primary me-1" aria-hidden="true">
                    #
                    {hashtag}
                  </span>
                ))}
              </div>
              {post?.images && (
                <CustomSwiper
                  images={
                    post.images.map((imageData: any) => ({
                      videoKey: imageData.videoKey,
                      imageUrl: imageData.image_path,
                      linkUrl: detailPage ? undefined : imageLinkUrl(post, imageData._id),
                      postId: post.id,
                      imageId: imageData.videoKey ? imageData.videoKey : imageData._id,
                    }))
                  }
                  /* eslint no-underscore-dangle: 0 */
                  initialSlide={post.images.findIndex((image: any) => image._id === queryParam)}
                />
              )}
              <Row className="pt-3 px-md-3">
                <Col>
                  <LinearIcon uniqueId="like-button" role="button" onClick={() => openDialogue('like')}>
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                    <span className="fs-3">{post.likeCount}</span>
                  </LinearIcon>
                </Col>
                <Col className="text-center" role="button">
                  <Link
                    to={post.rssfeedProviderId
                      ? `/news/partner/${post.rssfeedProviderId}/posts/${post.id}`
                      : `/${post.userName}/posts/${post.id}`}
                    className="text-decoration-none"
                  >
                    <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                    <span className="fs-3">{post.commentCount}</span>
                  </Link>
                </Col>
                <Col className="text-end" role="button" onClick={() => openDialogue('share')}>
                  <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                  <span className="fs-3">{post.sharedList}</span>
                </Col>
                <svg width="0" height="0">
                  <linearGradient id="like-button" x1="00%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                  </linearGradient>
                </svg>
              </Row>
            </Card.Body>
            <PostFooter
              likeIcon={post.likeIcon}
              postId={post.id}
              onLikeClick={() => { if (onLikeClick) onLikeClick(post.id); }}
            />
            {
              isCommentSection
              && (
                <>
                  <StyledBorder className="d-md-block d-none mb-4" />
                  <InfiniteScroll
                    pageStart={0}
                    initialLoad={false}
                    loadMore={() => {
                      if (setRequestAdditionalPosts) setRequestAdditionalPosts(true);
                    }}
                    hasMore={!noMoreData}
                  >
                    <PostCommentSection
                      commentSectionData={commentsData}
                      commentImage={post.profileImage}
                      popoverOption={popoverOptions}
                      setCommentValue={setCommentValue}
                      removeComment={removeComment}
                      setCommentID={setCommentID}
                      setCommentReplyID={setCommentReplyID}
                      commentID={commentID}
                      commentReplyID={commentReplyID}
                      loginUserId={loginUserId}
                      otherUserPopoverOptions={otherUserPopoverOptions}
                      setIsEdit={setIsEdit}
                      isEdit={isEdit}
                      onLikeClick={onLikeClick}
                      loadNewerComment={loadNewerComment}
                      previousCommentsAvailable={previousCommentsAvailable}
                    />
                  </InfiniteScroll>
                  {loadingPosts && renderLoadingIndicator()}
                  {noMoreData && renderNoMoreDataMessage()}
                </>
              )
            }
          </Card>
        </div>
      ))}
      {
        openLikeShareModal
        && (
          <LikeShareModal
            show={openLikeShareModal}
            setShow={setOpenLikeShareModal}
            click={buttonClick}
          />
        )
      }
    </StyledPostFeed>
  );
}
PostFeed.defaultProps = {
  isCommentSection: false,
  detailPage: false,
  setCommentValue: undefined,
  commentsData: [],
  removeComment: undefined,
  setCommentID: undefined,
  setCommentReplyID: undefined,
  commentID: '',
  commentReplyID: '',
  otherUserPopoverOptions: [],
  setIsEdit: undefined,
  isEdit: false,
  setRequestAdditionalPosts: undefined,
  noMoreData: false,
  loadingPosts: false,
  onLikeClick: undefined,
  isNewsPartnerPost: false,
  newsPostPopoverOptions: [],
  loadNewerComment: undefined,
  previousCommentsAvailable: false,
};
export default PostFeed;
