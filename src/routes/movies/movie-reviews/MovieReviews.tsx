import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import CreatePost from '../../posts/create-post/CreatePost';
import { reviewPost } from './review-data';

const loginUserPopoverOptions = ['Edit Review', 'Delete Rview'];
const otherUserPopoverOptions = ['Report', 'Block user'];

function MovieReviews() {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handlePopoverOption = (value: string) => value;
  const handleCreateInput = () => {
    setShowReviewForm(true);
  };
  return (
    <div>
      {
        showReviewForm
          ? <CreatePost />
          : (
            <CustomCreatePost
              label="Write a review"
              iconClass="text-primary"
              icon={solid('paper-plane')}
              handleCreateInput={handleCreateInput}
            />
          )
      }
      <PostFeed
        postFeedData={reviewPost}
        postType="review"
        popoverOptions={loginUserPopoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
        otherUserPopoverOptions={otherUserPopoverOptions}
      />

    </div>
  );
}

export default MovieReviews;
