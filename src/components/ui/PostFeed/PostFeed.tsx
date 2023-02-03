/* eslint-disable max-lines */
import React, { useState, useEffect } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Row,
} from 'react-bootstrap';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import styled from 'styled-components';
import linkifyHtml from 'linkify-html';
import 'swiper/swiper-bundle.css';
import Cookies from 'js-cookie';
import InfiniteScroll from 'react-infinite-scroller';
import PostFooter from './PostFooter';
import { CommentValue, Post, ReplyValue } from '../../../types';
import LikeShareModal from '../LikeShareModal';
import PostCommentSection from '../PostCommentSection/PostCommentSection';
import PostHeader from './PostHeader';
import CustomSwiper from '../CustomSwiper';
import 'linkify-plugin-mention';
import { PopoverClickProps } from '../CustomPopover';
import PubWiseAd from '../PubWiseAd';
import { scrollWithOffset } from '../../../utils/scrollFunctions';
import {
  decryptMessage,
  cleanExternalHtmlContent,
  escapeHtmlSpecialCharacters,
  newLineToBr,
} from '../../../utils/text-utils';
import LoadingIndicator from '../LoadingIndicator';
import { StyledBorder } from '../StyledBorder';
import { HOME_WEB_DIV_ID, NEWS_PARTNER_DETAILS_DIV_ID, NEWS_PARTNER_POSTS_DIV_ID } from '../../../utils/pubwise-ad-units';

const READ_MORE_TEXT_LIMIT = 300;

interface LinearIconProps {
  uniqueId?: string
}

