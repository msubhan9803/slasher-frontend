import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import CircleButton from '../../../components/ui/CircleButton';
import CustomPopover from '../../../components/ui/CustomPopover';

const Container = styled.div`
  background: #1F1F1F;
`;
const ProfileImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;
function FriendsProfileCard({
  friend, popoverOption, handleFriendsOption, friendsType,
}: any) {
  return (
    <Container className="d-flex p-2 justify-content-between pe-2 w-100 rounded mb-3">
      <div>
        <div className="d-flex align-items-center">
          <div>
            <ProfileImage src={friend.imageUrl} className="rounded-circle me-2" />
          </div>
          <div>
            <h1 className="h3 mb-0">{friend.name}</h1>
            <p className="fs-6 mb-0 text-light">{friend.email}</p>
          </div>
        </div>
      </div>
      <div className="d-flex align-self-center">
        {friendsType === 'my-friends' ? (
          <CustomPopover popoverOptions={popoverOption} onPopoverClick={handleFriendsOption} />
        ) : (
          <>
            <CircleButton variant="black" className="me-2 text-success" icon={solid('check')} />
            <CircleButton variant="black" className="me-2 text-primary" icon={solid('times')} />
          </>
        )}
      </div>
    </Container>
  );
}

FriendsProfileCard.defaultProps = {
  friendsType: '',
};

export default FriendsProfileCard;
