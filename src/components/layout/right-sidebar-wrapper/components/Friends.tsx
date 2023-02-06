import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getUsersFriends } from '../../../../api/users';
import { User } from '../../../../types';
import LoadingIndicator from '../../../ui/LoadingIndicator';
import FriendCircleWithLabel from './FriendCircleWithLabel';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface FriendType {
  /* eslint no-underscore-dangle: 0 */
  _id: string;
  userName: string;
  profilePic: string;
}

type FriendsProps = { user: User };

function Friends({ user }: FriendsProps) {
  const [friendsList, setFriendsList] = useState<FriendType[]>([]);
  const [loader, setLoader] = useState<boolean>(false);
  const { userName: userNameOrId } = useParams<string>();

  useEffect(() => {
    if (userNameOrId) {
      setLoader(true);
      /* eslint no-underscore-dangle: 0 */
      getUsersFriends(user._id)
        .then((res) => { setFriendsList(res.data.friends); setLoader(false); });
    }
  }, [userNameOrId]);

  return (
    <>
      <SidebarHeaderWithLink headerLabel="Friends" linkLabel="See All" linkTo={`/${user && user.userName}/friends`} />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {
            loader ? <LoadingIndicator />
              : friendsList.map((friend: FriendType, i: number) => (
                /* eslint no-underscore-dangle: 0 */
                <Col xs="4" key={friend._id} className={i > 2 ? 'mt-3' : ''}>
                  <FriendCircleWithLabel
                    className="mx-auto"
                    photo={friend.profilePic}
                    label={friend.userName}
                    photoAlt={`${i}`}
                    linkTo={`/${friend.userName}`}
                  />
                </Col>
              ))
          }
        </Row>
      </div>
    </>
  );
}

export default Friends;
