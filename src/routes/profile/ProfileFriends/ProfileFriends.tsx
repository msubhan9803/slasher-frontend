import React, { useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ProfileHeader from '../ProfileHeader';
import CustomPopover from '../../../components/ui/CustomPopover';
import UserCircleImage from '../../../components/ui/UserCircleImage';

const ProfileImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;
const Container = styled.div`
  background: #1F1F1F;
`;
const friendList = [
  {
    id: 1, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 2, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 3, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 4, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 5, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 6, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 7, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 8, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 9, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 10, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 11, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 12, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 13, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 14, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 15, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
];
function ProfileFriends() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [search, setSearch] = useState<string>('');
  const viewerOptions = ['View profile', 'Report', 'Block user'];
  const selfOptions = ['View profile', 'Message', 'Unfriend', 'Report', 'Block user'];
  const popoverOption = queryParam === 'self' ? selfOptions : viewerOptions;
  const navigate = useNavigate();
  const handlePopoverOption = (value: string) => {
    navigate(`/home/${value}`);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="friends" />
      <div className="mt-3">
        <div className="d-md-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
          </div>
          <div className="d-flex align-self-center mt-3 mt-md-0">
            <p className="fs-3 text-primary me-3 my-auto">310 friends</p>
          </div>
        </div>
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
          <Row>
            {friendList.map((friend) => (
              <Col md={4} lg={6} xl={4} key={friend.id}>
                <Container className="d-flex p-2 justify-content-between pe-2 w-100 rounded mb-3">
                  <div>
                    <div className="d-flex align-items-center">
                      <div>
                        <UserCircleImage src={friend.imageUrl} className="me-2" />
                      </div>
                      <div>
                        <h1 className="h3 mb-0">{friend.name}</h1>
                        <p className="fs-6 mb-0 text-light">{friend.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-self-center">
                    <CustomPopover
                      popoverOptions={popoverOption}
                      onPopoverClick={handlePopoverOption}
                    />
                  </div>
                </Container>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriends;
