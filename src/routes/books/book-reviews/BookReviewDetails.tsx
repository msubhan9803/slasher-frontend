import React from 'react';
import styled from 'styled-components';
import PostDetail from '../../../components/ui/post/PostDetail';

const StyledReviewContainer = styled.div`
  min-height:100vh;
`;
function BookReviewDetails() {
  return (
    <StyledReviewContainer>
      <PostDetail reviewDetail="book-review" />
    </StyledReviewContainer>
  );
}

export default BookReviewDetails;
