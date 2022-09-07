import React from 'react';
import { Button, Image } from 'react-bootstrap';
import styled from 'styled-components';
import SlasherQuestionMark from '../../../../images/slasher-question-mark.png';

interface LikesProps {
  MatchesList: LikesListProps[];
  LikesList: LikesListProps[];
  handleLikesOption: (value: string) => void;
}
interface LikesListProps {
  id: number;
  imageUrl: string;
  name: string;
  email: string;
}
const UnsubscribeProfileImage = styled.div`
  height: 3.334rem;
  width: 3.334rem;
  background-color: #171717;
`;
const StyledBorder = styled.div`
  border-bottom: 1px solid #3A3B46;
  &:last-child {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
`;
function UnsubscriberLikes({ MatchesList, LikesList, handleLikesOption }: LikesProps) {
  return (
    <>
      <div className="bg-dark bg-mobile-transparent py-4 p-lg-4 pb-lg-3 rounded-3">
        <h1 className="h2 fw-semibold mb-3">Matches</h1>
        {MatchesList.slice(0, 4).map((likesDetail: LikesListProps) => (
          <StyledBorder key={likesDetail.id} className="d-flex justify-content-between py-2">
            <Button className="px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0" onClick={() => handleLikesOption('')}>
              <UnsubscribeProfileImage className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
                <Image src={SlasherQuestionMark} alt="Unsubscribed user profile question mark" />
              </UnsubscribeProfileImage>
              <div>
                <h3 className="h3 mb-0">You’ve got a new match</h3>
                <h4 className="h5 mb-0 text-light">Just now</h4>
              </div>
            </Button>
          </StyledBorder>
        ))}
      </div>
      <div className="mt-2 mt-lg-4 bg-dark bg-mobile-transparent p-lg-4 pb-lg-3 rounded-3">
        <h1 className="h2 fw-semibold mb-3">Likes</h1>
        {LikesList.slice(0, 4).map((likesDetail: LikesListProps) => (
          <StyledBorder key={likesDetail.id} className="d-flex justify-content-between py-2">
            <Button className="px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0" onClick={() => handleLikesOption('')}>
              <UnsubscribeProfileImage className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
                <Image src={SlasherQuestionMark} alt="Unsubscribed user profile question mark" />
              </UnsubscribeProfileImage>
              <div>
                <h3 className="h3 mb-0">You’ve got a new like</h3>
                <h4 className="h5 mb-0 text-light">12 hours ago</h4>
              </div>
            </Button>
          </StyledBorder>
        ))}
      </div>
    </>
  );
}

export default UnsubscriberLikes;
