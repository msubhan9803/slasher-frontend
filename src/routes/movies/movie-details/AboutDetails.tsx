import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import WorthWatchIcon from '../components/WorthWatchIcon';
import MoviesModal from '../components/MoviesModal';
import {
  AdditionalMovieData, Country, MovieReleaseResults, ReleaseDate,
} from '../../../types';
import BorderButton from '../../../components/ui/BorderButton';
import WorthContent from '../../../components/ui/WorthContent';
import { StyledRateBorder } from '../../../components/ui/StyledRateBorder';

interface AboutMovieData {
  aboutMovieDetail: AdditionalMovieData
}
const AboutMovieDetails = styled.div`
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
function AboutDetails({ aboutMovieDetail }: AboutMovieData) {
  const [show, setShow] = useState(false);

  const toHoursAndMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getCertification = () => {
    const releaseDateForUS = aboutMovieDetail?.mainData?.release_dates?.results?.find((result: MovieReleaseResults) => result.iso_3166_1 === 'US');
    const certificationData = releaseDateForUS?.release_dates?.find(
      (movieCertificate: ReleaseDate) => movieCertificate.certification.length > 0,
    );

    return certificationData ? certificationData.certification : '';
  };
  const handleBorderButton = () => {
    setShow(true);
  };
  return (
    <AboutMovieDetails className="text-xl-start pt-4">
      <Row className="justify-content-center mt-2 mt-xl-0">
        <Col xs={10} sm={8} md={6} lg={9} xl={12}>
          <h1 className="fw-semibold m-0 text-center text-xl-start">
            {aboutMovieDetail && aboutMovieDetail?.mainData?.title}
          </h1>
        </Col>
      </Row>
      <StyledRateBorder borderTop="1px solid #3A3B46" className="pb-xxl-3 align-items-center d-block d-xxl-flex justify-content-center justify-content-xl-between">
        <div className="py-3 pb-xxl-0 align-items-center d-flex justify-content-center justify-content-xl-start text-light">
          <p className="m-0 fs-3">{DateTime.fromJSDate(new Date(aboutMovieDetail?.mainData?.release_date)).toFormat('yyyy')}</p>
          {getCertification() && (
            <p className="fs-3 p-1 mb-0 mx-3 align-items-center border border-primary d-flex justify-content-center text-primary">
              {getCertification()}
            </p>
          )}
          <span className="fs-3 align-items-center d-flex">
            <p className="my-0">
              {aboutMovieDetail?.mainData?.production_countries.map((country: Country) => country.name).join(', ')}
            </p>
            <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-2 text-primary" />
            <p className="my-0">
              {toHoursAndMinutes(aboutMovieDetail && aboutMovieDetail?.mainData?.runtime)}
            </p>
          </span>
        </div>
        <div className="rating align-items-center d-flex py-3 pb-xxl-0 justify-content-center justify-content-xl-start">
          <span className="fs-3 me-3 me-xxl-2 align-items-center d-flex justify-content-end justify-content-xl-start">
            <FontAwesomeIcon icon={solid('star')} size="xs" className="star mb-2 mt-1" />
            <div className="d-flex">
              <p className="fw-bold m-0 mx-2">0/5</p>
              <p className="m-0 text-light">(0)</p>
            </div>
          </span>
          <BorderButton
            buttonClass="d-flex rate-btn"
            variant="lg"
            icon={regular('star')}
            iconClass="mb-1 me-2"
            iconSize="sm"
            lable="Rate"
            handleClick={handleBorderButton}
          />
        </div>
      </StyledRateBorder>
      <div className="d-block d-xxl-flex justify-content-center justify-content-xxl-between py-3">
        <div className="align-items-center d-flex justify-content-center justify-content-xl-start">
          <p className="m-0 me-1 me-sm-3 fs-3 fw-bold">Worth watching?</p>
          <WorthWatchIcon />
        </div>
        <BorderButton
          buttonClass="d-none d-xxl-flex share-btn"
          variant="lg"
          icon={solid('share-nodes')}
          iconClass="me-2"
          iconSize="sm"
          lable="Share"
        />
      </div>
      <Row className="align-items-center justify-content-center justify-content-xl-start">
        <Col xs={6} sm={5} xl={12}>
          <WorthContent />
        </Col>
        <Col xs={6} sm={5} xl={12} className="pt-xl-3 pt-xxl-0">
          <BorderButton
            buttonClass="d-flex d-xxl-none share-btn"
            variant="lg"
            icon={solid('share-nodes')}
            iconClass="me-2"
            iconSize="sm"
            lable="Share"
          />
        </Col>
      </Row>
      <MoviesModal show={show} setShow={setShow} ButtonType="rate" />
    </AboutMovieDetails>
  );
}

export default AboutDetails;
