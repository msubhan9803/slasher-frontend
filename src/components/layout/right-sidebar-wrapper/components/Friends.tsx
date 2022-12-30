import React, { useEffect, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { getUsersFriends } from '../../../../api/users';
import FriendCircleWithLabel from './FriendCircleWithLabel';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';
import { useAppSelector } from '../../../../redux/hooks';

interface FriendProps {
  /* eslint no-underscore-dangle: 0 */
  _id: string;
  userName: string;
  profilePic: string;
}

function Friends() {
  const [friendsList, setFriendsList] = useState<FriendProps[]>([]);
  const sidebarContext = useAppSelector((state) => state.sidebarContext);
  const sidebarUserIdRef = useRef('');

  useEffect(() => {
    setFriendsList([]);
    const isSameUserId = sidebarUserIdRef.current === sidebarContext.userId;
    if (isSameUserId) return;
    if (sidebarContext.userId) {
      sidebarUserIdRef.current = sidebarContext.userId;
      getUsersFriends(sidebarContext.userId)
        .then((res) => setFriendsList(res.data.friends));
    }
  }, [sidebarContext]);

  return (
    <>
      <SidebarHeaderWithLink headerLabel="Friends" linkLabel="See All" linkTo={`/${sidebarContext.userName}/friends`} />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {friendsList.map((friend: FriendProps, i: number) => (
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
          ))}
        </Row>
      </div>
    </>
  );
}

export default Friends;
