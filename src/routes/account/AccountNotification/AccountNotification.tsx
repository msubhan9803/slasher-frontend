import React from 'react';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import Switch from '../../../components/ui/Switch';
import AccountHeader from '../AccountHeader';

const StyledBorder = styled.div`
  border-bottom: 1px solid #3A3B46;
  &:first-child {
  border-bottom: 1px solid #3A3B46;
    padding-top: 0 !important;
  }
  &:last-child {
    border-bottom: none;
    padding-bottom: 0 !important;
  }
`;

const dating = [
  { id: 1, label: 'Like or Match received' },
  { id: 2, label: 'Mesage received' },
];
const friends = [
  { id: 3, label: 'Friend request' },
  { id: 4, label: 'Message received' },
];
const groups = [
  { id: 5, label: 'Like on your post/comment/reply' },
  { id: 6, label: 'Comment/reply to your post' },
  { id: 7, label: 'New post in thread' },
];
const posts = [
  { id: 8, label: 'Like on your post/comment/reply' },
  { id: 9, label: 'Comment/reply on your post' },
];

function AccountNotification() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <AccountHeader tabKey="notifications" />
      <div className="mt-3 p-md-4 bg-dark bg-mobile-transparent rounded">
        <div>
          <div className="mb-4">
            <span className="fs-3">Dating</span>
            <span className="text-light fs-3"> (Only if you created a dating profile)</span>
          </div>
          {dating.map((option: any) => (
            <StyledBorder className="mt-2 mb-3" key={option.id}>
              <div className="fs-3  d-flex justify-content-between">
                <span className="fs-4">{option.label}</span>
                <Switch id={option.id} className="ms-0 ms-md-3" />
              </div>
            </StyledBorder>
          ))}
        </div>
        <div className="mt-5">
          <h1 className="h3 mb-3">Friends</h1>
          {friends.map((option: any) => (
            <StyledBorder className="mt-2 mb-3" key={option.id}>
              <div className="fs-3  d-flex justify-content-between" key={option.id}>
                <span className="fs-4">{option.label}</span>
                <Switch id={option.id} className="ms-0 ms-md-3" />
              </div>
            </StyledBorder>
          ))}
        </div>

        <div className="mt-5">
          <h1 className="h3 mb-3">Groups</h1>
          {groups.map((option: any) => (
            <StyledBorder className="mt-2 mb-3" key={option.id}>
              <div className="fs-3  d-flex justify-content-between" key={option.id}>
                <span className="fs-4">{option.label}</span>
                <Switch id={option.id} className="ms-0 ms-md-3" />
              </div>
            </StyledBorder>
          ))}
        </div>

        <div className="mt-5">
          <h1 className="h3 mb-3">Mentions</h1>
          <div className="fs-3  d-flex justify-content-between">
            <span className="fs-4">Mention on post, comment, reply</span>
            <Switch id="11" className="ms-0 ms-md-3" />
          </div>
        </div>

        <div className="mt-5">
          <h1 className="h3 mb-3">Posts</h1>
          {posts.map((option: any) => (
            <StyledBorder className="mt-2 mb-3" key={option.id}>
              <div className="fs-3  d-flex justify-content-between" key={option.id}>
                <span className="fs-4">{option.label}</span>
                <Switch id={option.id} className="ms-0 ms-md-3" />
              </div>
            </StyledBorder>
          ))}
        </div>

      </div>
    </AuthenticatedPageWrapper>
  );
}

export default AccountNotification;
