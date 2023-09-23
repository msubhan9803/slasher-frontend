import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProfileTabContent from '../../../../components/ui/profile/ProfileTabContent';
import FollowingHeader from '../FollowingHeader';
import UserCircleImage from '../../../../components/ui/UserCircleImage';
import NotificationBell from '../../../../components/ui/NotificationBell';
import LoadingIndicator from '../../../../components/ui/LoadingIndicator';
import { StyledBorder } from '../../../../components/ui/StyledBorder';
import { deleteNotificationStatus, getUserFollow } from '../../../../api/user-follow';
import { StyledButtonIcon } from '../../ProfileHeader';

function FollowingPeople() {
  const [additionalPost, setAdditionalPost] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [loadingPeople, setLoadingPeople] = useState<boolean>(false);
  const [followPeople, setFollowPeople] = useState<any>([]);
  const [page, setPage] = useState<number>(0);
  const callLatestFeed = () => {
    getUserFollow(page).then((res) => setFollowPeople(res.data));
  };
  const fetchMorePeopleList = useCallback(() => {
    getUserFollow(page)
      .then((res) => {
        setFollowPeople((prev: any) => [...prev, ...res.data]);
        setPage(page + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((error) => {
        setNoMoreData(true);
        /* eslint-disable no-console */
        console.error(error);
      }).finally(
        // eslint-disable-next-line max-len
        () => { setAdditionalPost(false); setLoadingPeople(false); },
      );
  }, [page]);
  const onOffNotificationClick = (user: any) => {
    deleteNotificationStatus(user.followUserId._id).then(() => {
      setNoMoreData(false);
      setPage(0);
      callLatestFeed();
    });
  };
  useEffect(() => {
    if (additionalPost && !loadingPeople) {
      setLoadingPeople(true);
      fetchMorePeopleList();
    }
  }, [additionalPost, fetchMorePeopleList, loadingPeople, page, followPeople]);
  const renderNoMoreDataMessage = () => {
    const message = followPeople.length === 0
      ? 'No results found'
      : 'No hashtags at the moment';
    return (
      <p className="text-center m-0 py-3">
        {
          followPeople.length === 0
            ? message
            : 'No more hashtag'
        }
      </p>
    );
  };
  return (
    <>
      <FollowingHeader
        tabKey="people"
        setSearch={() => { }}
        search=""
      />
      <ProfileTabContent>
        <div className="bg-dark p-3 mt-4 rounded-3">
          <InfiniteScroll
            threshold={3000}
            pageStart={0}
            initialLoad
            loadMore={() => { setAdditionalPost(true); }}
            hasMore={!noMoreData}
          >
            <Row>
              {followPeople.map((user: any, index: number) => (
                <div key={user.id}>
                  <Row key={user.userId} className="mt-4">
                    <Col>
                      <Link className="pb-4 d-flex align-items-center text-decoration-none" to={`/${user.followUserId.userName}`}>
                        <UserCircleImage className="me-3 ms-md-2 bg-dark align-items-center d-flex fs-1 justify-content-around fw-light" src={user.followUserId.profilePic} />
                        <div className="ps-0 ps-md-5 ps-lg-3 ps-xl-0">
                          <p className="fw-bold mb-0">
                            {user.followUserId.userName}
                          </p>
                          <small className="text-light mb-0">
                            {' '}
                            {user.followUserId.firstName}
                          </small>
                        </div>
                      </Link>
                    </Col>
                    <Col className="mt-sm-0">
                      <StyledButtonIcon className="d-flex align-items-center justify-content-end">
                        <NotificationBell
                          onButtonClick={() => onOffNotificationClick(user)}
                          toggle
                        />
                      </StyledButtonIcon>
                    </Col>
                  </Row>
                  {(index !== (followPeople.length - 1)) && <StyledBorder />}
                </div>
              ))}
            </Row>
            {(loadingPeople) && <LoadingIndicator className="py-3" />}
            {noMoreData && renderNoMoreDataMessage()}
          </InfiniteScroll>
        </div>
      </ProfileTabContent>
    </>
  );
}
export default FollowingPeople;
