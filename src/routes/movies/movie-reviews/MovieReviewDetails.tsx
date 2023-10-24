import React from 'react';
import styled from 'styled-components';
import PostDetail from '../../../components/ui/post/PostDetail';

const StyledReviewContainer = styled.div`
  min-height:100vh;
`;
function MovieReviewDetails() {
  return (
    <StyledReviewContainer>
      <PostDetail reviewDetail="movie-review" postType="review" />
    </StyledReviewContainer>
  );
}

export default MovieReviewDetails;
