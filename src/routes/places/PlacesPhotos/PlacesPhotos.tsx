import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, OverlayTrigger, Popover, Row,
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import placesPhoto from '../../../images/places-photos.png';

const ProfilePhoto = styled(Image)`
  acpect-ratio:1;
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

function PlacesPhoto() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      {queryParam === 'self' ? (
        <>
          <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Edit image</PopoverText>
          <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Delete image</PopoverText>
        </>
      )
        : (
          <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Report image</PopoverText>

        )}
    </CustomPopover>
  );
  return (
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
  );
}

export default PlacesPhoto;
