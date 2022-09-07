import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import RoundButton from './RoundButton';
import UserCircleImage from './UserCircleImage';

interface Props {
  imageUrl: string
}
const StyledDiv = styled.div`
  border : 1px solid #3A3B46;
  border-radius: 6.25rem;
`;
function CustomCreatePost({ imageUrl }: Props) {
  return (
    <RoundButton className="w-100 bg-transparent border-0 p-md-0 pb-4 ">
      <StyledDiv className="d-flex justify-content-between px-2 py-2 bg-dark">
        <div>
          <UserCircleImage size="2.5rem" src={imageUrl} />
          <span className="ms-2 text-light fs-5">Create a post</span>
        </div>
        <div className="align-self-center me-2">
          <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" className="text-white" />
        </div>
      </StyledDiv>
    </RoundButton>
  );
}

export default CustomCreatePost;
