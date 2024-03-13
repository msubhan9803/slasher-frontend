/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback,
  useEffect, useLayoutEffect, useMemo, useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import CreatePostComponent from '../../../components/ui/CreatePostComponent';
import {
  createPost, deleteFeedPost, feedPostDetail, getBookReview, updateFeedPost,
} from '../../../api/feed-posts';
import {
  BookPageCache,
  FormatMentionProps,
  Post, PostType,
} from '../../../types';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { getLocalStorage, setLocalStorage } from '../../../utils/localstorage-utils';
import { getPageStateCache, hasPageStateCache, setPageStateCache } from '../../../pageStateCache';
import useProgressButton from '../../../components/ui/ProgressButton';
import { atMentionsGlobalRegex, decryptMessage, generateMentionReplacementMatchFunc } from '../../../utils/text-utils';
import { getBookById } from '../../../api/books';
import ReportModal from '../../../components/ui/ReportModal';
import { sleep } from '../../../utils/timer-utils';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';
import { unlikeFeedPost, likeFeedPost } from '../../../api/feed-likes';

type Props = {
  bookReviewData: any;
  setBookReviewData: any;
  setReviewForm: (value: boolean) => void;
  handleScroll: () => void;
  showReviewForm: boolean;
  reviewForm: boolean;
  setShowReviewForm: (value: boolean) => void;
};

export const StyledReviewContainer = styled.div`
  min-height: 100vh;
`;

const loginUserPopoverOptions = ['Edit Review', 'Delete Review'] as const;
const otherUserPopoverOptions = ['Report', 'Block user'] as const;
const validPopOverOptions = [...loginUserPopoverOptions, ...otherUserPopoverOptions] as const;
type PopOverValueType = typeof validPopOverOptions[number];
// Using typeguard to get typesafe value
// eslint-disable-next-line max-len
const isValidPopOverValue = (v: string): v is PopOverValueType => validPopOverOptions.includes(v as any);

