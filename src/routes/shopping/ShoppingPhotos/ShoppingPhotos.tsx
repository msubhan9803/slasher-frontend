import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import CustomPopover from '../../../components/ui/CustomPopover';
import shoppingPhoto from '../../../images/shopping-photos.png';

const ProfilePhoto = styled(Image)`
  acpect-ratio:1;
`;
const photosData = [
  { id: 1, photoUrl: shoppingPhoto },
  { id: 2, photoUrl: shoppingPhoto },
  { id: 3, photoUrl: shoppingPhoto },
  { id: 4, photoUrl: shoppingPhoto },
  { id: 5, photoUrl: shoppingPhoto },
  { id: 6, photoUrl: shoppingPhoto },
  { id: 7, photoUrl: shoppingPhoto },
  { id: 8, photoUrl: shoppingPhoto },
  { id: 9, photoUrl: shoppingPhoto },
  { id: 10, photoUrl: shoppingPhoto },
  { id: 11, photoUrl: shoppingPhoto },
  { id: 12, photoUrl: shoppingPhoto },
];

const selfOptions = ['Edit image', 'Delete image'];
const viewerOptions = ['Report image'];
function ShoppingPhotos() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const popoverOption = queryParam === 'self' ? selfOptions : viewerOptions;
  const navigate = useNavigate();
  const handlePopoverOption = (value: string) => {
    navigate(`/home/${value}`);
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

export default ShoppingPhotos;
