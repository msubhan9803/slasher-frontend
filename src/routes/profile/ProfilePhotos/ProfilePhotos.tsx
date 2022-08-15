import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, OverlayTrigger, Popover, Row,
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';

const ProfilePhoto = styled(Image)`
  aspectRatio:1;
`;
const StyledPopover = styled.div`
  top:1.563rem;
  right:0rem;
  .btn[aria-describedby="popover-basic"]{
    svg{
      color: var(--bs-primary);
    }
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: red;
  }
`;
const CustomPopover = styled(Popover)`
  z-index :1;
  background:rgb(27,24,24) !important;
  border: 1px solid rgb(56,56,56) !important;
  position:absolute;
  top: 0px !important;
  .popover-arrow{
    &:after{
      border-bottom-color:rgb(56,56,56) !important;
     
    }
  }
`;
const photosData = [
  { id: 1, photoUrl: 'https://i.pravatar.cc/300?img=02' },
  { id: 2, photoUrl: 'https://i.pravatar.cc/300?img=03' },
  { id: 3, photoUrl: 'https://i.pravatar.cc/300?img=04' },
  { id: 4, photoUrl: 'https://i.pravatar.cc/300?img=11' },
  { id: 5, photoUrl: 'https://i.pravatar.cc/300?img=01' },
  { id: 6, photoUrl: 'https://i.pravatar.cc/300?img=02' },
  { id: 7, photoUrl: 'https://i.pravatar.cc/300?img=03' },
  { id: 8, photoUrl: 'https://i.pravatar.cc/300?img=04' },
  { id: 9, photoUrl: 'https://i.pravatar.cc/300?img=11' },
  { id: 10, photoUrl: 'https://i.pravatar.cc/300?img=19' },
  { id: 11, photoUrl: 'https://i.pravatar.cc/300?img=31' },
  { id: 12, photoUrl: 'https://i.pravatar.cc/300?img=01' },
];

function ProfilePhotos() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      {queryParam === 'self' ? (
        <>
          <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Edit post</PopoverText>
          <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Delete Image</PopoverText>
        </>
      )
        : (
          <>
            <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Unfriend</PopoverText>
            <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Block user</PopoverText>
            <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Report</PopoverText>
          </>
        )}
    </CustomPopover>
  );
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="photos" />
      <div className="bg-dark rounded px-md-4 pb-md-4 bg-mobile-transparent mt-3">
        <Row className="justify-content-between">
          {photosData.map((data) => (
            <Col xs={4} md={3} key={data.id}>
              <div className="position-relative">
                <ProfilePhoto src={data.photoUrl} className="rounded mt-4 w-100" key={data.id} />
                <StyledPopover className="position-absolute">
                  <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={popover}>
                    <Button className="bg-transparent shadow-none border-0 text-white">
                      <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                    </Button>
                  </OverlayTrigger>
                </StyledPopover>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePhotos;
