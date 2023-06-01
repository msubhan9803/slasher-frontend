import React, { useEffect } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import CircleButton from '../../../components/ui/CircleButton';
import CustomPopover from '../../../components/ui/CustomPopover';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import { useAppSelector } from '../../../redux/hooks';

const Container = styled.div`
  background: #1F1F1F;
`;
function FriendsProfileCard({
  friend, popoverOption, handlePopoverOption, friendsType, onAcceptClick,
  onRejectClick, onSelect,
}: any) {
  const location = useLocation();
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const userData = useAppSelector((state) => state.user);
  useEffect(() => {
    if (scrollPosition.position > 0
      && scrollPosition?.pathname === location.pathname) {
      window.scrollTo({
        top: scrollPosition?.position,
        behavior: 'instant' as any,
      });
    }
  }, [scrollPosition, location.pathname]);
  return (
    <Container className="d-flex p-2 justify-content-between pe-2 w-100 rounded mb-3">
      <div>
        <div className="d-flex align-items-center">
          <Link to={`/${friend.userName}`} onClick={() => onSelect(friend.id)} className="rounded-circle me-2 text-decoration-none">
            <div>
              <UserCircleImage src={friend.profilePic} alt="user picture" className="d-flex" />
            </div>
          </Link>

          <Link to={`/${friend.userName}`} onClick={() => onSelect(friend.id)} className="text-decoration-none">
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
              userId={friend._id}
              onAcceptRejectClick={onAcceptClick}
              label="accept friend request"
            />
            <CircleButton
              variant="black"
              className="me-2 text-primary"
              icon={solid('times')}
              userId={friend._id}
              onAcceptRejectClick={onRejectClick}
              label="reject friend request"
            />
          </>
        ) : (
          userData.user.id !== friend._id && (
          <CustomPopover
            userName={friend.userName}
            popoverOptions={popoverOption}
            onPopoverClick={handlePopoverOption}
            id={friend._id}
            userId={friend._id}
          />
          )
        )}
      </div>
    </Container>
  );
}

FriendsProfileCard.defaultProps = {
  friendsType: 'my-friends',
};

export default FriendsProfileCard;
