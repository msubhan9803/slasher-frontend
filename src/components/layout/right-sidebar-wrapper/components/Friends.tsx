import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getUsersFriends } from '../../../../api/users';
import { User } from '../../../../types';
import LoadingIndicator from '../../../ui/LoadingIndicator';
import FriendCircleWithLabel from './FriendCircleWithLabel';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface FriendType {
  _id: string;
  userName: string;
  profilePic: string;
}

type FriendsProps = { user: User };

function Friends({ user }: FriendsProps) {
  const [friendsList, setFriendsList] = useState<FriendType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { userName: userNameOrId } = useParams<string>();

  useEffect(() => {
    if (!userNameOrId) { return; }
    getUsersFriends(user._id)
      .then((res) => { setFriendsList(res.data.friends); setLoading(false); });
  }, [userNameOrId, user._id]);

  return (
    <>
      <SidebarHeaderWithLink headerLabel="Friends" headerLabelCount={user.friendsCount} linkLabel="See All" linkTo={`/${user && user.userName}/friends`} />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {!loading && friendsList.length === 0 && <div>No friends yet.</div>}
          {loading ? <LoadingIndicator />
            : friendsList.map((friend: FriendType, i: number) => (
              <Col xs="4" key={friend._id} className={i > 2 ? 'mt-3' : ''}>
                <FriendCircleWithLabel
                  className="mx-auto"
                  photo={friend.profilePic}
                  label={friend.userName}
                  photoAlt={`${i}`}
                  linkTo={`/${friend.userName}`}
                />
              </Col>
            ))}
        </Row>
      </div>
    </>
  );
}

export default Friends;
