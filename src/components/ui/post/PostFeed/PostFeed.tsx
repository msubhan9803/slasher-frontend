/* eslint-disable max-lines */
import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Col, Row,
} from 'react-bootstrap';
import {
  Link, useLocation, useNavigate, useSearchParams,
} from 'react-router-dom';
import styled, { css } from 'styled-components';
import linkifyHtml from 'linkify-html';
import 'swiper/swiper-bundle.css';
import InfiniteScroll from 'react-infinite-scroller';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import * as stringSimilarity from 'string-similarity';
import PostFooter from './PostFooter';
import {
  CommentValue, LikeShareModalResourceName, Post, LikeShareModalTabName,
  ReplyValue, WorthWatchingStatus, CommentsOrder, WorthReadingStatus,
} from '../../../../types';
import LikeShareModal from '../../LikeShareModal';
import PostCommentSection from '../PostCommentSection/PostCommentSection';
import PostHeader from './PostHeader';
import CustomSwiper from '../../CustomSwiper';
import 'linkify-plugin-mention';
import { PopoverClickProps } from '../../CustomPopover';
import {
  cleanExternalHtmlContent,
  decryptMessage,
  escapeHtmlSpecialCharacters,
  findFirstYouTubeLinkVideoId,
  newLineToBr,
} from '../../../../utils/text-utils';
import { MentionListProps } from '../../MessageTextarea';
import {
  LG_MEDIA_BREAKPOINT, MD_MEDIA_BREAKPOINT,
  XL_MEDIA_BREAKPOINT, XXL_MEDIA_BREAKPOINT,
} from '../../../../constants';
import RoundButton from '../../RoundButton';
import CustomRatingText from '../../CustomRatingText';
import CustomWortItText from '../../CustomWortItText';
import LoadingIndicator from '../../LoadingIndicator';
import { defaultLinkifyOpts } from '../../../../utils/linkify-utils';
import { getLocalStorage } from '../../../../utils/localstorage-utils';
import FormatImageVideoList from '../../../../utils/video-utils';
import useOnScreen from '../../../../hooks/useOnScreen';
import { isPostDetailsPage } from '../../../../utils/url-utils';
import ScrollToTop from '../../../ScrollToTop';
import {
  postBookDataToBookDBformat, postMovieDataToMovieDBformat, showBookPoster, showMoviePoster,
} from '../../../../routes/movies/movie-utils';
import { useAppSelector } from '../../../../redux/hooks';
import CustomSelect from '../../../filter-sort/CustomSelect';
import { ProgressButtonComponentType } from '../../ProgressButton';
import TpdAd from '../../TpdAd';
import { getInfiniteAdSlot, tpdAdSlotIdZ } from '../../../../utils/tpd-ad-slot-ids';

interface Props {
  popoverOptions: string[];
  postFeedData: any[];
  commentsData?: any[];
  isCommentSection?: boolean;
  onPopoverClick: (value: string, popoverClickProps: PopoverClickProps) => void;
  isSinglePost?: boolean;
  removeCommentAsync?: () => void;
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
  addUpdateReply?: (value: ReplyValue) => void;
  addUpdateComment?: (addUpdateComment: CommentValue) => void;
  updateState?: boolean;
  setUpdateState?: (value: boolean) => void;
  onSelect?: () => void;
  postType?: string,
  handleSearch?: (val: string, prefix: string) => void;
  mentionList?: MentionListProps[];
  commentImages?: string[];
  commentReplyError?: string[];
  setCommentImages?: (val: any) => void;
  commentError?: string[];
  onSpoilerClick?: (value: string) => void;
  commentSent?: boolean;
  setCommentReplyErrorMessage?: (value: string[]) => void;
  setCommentErrorMessage?: (value: string[]) => void;
  showAdAtPageBottom?: boolean;
  setSelectedBlockedUserId?: (value: string) => void;
  setDropDownValue?: (value: string) => void;
  ProgressButton?: ProgressButtonComponentType;
  setProgressButtonStatus?: any;
  commentOrReplySuccessAlertMessage?: string;
  setCommentOrReplySuccessAlertMessage?: React.Dispatch<React.SetStateAction<string>>;
  commentsOrder?: string;
  handleCommentsOrder?: (value: CommentsOrder) => void;
}

