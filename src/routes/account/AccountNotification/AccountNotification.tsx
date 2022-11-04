import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getAccountNotification, updateAccountNotification } from '../../../api/settings';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import Switch from '../../../components/ui/Switch';
import AccountHeader from '../AccountHeader';

const StyledBorder = styled.div`
  border-bottom: 1px solid #3A3B46;
  &:first-of-type {
  border-bottom: 1px solid #3A3B46;
    padding-top: 0 !important;
  }
  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0 !important;
  }
`;

function AccountNotification() {
  const [allNotification, setNotification] = useState<any>();
  useEffect(() => {
    getAccountNotification()
      .then((res) => setNotification(res.data));
  }, []);
  const handleChange = (e: any, key: string) => {
    const reqBody = {} as any;
    reqBody[key] = e.target.checked === false ? 0 : 1;
    updateAccountNotification(reqBody)
      .then((res) => setNotification(res.data));
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <AccountHeader tabKey="notifications" />
      <div className="mt-3 p-md-4 bg-dark bg-mobile-transparent rounded">
        <div>
          <div className="mb-4">
            <span className="fs-3">Dating</span>
            <span className="text-light fs-3"> (Only if you created a dating profile)</span>
          </div>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Like or Match received</span>
              <Switch
                id="1"
                className="ms-0 ms-md-3"
                keyName="dating_got_a_match"
                onSwitchToggle={handleChange}
                isChecked={!!(allNotification && allNotification.dating_got_a_match === 1)}
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Mesage received</span>
              <Switch
                id="2"
                className="ms-0 ms-md-3"
                keyName="dating_message_received"
                onSwitchToggle={handleChange}
                isChecked={!!(allNotification && allNotification.dating_message_received === 1)}
              />
            </div>
          </StyledBorder>
        </div>
        <div className="mt-5">
          <h1 className="h3 mb-3">Friends</h1>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Friend request</span>
              <Switch
                id="3"
                className="ms-0 ms-md-3"
                keyName="friends_got_a_match"
                onSwitchToggle={handleChange}
                isChecked={!!(allNotification && allNotification.friends_got_a_match === 1)}
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Message received</span>
              <Switch
                id="4"
                className="ms-0 ms-md-3"
                keyName="friends_message_received"
                onSwitchToggle={handleChange}
                isChecked={
                  !!(allNotification
                    && allNotification.friends_message_received
                    === 1)
                }
              />
            </div>
          </StyledBorder>
        </div>
        <div className="mt-5">
          <h1 className="h3 mb-3">Groups</h1>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Like on your post/comment/reply</span>
              <Switch
                id="4"
                className="ms-0 ms-md-3"
                keyName="rss_feed_mention_on_post_comment_reply"
                onSwitchToggle={handleChange}
                isChecked={
                  !!(allNotification
                    && allNotification.rss_feed_mention_on_post_comment_reply === 1)
                }
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Comment/reply to your post</span>
              <Switch
                id="5"
                className="ms-0 ms-md-3"
                keyName="feed_comment_on_post"
                onSwitchToggle={handleChange}
                isChecked={
                  !!(allNotification
                    && allNotification.feed_comment_on_post === 1)
                }
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">New post in thread</span>
              <Switch
                id="6"
                className="ms-0 ms-md-3"
                keyName="rss_feed_post_like"
                onSwitchToggle={handleChange}
                isChecked={
                  !!(allNotification && allNotification.rss_feed_post_like === 1)
                }
              />
            </div>
          </StyledBorder>
        </div>
        <div className="mt-5">
          <h1 className="h3 mb-3">Mentions</h1>
          <div className="fs-3  d-flex justify-content-between">
            <span className="fs-4">Mention on post/comment/reply</span>
            <Switch
              id="7"
              className="ms-0 ms-md-3"
              keyName="feed_mention_on_post_comment_reply"
              onSwitchToggle={handleChange}
              isChecked={!!(allNotification
                && allNotification.feed_mention_on_post_comment_reply === 1)}
            />
          </div>
        </div>
        <div className="mt-5">
          <h1 className="h3 mb-3">Posts</h1>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Like on your post/comment/reply</span>
              <Switch
                id="8"
                className="ms-0 ms-md-3"
                keyName="message_board_mention_on_comment_reply"
                onSwitchToggle={handleChange}
                isChecked={
                  !!(allNotification
                    && allNotification.message_board_mention_on_comment_reply
                    === 1)
                }
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Comment/reply on your post</span>
              <Switch
                id="8"
                className="ms-0 ms-md-3"
                keyName="feed_mention_on_post_comment_reply"
                onSwitchToggle={handleChange}
                isChecked={
                  !!(allNotification
                    && allNotification.feed_mention_on_post_comment_reply
                    === 1)
                }
              />
            </div>
          </StyledBorder>
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default AccountNotification;
