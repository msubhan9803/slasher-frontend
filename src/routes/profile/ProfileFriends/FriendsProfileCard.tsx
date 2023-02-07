import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import CircleButton from '../../../components/ui/CircleButton';
import CustomPopover from '../../../components/ui/CustomPopover';
import UserCircleImage from '../../../components/ui/UserCircleImage';

const Container = styled.div`
  background: #1F1F1F;
`;
function FriendsProfileCard({
  friend, popoverOption, handlePopoverOption, friendsType, onAcceptClick, onRejectClick,
}: any) {
  return (
    <Container className="d-flex p-2 justify-content-between pe-2 w-100 rounded mb-3">
      <div>
        <div className="d-flex align-items-center">
          <Link to={`/${friend.userName}`} className="text-decoration-none">
            <div>
              <UserCircleImage src={friend.profilePic} alt="user picture" className="me-2" />
            </div>
          </Link>

          <Link to={`/${friend.userName}`} className="text-decoration-none">
            <div className="d-grid">
              <h1 className="h3 mb-0 text-truncate">{friend.firstName}</h1>
              <p className="fs-6 mb-0 text-light text-truncate">
                @
                {friend.userName}
              </p>
            </div>
          </Link>
        </div>
      </div>
      <div className="d-flex align-self-center">
        {friendsType === 'requested' ? (
          <>
            <CircleButton
              variant="black"
              className="me-2 text-success"
              icon={solid('check')}
              /* eslint no-underscore-dangle: 0 */
              userId={friend._id}
              onAcceptRejectClick={onAcceptClick}
              label="check icon"
            />
            <CircleButton
              variant="black"
              className="me-2 text-primary"
              icon={solid('times')}
              /* eslint no-underscore-dangle: 0 */
              userId={friend._id}
              onAcceptRejectClick={onRejectClick}
              label="times icon"
            />
          </>
        ) : (
          <CustomPopover
            userName={friend.userName}
            popoverOptions={popoverOption}
            onPopoverClick={handlePopoverOption}
            id={friend._id}
          />
        )}
      </div>
    </Container>
  );
}

FriendsProfileCard.defaultProps = {
  friendsType: 'my-friends',
};

export default FriendsProfileCard;
