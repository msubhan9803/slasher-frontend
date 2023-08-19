/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useEffect, useLayoutEffect, useMemo, useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import CreatePostComponent from '../../../components/ui/CreatePostComponent';
import { feedPostDetail } from '../../../api/feed-posts';
import {
  FormatMentionProps,
  MovieData, MoviePageCache,
} from '../../../types';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { getLocalStorage, setLocalStorage } from '../../../utils/localstorage-utils';
import { getPageStateCache, hasPageStateCache, setPageStateCache } from '../../../pageStateCache';
import useProgressButton from '../../../components/ui/ProgressButton';
import { bookReviewList } from '../components/booksList';
import { decryptMessage } from '../../../utils/text-utils';

type Props = {
  bookReviewData: MovieData;
  setBookReviewData: React.Dispatch<React.SetStateAction<MovieData | undefined>>;
  reviewForm: boolean;
  setReviewForm: (value: boolean) => void;
  handleScroll: () => void;
  showReviewForm: boolean;
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
  const [errorMessage, setErrorMessage] = useState([]);
  const [postContent, setPostContent] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [containSpoiler, setContainSpoiler] = useState<boolean>(false);
  const [rating, setRating] = useState(0);
  const [goreFactor, setGoreFactor] = useState(0);
  const [requestAdditionalReviewPosts, setRequestAdditionalReviewPosts] = useState<boolean>(false);
  const [loadingReviewPosts, setLoadingReviewPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [isWorthIt, setWorthIt] = useState<any>(0);
  const [liked, setLike] = useState<boolean>(false);
  const [disLiked, setDisLike] = useState<boolean>(false);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
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
  }, [location, reviewForm, id, setShowReviewForm]);

  const persistScrollPosition = () => {
    setPageStateCache<MoviePageCache>(location, {
      ...getPageStateCache(location),
      reviews: reviewPostData,
    });
  };

  const handlePopoverOption = (value: string) => {
    if (!isValidPopOverValue(value)) {
      throw new Error(`Please call 'onPopoverClick()' with correct value! Called value: ${value}, Expected value is one of:`, validPopOverOptions as any);
    }
  };

  const addPost = () => {

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

  const onLikeClick = async () => {

  };
  return (
    <StyledReviewContainer>
      {
        showReviewForm
          ? (
            <CreatePostComponent
              movieData={bookReviewData}
              errorMessage={errorMessage}
              setPostMessageContent={setPostContent}
              defaultValue={decryptMessage(postContent, true)}
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
            postFeedData={bookReviewList}
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
    </StyledReviewContainer>
  );
}

export default BookReview;
