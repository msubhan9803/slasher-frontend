import React from 'react';
import { Image } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';

const ProfilePhoto = styled(Image)`
  height:11.125rem;
  width:11.125rem;
`;

const photosData = [
  { id: 1, photoUrl: 'https://i.pravatar.cc/300?img=02' },
  { id: 2, photoUrl: 'https://i.pravatar.cc/300?img=03' },
  { id: 3, photoUrl: 'https://i.pravatar.cc/300?img=04' },
  { id: 4, photoUrl: 'https://i.pravatar.cc/300?img=05' },
  { id: 5, photoUrl: 'https://i.pravatar.cc/300?img=01' },
];
function ProfilePhotos() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="photos" />
      <div className="bg-dark rounded p-md-4 bg-mobile-transparent ">
        <div className="">
          {photosData.map((data) => (
            <ProfilePhoto src={data.photoUrl} className="rounded mx-2 mb-2 me-3" key={data.id} />
          ))}
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePhotos;
