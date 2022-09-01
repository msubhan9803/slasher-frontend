import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import AccountHeader from '../AccountHeader';
import CustomPopover from '../../../components/ui/CustomPopover';

const Container = styled.div`
  @media (min-width: 992px) {
    background: #1F1F1F;
  }
`;
const ProfileImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;
const friendList = [
  {
    id: 1, imageUrl: 'https://i.pravatar.cc/300?img=19', name: 'Maureen Biologist', email: '@maureenbio122',
  },
  {
    id: 2, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 3, imageUrl: 'https://i.pravatar.cc/300?img=19', name: 'Theodore Henry', email: '@maureenbio122',
  },
  {
    id: 4, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Maureen Biologist', email: '@maureenbio122',
  },
  {
    id: 5, imageUrl: 'https://i.pravatar.cc/300?img=32', name: 'Alexander Daniel', email: '@maureenbio122',
  },
  {
    id: 6, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Michael Mason', email: '@maureenbio122',
  },
  {
    id: 7, imageUrl: 'https://i.pravatar.cc/300?img=13', name: 'Sebastian', email: '@maureenbio122',
  },
  {
    id: 8, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Samuel Jacob', email: '@maureenbio122',
  },
  {
    id: 9, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Aiden John', email: '@maureenbio122',
  },
  {
    id: 10, imageUrl: 'https://i.pravatar.cc/300?img=17', name: 'Joseph Wyatt', email: '@maureenbio122',
  },
  {
    id: 11, imageUrl: 'https://i.pravatar.cc/300?img=32', name: 'Hudson Grayson', email: '@maureenbio122',
  },
  {
    id: 12, imageUrl: 'https://i.pravatar.cc/300?img=20', name: 'Gabriel Jayden', email: '@maureenbio122',
  },
];
const PopoverOption = ['Unblock user'];
function AccountBlockedUser() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <AccountHeader tabKey="blocked-users" />
      <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
        <Row>
          {friendList.map((friend) => (
            <Col sm={6} md={4} lg={6} xl={4} key={friend.id}>
              <Container className="d-flex p-2 justify-content-between pe-2 w-100 rounded mb-3">
                <div>
                  <div className="d-flex align-items-center">
                    <div>
                      <ProfileImage src={friend.imageUrl} className="rounded-circle me-2" />
                    </div>
                    <div>
                      <h1 className="h3 mb-0">{friend.name}</h1>
                      <p className="fs-6 mb-0 text-light">{friend.email}</p>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-self-center">
                  <CustomPopover popoverOptions={PopoverOption} onPopoverClick={() => { }} />
                </div>
              </Container>
            </Col>
          ))}
        </Row>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default AccountBlockedUser;