interface Props {
  popoverOptions: string[];
  postFeedData: any[];
  commentsData?: any[];
  isCommentSection?: boolean;
  onPopoverClick: (value: string, popoverClickProps: PopoverClickProps) => void;
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
  newsPostPopoverOptions?: string[];
  escapeHtml?: boolean;
  loadNewerComment?: () => void;
  previousCommentsAvailable?: boolean;
  isSinglePagePost?: boolean;
  addUpdateReply?: (value: ReplyValue) => void;
  addUpdateComment?: (addUpdateComment: CommentValue) => void;
  updateState?: boolean;
  setUpdateState?: (value: boolean) => void;
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
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

function PostFeed({
  postFeedData, popoverOptions, isCommentSection, onPopoverClick, detailPage,
  commentsData, removeComment, setCommentID, setCommentReplyID, commentID,
  commentReplyID, otherUserPopoverOptions, setIsEdit, setRequestAdditionalPosts,
  noMoreData, isEdit, loadingPosts, onLikeClick, newsPostPopoverOptions,
  escapeHtml, loadNewerComment, previousCommentsAvailable, addUpdateReply,
  addUpdateComment, updateState, setUpdateState, isSinglePagePost,
}: Props) {
  const [postData, setPostData] = useState<Post[]>([]);
  const [openLikeShareModal, setOpenLikeShareModal] = useState<boolean>(false);
  const [buttonClick, setButtonClck] = useState<string>('');
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('imageId');
  const loginUserId = Cookies.get('userId');
  const location = useLocation();

  const generateReadMoreLink = (post: any) => {
    if (post.rssfeedProviderId) {
      return `/news/partner/${post.rssfeedProviderId}/posts/${post.id}`;
    }
    return `/${post.userName}/posts/${post.id}`;
  };

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

  const renderPostContent = (post: any) => {
    let { content } = post;
    let showReadMoreLink = false;
    if (!detailPage && content.length >= READ_MORE_TEXT_LIMIT) {
      let reducedContentLength = post.content.substring(0, READ_MORE_TEXT_LIMIT).lastIndexOf(' ');
      if (reducedContentLength === -1) {
        // This means that no spaces were found anywhere in the post content.  Since posts can't be
        // empty, that means that someone either put in a really long link or a lot of text with
        // no spaces.  In either case, we'll fall back to just cutting the post content to
        // READ_MORE_TEXT_LIMIT.
        reducedContentLength = READ_MORE_TEXT_LIMIT;
      }
      content = post.content.substring(0, reducedContentLength);
      showReadMoreLink = true;
    }
    return (
      <div>
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={
          {
            __html: escapeHtml
              ? newLineToBr(linkifyHtml(decryptMessage(escapeHtmlSpecialCharacters(content))))
              : cleanExternalHtmlContent(content),
          }
        }
        />
        {post.hashTag?.map((hashtag: string) => (
          <span role="button" key={hashtag} tabIndex={0} className="fs-4 text-primary me-1" aria-hidden="true">
            #
            {hashtag}
          </span>
        ))}
        {!detailPage
          && showReadMoreLink
          && (
            <>
              {' '}
              <Link to={generateReadMoreLink(post)} className="text-decoration-none text-primary">
                ...read more
              </Link>
            </>
          )}
      </div>
    );
  };

  let pubWiseAdDivId: string = '';
  if (location.pathname === '/home' || location.pathname.endsWith('/posts')) {
    pubWiseAdDivId = HOME_WEB_DIV_ID;
  }
  if (location.pathname.includes('/news/partner/')) {
    pubWiseAdDivId = NEWS_PARTNER_POSTS_DIV_ID;
  }

  let singlePagePostPubWiseAdDivId: string;
  if (location.pathname.includes('/news/partner/')) {
    singlePagePostPubWiseAdDivId = NEWS_PARTNER_DETAILS_DIV_ID;
  }
  if (location.pathname.includes('/posts/')) {
    singlePagePostPubWiseAdDivId = NEWS_PARTNER_DETAILS_DIV_ID;
  }

  return (
    <StyledPostFeed>
      {postData.map((post: any, i) => (
        <div key={post.id}>
          <div className="post">
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
                {renderPostContent(post)}
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
                { /* Below ad is to be shown in the end of post content when the post is a
              single pgae post */ }
                {isSinglePagePost && singlePagePostPubWiseAdDivId && <PubWiseAd className="text-center mt-3" id={singlePagePostPubWiseAdDivId} autoSequencer />}
                <Row className="pt-3 px-md-3">
                  <Col>
                    <LinearIcon uniqueId="like-button" role="button" onClick={() => openDialogue('like')}>
                      <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                      <span className="fs-3">{post.likeCount}</span>
                    </LinearIcon>
                  </Col>
                  <Col className="text-center" role="button">
                    <HashLink
                      to={post.rssfeedProviderId
                        ? `/news/partner/${post.rssfeedProviderId}/posts/${post.id}#comments`
                        : `/${post.userName}/posts/${post.id}#comments`}
                      className="text-decoration-none"
                      scroll={scrollWithOffset}
                    >
                      <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                      <span className="fs-3">{post.commentCount}</span>
                    </HashLink>
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
                userName={post.userName}
                rssfeedProviderId={post.rssfeedProviderId}
                onLikeClick={() => { if (onLikeClick) onLikeClick(post.id); }}
              />
              {
                isCommentSection
                && (
                  <>
                    <StyledBorder className="d-md-block d-none mb-4" />
                    <InfiniteScroll
                      pageStart={0}
                      initialLoad
                      loadMore={() => {
                        if (setRequestAdditionalPosts) setRequestAdditionalPosts(true);
                      }}
                      hasMore={!noMoreData}
                    >
                      <PostCommentSection
                        commentSectionData={commentsData}
                        popoverOption={popoverOptions}
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
                        addUpdateReply={addUpdateReply}
                        addUpdateComment={addUpdateComment}
                        updateState={updateState}
                        setUpdateState={setUpdateState}
                      />
                    </InfiniteScroll>
                    {loadingPosts && <LoadingIndicator />}
                    {noMoreData && renderNoMoreDataMessage()}
                  </>
                )
              }
            </Card>
          </div>
          {(i + 1) % 3 === 0 && pubWiseAdDivId && <PubWiseAd className="text-center my-3" id={pubWiseAdDivId} autoSequencer />}
        </div>
      ))}
      {!isSinglePagePost && pubWiseAdDivId && postData.length < 3 && postData.length !== 0 && <PubWiseAd className="text-center my-3" id={pubWiseAdDivId} autoSequencer />}
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
  newsPostPopoverOptions: [],
  escapeHtml: true,
  loadNewerComment: undefined,
  previousCommentsAvailable: false,
  isSinglePagePost: false,
  addUpdateReply: undefined,
  addUpdateComment: undefined,
  updateState: false,
  setUpdateState: undefined,
};
export default PostFeed;
