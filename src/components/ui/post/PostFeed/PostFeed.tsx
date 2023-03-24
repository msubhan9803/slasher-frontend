/* eslint-disable max-lines */
import React, { useState, useEffect } from 'react';
import {
  Card, Col, Row,
} from 'react-bootstrap';
import {
  Link, useLocation, useNavigate, useSearchParams,
} from 'react-router-dom';
import styled from 'styled-components';
import linkifyHtml from 'linkify-html';
import 'swiper/swiper-bundle.css';
import Cookies from 'js-cookie';
import InfiniteScroll from 'react-infinite-scroller';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import * as stringSimilarity from 'string-similarity';
import PostFooter from './PostFooter';
import {
  CommentValue, Post, PostButtonClickType, ReplyValue, WorthWatchingStatus,
} from '../../../../types';
import LikeShareModal from '../../LikeShareModal';
import PostCommentSection from '../PostCommentSection/PostCommentSection';
import PostHeader from './PostHeader';
import CustomSwiper from '../../CustomSwiper';
import 'linkify-plugin-mention';
import { PopoverClickProps } from '../../CustomPopover';
import PubWiseAd from '../../PubWiseAd';
import {
  cleanExternalHtmlContent,
  decryptMessage,
  escapeHtmlSpecialCharacters,
  newLineToBr,
} from '../../../../utils/text-utils';
import { MentionListProps } from '../../MessageTextarea';
import { MD_MEDIA_BREAKPOINT } from '../../../../constants';
import RoundButton from '../../RoundButton';
import CustomRatingText from '../../CustomRatingText';
import CustomWortItText from '../../CustomWortItText';
import { useAppSelector } from '../../../../redux/hooks';
import { HOME_WEB_DIV_ID, NEWS_PARTNER_DETAILS_DIV_ID, NEWS_PARTNER_POSTS_DIV_ID } from '../../../../utils/pubwise-ad-units';
import LoadingIndicator from '../../LoadingIndicator';
import { customlinkifyOpts } from '../../../../utils/linkify-utils';
import { getLocalStorage } from '../../../../utils/localstorage-utils';

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
  loginUserMoviePopoverOptions?: string[];
  postCreaterPopoverOptions?: string[];
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
  postType?: string,
  handleSearch?: (val: string) => void;
  mentionList?: MentionListProps[];
  commentImages?: string[];
  setCommentImages?: (val: any) => void;
  commentError?: string[];
  onSpoilerClick?: (value: string) => void;
}

