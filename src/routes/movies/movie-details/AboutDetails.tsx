/* eslint-disable max-lines */
import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import RoundButton from '../../../components/ui/RoundButton';
import WorthWatchIcon, { StyledLikeIcon } from '../components/WorthWatchIcon';
import MoviesModal from '../components/MoviesModal';
import {
  AdditionalMovieData, Country, MovieReleaseResults, ReleaseDate,
} from '../../../types';
import BorderButton from '../../../components/ui/BorderButton';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import ShareLinksModal from '../../../components/ui/ShareLinksModal';
import { enableDevFeatures } from '../../../utils/configEnvironment';

interface AboutMovieData {
  aboutMovieDetail: AdditionalMovieData
}
const StyledVerticalBorder = styled.div`
  border-right: 1px solid #3A3B46;
  @media(min-width: 767px) {
    border-left: 1px solid #3A3B46;
  }
`;
const AboutMovieDetails = styled.div`
  .small-initial {
    width: 2.063rem;
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
  .burst {
    color: #FF1800;
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
const StyleWatchWorthIcon = styled(FontAwesomeIcon)`
  width: 0.995rem;
  height: 0.997rem;
`;
const StyledInitial = styled.p`
  padding: 0.34rem 0.68rem;
`;

function AboutDetails({ aboutMovieDetail }: AboutMovieData) {
  const [showRating, setShowRating] = useState(false);
  const [showGoreRating, setShowGoreRating] = useState(false);
  const [showShareLinks, setShowShareLinks] = useState(false);
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
    if (!certificationData) {
      const certificate = aboutMovieDetail?.mainData?.release_dates?.results?.find(
        (release: MovieReleaseResults) => release.release_dates.find(
          (movieCertificate: ReleaseDate) => movieCertificate.certification,
        ),
      );
      return certificate?.release_dates[0]?.certification;
    }
    return certificationData ? certificationData.certification : '';
  };
  const handleBorderButton = () => {
    setShowRating(true);
  };
  const handleShowShareLinks = () => setShowShareLinks(true);
  return (
    <AboutMovieDetails className="text-xl-start pt-4">
      <Row className="justify-content-center mt-2 mt-xl-0">
        <Col xs={10} sm={8} md={6} lg={9} xl={12} className="px-xl-0">
          <h1 className="fw-semibold m-0 text-center text-xl-start">
            {aboutMovieDetail && aboutMovieDetail?.mainData?.title}
          </h1>
        </Col>
      </Row>
      <div className="d-block align-items-center justify-content-center justify-content-xl-between">
        <Row>
          <div className="d-flex justify-content-between my-3 text-light px-0">
            <div className="d-flex">
              <p className="m-0 fs-3 align-self-center">{DateTime.fromJSDate(new Date(aboutMovieDetail?.mainData?.release_date)).toFormat('yyyy')}</p>
              {getCertification() && (
                <div className="d-flex align-items-center mx-3 mx-lg-2">
                  <StyledInitial className="border border-primary mb-0 text-center text-primary">
                    {getCertification()}
                  </StyledInitial>
                </div>
              )}
              <p className="m-0 ms-1 fs-3 align-self-center">
                {toHoursAndMinutes(aboutMovieDetail && aboutMovieDetail?.mainData?.runtime)}
              </p>
            </div>
            <div>
              <BorderButton
                buttonClass="d-flex share-btn bg-black py-2"
                variant="lg"
                icon={solid('share-nodes')}
                iconClass="me-2"
                iconSize="sm"
                lable="Share"
                handleClick={handleShowShareLinks}
              />
            </div>
          </div>
          {aboutMovieDetail?.mainData?.production_countries.length > 0
            && (
              <p className="mb-3 text-light p-0">
                {aboutMovieDetail?.mainData?.production_countries.map((country: Country) => country.name).join(', ')}
              </p>
            )}
          <StyledBorder className="d-md-none" />
        </Row>

        {enableDevFeatures
          && (
            <Row className="justify-content-between mt-4">
              <Col xs={12} md={3} className="px-0">
                <div className="d-flex justify-content-between d-md-block align-items-center">
                  <p className="fs-3 fw-bold text-md-center m-md-0 mb-0">User rating</p>
                  <div className="d-flex mt-md-3 justify-content-md-center">
                    <FontAwesomeIcon icon={solid('star')} size="xs" className="star m-md-0" />
                    <div className="d-flex align-items-center m-md-0 ">
                      <p className="fw-bold m-0 mx-2">3.3/5</p>
                      <p className="m-0 text-light">(99k)</p>
                    </div>
                  </div>
                  <BorderButton
                    buttonClass="mx-md-auto rate-btn bg-black py-2 mt-md-4 justify-content-md-center"
                    variant="lg"
                    icon={regular('star')}
                    iconClass="me-2"
                    iconSize="sm"
                    lable="Rate"
                    handleClick={handleBorderButton}
                  />
                </div>
                <div className="d-flex justify-content-center my-3 d-md-none ">
                  <RoundButton className="w-100 fs-3 fw-bold">Write a review</RoundButton>
                </div>
                <StyledBorder className="d-md-none" />
              </Col>
              <Col xs={6} md={5} className="p-0">
                <StyledVerticalBorder className="mt-4 mt-md-0">
                  <p className="fs-3 fw-bold text-center">Worth watching?</p>
                  <div className="mt-2 d-flex justify-content-center">
                    <StyledLikeIcon className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
                      <StyleWatchWorthIcon icon={regular('thumbs-up')} />
                    </StyledLikeIcon>
                    <p className="fs-3 fw-bold m-0 align-self-center" style={{ color: '#00FF0A' }}>Worth it!</p>
                  </div>
                  <div className="mt-3">
                    <WorthWatchIcon />
                  </div>
                </StyledVerticalBorder>
              </Col>
              <Col xs={6} md={3} className="p-0 mt-4 mt-md-0">
                <p className="fs-3 fw-bold text-center">Gore factor</p>
                <div className="mt-2 d-flex justify-content-center">
                  <FontAwesomeIcon icon={solid('burst')} size="xs" className="burst" />
                  <div className="d-flex align-items-center">
                    <p className="fw-bold m-0 mx-2">3.3/5</p>
                    <p className="m-0 text-light">(99k)</p>
                  </div>
                </div>
                <div className="mt-4 d-flex justify-content-center">
                  <BorderButton
                    buttonClass="d-flex rate-btn bg-black py-2"
                    variant="lg"
                    icon={solid('burst')}
                    iconClass="me-2"
                    iconSize="sm"
                    lable="Rate"
                    handleClick={handleBorderButton}
                  />
                </div>
              </Col>
              <div className="d-none d-md-flex justify-content-center mt-3">
                <RoundButton className="w-50 fs-3 fw-bold">Write a review</RoundButton>
              </div>
              <StyledBorder className="d-md-none my-3" />
            </Row>
          )}
      </div>
      <MoviesModal show={showRating} setShow={setShowRating} ButtonType="rate" />
      <MoviesModal show={showGoreRating} setShow={setShowGoreRating} ButtonType="gore" />
      {showShareLinks && <ShareLinksModal show={showShareLinks} setShow={setShowShareLinks} />}
    </AboutMovieDetails>
  );
}

export default AboutDetails;