interface StyledProps {
  detailsPage?: boolean;
}

const StyledPostFeed = styled.div`
    margin: 0 1rem;

    .post-separator {
      border-top: 1px solid var(--bs-light);
      margin: 1rem 0;
    }

    @media (min-width: ${MD_MEDIA_BREAKPOINT}) {
      .post-separator {
        margin: 1rem 0;
      }
    }
`;

const StyleSpoilerButton = styled(RoundButton)`
  width: 150px;
  height: 42px;
`;

const StyledContentContainer = styled.div<StyledProps>`
    ${(props) => (!props?.detailsPage) && css`
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      line-clamp: 4;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
    `}
    cursor: ${(props) => (!props?.detailsPage ? 'pointer' : 'auto')};
    word-wrap: break-word;
    word-break: break-all;
    span {
      cursor: pointer
    }
    a {
      display: inline-block;
    }
  `;
type PostContentPropsType = {
  post: any, postType: string | undefined, generateReadMoreLink: any,
  escapeHtml: boolean | undefined, onPostContentClick: (post: any, event?: any) => void,
  handlePostContentKeyDown: (e: React.KeyboardEvent, post: any) => void,
  loginUserId: string | undefined, spoilerId: any,
  onSpoilerClick: ((value: string) => void) | undefined, isSinglePost: boolean | undefined,
};
const SelectContainer = styled.div`
  @media(max-width: ${MD_MEDIA_BREAKPOINT}) { margin-bottom: 8px; }
  @media(min-width: ${MD_MEDIA_BREAKPOINT}) { width: 35%; }
  @media(min-width: ${LG_MEDIA_BREAKPOINT}) { width: 52%; }
  @media(min-width: ${XL_MEDIA_BREAKPOINT}) { width: 40%; }
  @media(min-width: ${XXL_MEDIA_BREAKPOINT}) { width: 30%; }
`;
function PostContent({
  post, postType, generateReadMoreLink,
  escapeHtml, onPostContentClick, handlePostContentKeyDown, loginUserId,
  spoilerId, onSpoilerClick, isSinglePost,
}: PostContentPropsType) {
  const messageRef = useRef<any>(null);
  const visible = useOnScreen(messageRef);
  const [showReadMoreLink, setShowReadMoreLink] = useState(false);
  const [searchParams] = useSearchParams();
  const selectedHashtag = searchParams.get('hashtag');
  let { message } = post;

  if (post.rssFeedTitle) {
    // Posts almost always have a title, but sometimes the post title also appears redundantly in
    // the content (and when it is in the content, we've always found it in an h1 tag so far).
    // Having a double title display doesn't look good, so we'll remove the second title if we
    // find it.
    const firstH1TagRegex = /<h1[^>]*>(.+)<\/h1>/i;
    const firstH1Tag = message.match(firstH1TagRegex)?.[0];
    const firstH1TagContent = message.match(firstH1TagRegex)?.[1];

    if (firstH1Tag && firstH1TagContent) {
      // If the normalized title is very similar to the content from the first h1 tag, then we'll
      // remove the h1 tag content.
      const similarity = stringSimilarity.compareTwoStrings(post.rssFeedTitle, firstH1TagContent);
      // Generally, differences between the title and the h1 title come from html-entity-encoded
      // versions of the same characters in the h1 title.
      // We may want to move this logic to the server side feed sync code later on.
      if (similarity > 0.75) {
        // Remove first h1 tag because a likely duplicate title was found.
        message = message.replace(firstH1Tag, '');
      }
    }
  }

  useEffect(() => {
    if (!isSinglePost) {
      if (messageRef.current) {
        // Note: We are checking to show the "...read more" text based on the
        const s = messageRef.current?.scrollHeight > messageRef.current?.clientHeight;
        setShowReadMoreLink(s);
      }
    }
  }, [isSinglePost, visible]);

  const genratePostContent = (content: any) => {
    const escapedString = newLineToBr(linkifyHtml(decryptMessage(escapeHtmlSpecialCharacters(content, `#${selectedHashtag}`!, post.hashtags)), defaultLinkifyOpts));

    const regex = /(#\w+)/g;

    const result = escapedString.split(regex).filter(Boolean);

    const arrayWithJsx = result.map((resultItem) => {
      if (resultItem.startsWith('#')) {
        (
          <div>
            <Link to={`/app/search/posts?hashtag=${resultItem.slice(1)}`}>{resultItem}</Link>
          </div>
        );
      }

      return resultItem;
    });

    return arrayWithJsx.join('').toString();
  };
  return (
    <div>
      {postType === 'review' && (
        <div className="d-flex align-items-center mb-3">
          {post?.rating && post?.rating !== 0 ? (
            <div className={`px-3 py-2 bg-dark rounded-pill d-flex align-items-center ${(post.worthWatching && !post.goreFactor) && 'me-3'}`}>
              <CustomRatingText
                rating={post.rating}
                icon={solid('star')}
                ratingType="star"
                customWidth="16.77px"
                customHeight="16px"
              />
            </div>
          ) : null}
          {post?.goreFactor && post?.goreFactor !== 0 ? (
            <div className={`align-items-center bg-dark d-flex py-2 px-3 rounded-pill ${post.rating && 'ms-3'} ${(post.worthWatching || post.worthReading) && 'me-3'}`}>
              <CustomRatingText
                rating={post.goreFactor}
                icon={solid('burst')}
                ratingType="burst"
                customWidth="15.14px"
                customHeight="16px"
              />
            </div>
          ) : null}
          {post.worthWatching && post.worthWatching !== WorthWatchingStatus.NoRating ? (
            <CustomWortItText
              divClass="align-items-center py-2 px-3 bg-dark rounded-pill"
              textClass="fs-4"
              customCircleWidth="16px"
              customCircleHeight="16px"
              customIconWidth="8.53px"
              customIconHeight="8.53px"
              worthIt={post.worthWatching}
            />
          ) : null}
          {post.worthReading && post.worthReading !== WorthReadingStatus.NoRating ? (
            <CustomWortItText
              divClass="align-items-center py-2 px-3 bg-dark rounded-pill"
              textClass="fs-4"
              customCircleWidth="16px"
              customCircleHeight="16px"
              customIconWidth="8.53px"
              customIconHeight="8.53px"
              worthIt={post.worthReading}
            />
          ) : null}
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
              ref={messageRef}
              detailsPage={isSinglePost ?? false}
              dangerouslySetInnerHTML={
                {
                  __html: escapeHtml && !post?.spoiler
                    // eslint-disable-next-line max-len
                    ? genratePostContent(message)
                    : cleanExternalHtmlContent(message),
                }
              }
              onClick={(e: any) => {
                if (e.target.tagName !== 'A' && !isSinglePost) {
                  onPostContentClick(e, post);
                }
              }}
              aria-label="post-content"
              onKeyDown={(e) => handlePostContentKeyDown(e, post)}
            />
            {
              !isSinglePost
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
}

function PostFeed({
  postFeedData, popoverOptions, isCommentSection, onPopoverClick, isSinglePost,
  commentsData, removeCommentAsync, setCommentID, setCommentReplyID, commentID,
  commentReplyID, otherUserPopoverOptions, postCreaterPopoverOptions,
  loginUserMoviePopoverOptions, setIsEdit, setRequestAdditionalPosts,
  noMoreData, isEdit, loadingPosts, onLikeClick, newsPostPopoverOptions,
  escapeHtml, loadNewerComment, previousCommentsAvailable, addUpdateReply,
  addUpdateComment, updateState, setUpdateState, onSelect,
  handleSearch, mentionList, commentImages, setCommentImages, commentError,
  commentReplyError, postType, onSpoilerClick,
  commentSent, setCommentReplyErrorMessage, setCommentErrorMessage,
  showAdAtPageBottom, setSelectedBlockedUserId, setDropDownValue, ProgressButton,
  setProgressButtonStatus, commentOrReplySuccessAlertMessage, setCommentOrReplySuccessAlertMessage,
  commentsOrder, handleCommentsOrder,
}: Props) {
  const [postData, setPostData] = useState<Post[]>(postFeedData);
  const [isCommentClick, setCommentClick] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('imageId');
  const loginUserId = useAppSelector((state) => state.user.user.id);
  const navigate = useNavigate();
  const spoilerId = getLocalStorage('spoilersIds');
  // Below states (prefixed by `modal`) are useful for `LikeShareModal` component
  const [showLikeShareModal, setShowLikeShareModal] = useState<boolean>(false);
  const [modaResourceName, setModaResourceName] = useState<LikeShareModalResourceName | null>(null);
  const [modalTabName, setModalTabName] = useState<LikeShareModalTabName>('');
  const [modalResourceId, setModalResourceId] = useState('');
  const [modalLikeCount, setModalLikeCount] = useState(0);
  const { pathname } = useLocation();
  const parentSection = useRef<HTMLDivElement>(null);

  const generateReadMoreLink = (post: any) => {
    if (post.rssfeedProviderId) {
      return `/app/news/partner/${post.rssfeedProviderId}/posts/${post.id}`;
    }
    if (post.movieId) {
      return `/app/movies/${post.movieId}/reviews/${post.id}`;
    }
    return `/${post.userName}/posts/${post.id}`;
  };
  useEffect(() => {
    setPostData(postFeedData);
  }, [postFeedData]);

  const handleLikeModal = (
    modalTabNameValue: LikeShareModalTabName,
    modaResourceNameValue: LikeShareModalResourceName | null,
    modalResourceIdValue: string,
    modalLikeCountValue: number,
  ) => {
    setShowLikeShareModal(true);
    setModaResourceName(modaResourceNameValue);
    // Set other useful info for the `modal`
    setModalResourceId(modalResourceIdValue);
    setModalTabName(modalTabNameValue);
    setModalLikeCount(modalLikeCountValue);
  };

  const imageLinkUrl = (post: any, imageId: string) => {
    if (post.rssfeedProviderId) {
      return `/app/news/partner/${post.rssfeedProviderId}/posts/${post.id}?imageId=${imageId}`;
    }
    return `/${post.userName}/posts/${post.id}?imageId=${imageId}`;
  };

  const onPostContentClick = (event: any, post: any) => {
    const state = { pathname };
    const clickedElement = event.target;
    if (
      clickedElement.tagName === 'DIV'
    ) {
      if (post.rssfeedProviderId) {
        navigate(`/app/news/partner/${post.rssfeedProviderId}/posts/${post.id}`, { state });
      } else if (postType === 'review') {
        navigate(`/app/movies/${post.movieId}/reviews/${post.id}#comments`, { state });
      } else {
        navigate(`/${post.userName}/posts/${post.id}`, { state });
      }
      onSelect?.();
    }
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
  const handlePostContentKeyDown = (event: React.KeyboardEvent, post: any) => {
    if (event.key === 'Enter') {
      const shouldCallPostContentClick = !isSinglePost;
      if (shouldCallPostContentClick) {
        onPostContentClick(event, post);
      }
    }
  };

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
  const swiperDataForPost = (post: any) => {
    const imageVideoList = FormatImageVideoList(post.images, post.message);
    if (post.movieId) {
      const posterData = postMovieDataToMovieDBformat(post.movieId, post.postType, post.id);
      imageVideoList.splice(0, 0, { posterData });
    }
    if (post.bookId) {
      const posterData = postBookDataToBookDBformat(post.bookId, post.postType, post.id);
      imageVideoList.splice(0, 0, { posterData });
    }
    return imageVideoList.map((imageData: any) => {
      if (imageData.posterData) { return imageData; }
      return ({
        imageDescription: imageData.description,
        videoKey: imageData.videoKey,
        imageUrl: imageData.image_path,
        linkUrl: isSinglePost ? undefined : imageLinkUrl(post, imageData._id),
        postId: post.id,
        imageId: imageData.videoKey ? imageData.videoKey : imageData._id,
      });
    });
  };

  const handleComment = () => {
    setCommentClick(!isCommentClick);
  };
  const getContext = (post: any) => {
    if (post?.movieId) {
      return 'shareMoviePost';
    } if (post?.bookId) {
      return 'shareBookPost';
    }
    return 'post';
  };
  return (
    <StyledPostFeed>
      {isPostDetailsPage(pathname) && <ScrollToTop />}
      {postData.map((post: any, i) => (
        <div key={post.id}>
          <div className="post">
            <Card className="bg-transparent border-0 rounded-3 px-sm-0">
              <Card.Header className="border-0 px-0 bg-transparent" style={{ paddingTop: 6 }}>
                <PostHeader
                  isSinglePost={isSinglePost}
                  id={post.id}
                  userName={post.userName || post.title}
                  postDate={post.postDate}
                  profileImage={post.profileImage || post.rssFeedProviderLogo}
                  popoverOptions={showPopoverOption(post)}
                  onPopoverClick={onPopoverClick}
                  message={post.message}
                  userId={post.userId}
                  rssfeedProviderId={post.rssfeedProviderId}
                  onSelect={onSelect}
                  postImages={post.images}
                  postType={postType}
                />
              </Card.Header>
              <Card.Body className="px-0 pt-3 pb-0">
                {postType === 'group-post' && renderGroupPostContent(post)}
                {post?.rssFeedTitle && <h1 className="h2">{post.rssFeedTitle}</h1>}
                <PostContent
                  post={post}
                  postType={postType}
                  generateReadMoreLink={generateReadMoreLink}
                  escapeHtml={escapeHtml}
                  onPostContentClick={onPostContentClick}
                  handlePostContentKeyDown={handlePostContentKeyDown}
                  loginUserId={loginUserId}
                  spoilerId={spoilerId}
                  onSpoilerClick={onSpoilerClick}
                  isSinglePost={isSinglePost}
                />
                {(post?.images?.length > 0 || findFirstYouTubeLinkVideoId(post?.message) || showMoviePoster(post.movieId, postType) || showBookPoster(post.bookId, postType)) && (
                  <CustomSwiper
                    context={getContext(post)}
                    images={
                      swiperDataForPost(post)
                    }
                    initialSlide={post.images.findIndex((image: any) => image._id === queryParam)}
                    onSelect={onSelect}
                    isSinglePost={isSinglePost}
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
                      handleLikeModal={handleLikeModal}
                      postType={postType}
                      movieId={post.movieId}
                      bookId={post?.bookId}
                      detailsPage={isSinglePost}
                      onCommentClick={handleComment}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {
              isCommentSection
              && (
                <SelectContainer className="ml-auto ms-auto pb-1 mt-3">
                  <CustomSelect value={commentsOrder} onChange={handleCommentsOrder} options={[{ value: CommentsOrder.oldestFirst, label: 'Oldest to newest (default)' }, { value: CommentsOrder.newestFirst, label: 'Newest to oldest' }]} />
                </SelectContainer>
              )
            }

            {
              isCommentSection
              && (
                <div ref={parentSection}>
                  {/* <StyledBorder className="d-md-block d-none mb-4" /> */}
                  <InfiniteScroll
                    threshold={1000}
                    pageStart={0}
                    initialLoad
                    loadMore={() => {
                      if (setRequestAdditionalPosts) { setRequestAdditionalPosts(true); }
                    }}
                    hasMore={!noMoreData}
                    /* Using a custom parentNode element to base the scroll calulations on. */
                    useWindow={false}
                    getScrollParent={() => parentSection.current}

                  >
                    <PostCommentSection
                      postCreator={postData[0].userId}
                      commentSectionData={commentsData}
                      popoverOption={popoverOptions}
                      removeCommentAsync={removeCommentAsync}
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
                      commentReplyError={commentReplyError}
                      commentSent={commentSent}
                      setCommentReplyErrorMessage={setCommentReplyErrorMessage}
                      setCommentErrorMessage={setCommentErrorMessage}
                      handleLikeModal={handleLikeModal}
                      isMainPostCommentClick={isCommentClick}
                      setSelectedBlockedUserId={setSelectedBlockedUserId}
                      setCommentDropDownValue={setDropDownValue}
                      ProgressButton={ProgressButton}
                      setProgressButtonStatus={setProgressButtonStatus}
                      commentOrReplySuccessAlertMessage={commentOrReplySuccessAlertMessage}
                      setCommentOrReplySuccessAlertMessage={setCommentOrReplySuccessAlertMessage}
                    />
                  </InfiniteScroll>
                  {loadingPosts && <LoadingIndicator />}
                </div>
              )
            }
          </div>
          {/* Below ad is to be shown in the end of a single page post */}
          {isSinglePost && showAdAtPageBottom && (
            <>
              <TpdAd id="single-page-post-ad-placeholder" slotId={tpdAdSlotIdZ} />
              <div className="pt-5 mt-5" />
            </>
          )}

          {!isSinglePost && <hr className="post-separator" />}

          {/* Show ad after every three posts. */}
          {(i + 1) % 3 === 0 /* (i=2,5,8,11) */
            && (
              <>
                <TpdAd slotId={getInfiniteAdSlot()} id={`post-${(i + 1) / 3}`} />
                <hr className="post-separator" />
              </>
            )}
        </div>
      ))}

      {/* Show an ad if posts are less than 3 */}
      {!isSinglePost && postData.length < 3 && postData.length !== 0 && <TpdAd className="my-3" id="post-0" slotId={tpdAdSlotIdZ} />}
      {
        showLikeShareModal
        && (
          <LikeShareModal
            modaResourceName={modaResourceName}
            show={showLikeShareModal}
            setShow={setShowLikeShareModal}
            click={modalTabName} // "like"
            clickedPostId={modalResourceId}
            clickedPostLikeCount={modalLikeCount} // e.g., 23
            onSelect={onSelect}
          />
        )
      }
    </StyledPostFeed>
  );
}
PostFeed.defaultProps = {
  isCommentSection: false,
  isSinglePost: false,
  commentsData: [],
  removeCommentAsync: undefined,
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
  addUpdateReply: undefined,
  addUpdateComment: undefined,
  updateState: false,
  setUpdateState: undefined,
  onSelect: undefined,
  postType: '',
  handleSearch: undefined,
  mentionList: null,
  commentError: undefined,
  commentReplyError: undefined,
  commentImages: [],
  setCommentImages: () => { },
  onSpoilerClick: () => { },
  commentSent: undefined,
  setCommentReplyErrorMessage: undefined,
  setCommentErrorMessage: undefined,
  showAdAtPageBottom: undefined,
  setSelectedBlockedUserId: undefined,
  setDropDownValue: undefined,
  ProgressButton: undefined,
  setProgressButtonStatus: undefined,
  commentOrReplySuccessAlertMessage: '',
  setCommentOrReplySuccessAlertMessage: undefined,
  commentsOrder: '',
  handleCommentsOrder: undefined,
};
export default PostFeed;