interface StyledProps {
  detailsPage: boolean;
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

const StyleSpoilerButton = styled(RoundButton)`
  width: 150px;
  height: 42px;
`;

const StyledContentContainer = styled.div<StyledProps>`
  max-width: max-content;
  cursor: ${(props) => (!props?.detailsPage ? 'pointer' : 'auto')};
`;
function PostFeed({
  postFeedData, popoverOptions, isCommentSection, onPopoverClick, detailPage,
  commentsData, removeComment, setCommentID, setCommentReplyID, commentID,
  commentReplyID, otherUserPopoverOptions, postCreaterPopoverOptions,
  loginUserMoviePopoverOptions, setIsEdit, setRequestAdditionalPosts,
  noMoreData, isEdit, loadingPosts, onLikeClick, newsPostPopoverOptions,
  escapeHtml, loadNewerComment, previousCommentsAvailable, addUpdateReply,
  addUpdateComment, updateState, setUpdateState, isSinglePagePost, onSelect,
  handleSearch, mentionList, commentImages, setCommentImages, commentError, postType,
  onSpoilerClick,
}: Props) {
  const [postData, setPostData] = useState<Post[]>(postFeedData);
  const [openLikeShareModal, setOpenLikeShareModal] = useState<boolean>(false);
  const [buttonClick, setButtonClck] = useState<PostButtonClickType>('');
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('imageId');
  const loginUserId = Cookies.get('userId');
  const location = useLocation();
  const navigate = useNavigate();
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const [clickedPostId, setClickedPostId] = useState('');
  const spoilerId = getLocalStorage('spoilersIds');
  const [clickedPostLikeCount, setClickedPostLikeCount] = useState(0);
  const generateReadMoreLink = (post: any) => {
    if (post.rssfeedProviderId) {
      return `/app/news/partner/${post.rssfeedProviderId}/posts/${post.id}`;
    }
    return `/${post.userName}/posts/${post.id}`;
  };

  useEffect(() => {
    setPostData(postFeedData);
  }, [postFeedData]);

  const openDialogue = (click: PostButtonClickType, postId: string, postLikeCount: number) => {
    setOpenLikeShareModal(true);
    // Set other useful info for the `modal`
    setClickedPostId(postId);
    setButtonClck(click);
    setClickedPostLikeCount(postLikeCount);
  };

  const imageLinkUrl = (post: any, imageId: string) => {
    if (post.rssfeedProviderId) {
      return `/app/news/partner/${post.rssfeedProviderId}/posts/${post.id}?imageId=${imageId}`;
    }
    return `/${post.userName}/posts/${post.id}?imageId=${imageId}`;
  };

  const onPostContentClick = (post: any) => {
    if (post.rssfeedProviderId) {
      navigate(`/app/news/partner/${post.rssfeedProviderId}/posts/${post.id}`);
    } else if (postType === 'review') {
      navigate(`/app/movies/${post.movieId}/reviews/${post.id}#comments`);
    } else {
      navigate(`/${post.userName}/posts/${post.id}`);
    }
    onSelect!(post.id);
  };

  const showPopoverOption = (postDetail: any) => {
    if (postDetail && !postDetail.userId && newsPostPopoverOptions?.length) {
      return newsPostPopoverOptions;
    }
    /* eslint-disable max-len */
    // TO-DO: Remove this because it was breaking popover for others user post (comment added by Avadh)
    // if (postDetail?.userId && loginUserId !== postDetail?.userId && (postType && postType === 'group-post')) {
    if (postDetail?.userId && loginUserId !== postDetail?.userId) {
      return otherUserPopoverOptions!;
    }
    if (postDetail && postType === 'review' && loginUserMoviePopoverOptions?.length) {
      return loginUserMoviePopoverOptions;
    }
    return popoverOptions;
  };

  const renderPostContent = (post: any) => {
    let { content } = post;

    if (post.rssFeedTitle) {
      // Posts almost always have a title, but sometimes the post title also appears redundantly in
      // the content (and when it is in the content, we've always found it in an h1 tag so far).
      // Having a double title display doesn't look good, so we'll remove the second title if we
      // find it.
      const firstH1TagRegex = /<h1[^>]*>(.+)<\/h1>/i;
      const firstH1Tag = content.match(firstH1TagRegex)?.[0];
      const firstH1TagContent = content.match(firstH1TagRegex)?.[1];

      if (firstH1Tag && firstH1TagContent) {
        // If the normalized title is very similar to the content from the first h1 tag, then we'll
        // remove the h1 tag content.
        const similarity = stringSimilarity.compareTwoStrings(post.rssFeedTitle, firstH1TagContent);
        // Generally, differences between the title and the h1 title come from html-entity-encoded
        // versions of the same characters in the h1 title.
        // We may want to move this logic to the server side feed sync code later on.
        if (similarity > 0.75) {
          // Remove first h1 tag because a likely duplicate title was found.
          content = content.replace(firstH1Tag, '');
        }
      }
    }

    let showReadMoreLink = false;
    if (!detailPage && content?.length >= READ_MORE_TEXT_LIMIT) {
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
        {postType === 'review' && (
          <div className="d-flex align-items-center mb-3">
            {post?.rating !== 0 && (
              <div className={`px-3 py-2 bg-dark rounded-pill d-flex align-items-center ${(post.worthWatching && !post.goreFactor) && 'me-3'}`}>
                <CustomRatingText
                  rating={post.rating}
                  icon={solid('star')}
                  ratingType="star"
                  customWidth="16.77px"
                  customHeight="16px"
                />
              </div>
            )}
            {post?.goreFactor !== 0 && (
              <div className={`align-items-center bg-dark d-flex px-3 py-2 rounded-pill ${post.rating && 'ms-3'} ${post.worthWatching && 'me-3'}`}>
                <CustomRatingText
                  rating={post.goreFactor}
                  icon={solid('burst')}
                  ratingType="burst"
                  customWidth="15.14px"
                  customHeight="16px"
                />
              </div>
            )}
            {post.worthWatching !== WorthWatchingStatus.NoRating && (
              <CustomWortItText
                divClass="align-items-center py-2 px-3 bg-dark rounded-pill"
                textClass="fs-4"
                customCircleWidth="16px"
                customCircleHeight="16px"
                customIconWidth="8.53px"
                customIconHeight="8.53px"
                worthIt={post.worthWatching}
              />
            )}
          </div>
        )}
        {(post.spoilers
          && post.userId !== loginUserId && !spoilerId.includes(post.id)
        )
          ? (
            <div className="d-flex flex-column align-items-center p-5 mt-3" style={{ backgroundColor: '#1B1B1B' }}>
              <h2 className="text-primary fw-bold">Warning</h2>
              <p className="fs-3">Contains spoilers</p>
              <StyleSpoilerButton variant="filter" className="fs-5" onClick={() => onSpoilerClick && onSpoilerClick(post.id)}>
                Click to view
              </StyleSpoilerButton>
            </div>
          ) : (
            <span>
              {/* eslint-disable-next-line react/no-danger */}
              <StyledContentContainer
                detailsPage={detailPage ?? false}
                dangerouslySetInnerHTML={
                  {
                    __html: escapeHtml && !post?.spoiler
                      // eslint-disable-next-line max-len
                      ? newLineToBr(linkifyHtml(decryptMessage(escapeHtmlSpecialCharacters(content)), customlinkifyOpts))
                      : cleanExternalHtmlContent(content),
                  }
                }
                onClick={() => !detailPage && onPostContentClick(post)}
              />
              {
                post.hashTag?.map((hashtag: string) => (
                  <span role="button" key={hashtag} tabIndex={0} className="fs-4 text-primary me-1" aria-hidden="true">
                    #
                    {hashtag}
                  </span>
                ))
              }
              {
                !detailPage
                && showReadMoreLink
                && (
                  <>
                    {' '}
                    <Link to={generateReadMoreLink(post)} className="text-decoration-none text-primary">
                      ...read more
                    </Link>
                  </>
                )
              }
            </span>
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
    if (scrollPosition.position > 0
      && scrollPosition?.pathname === location.pathname) {
      window.scrollTo({
        top: scrollPosition?.position,
        behavior: 'instant' as any,
      });
    }
  }, [scrollPosition, location.pathname]);
  const renderGroupPostContent = (posts: any) => (
    <>
      <p>
        Posted in&nbsp;
        <span className="text-primary">
          {posts.postedIn}
        </span>
      </p>
      <span className="my-2 px-3 py-1 rounded-pill" style={{ backgroundColor: '#383838' }}>
        {posts.type}
      </span>
      <h1 className="h2 my-3">
        {posts.contentHeading}
      </h1>
    </>
  );

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
                  postImages={post.images}
                  postType={postType}
                />
              </Card.Header>
              <Card.Body className="px-0 pt-3">
                {postType === 'group-post' && renderGroupPostContent(post)}
                {post?.rssFeedTitle && <h1 className="h2">{post.rssFeedTitle}</h1>}
                {renderPostContent(post)}
                {post?.images?.length > 0 && (
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
                      postType={postType}
                      movieId={post.movieId}
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
                      postCreator={postData[0].userId}
                      commentSectionData={commentsData}
                      popoverOption={popoverOptions}
                      removeComment={removeComment}
                      setCommentID={setCommentID}
                      setCommentReplyID={setCommentReplyID}
                      commentID={commentID}
                      commentReplyID={commentReplyID}
                      loginUserId={loginUserId}
                      otherUserPopoverOptions={otherUserPopoverOptions}
                      postCreaterPopoverOptions={postCreaterPopoverOptions}
                      loginUserMoviePopoverOptions={loginUserMoviePopoverOptions}
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
                      commentImages={commentImages}
                      setCommentImages={setCommentImages}
                      commentError={commentError}
                    />
                  </InfiniteScroll>
                  {loadingPosts && <LoadingIndicator />}
                </>
              )
            }
          </div>
          { /* Below ad is to be shown in the end of a single pgae post */}
          {isSinglePagePost && <PubWiseAd className="text-center mt-3" id={NEWS_PARTNER_DETAILS_DIV_ID} autoSequencer />}

          {!detailPage && <hr className="post-separator" />}

          {/* Show ad after every three posts. */}
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
            clickedPostLikeCount={clickedPostLikeCount}
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
  postCreaterPopoverOptions: [],
  loginUserMoviePopoverOptions: [],
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
  postType: '',
  handleSearch: undefined,
  mentionList: null,
  commentError: undefined,
  commentImages: [],
  setCommentImages: () => { },
  onSpoilerClick: () => { },
};
export default PostFeed;
