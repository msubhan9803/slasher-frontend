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
import { FormatMentionProps } from '../../posts/create-post/CreatePost';
import {
  createPost, deleteFeedPost, feedPostDetail, getMovieReview, updateFeedPost,
} from '../../../api/feed-posts';
import {
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

type Props = {
  movieData: MovieData;
  setMovieData: React.Dispatch<React.SetStateAction<MovieData | undefined>>;
  reviewForm: boolean;
  setReviewForm: (value: boolean) => void;
  handleScroll: () => void;
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

function MovieReviews({
  movieData, setMovieData, reviewForm, setReviewForm, handleScroll,
}: Props) {
  const { id } = useParams();
  const location = useLocation();
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);
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
  // eslint-disable-next-line max-len
  const ReviewsCache: MoviePageCache['reviews'] = useMemo(() => getPageStateCache<MoviePageCache>(location)?.reviews ?? [], [location]);
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
  }, [location, reviewForm, id]);

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
        }));
        setReviewPostData(newPosts);
      });
    }
  }, [id]);

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
  const mentionReplacementMatchFunc = (match: string) => {
    if (match) {
      const finalString: any = formatMention.find(
        (matchMention: FormatMentionProps) => match.includes(matchMention.value),
      );
      if (finalString) {
        return finalString.format;
      }
      return match;
    }
    return undefined;
  };

  const createMovieReview = (movieReviewPostData: object) => {
    createPost(movieReviewPostData, '')
      .then(() => {
        setMovieData({
          ...movieData,
          userData: {
            ...movieData.userData!,
            rating: rating + 1,
            goreFactorRating: goreFactor + 1,
            worthWatching: isWorthIt,
          },
        });
        callLatestFeedPost();
        setErrorMessage([]);
        setShowReviewForm(false);
      })
      .catch((error) => {
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };

  const updateMovieReview = (movieReviewPostData: any) => {
    updateFeedPost(
      movieReviewPostData.postId,
      movieReviewPostData.message,
      [],
      [],
      movieReviewPostData,
    )
      .then(() => {
        setMovieData({
          ...movieData,
          userData: {
            ...movieData.userData!,
            rating: rating + 1,
            goreFactorRating: goreFactor + 1,
            worthWatching: isWorthIt,
          },
        });
        callLatestFeedPost();
        setErrorMessage([]);
        setShowReviewForm(false);
      })
      .catch((error) => {
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };

  const addPost = () => {
    /* eslint no-useless-escape: 0 */
    const postContentWithMentionReplacements = (postContent.replace(/(?<!\S)@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
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
    createBlockUser(postUserId)
      .then(() => {
        setShow(false);
        setDropDownValue('BlockUserSuccess');
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  const reportReview = (reason: string) => {
    const reportPayload = {
      targetId: postId,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res.status === 200) { callLatestFeedPost(); }
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
    // Ask to block user as well
    setDropDownValue('PostReportSuccessDialog');
  };

  const deletePostClick = () => {
    if (deletePostId) {
      deleteFeedPost(deletePostId)
        .then(() => {
          setShow(false);
          callLatestFeedPost();
          setRating(0);
          setGoreFactor(0);
          setPostContent('');
          setContainSpoiler(false);
        })
        /* eslint-disable no-console */
        .catch((error) => console.error(error));
    }
  };
  const handleSpoiler = (currentPostId: string) => {
    const spoilerIdList = getLocalStorage('spoilersIds');
    if (!spoilerIdList.includes(currentPostId)) {
      spoilerIdList.push(currentPostId);
      setLocalStorage('spoilersIds', JSON.stringify(spoilerIdList));
    }
    navigate(`/app/movies/${id}/reviews/${currentPostId}`);
  };

  const onLikeClick = (feedPostId: string) => {
    const checkLike = reviewPostData.some((post: any) => post.id === feedPostId
      && post.likeIcon);
    if (checkLike) {
      unlikeFeedPost(feedPostId).then((res) => {
        if (res.status === 200) {
          const unLikePostData = reviewPostData.map(
            (unLikePost: Post) => {
              if (unLikePost._id === feedPostId) {
                return {
                  ...unLikePost,
                  likeIcon: false,
                  likedByUser: false,
                  likeCount: unLikePost.likeCount - 1,
                };
              }
              return unLikePost;
            },
          );
          setReviewPostData(unLikePostData);
        }
      });
    } else {
      likeFeedPost(feedPostId).then((res) => {
        if (res.status === 201) {
          const likePostData = reviewPostData.map((likePost: Post) => {
            if (likePost._id === feedPostId) {
              return {
                ...likePost,
                likeIcon: true,
                likedByUser: true,
                likeCount: likePost.likeCount + 1,
              };
            }
            return likePost;
          });
          setReviewPostData(likePostData);
        }
      });
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
              defaultValue={postContent}
              formatMention={formatMention}
              setFormatMention={setFormatMention}
              postType="review"
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
              reviewForm={reviewForm}
              setReviewForm={setReviewForm}
              setShowReviewForm={setShowReviewForm}
              handleScroll={handleScroll}
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
            onConfirmClick={deletePostClick}
            show={show}
            setShow={setShow}
            slectedDropdownValue={dropDownValue}
            onBlockYesClick={onBlockYesClick}
            handleReport={reportReview}
          />
        )
      }
    </StyledReviewContainer>
  );
}

export default MovieReviews;
