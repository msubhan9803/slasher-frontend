/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useLayoutEffect, useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import CreatePostComponent from '../../../components/ui/CreatePostComponent';
import { FormatMentionProps } from '../../posts/create-post/CreatePost';
import {
  createPost, deleteFeedPost, feedPostDetail, getMovieReview, updateFeedPost,
} from '../../../api/feed-posts';
import {
  MovieData, Post, PostType,
} from '../../../types';
import FormatImageVideoList from '../../../utils/vido-utils';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import { useAppDispatch } from '../../../redux/hooks';
import ReportModal from '../../../components/ui/ReportModal';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { getLocalStorage, setLocalStorage } from '../../../utils/localstorage-utils';
import { getMoviesById } from '../../../api/movies';

type Props = {
  movieData: MovieData;
  setMovieData: React.Dispatch<React.SetStateAction<MovieData | undefined>>;
  reviewForm: boolean;
  setReviewForm: (value: boolean) => void;
};

const loginUserPopoverOptions = ['Edit Review', 'Delete Review'];
const otherUserPopoverOptions = ['Report', 'Block user'];

function MovieReviews({
  movieData, setMovieData, reviewForm, setReviewForm,
}: Props) {
  const { id } = useParams();
  const location = useLocation();
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [postContent, setPostContent] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [containSpoiler, setContainSpoiler] = useState<boolean>(false);
  const [rating, setRating] = useState(0);
  const [goreFactor, setGoreFactor] = useState(0);
  const [reviewPostData, setReviewPostData] = useState<any>([]);
  const [deletePostId, setDeletePostId] = useState<any>([]);
  const [requestAdditionalReviewPosts, setRequestAdditionalReviewPosts] = useState<boolean>(false);
  const [loadingReviewPosts, setLoadingReviewPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [lastReviewPostId, setLastReviePostId] = useState<string>('');
  const [isWorthIt, setWorthIt] = useState<any>(0);
  const [liked, setLike] = useState<boolean>(false);
  const [disLiked, setDisLike] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const handleCreateInput = () => {
    setShowReviewForm(true);
  };

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
          content: data.message,
          images: FormatImageVideoList(data.images, data.message),
          userName: data.userId.userName,
          profileImage: data.userId.profilePic,
          userId: data.userId._id,
          likeIcon: data.likedByUser,
          likeCount: data.likeCount,
          commentCount: data.commentCount,
          rating: data?.reviewData.rating || 0,
          goreFactor: data?.reviewData.goreFactorRating || 0,
          worthWatching: data?.reviewData.worthWatching || 0,
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

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    setShow(true);
    if (value === 'Delete Review') {
      setDropDownValue('Delete');
    } else {
      setDropDownValue('Edit');
    }
    setDeletePostId(popoverClickProps.id);
    if (value === 'Edit Review') {
      setShowReviewForm(true);
      getUserMovieReviewData(popoverClickProps.id!);
      getMoviesById(id!)
        .then((res) => setMovieData(res.data));
    }
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
          content: data.message,
          images: FormatImageVideoList(data.images, data.message),
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
  const persistScrollPosition = (movieId: string) => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset,
      data: reviewPostData,
      positionElementId: movieId,
    };
    dispatch(setScrollPosition(positionData));
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
  const handleSpoiler = (postId: string) => {
    const spoilerIdList = getLocalStorage('spoilersIds');
    if (!spoilerIdList.includes(postId)) {
      spoilerIdList.push(postId);
      setLocalStorage('spoilersIds', JSON.stringify(spoilerIdList));
    }
    navigate(`/app/movies/${id}/reviews/${postId}`);
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
    <div>
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
            popoverOptions={loginUserPopoverOptions}
            isCommentSection={false}
            onPopoverClick={handlePopoverOption}
            otherUserPopoverOptions={otherUserPopoverOptions}
            onLikeClick={onLikeClick}
            onSelect={persistScrollPosition}
            onSpoilerClick={handleSpoiler}
          />
        </div>
      </InfiniteScroll>
      {loadingReviewPosts && <LoadingIndicator />}
      {noMoreData && renderNoMoreDataMessage()}
      {
        dropDownValue === 'Delete'
        && (
          <ReportModal
            onConfirmClick={deletePostClick}
            show={show}
            setShow={setShow}
            slectedDropdownValue={dropDownValue}
          />
        )
      }
    </div>
  );
}

export default MovieReviews;
