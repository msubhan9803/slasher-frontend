import React, { useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';
import CustomPopover from '../../../components/ui/CustomPopover';
import ReportModal from '../../../components/ui/ReportModal';

const ProfilePhoto = styled(Image)`
  acpect-ratio:1;
`;
const StyledPopover = styled.div`
  top: 25px;
  right: 8px;
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
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const viewerOptions = ['Unfriend', 'Block user', 'Report'];
  const selfOptions = ['Edit post', 'Delete Image'];
  const popoverOption = queryParam === 'self' ? selfOptions : viewerOptions;
  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };
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
                  <CustomPopover
                    popoverOptions={popoverOption}
                    onPopoverClick={handlePopoverOption}
                  />
                </StyledPopover>
              </div>
            </Col>
          ))}
        </Row>
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePhotos;
