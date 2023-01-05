import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getUser, getUsersFriends } from '../../../../api/users';
import { User } from '../../../../types';
import LoadingIndicator from '../../../ui/LoadingIndicator';
import FriendCircleWithLabel from './FriendCircleWithLabel';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

interface FriendProps {
  /* eslint no-underscore-dangle: 0 */
  _id: string;
  userName: string;
  profilePic: string;
}

function Friends() {
  const [friendsList, setFriendsList] = useState<FriendProps[]>([]);
  const [user, setUser] = useState<User>();
  const [loader, setLoader] = useState<boolean>(false);
  const { userName: userNameOrId } = useParams<string>();

  const getUserFriendList = (id: string) => {
    getUsersFriends(id)
      .then((res) => { setFriendsList(res.data.friends); setLoader(false); });
  };

  useEffect(() => {
    if (userNameOrId) {
      setLoader(true);
      getUser(userNameOrId)
        .then((res) => { getUserFriendList(res.data.id); setUser(res.data); });
    }
  }, [userNameOrId]);

  return (
    <>
      <SidebarHeaderWithLink headerLabel="Friends" linkLabel="See All" linkTo={`/${user && user.userName}/friends`} />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {
            loader ? <LoadingIndicator />
              : friendsList.map((friend: FriendProps, i: number) => (
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
