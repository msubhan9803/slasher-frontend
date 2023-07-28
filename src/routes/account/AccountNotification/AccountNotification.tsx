/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getAccountNotification, updateAccountNotification } from '../../../api/settings';
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
interface AllNotification {
  dating_got_a_match: number;
  dating_message_received: number;
  friends_got_a_match: number;
  friends_message_received: number;
  message_board_like_your_post: number;
  message_board_reply_your_post: number;
  message_board_new_post_on_thread: number;
  feed_mention_on_post_comment_reply: number;
  message_board_mention_on_comment_reply: number;
  feed_post_like: number;
  feed_comment_on_post: number;
}
interface RequestBody {
  [key: string]: number
}
function AccountNotification() {
  const [allNotification, setNotification] = useState<AllNotification>();
  useEffect(() => {
    getAccountNotification()
      .then((res) => setNotification(res.data));
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const reqBody = {} as RequestBody;
    reqBody[key] = e.target.checked === false ? 0 : 1;
    updateAccountNotification(reqBody)
      .then((res) => setNotification(res.data));
  };
  return (
    <div>
      <AccountHeader tabKey="notifications" />
      <div className="mt-3 p-md-4 bg-dark bg-mobile-transparent rounded">
        <h1 className="mb-5">Mobile Push Notifications</h1>
        {/* <div>
          <div className="mb-4">
            <span className="fs-3">Dating</span>
            <span className="text-light fs-3"> (Only if you created a dating profile)</span>
          </div>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Like or Match received</span>
              <Switch
                id="dating_got_a_match"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'dating_got_a_match')}
                isChecked={!!(allNotification && allNotification.dating_got_a_match === 1)}
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Mesage received</span>
              <Switch
                id="dating_message_received"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'dating_message_received')}
                isChecked={!!(allNotification && allNotification.dating_message_received === 1)}
              />
            </div>
          </StyledBorder>
        </div> */}
        <div className="mt-5">
          <h2 className="h3 mb-3">Friends</h2>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Friend request</span>
              <Switch
                id="friends_got_a_match"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'friends_got_a_match')}
                isChecked={!!(allNotification && allNotification.friends_got_a_match === 1)}
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Message received</span>
              <Switch
                id="friends_message_received"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'friends_message_received')}
                isChecked={
                  !!(allNotification
                    && allNotification.friends_message_received === 1)
                }
              />
            </div>
          </StyledBorder>
        </div>
        {/* <div className="mt-5">
          <h2 className="h3 mb-3">Groups</h2>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Like on your post/comment/reply</span>
              <Switch
                id="message_board_like_your_post"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'message_board_like_your_post')}
                isChecked={
                  !!(allNotification
                    && allNotification.message_board_like_your_post === 1)
                }
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Comment/reply to your post</span>
              <Switch
                id="message_board_reply_your_post"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'message_board_reply_your_post')}
                isChecked={
                  !!(allNotification
                    && allNotification.message_board_reply_your_post === 1)
                }
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">New post in thread</span>
              <Switch
                id="message_board_new_post_on_thread"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'message_board_new_post_on_thread')}
                isChecked={
                  !!(allNotification && allNotification.message_board_new_post_on_thread === 1)
                }
              />
            </div>
          </StyledBorder>
        </div> */}
        <div className="mt-5">
          <h2 className="h3 mb-3">Mentions</h2>
          <div className="fs-3  d-flex justify-content-between">
            <span className="fs-4">Mention on post/comment/reply</span>
            <Switch
              id="feed_mention_on_post_comment_reply"
              className="ms-0 ms-md-3"
              onSwitchToggle={(e) => handleChange(e, 'feed_mention_on_post_comment_reply')}
              isChecked={!!(allNotification
                && allNotification.feed_mention_on_post_comment_reply === 1)}
            />
          </div>
        </div>
        <div className="mt-5">
          <h2 className="h3 mb-3">Posts</h2>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Like on your post/comment/reply</span>
              <Switch
                id="feed_post_like"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'feed_post_like')}
                isChecked={
                  !!(allNotification
                    && allNotification.feed_post_like === 1)
                }
              />
            </div>
          </StyledBorder>
          <StyledBorder className="mt-2 mb-3">
            <div className="fs-3  d-flex justify-content-between">
              <span className="fs-4">Comment/reply on your post</span>
              <Switch
                id="feed_comment_on_post"
                className="ms-0 ms-md-3"
                onSwitchToggle={(e) => handleChange(e, 'feed_comment_on_post')}
                isChecked={
                  !!(allNotification && allNotification.feed_comment_on_post === 1)
                }
              />
            </div>
          </StyledBorder>
        </div>
      </div>
    </div>
  );
}

export default AccountNotification;
