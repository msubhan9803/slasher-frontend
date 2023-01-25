import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import AccountHeader from '../AccountHeader';
import CustomPopover from '../../../components/ui/CustomPopover';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import { blockedUsers, removeBlockedUsers } from '../../../api/blocks';
import { LG_MEDIA_BREAKPOINT } from '../../../constants';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';

interface BlockUsers {
  /* eslint no-underscore-dangle: 0 */
  _id: string;
  firstName: string;
  userName: string;
  profilePic: string;
}

const Container = styled.div`
  @media (min-width: ${LG_MEDIA_BREAKPOINT}) {
    background: #1f1f1f;
  }
`;
const PopoverOption = ['Unblock user'];
function AccountBlockedUser() {
  const [blockUsersList, setBlockUsersList] = useState<BlockUsers[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const getBlockedUserList = (blockUserPage: number) => {
    blockedUsers(blockUserPage)
      .then((res) => {
        setBlockUsersList(res.data);
        setPage(blockUserPage + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((error) => setErrorMessage(error.response.data.message));
  };

  useEffect(() => {
    getBlockedUserList(page);
  }, []);

  const fetchMoreBlockUsersList = () => {
    if (page > 0) {
      blockedUsers(page)
        .then((res) => {
          setBlockUsersList((prev: any) => [...prev, ...res.data]);
          setPage(page + 1);
          if (res.data.length === 0) {
            setNoMoreData(true);
          }
        })
        .catch((error) => setErrorMessage(error.response.data.message));
    }
  };

  const removeBlockUser = (userId: string) => {
    removeBlockedUsers(userId).then(() => {
      window.scrollTo(0, 0);
      setTimeout(() => {
        setNoMoreData(false);
        getBlockedUserList(0);
      }, 500);
    });
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <AccountHeader tabKey="blocked-users" />
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 my-3">
          <InfiniteScroll
            pageStart={0}
            initialLoad={false}
            loadMore={fetchMoreBlockUsersList}
            hasMore={!noMoreData}
            useWindow={false}
          >
            <Row>
              {
                blockUsersList.length > 0
                && blockUsersList.map((blockUser) => (
                  <Col xs sm={6} md={4} lg={6} xl={4} key={blockUser._id}>
                    <Container className="d-flex p-2 justify-content-between pe-2 w-100 rounded mb-3">
                      <div>
                        <div className="d-flex align-items-center">
                          <div>
                            <UserCircleImage
                              src={blockUser.profilePic}
                              className="me-2"
                            />
                          </div>
                          <div>
                            <h1 className="h3 mb-0">{blockUser.firstName}</h1>
                            <p className="fs-6 mb-0 text-light">
                              {blockUser.userName}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-self-center">
                        <CustomPopover
                          popoverOptions={PopoverOption}
                          onPopoverClick={() => {
                            removeBlockUser(blockUser._id);
                          }}
                        />
                      </div>
                    </Container>
                  </Col>
                ))
              }
            </Row>
          </InfiniteScroll>
          {noMoreData && (
            <p className="text-center my-2">
              {blockUsersList.length === 0 && 'You have not blocked any users.'}
            </p>
          )}

          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default AccountBlockedUser;
