import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import ShoppingFeaturePoster from './ShoppingFeaturePoster';

interface ShoppingCardProps {
  listDetail: ShoppigCardData;
}
interface ShoppigCardData {
  id: number;
  image: string;
  name: string;
  discount?: string;
  offerCode?: string;
  expireDate?: string;
  description: string;
  location: string;
  rating: string;
}

const StyledDescription = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
const StyledRating = styled.div`
  svg {
    color: var(--bs-orange);
    width: 0.847rem;
    height: 0.808rem;
  }
`;
function ShoppingCard({ listDetail }: ShoppingCardProps) {
  return (
    <Row className="">
      <Col xs={4} md={3} lg={4} xl={3} className="text-center">
        <ShoppingFeaturePoster
          featureImage={listDetail.image}
          rating={listDetail.rating}
          showRating
        />
      </Col>
      <Col xs={8}>
        <div className="ms-2">
          <h1 className="h2 fw-bold mb-1">
            {listDetail.name}
          </h1>
          {listDetail.offerCode && listDetail.expireDate && listDetail.discount && (
            <>
              <div className="mt-lg-3 d-flex align-items-center text-primary">
                <FontAwesomeIcon icon={solid('tag')} className="me-1" />
                <p className="ms-2 mb-0 fs-4 fw-bold">{listDetail.discount}</p>
              </div>
              <div className="fs-4 mt-1 d-md-flex d-lg-block d-xl-flex align-items-center">
                <p className="m-0">
                  <span className="fw-semibold">Offer code: </span>
                  {listDetail.offerCode}
                </p>
                <p className="m-0 ms-md-5 ms-lg-0 ms-xl-5">
                  <span className="fw-semibold">Expires: </span>
                  {listDetail.expireDate}
                </p>
              </div>
            </>
          )}
          <StyledDescription className="mt-1 mt-lg-3 text-light m-0">{listDetail.description}</StyledDescription>
          <div className="mt-1 mt-lg-3 d-flex align-items-center">
            <FontAwesomeIcon icon={solid('location-dot')} size="lg" className="text-primary me-1" />
            <p className="ms-2 mb-0 fs-4">{listDetail.location}</p>
          </div>
          <StyledRating className="d-lg-none d-flex mt-2">
            <p className="bg-white mb-0 px-2 rounded-5 fs-5 text-black">
              <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" />
              <span className="h5">{listDetail.rating}</span>
            </p>
          </StyledRating>
        </div>
      </Col>
    </Row>
  );
}

export default ShoppingCard;
