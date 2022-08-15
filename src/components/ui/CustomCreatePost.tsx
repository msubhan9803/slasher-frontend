import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from './RoundButton';

const CommentProfileImage = styled(Image)`
  height:2.5rem;
  width:2.5rem;
`;
const StyledDiv = styled.div`
  border : 1px solid #3A3B46;
  border-radius: 6.25rem;
`;
function CustomCreatePost() {
  return (
    <RoundButton className="w-100 bg-transparent border-0 p-md-0 pb-4 ">
      <StyledDiv className="d-flex justify-content-between px-2 py-2 bg-dark">
        <div>
          <CommentProfileImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle" />
          <span className="ms-2 text-light fs-5">Create a post</span>
        </div>
        <div className="align-self-center me-2 text-white">
          <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" />
        </div>
      </StyledDiv>
    </RoundButton>
  );
}

export default CustomCreatePost;
