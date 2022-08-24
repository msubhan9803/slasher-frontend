import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import Ratings from '../../../components/ui/Ratings';
import LikeDislike from '../../../components/ui/LikeDislike';
import ShareButton from '../../../components/ui/ShareButton';
import RoundButton from '../../../components/ui/RoundButton';
import WorthContent from '../../../components/ui/WorthContent';
import BooksModal from '../components/BooksModal';

const StyledRateBorder = styled.div`
  @media (min-width: 89.938rem) {
    border-bottom: 0.063rem solid #3A3B46;
  }
  @media (max-width: 89.938rem) {
    .rating {
      border-bottom: 0.063rem solid #3A3B46;
    }
  }
`;
const StyledWorth = styled.div`
  color: #00FF0A;
  div {
    width: 2.5rem;
    height: 2.5rem;
    border: 0.063rem solid #3A3B46;
    background: #1F1F1F;
  }
  FontAwesomeIcon {
    width: 1.326rem;
    height: 1.391rem;
  }
`;
const AboutBookDetails = styled.div`
  .small-initial {
    width: 2.063rem;
    height: 2.063rem;
  }
  .circle {
    width: 0.188rem;
    height: 0.188rem;
  }
  .star {
    color: #FF8A00;
    width: 1.638rem;
    height: 1.563rem;
  }
  .rate-btn {
    padding: 0 1.438rem;
    svg {
      width: 1.179rem;
      height: 1.125rem;
    }    
    p {
      font-size: 1rem;
    }
  }
  .share-btn {
    padding: 0 1.25rem;
    svg {
      width: 1.055rem;
      height: 1.125rem;
    }    
    p {
      font-size: 1rem;
    }
  }
  
`;
function BookSummary() {
  const [show, setShow] = useState(false);
  const changeRating = () => {
    setShow(true);
  };
  return (
    <AboutBookDetails className="text-xl-start pt-4">
      <Row className="justify-content-center mt-2 mt-xl-0">
        <Col xs={8} sm={6} md={4} lg={9} xl={12}>
          <h1 className="fw-semibold m-0 text-center text-xl-start">
            Grave Secrets - Short tales of mystery &#38; mayhem
          </h1>
        </Col>
      </Row>
      <StyledRateBorder className="pb-xxl-3">
        <div className="align-items-center d-block d-xxl-flex justify-content-center justify-content-xl-between">
          <div className="py-3 pb-xxl-0 align-items-center d-flex justify-content-center justify-content-xl-start text-light">
            <p className="m-0 fs-3">George R.R Martin</p>
          </div>
          <div className="d-flex d-xxl-none align-items-center justify-content-center justify-content-xl-start">
            <span className="fs-3 d-lg-flex text-center">
              <p className="m-0 fw-bold">
                Year:&nbsp;
              </p>
              <p className="m-0 text-light"> 1921</p>
            </span>
            <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-4 mx-lg-3 text-primary" />
            <span className="fs-3 d-lg-flex text-center">
              <p className="m-0 fw-bold">
                Pages:&nbsp;
              </p>
              <p className="m-0 text-light"> 447</p>
            </span>
            <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-4 mx-lg-3 text-primary" />
            <span className="fs-3 fw-lignt d-lg-flex text-center">
              <p className="m-0 fw-bold">
                ISBN:&nbsp;
              </p>
              <p className="m-0 text-light"> 272423118X</p>
            </span>
          </div>
          <Ratings changeRating={changeRating} />
        </div>
        <div className="my-2 mb-xl-0 mt-xxl-3 d-none d-xxl-flex align-items-center">
          <span className="d-lg-flex">
            <p className="m-0 fs-3 fw-bold">
              Year:&nbsp;
            </p>
            1921
          </span>
          <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-3 text-primary" />
          <span className="d-lg-flex">
            <p className="m-0 fs-3 fw-bold">
              Pages:&nbsp;
            </p>
            447
          </span>
          <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-3 text-primary" />
          <span className="d-lg-flex">
            <p className="m-0 fs-3 fw-bold">
              ISBN:&nbsp;
            </p>
            272423118X
          </span>
        </div>
      </StyledRateBorder>
      <div className="mt-2 mt-xl-0 d-block d-xxl-flex justify-content-center justify-content-xxl-between py-3">
        <div className="align-items-center d-flex justify-content-center justify-content-xl-start">
          <p className="m-0 me-1 me-sm-3 fs-3 fw-bold">Worth watching?</p>
          <LikeDislike />
        </div>
        <div className="d-none d-xxl-flex">
          <ShareButton />
        </div>
      </div>
      <Row className="mt-2 mt-lg-0 align-items-center justify-content-center justify-content-xl-start">
        <Col xs={6} sm={5} xl={12}>
          <div className="d-flex justify-content-xl-between justify-content-end align-items-center">
            <StyledWorth className="me-3 align-items-center d-flex justify-content-end justify-content-xl-start">
              <WorthContent />
            </StyledWorth>
            <RoundButton className="d-none d-xl-block bg-primary px-5 py-2 fw-bold fs-3">Buy now</RoundButton>
          </div>
        </Col>
        <Col xs={6} sm={5} xl={12} className="d-xxl-none pt-xl-3 pt-xxl-0">
          <ShareButton />
        </Col>
      </Row>
      <Row className="mt-5 d-xl-none">
        <Col className="text-center text-xl-end">
          <RoundButton className="bg-primary px-5 py-2 fw-bold fs-3">Buy now</RoundButton>
        </Col>
      </Row>
      <BooksModal show={show} setShow={setShow} ButtonType="rate" />
    </AboutBookDetails>
  );
}

export default BookSummary;
