import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import placesPhoto from '../../../images/places-photos.png';
import CustomPopover from '../../../components/ui/CustomPopover';

const ProfilePhoto = styled(Image)`
  acpect-ratio:1;
`;
const photosData = [
  { id: 1, photoUrl: placesPhoto },
  { id: 2, photoUrl: placesPhoto },
  { id: 3, photoUrl: placesPhoto },
  { id: 4, photoUrl: placesPhoto },
  { id: 5, photoUrl: placesPhoto },
  { id: 6, photoUrl: placesPhoto },
  { id: 7, photoUrl: placesPhoto },
  { id: 8, photoUrl: placesPhoto },
  { id: 9, photoUrl: placesPhoto },
  { id: 10, photoUrl: placesPhoto },
  { id: 11, photoUrl: placesPhoto },
  { id: 12, photoUrl: placesPhoto },
];

const selfOptions = ['Edit image', 'Delete image'];
const viewerOptions = ['Report image'];
function PlacesPhoto() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const popoverOption = queryParam === 'self' ? selfOptions : viewerOptions;

  const navigate = useNavigate();
  const handlePopoverOption = (value: string) => {
    navigate(`/app/home/${value}`);
  };
  return (
    <div className="bg-dark rounded px-md-4 pb-md-4 bg-mobile-transparent mt-3">
      <Row className="justify-content-between">
        {photosData.map((data) => (
          <Col xs={4} md={3} key={data.id}>
            <div className="position-relative">
              <ProfilePhoto src={data.photoUrl} className="rounded mt-4 w-100" key={data.id} />
              <CustomPopover popoverOptions={popoverOption} onPopoverClick={handlePopoverOption} />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default PlacesPhoto;
