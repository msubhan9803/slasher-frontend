/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useLayoutEffect, useMemo, useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import CreatePostComponent from '../../../components/ui/CreatePostComponent';
import {
  createPost, deleteFeedPost, feedPostDetail, getMovieReview, updateFeedPost,
} from '../../../api/feed-posts';
import {
  FormatMentionProps,
  FriendRequestReaction,
  FriendType,
  MovieData, MoviePageCache, Post, PostType,
} from '../../../types';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import ReportModal from '../../../components/ui/ReportModal';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { getLocalStorage, setLocalStorage } from '../../../utils/localstorage-utils';
import { getMoviesById } from '../../../api/movies';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';
import { getPageStateCache, hasPageStateCache, setPageStateCache } from '../../../pageStateCache';
import useProgressButton from '../../../components/ui/ProgressButton';
import { sleep } from '../../../utils/timer-utils';
import { atMentionsGlobalRegex, decryptMessage, generateMentionReplacementMatchFunc } from '../../../utils/text-utils';
import FriendshipStatusModal from '../../../components/ui/friendShipCheckModal';
import { useAppSelector } from '../../../redux/hooks';

type Props = {
  movieData: MovieData;
  setMovieData: React.Dispatch<React.SetStateAction<MovieData | undefined>>;
  reviewForm: boolean;
  setReviewForm: (value: boolean) => void;
  handleScroll: () => void;
  showReviewForm: boolean;
  setShowReviewForm: (value: boolean) => void;
};

export const StyledReviewContainer = styled.div`
  min-height: 60vh;
`;

const loginUserPopoverOptions = ['Edit Review', 'Delete Review'] as const;
const otherUserPopoverOptions = ['Report', 'Block user'] as const;
const validPopOverOptions = [...loginUserPopoverOptions, ...otherUserPopoverOptions] as const;
type PopOverValueType = typeof validPopOverOptions[number];
// Using typeguard to get typesafe value
// eslint-disable-next-line max-len
const isValidPopOverValue = (v: string): v is PopOverValueType => validPopOverOptions.includes(v as any);

