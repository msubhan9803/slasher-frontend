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
const CameraIcon = styled(FontAwesomeIcon)`
  height:1.25rem;
  width:1.438rem;
`;
function CreatePostInput() {
  return (
    <RoundButton variant="dark" className="w-100 border-0 p-md-0 pb-4">
      <StyledDiv className="d-flex justify-content-between px-2 py-2">
        <div>
          <CommentProfileImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle" />
          <span className="ms-2 text-light fs-5">Create a post</span>
        </div>
        <div className="align-self-center me-2 mt-1">
          <CameraIcon role="button" icon={solid('camera')} />
        </div>
      </StyledDiv>
    </RoundButton>
  );
}

export default CreatePostInput;