function BookReview({
  reviewForm, bookReviewData, setBookReviewData, setReviewForm, handleScroll, showReviewForm,
  setShowReviewForm,
}: Props) {
  const { id } = useParams();
  const location = useLocation();
  const [show, setShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [postContent, setPostContent] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [containSpoiler, setContainSpoiler] = useState<boolean>(false);
  const [rating, setRating] = useState(0);
  const [postId, setPostId] = useState<string>('');
  const [postUserId, setPostUserId] = useState<string>('');
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [deletePostId, setDeletePostId] = useState<any>([]);
  const [goreFactor, setGoreFactor] = useState(0);
  const [requestAdditionalReviewPosts, setRequestAdditionalReviewPosts] = useState<boolean>(false);
  const [loadingReviewPosts, setLoadingReviewPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [isWorthIt, setWorthIt] = useState<any>(0);
  const [liked, setLike] = useState<boolean>(false);
  const [disLiked, setDisLike] = useState<boolean>(false);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  // eslint-disable-next-line max-len
  const ReviewsCache: BookPageCache['reviews'] = useMemo(() => getPageStateCache<BookPageCache>(location)?.reviews ?? [], [location]);
  const [reviewPostData, setReviewPostData] = useState<any>(
    hasPageStateCache(location)
      ? ReviewsCache : [],
  );
  const navigate = useNavigate();
  const handleCreateInput = () => {
    setShowReviewForm(true);
  };

  useEffect(() => {
    if (hasPageStateCache(location)) {
      setReviewPostData(ReviewsCache);
    }
  }, [location, ReviewsCache]);

  const persistScrollPosition = () => {
    setPageStateCache<BookPageCache>(location, {
      ...getPageStateCache(location),
      reviews: reviewPostData,
    });
  };

  const callLatestFeedPost = useCallback(() => {
    if (id) {
      getBookReview(id).then((res) => {
        const newPosts = res.data.map((data: any) => ({
          _id: data._id,
          id: data._id,
          postDate: data.createdAt,
          message: data.message,
          images: data.images,
          userName: data.userId.userName,
          profileImage: data.userId.profilePic,
          userId: data.userId._id,
          likeIcon: data.likedByUser,
          likeCount: data.likeCount,
          commentCount: data.commentCount,
          rating: data?.reviewData?.rating || 0,
          goreFactor: data?.reviewData?.goreFactorRating || 0,
          worthReading: data?.reviewData?.worthReading || 0,
          contentHeading: data.title,
          bookId: id,
          spoilers: data.spoilers,
          hashtags: data.hashtags,
        }));
        setReviewPostData(newPosts);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, showReviewForm]);
  const getUserBookReviewData = (reviewPostId: string) => {
    feedPostDetail(reviewPostId).then((res) => {
      setPostContent(res.data.message);
      setContainSpoiler(res.data.spoilers);
    });
  };

  useLayoutEffect(() => {
    if ((location.state && location.state.bookId && location.state.bookId.length) || reviewForm) {
      setShowReviewForm(true);
      getUserBookReviewData(id!);
    }
  }, [location, reviewForm, id, setShowReviewForm]);
  useEffect(() => {
    if (bookReviewData) {
      setRating(bookReviewData.userData.rating - 1);
      setGoreFactor(bookReviewData.userData.goreFactorRating - 1);
      setWorthIt(bookReviewData.userData.worthReading);
      if (bookReviewData.userData?.reviewPostId) {
        getUserBookReviewData(bookReviewData.userData?.reviewPostId);
      }
      callLatestFeedPost();
    }
  }, [bookReviewData, callLatestFeedPost]);

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    persistScrollPosition();
    if (!isValidPopOverValue(value)) {
      throw new Error(`Please call 'onPopoverClick()' with correct value! Called value: ${value}, Expected value is one of:`, validPopOverOptions as any);
    }
    // Tip: `value` has type of `PopOverValueType` here onwards because of typeguard.
    if (value === 'Edit Review') {
      setShowReviewForm(true);
      getUserBookReviewData(popoverClickProps.id!);
      getBookById(id!)
        .then((res) => setBookReviewData(res.data));
      return;
    }
    if (popoverClickProps.id) {
      setPostId(popoverClickProps.id);
    }
    if (popoverClickProps.userId) {
      setPostUserId(popoverClickProps.userId);
    }
    setShow(true);
    setDropDownValue(value);
    setDeletePostId(popoverClickProps.id);
  };

  const updateBookReview = (bookReviewPostData: any) => {
    setProgressButtonStatus('loading');
    updateFeedPost(
      bookReviewPostData.postId,
      bookReviewPostData.message,
      [],
      [],
      bookReviewPostData,
    )
      .then(async () => {
        setProgressButtonStatus('default');
        setBookReviewData({
          ...bookReviewData,
          userData: {
            ...bookReviewData.userData!,
            rating: rating + 1,
            goreFactorRating: goreFactor + 1,
            worthReading: isWorthIt,
          },
          isUpdated: true,
        });
        callLatestFeedPost();
        setErrorMessage([]);
        setShowReviewForm(false);
      })
      .catch((error) => {
        setProgressButtonStatus('failure');
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };
  const createBookReview = (bookReviewPostData: any) => {
    setProgressButtonStatus('loading');
    createPost(bookReviewPostData, '')
      .then(async () => {
        setProgressButtonStatus('default');
        setBookReviewData({
          ...bookReviewData,
          userData: {
            ...bookReviewData.userData!,
            rating: rating + 1,
            goreFactorRating: goreFactor + 1,
            worthReading: isWorthIt,
          },
          isUpdated: true,
        });
        callLatestFeedPost();
        setErrorMessage([]);
        setShowReviewForm(false);
      })
      .catch((error) => {
        setProgressButtonStatus('failure');
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };

  const addPost = () => {
    const postContentWithMentionReplacements = (postContent.replace(
      atMentionsGlobalRegex,
      generateMentionReplacementMatchFunc(formatMention),
    ));
    const bookReviewPostData = {
      message: postContentWithMentionReplacements,
      spoiler: containSpoiler,
      rate: rating + 1,
      goreFactorRate: goreFactor + 1,
      worthIt: isWorthIt,
      postType: PostType.BookReview,
      bookId: id,
    };
    if (bookReviewData.userData?.reviewPostId) {
      (bookReviewPostData as any).postId = bookReviewData.userData?.reviewPostId;
      updateBookReview(bookReviewPostData);
    } else {
      createBookReview(bookReviewPostData);
    }
    return bookReviewPostData;
  };
  const deletePostClickAsync = () => {
    setProgressButtonStatus('loading');
    if (deletePostId) {
      return deleteFeedPost(deletePostId)
        .then(async () => {
          setProgressButtonStatus('default');
          callLatestFeedPost();
          setShow(false);
          setRating(0);
          setGoreFactor(0);
          setPostContent('');
          setContainSpoiler(false);
          setBookReviewData({
            ...bookReviewData,
            userData: {
              ...bookReviewData.userData!,
              reviewPostId: '',
            },
          });
        })
        /* eslint-disable no-console */
        .catch(async (error) => {
          console.error(error);
          setProgressButtonStatus('failure');
          await sleep(500);
        });
    }
    return undefined;
  };
  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(postUserId)
      .then(() => {
        setProgressButtonStatus('default');
        setShow(false);
        setDropDownValue('BlockUserSuccess');
        setReviewPostData((prev: any) => prev.filter(
          (scrollData: any) => scrollData.userId !== postUserId,
        ));
      })
      /* eslint-disable no-console */
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        setProgressButtonStatus('failure');
      });
  };
  const afterBlockUser = () => {
    setShow(false);
  };
  const reportReview = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: postId,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res) { callLatestFeedPost(); setProgressButtonStatus('default'); }
    })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    setDropDownValue('PostReportSuccessDialog');
  };
  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        reviewPostData.length === 0
          ? 'No review posts available'
          : 'No more review posts'
      }
    </p>
  );

  const handleSpoiler = (currentPostId: string) => {
    const spoilerIdList = getLocalStorage('spoilersIds');
    if (!spoilerIdList.includes(currentPostId)) {
      spoilerIdList.push(currentPostId);
      setLocalStorage('spoilersIds', JSON.stringify(spoilerIdList));
    }
    navigate(`/app/books/${id}/reviews/${currentPostId}`);
  };

  const handlePostLike = (feedPostId: string) => {
    setReviewPostData((prevReviewPostData: any) => prevReviewPostData.map(
      (reviewPost: Post) => {
        if (reviewPost._id === feedPostId) {
          return {
            ...reviewPost,
            likeIcon: false,
            likedByUser: false,
            likeCount: reviewPost.likeCount - 1,
          };
        }
        return reviewPost;
      },
    ));
  };
  const handlePostDislike = (feedPostId: string) => {
    setReviewPostData((prevReviewPostData: any) => prevReviewPostData.map((reviewPost: Post) => {
      if (reviewPost._id === feedPostId) {
        return {
          ...reviewPost,
          likeIcon: true,
          likedByUser: true,
          likeCount: reviewPost.likeCount + 1,
        };
      }
      return reviewPost;
    }));
  };
  const onLikeClick = async (feedPostId: string) => {
    const checkLike = reviewPostData.some((post: any) => post.id === feedPostId
      && post.likeIcon);

    if (checkLike) {
      handlePostLike(feedPostId);
    } else {
      handlePostDislike(feedPostId);
    }

    const revertOptimisticUpdate = () => {
      if (checkLike) {
        handlePostDislike(feedPostId);
      } else {
        handlePostLike(feedPostId);
      }
    };

    try {
      if (checkLike) {
        await unlikeFeedPost(feedPostId);
      } else {
        await likeFeedPost(feedPostId);
      }
    } catch (error) {
      revertOptimisticUpdate();
    }
  };
  return (
    <StyledReviewContainer>
      {
        showReviewForm
          ? (
            <CreatePostComponent
              bookData={bookReviewData}
              errorMessage={errorMessage}
              setPostMessageContent={setPostContent}
              defaultValue={decryptMessage(postContent, true)}
              formatMention={formatMention}
              setFormatMention={setFormatMention}
              postType="review"
              reviewForm="book-review"
              createUpdatePost={addPost}
              containSpoiler={containSpoiler}
              setContainSpoiler={setContainSpoiler}
              rating={rating}
              setRating={setRating}
              goreFactor={goreFactor}
              setGoreFactor={setGoreFactor}
              setWorthIt={setWorthIt}
              liked={liked}
              setLike={setLike}
              disLiked={disLiked}
              setDisLike={setDisLike}
              isWorthIt={isWorthIt}
              placeHolder="Write your review here"
              setReviewForm={setReviewForm}
              setShowReviewForm={setShowReviewForm}
              handleScroll={handleScroll}
              ProgressButton={ProgressButton}
              showReviewForm={showReviewForm}
              createEditPost
            />
          ) : (
            <CustomCreatePost
              label="Write a review"
              iconClass="text-primary"
              icon={solid('paper-plane')}
              handleCreateInput={handleCreateInput}
            />
          )
      }
      <InfiniteScroll
        pageStart={0}
        initialLoad
        loadMore={() => { setRequestAdditionalReviewPosts(true); }}
        hasMore={!noMoreData}
      >
        <div className="mt-3">
          <PostFeed
            postFeedData={reviewPostData}
            postType="review"
            popoverOptions={loginUserPopoverOptions as unknown as string[]}
            isCommentSection={false}
            onPopoverClick={handlePopoverOption as any}
            otherUserPopoverOptions={otherUserPopoverOptions as unknown as string[]}
            onLikeClick={onLikeClick}
            onSelect={persistScrollPosition}
            onSpoilerClick={handleSpoiler}
            isSinglePost={false}
          />
        </div>
      </InfiniteScroll>
      {loadingReviewPosts && <LoadingIndicator />}
      {noMoreData && renderNoMoreDataMessage()}
      {
        (['Delete Review', 'Block user', 'Report', 'PostReportSuccessDialog'].includes(dropDownValue))
        && (
          <ReportModal
            onConfirmClickAsync={deletePostClickAsync}
            show={show}
            setShow={setShow}
            slectedDropdownValue={dropDownValue}
            onBlockYesClick={onBlockYesClick}
            afterBlockUser={afterBlockUser}
            handleReport={reportReview}
            ProgressButton={ProgressButton}
          />
        )
      }
    </StyledReviewContainer>
  );
}

export default BookReview;