function MovieReviews({
  movieData, setMovieData, reviewForm, setReviewForm, handleScroll, showReviewForm,
  setShowReviewForm,
}: Props) {
  const { id } = useParams();
  const location = useLocation();
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState([]);
  const [postUserId, setPostUserId] = useState<string>('');
  const [postId, setPostId] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [containSpoiler, setContainSpoiler] = useState<boolean>(false);
  const [rating, setRating] = useState(0);
  const [goreFactor, setGoreFactor] = useState(0);
  const [deletePostId, setDeletePostId] = useState<any>([]);
  const [requestAdditionalReviewPosts, setRequestAdditionalReviewPosts] = useState<boolean>(false);
  const [loadingReviewPosts, setLoadingReviewPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [lastReviewPostId, setLastReviePostId] = useState<string>('');
  const [isWorthIt, setWorthIt] = useState<any>(0);
  const [liked, setLike] = useState<boolean>(false);
  const [disLiked, setDisLike] = useState<boolean>(false);
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [friendData, setFriendData] = useState<FriendType>(null);
  const [friendShipStatusModal, setFriendShipStatusModal] = useState<boolean>(false);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  // eslint-disable-next-line max-len
  const ReviewsCache: MoviePageCache['reviews'] = useMemo(() => getPageStateCache<MoviePageCache>(location)?.reviews ?? [], [location]);
  const [reviewPostData, setReviewPostData] = useState<any>(
    hasPageStateCache(location)
      ? ReviewsCache : [],
  );
  const userData = useAppSelector((state) => state.user.user);

  const navigate = useNavigate();
  const handleCreateInput = () => {
    setShowReviewForm(true);
  };
  useEffect(() => {
    if (hasPageStateCache(location)) {
      setReviewPostData(ReviewsCache);
    }
  }, [location, ReviewsCache]);

  const getUserMovieReviewData = (reviewPostId: string) => {
    feedPostDetail(reviewPostId).then((res) => {
      setPostContent(res.data.message);
      setContainSpoiler(res.data.spoilers);
    });
  };
  useLayoutEffect(() => {
    if ((location.state && location.state.movieId && location.state.movieId.length) || reviewForm) {
      setShowReviewForm(true);
      getUserMovieReviewData(id!);
    }
  }, [location, reviewForm, id, setShowReviewForm]);

  const callLatestFeedPost = useCallback(() => {
    if (id) {
      getMovieReview(id).then((res) => {
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
          worthWatching: data?.reviewData?.worthWatching || 0,
          contentHeading: data.title,
          movieId: id,
          spoilers: data.spoilers,
          hashtags: data.hashtags,
        }));
        setReviewPostData(newPosts);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, showReviewForm]);

  useEffect(() => {
    if (movieData) {
      setRating(movieData.userData.rating - 1);
      setGoreFactor(movieData.userData.goreFactorRating - 1);
      setWorthIt(movieData.userData.worthWatching);
      if (movieData.userData?.reviewPostId) {
        getUserMovieReviewData(movieData.userData?.reviewPostId);
      }
      callLatestFeedPost();
    }
  }, [movieData, callLatestFeedPost]);

  const persistScrollPosition = () => {
    setPageStateCache<MoviePageCache>(location, {
      ...getPageStateCache(location),
      reviews: reviewPostData,
    });
  };

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    persistScrollPosition();
    if (!isValidPopOverValue(value)) {
      throw new Error(`Please call 'onPopoverClick()' with correct value! Called value: ${value}, Expected value is one of:`, validPopOverOptions as any);
    }
    // Tip: `value` has type of `PopOverValueType` here onwards because of typeguard.
    if (value === 'Edit Review') {
      setShowReviewForm(true);
      getUserMovieReviewData(popoverClickProps.id!);
      getMoviesById(id!)
        .then((res) => setMovieData(res.data));
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

  const createMovieReview = (movieReviewPostData: object) => {
    setProgressButtonStatus('loading');
    createPost(movieReviewPostData, '')
      .then(async () => {
        setProgressButtonStatus('default');
        setMovieData({
          ...movieData,
          userData: {
            ...movieData.userData!,
            rating: rating + 1,
            goreFactorRating: goreFactor + 1,
            worthWatching: isWorthIt,
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

  const updateMovieReview = (movieReviewPostData: any) => {
    setProgressButtonStatus('loading');
    updateFeedPost(
      movieReviewPostData.postId,
      movieReviewPostData.message,
      [],
      [],
      movieReviewPostData,
    )
      .then(async () => {
        setProgressButtonStatus('default');
        setMovieData({
          ...movieData,
          userData: {
            ...movieData.userData!,
            rating: rating + 1,
            goreFactorRating: goreFactor + 1,
            worthWatching: isWorthIt,
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
    const movieReviewPostData = {
      message: postContentWithMentionReplacements,
      spoiler: containSpoiler,
      rate: rating + 1,
      goreFactorRate: goreFactor + 1,
      worthIt: isWorthIt,
      postType: PostType.MovieReview,
      movieId: id,
    };
    if (movieData.userData?.reviewPostId) {
      (movieReviewPostData as any).postId = movieData.userData?.reviewPostId;
      updateMovieReview(movieReviewPostData);
    } else {
      createMovieReview(movieReviewPostData);
    }
    return movieReviewPostData;
  };

  useEffect(() => {
    if (requestAdditionalReviewPosts && !loadingReviewPosts && id && lastReviewPostId) {
      setLoadingReviewPosts(false);
      getMovieReview(
        id,
        lastReviewPostId.length > 0 ? lastReviewPostId : undefined,
      ).then((res) => {
        // setLoadingReviewPosts(false);
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
          worthWatching: data?.reviewData?.worthWatching || 0,
          contentHeading: data.title,
          movieId: id,
          spoilers: data.spoilers,
          hashtags: data?.hashtags,
        }));
        setReviewPostData((prev: Post[]) => [
          ...prev,
          ...newPosts,
        ]);
        if (res.data.length === 0) {
          setNoMoreData(true);
          setLastReviePostId('');
          setLoadingReviewPosts(false);
        } else {
          setLastReviePostId(res.data[res.data.length - 1]._id);
        }
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => { setRequestAdditionalReviewPosts(false); setLoadingReviewPosts(false); },
      );
    }
  }, [requestAdditionalReviewPosts, loadingReviewPosts, id, lastReviewPostId, movieData]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        reviewPostData.length === 0
          ? 'No review posts available'
          : 'No more review posts'
      }
    </p>
  );
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
    // Ask to block user as well
    setDropDownValue('PostReportSuccessDialog');
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
          setMovieData({
            ...movieData,
            userData: {
              ...movieData.userData!,
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
  const handleSpoiler = (currentPostId: string) => {
    const spoilerIdList = getLocalStorage('spoilersIds');
    if (!spoilerIdList.includes(currentPostId)) {
      spoilerIdList.push(currentPostId);
      setLocalStorage('spoilersIds', JSON.stringify(spoilerIdList));
    }
    navigate(`/app/movies/${id}/reviews/${currentPostId}`);
  };

  const afterBlockUser = () => {
    setShow(false);
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
              movieData={movieData}
              errorMessage={errorMessage}
              setPostMessageContent={setPostContent}
              defaultValue={decryptMessage(postContent, true, true)}
              formatMention={formatMention}
              setFormatMention={setFormatMention}
              postType="review"
              reviewForm="movie-review"
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

      {friendShipStatusModal && !userData.ignoreFriendSuggestionDialog && (
        <FriendshipStatusModal
          friendShipStatusModal={friendShipStatusModal}
          setFriendShipStatusModal={setFriendShipStatusModal}
          friendStatus={friendStatus}
          setFriendStatus={setFriendStatus}
          setFriendData={setFriendData}
          friendData={friendData}
          userId={postUserId}
        />
      )}
    </StyledReviewContainer>
  );
}

export default MovieReviews;
