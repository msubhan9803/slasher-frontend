/* eslint-disable max-lines */
import React, { useState, useEffect } from 'react';
import {
  Card, Col, Row,
} from 'react-bootstrap';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import linkifyHtml from 'linkify-html';
import 'swiper/swiper-bundle.css';
import Cookies from 'js-cookie';
import InfiniteScroll from 'react-infinite-scroller';
import PostFooter from './PostFooter';
import { CommentValue, Post, ReplyValue } from '../../../../types';
import LikeShareModal from '../../LikeShareModal';
import PostCommentSection from '../PostCommentSection/PostCommentSection';
import PostHeader from './PostHeader';
import CustomSwiper from '../../CustomSwiper';
import 'linkify-plugin-mention';
import { PopoverClickProps } from '../../CustomPopover';
import PubWiseAd from '../../PubWiseAd';
import {
  decryptMessage,
  cleanExternalHtmlContent,
  escapeHtmlSpecialCharacters,
  newLineToBr,
} from '../../../../utils/text-utils';
import LoadingIndicator from '../../LoadingIndicator';
import { HOME_WEB_DIV_ID, NEWS_PARTNER_POSTS_DIV_ID } from '../../../../utils/pubwise-ad-units';
import { useAppSelector } from '../../../../redux/hooks';
import { MentionListProps } from '../../MessageTextarea';
import { MD_MEDIA_BREAKPOINT } from '../../../../constants';

const READ_MORE_TEXT_LIMIT = 300;

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
  onSelect?: (value: string) => void;
  handleSearch?: (val: string) => void;
  mentionList?: MentionListProps[];
}
const StyledPostFeed = styled.div`
    .post-separator {
      border-top: 1px solid var(--bs-light);
      margin: 1rem 0;
    }

    @media (min-width: ${MD_MEDIA_BREAKPOINT}) {
      .post-separator {
        margin: 1rem 1.5rem;
      }
    }
`;

function PostFeed({
  postFeedData, popoverOptions, isCommentSection, onPopoverClick, detailPage,
  commentsData, removeComment, setCommentID, setCommentReplyID, commentID,
  commentReplyID, otherUserPopoverOptions, setIsEdit, setRequestAdditionalPosts,
  noMoreData, isEdit, loadingPosts, onLikeClick, newsPostPopoverOptions,
  escapeHtml, loadNewerComment, previousCommentsAvailable, addUpdateReply,
  addUpdateComment, updateState, setUpdateState, isSinglePagePost, onSelect,
  handleSearch, mentionList,
}: Props) {
  const [postData, setPostData] = useState<Post[]>([]);
  const [openLikeShareModal, setOpenLikeShareModal] = useState<boolean>(false);
  const [buttonClick, setButtonClck] = useState<string>('');
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('imageId');
  const loginUserId = Cookies.get('userId');
  const location = useLocation();
  const scrollPosition: any = useAppSelector((state) => state.scrollPosition);
  const [clickedPostId, setClickedPostId] = useState('');
  const generateReadMoreLink = (post: any) => {
    if (post.rssfeedProviderId) {
      return `/app/news/partner/${post.rssfeedProviderId}/posts/${post.id}`;
    }
    return `/${post.userName}/posts/${post.id}`;
  };

  useEffect(() => {
    setPostData(postFeedData);
  }, [postFeedData]);

  const openDialogue = (click: string, postId: string) => {
    setClickedPostId(postId);
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
      return `/app/news/partner/${post.rssfeedProviderId}/posts/${post.id}?imageId=${imageId}`;
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
  if (location.pathname === '/app/home' || location.pathname.endsWith('/posts')) {
    pubWiseAdDivId = HOME_WEB_DIV_ID;
  }
  if (location.pathname.includes('/app/news/partner/')) {
    pubWiseAdDivId = NEWS_PARTNER_POSTS_DIV_ID;
  }

  useEffect(() => {
    if (postData.length > 1
      && scrollPosition.position > 0
      && scrollPosition?.pathname === location.pathname) {
      window.scrollTo({
        top: scrollPosition?.position,
        behavior: 'auto',
      });
    }
  }, [postData, scrollPosition, location.pathname]);

  return (
    <StyledPostFeed>
      {postData.map((post: any, i) => (
        <div key={post.id}>
          <div className="post">
            <Card className="bg-transparent border-0 rounded-3 mb-md-4 mb-0 pt-md-3 px-sm-0 px-md-4">
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
                  onSelect={onSelect}
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
                    onSelect={onSelect}
                  />
                )}
                <Row>
                  <Col>
                    <PostFooter
                      likeIcon={post.likeIcon}
                      postId={post.id}
                      userName={post.userName}
                      rssfeedProviderId={post.rssfeedProviderId}
                      onLikeClick={() => { if (onLikeClick) { onLikeClick(post.id); } }}
                      onSelect={onSelect}
                      likeCount={post.likeCount}
                      commentCount={post.commentCount}
                      handleLikeModal={openDialogue}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {
              isCommentSection
              && (
                <>
                  {/* <StyledBorder className="d-md-block d-none mb-4" /> */}
                  <InfiniteScroll
                    pageStart={0}
                    initialLoad
                    loadMore={() => {
                      if (setRequestAdditionalPosts) { setRequestAdditionalPosts(true); }
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
                      handleSearch={handleSearch}
                      mentionList={mentionList}
                    />
                  </InfiniteScroll>
                  {loadingPosts && <LoadingIndicator />}
                  {noMoreData && renderNoMoreDataMessage()}
                </>
              )
            }
          </div>
          {!detailPage && <hr className="post-separator" />}
          {(i + 1) % 3 === 0 && pubWiseAdDivId && (
            <>
              <PubWiseAd className="text-center" id={pubWiseAdDivId} autoSequencer />
              <hr className="post-separator" />
            </>
          )}
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
            clickedPostId={clickedPostId}
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
  onSelect: undefined,
  handleSearch: undefined,
  mentionList: null,
};
export default PostFeed;
