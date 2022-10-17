import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import styled from 'styled-components';
import CircleButton from '../../../components/ui/CircleButton';
import CustomPopover from '../../../components/ui/CustomPopover';
import UserCircleImage from '../../../components/ui/UserCircleImage';

const Container = styled.div`
  background: #1F1F1F;
`;
function FriendsProfileCard({
  friend, popoverOption, handlePopoverOption, friendsType,
}: any) {
  // console.log(friend, 'friend');

  return (
    <Container className="d-flex p-2 justify-content-between pe-2 w-100 rounded mb-3">
      <div>
        <div className="d-flex align-items-center">
          <div>
            <UserCircleImage src={friend.profilePic} className="me-2" />
          </div>
          <div>
            <h1 className="h3 mb-0">{friend.userName}</h1>
            <p className="fs-6 mb-0 text-light">
              @
              {friend.userName}
            </p>
          </div>
        </div>
      </div>
      <div className="d-flex align-self-center">
        {friendsType === 'requested' ? (
          <>
            <CircleButton variant="black" className="me-2 text-success" icon={solid('check')} />
            <CircleButton variant="black" className="me-2 text-primary" icon={solid('times')} />
          </>
        ) : (
          <CustomPopover popoverOptions={popoverOption} onPopoverClick={handlePopoverOption} />
        )}
      </div>
    </Container>
  );
}

FriendsProfileCard.defaultProps = {
  friendsType: 'my-friends',
};

export default FriendsProfileCard;
