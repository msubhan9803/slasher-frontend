import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useSearchParams } from 'react-router-dom';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import CreatePost from '../../posts/create-post/CreatePost';
import { reviewPost } from './review-data';
import PostDetail from '../../../components/ui/post/PostDetail';

const loginUserPopoverOptions = ['Edit Review', 'Delete Rview'];
const otherUserPopoverOptions = ['Report', 'Block user'];

function MovieReviews() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReviewDetail, setShowReviewDetail] = useState(false);

  const handlePopoverOption = (value: string) => value;
  const handleCreateInput = () => {
    setShowReviewForm(true);
  };
  // const showReviewDetail = () => {

  // }
  return (
    <div>
      {!showReviewDetail && (
        queryParam === 'self'
          && !showReviewForm
          ? (
            <CustomCreatePost
              label="Write a review"
              iconClass="text-primary"
              icon={solid('paper-plane')}
              handleCreateInput={handleCreateInput}
            />
          )
          : (<CreatePost />)
      )}
      <h1 className="h2 my-3">
        Reviews
        <span className="fw-normal text-light">(999k)</span>
      </h1>
      {showReviewDetail
        ? <PostDetail postType="review" />
        : (
          <PostFeed
            postFeedData={reviewPost}
            postType="review"
            popoverOptions={loginUserPopoverOptions}
            isCommentSection={false}
            onPopoverClick={handlePopoverOption}
            otherUserPopoverOptions={otherUserPopoverOptions}
            setShowReviewDetail={setShowReviewDetail}
          />
        )}
    </div>
  );
}

export default MovieReviews;
