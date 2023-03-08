/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocation, useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import CreatePostComponent from '../../../components/ui/CreatePostComponent';
import { FormatMentionProps } from '../../posts/create-post/CreatePost';
import {
  createPost, feedPostDetail, getMovieReview, updateFeedPost,
} from '../../../api/feed-posts';
import { MovieData, Post, PostType } from '../../../types';
import FormatImageVideoList from '../../../utils/vido-utils';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import { useAppDispatch } from '../../../redux/hooks';

type Props = {
  movieData: MovieData;
  setMovieData: React.Dispatch<React.SetStateAction<MovieData | undefined>>;
};

const loginUserPopoverOptions = ['Edit Review', 'Delete Review'];
const otherUserPopoverOptions = ['Report', 'Block user'];

function MovieReviews({ movieData, setMovieData }: Props) {
  const { id } = useParams();
  const location = useLocation();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [postContent, setPostContent] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [titleContent, setTitleContent] = useState<string>('');
  const [containSpoiler, setContainSpoiler] = useState<boolean>(false);
  const [rating, setRating] = useState(0);
  const [goreFactor, setGoreFactor] = useState(0);
  const [reviewPostData, setReviewPostData] = useState<any>([]);
  const [requestAdditionalReviewPosts, setRequestAdditionalReviewPosts] = useState<boolean>(false);
  const [loadingReviewPosts, setLoadingReviewPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const dispatch = useAppDispatch();
  const [lastReviePostId, setLastReviePostId] = useState<string>('');
  const handlePopoverOption = (value: string) => value;
  const handleCreateInput = () => {
    setShowReviewForm(true);
  };

  const getUserMovieReviewData = (reviewPostId: string) => {
    feedPostDetail(reviewPostId).then((res) => {
      setTitleContent(res.data.title);
      setPostContent(res.data.message);
      setContainSpoiler(res.data.spoilers);
    });
  };

  useEffect(() => {
    if (movieData) {
      setRating(movieData.userData.rating - 1);
      setGoreFactor(movieData.userData.goreFactorRating - 1);
      if (movieData.userData?.reviewPostId) {
        getUserMovieReviewData(movieData.userData?.reviewPostId);
      }
    }
  }, [movieData]);

  const mentionReplacementMatchFunc = (match: string) => {
    if (match) {
      const finalString: any = formatMention.find(
        (matchMention: FormatMentionProps) => match.includes(matchMention.value),
      );
      return finalString.format;
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
          },
        });
        setErrorMessage([]);
        setShowReviewForm(false);
      })
      .catch((error) => {
        setErrorMessage(error.response.data.message);
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
          },
        });
        setErrorMessage([]);
        setShowReviewForm(false);
      })
      .catch((error) => {
        setErrorMessage(error.response.data.message);
      });
  };

  const addPost = () => {
    /* eslint no-useless-escape: 0 */
    const postContentWithMentionReplacements = (postContent.replace(/\@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    const movieReviewPostData = {
      title: titleContent,
      message: postContentWithMentionReplacements,
      spoiler: containSpoiler,
      rate: rating + 1,
      goreFactorRate: goreFactor + 1,
      worthIt: movieData && movieData.worthWatching,
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
    if (requestAdditionalReviewPosts && !loadingReviewPosts && id) {
      getMovieReview(
        id,
        lastReviePostId.length > 0 ? lastReviePostId : undefined,
      ).then((res) => {
        setLoadingReviewPosts(false);
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
          rating: data.reviewData.rating,
          goreFactor: data.reviewData.goreFactorRating,
          worthWatching: data.reviewData.worthWatching,
          contentHeading: data.title,
          movieId: id,
        }));
        setLoadingReviewPosts(false);
        setReviewPostData((prev: Post[]) => [
          ...prev,
          ...newPosts,
        ]);
        if (res.data.length === 0) {
          setNoMoreData(true);
          setLastReviePostId('');
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
  }, [requestAdditionalReviewPosts, loadingReviewPosts, id, lastReviePostId]);
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
              setMovieData={setMovieData}
              errorMessage={errorMessage}
              setPostMessageContent={setPostContent}
              defaultValue={postContent}
              formatMention={formatMention}
              setFormatMention={setFormatMention}
              postType="review"
              titleContent={titleContent}
              setTitleContent={setTitleContent}
              createUpdatePost={addPost}
              containSpoiler={containSpoiler}
              setContainSpoiler={setContainSpoiler}
              rating={rating}
              setRating={setRating}
              goreFactor={goreFactor}
              setGoreFactor={setGoreFactor}
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
        <PostFeed
          postFeedData={reviewPostData}
          postType="review"
          popoverOptions={loginUserPopoverOptions}
          isCommentSection={false}
          onPopoverClick={handlePopoverOption}
          otherUserPopoverOptions={otherUserPopoverOptions}
          onLikeClick={onLikeClick}
          onSelect={persistScrollPosition}
        />
      </InfiniteScroll>
      {loadingReviewPosts && <LoadingIndicator />}
      {noMoreData && renderNoMoreDataMessage()}
    </div>
  );
}

export default MovieReviews;
