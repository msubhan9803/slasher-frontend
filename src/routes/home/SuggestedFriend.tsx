import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Row } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import RoundButton from '../../components/ui/RoundButton';
import { getSuggestFriends } from '../../api/users';
import { addFriend, rejectFriendsRequest, removeSuggestedFriend } from '../../api/friends';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import UserCircleImage from '../../components/ui/UserCircleImage';

const StyleFriend = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;
  .casts-image {
    aspect-ratio: 1;
  }
  &::-webkit-scrollbar {
    display: none;
}
`;
const Card = styled.div`
  height:12.857rem;
  width:11.71rem;
  padding-right: 1rem;
`;

const slideFriendRight = () => {
  const slider = document.getElementById('slideFriend');
  if (slider !== null) {
    slider.scrollLeft += 300;
  }
};
const slideFriendLeft = () => {
  const slider = document.getElementById('slideFriend');
  if (slider !== null) {
    slider.scrollLeft -= 300;
  }
};
function SuggestedFriend() {
  const [friendListData, setFriendListData] = useState<any>();

  const getSuggestedFriends = () => {
    getSuggestFriends()
      .then((res) => setFriendListData(res.data));
  };

  useEffect(() => {
    getSuggestedFriends();
  }, []);

  const addFriendClick = (userId: string) => {
    addFriend(userId).then(() => {
      const data = friendListData?.map((friend: any) => {
        if (friend._id === userId) {
          // eslint-disable-next-line no-param-reassign
          friend.addFriend = true;
        }
        return friend;
      });
      setFriendListData(data);
    });
  };

  const cancelFriendClick = (userId: string) => {
    rejectFriendsRequest(userId).then(() => {
      getSuggestedFriends();
    });
  };

  const onCloseClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>, userId: string) => {
    e.preventDefault();
    removeSuggestedFriend(userId).then(() => {
      getSuggestedFriends();
    });
  };

  return (
    <div className="p-md-4 pt-md-1 rounded-2">
      {!friendListData ? <LoadingIndicator /> : (
        <div className="d-flex align-items-center">
          <Button aria-label="chevron left icon" className="d-block p-0 prev bg-transparent border-0 shadow-none" onClick={slideFriendLeft}>
            <FontAwesomeIcon icon={solid('chevron-left')} size="lg" className="text-white" />
          </Button>
          <StyleFriend
            id="slideFriend"
            className="d-flex flex-nowrap w-100 mx-3 g-0"
          >
            {friendListData?.map((user: any) => (
              /* eslint no-underscore-dangle: 0 */
              <Card key={user._id}>
                <div className="bg-dark rounded p-2">
                  <Link className="text-decoration-none" to={`/${user.userName}/about`}>
                    <div className=" d-flex justify-content-center position-relative">
                      <UserCircleImage size="6.25rem" src={user.profilePic} alt="suggested friend" />
                      <div className="position-absolute" style={{ right: '0' }}>
                        <FontAwesomeIcon role="button" onClick={(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => { onCloseClick(e, user._id); }} icon={solid('xmark')} size="lg" />
                      </div>
                    </div>
                    <p className="text-center my-2">{user.userName}</p>
                  </Link>
                  {user.addFriend
                    ? (
                      <RoundButton variant="black" className="w-100 fs-3" onClick={() => cancelFriendClick(user._id)}>
                        Cancel Request
                      </RoundButton>
                    )
                    : (
                      <RoundButton className="w-100 fs-3" onClick={() => addFriendClick(user._id)}>
                        Add friend
                      </RoundButton>
                    )}
                </div>
              </Card>
            ))}
          </StyleFriend>
          <Button aria-label="chevron right icon" className="d-block p-0 next bg-transparent border-0 shadow-none" onClick={slideFriendRight}>
            <FontAwesomeIcon icon={solid('chevron-right')} size="lg" className="text-white" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default SuggestedFriend;
