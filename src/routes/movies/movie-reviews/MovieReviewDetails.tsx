import React from 'react';
import PostDetail from '../../../components/ui/post/PostDetail';
import { StyledReviewContainer } from './MovieReviews';

function MovieReviewDetails() {
  return (
    <StyledReviewContainer>
      <PostDetail postType="review" />
    </StyledReviewContainer>
  );
}

export default MovieReviewDetails;
