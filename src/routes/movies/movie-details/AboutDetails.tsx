/* eslint-disable max-lines */
import React, { useState, useEffect } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RoundButton from '../../../components/ui/RoundButton';
import WorthWatchIcon, { StyledDislikeIcon, StyledLikeIcon } from '../components/WorthWatchIcon';
import MoviesModal from '../components/MoviesModal';
import {
  AdditionalMovieData, Country, MovieData, MovieReleaseResults, ReleaseDate, WorthWatchingStatus,
} from '../../../types';
import BorderButton from '../../../components/ui/BorderButton';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import ShareLinksModal from '../../../components/ui/ShareLinksModal';
import CustomRatingText from '../../../components/ui/CustomRatingText';
import { createOrUpdateWorthWatching, deleteWorthWatching } from '../../../api/movies';
import { updateMovieUserData } from '../components/updateMovieDataUtils';
import { urlForMovie } from '../../../utils/url-utils';
import { generateAmazonAffiliateLinkForMovie } from '../../../utils/text-utils';

const StyleWatchWorthIcon = styled(FontAwesomeIcon)`
  width: 0.995rem;
  height: 0.997rem;
`;
interface AboutMovieData {
  aboutMovieDetail: AdditionalMovieData
  movieData: MovieData;
  setMovieData: React.Dispatch<React.SetStateAction<MovieData | undefined>>
  setReviewForm?: (value: boolean) => void;
  reviewButtonRef?: any;
  reviewSmallButtonRef?: any;
  handleScroll?: () => void;
  setShowReviewForm?: (value: boolean) => void;
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
    color: var(--bs-orange);
    width: 1.638rem;
    height: 1.563rem;
  }
  .burst {
    color: var(--bs-primary);
    width: 1.638rem;
    height: 1.563rem;
  }
  .rate-btn {
    padding-right: 1.438rem;
    padding-left: 1.438rem;
    svg {
      width: 1.179rem;
      height: 1.125rem;
    }
    p {
      font-size: var(--fs-4);
    }
  }
  .share-btn {
    padding-right: 0 1.25rem;
    padding-left: 0 1.25rem;
    svg {
      width: 1.055rem;
      height: 1.125rem;
    }
    p {
      font-size: var(--fs-4);
    }
  }

`;
const StyledInitial = styled.p`
  padding: 0.34rem 0.68rem;
`;

function AboutDetails({
  aboutMovieDetail, movieData, setMovieData, setReviewForm, reviewButtonRef,
  handleScroll, reviewSmallButtonRef, setShowReviewForm,
}: AboutMovieData) {
  const [showRating, setShowRating] = useState(false);
  const [showGoreRating, setShowGoreRating] = useState(false);
  const [showShareLinks, setShowShareLinks] = useState(false);
  /** NOTE: `worthIt` is used as a effect-trigger to call api so
   * do *not* use `movieData.worthWatching` as iniial value of `worthIt` state. */
  const [worthIt, setWorthIt] = useState<WorthWatchingStatus | null>(null);
  const [liked, setLike] = useState<boolean>(
    movieData.userData.worthWatching === WorthWatchingStatus.Up,
  );
  const [disLiked, setDisLike] = useState<boolean>(
    movieData.userData.worthWatching === WorthWatchingStatus.Down,
  );
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.id && worthIt !== null) {
      if (worthIt === WorthWatchingStatus.NoRating) {
        deleteWorthWatching(params.id)
          .then((res) => {
            updateMovieUserData(res.data, 'worthWatching', setMovieData!);
          });
      } else {
        createOrUpdateWorthWatching(params.id, worthIt).then((res) => {
          updateMovieUserData(res.data, 'worthWatching', setMovieData!);
        });
      }
    }
  }, [worthIt, params, setMovieData]);

  const handleReviwRedirect = () => {
    setReviewForm!(true);
    setShowReviewForm!(true);
    if (params['*'] !== 'reviews') {
      navigate(`/app/movies/${params.id}/reviews`, { state: { movieId: params.id } });
    }
  };
  const toHoursAndMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
  const handleShowShareLinks = () => setShowShareLinks(true);
  const hasRating = movieData.userData !== null && movieData.userData?.rating !== 0;
  const hasGoreFactor = movieData.userData !== null && movieData.userData?.goreFactorRating !== 0;
  const to = generateAmazonAffiliateLinkForMovie(aboutMovieDetail?.mainData?.title);
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
        <Row className="align-items-center">
          <Col className="d-flex justify-content-between my-3 text-light px-0">
            <div className="d-flex">
              <p className="m-0 fs-3 align-self-center">{DateTime.fromJSDate(new Date(aboutMovieDetail?.mainData?.release_date)).toFormat('yyyy')}</p>
              {getCertification() && (
                <div className="d-flex align-items-center mx-3 mx-lg-2">
                  <StyledInitial className="border border-primary mb-0 text-center text-primary">
                    {getCertification()}
                  </StyledInitial>
                </div>
              )}
              {aboutMovieDetail && aboutMovieDetail?.mainData?.runtime !== 0 && (
                <p className="m-0 ms-1 fs-3 align-self-center">
                  {toHoursAndMinutes(aboutMovieDetail && aboutMovieDetail?.mainData?.runtime)}
                </p>
              )}
            </div>
          </Col>
          <Col xs={6} md={3} className="p-0">
            <div className="d-flex justify-content-end justify-content-md-center me-md-3">
              <BorderButton
                buttonClass="d-flex share-btn bg-black"
                variant="black"
                icon={solid('share-nodes')}
                iconClass="me-2"
                iconSize="sm"
                lable="Share"
                handleClick={handleShowShareLinks}
              />
            </div>
          </Col>
          {aboutMovieDetail?.mainData?.production_countries.length > 0
            && (
              <p className="mb-3 text-light p-0">
                {aboutMovieDetail?.mainData?.production_countries.map((country: Country) => country.name).join(', ')}
              </p>
            )}
          <StyledBorder className="d-md-none" />
        </Row>

        <Row className="justify-content-between mt-4">
          <Col xs={12} md={3} className="px-0">
            <div className="d-flex justify-content-between d-md-block align-items-center">
              <p className="fw-bold text-md-center mb-0 mb-md-3">User rating</p>

              {movieData.ratingUsersCount === 0
                ? <p className="fw-bold m-0 align-self-center text-light text-center">Not yet rated</p>
                : (
                  <div className="d-flex mt-md-3 justify-content-md-center">
                    <CustomRatingText
                      rating={movieData.rating}
                      icon={solid('star')}
                      ratingType="star"
                      customWidth="1.638rem"
                      customHeight="1.563rem"
                      ratingCount={`(${movieData.ratingUsersCount ? movieData.ratingUsersCount : 0})`}
                    />
                  </div>
                )}

              <BorderButton
                buttonClass="mx-md-auto rate-btn bg-black mt-md-4 justify-content-md-center d-flex"
                variant="black"
                icon={hasRating ? solid('star') : regular('star')}
                iconClass="me-2"
                iconStyle={{ color: hasRating ? 'var(--bs-orange)' : 'white' }}
                iconSize="sm"
                lable={hasRating ? String(movieData.userData ? movieData.userData?.rating : 'Rate') : 'Rate'}
                handleClick={() => { setShowRating(true); setShowReviewForm!(false); }}
              />
            </div>
            <div ref={reviewSmallButtonRef} id=" reviewSmallBUtton" className="d-flex justify-content-center my-3 d-md-none ">
              <RoundButton className="w-100 fw-bold" onClick={() => { handleReviwRedirect(); handleScroll!(); }}> Write a review</RoundButton>
            </div>
            <StyledBorder className="d-md-none" />
          </Col>
          <Col xs={6} md={5} className="p-0">
            <StyledVerticalBorder className="mt-4 mt-md-0">
              <p className="fw-bold text-center">Worth watching?</p>
              <div className="d-flex justify-content-center" style={{ height: 30 }}>
                {movieData.worthWatching === WorthWatchingStatus.Up
                  && (
                    <>
                      <StyledLikeIcon className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
                        <StyleWatchWorthIcon icon={regular('thumbs-up')} onClick={() => setShowReviewForm!(false)} />
                      </StyledLikeIcon>
                      <p className="fw-bold m-0 align-self-center" style={{ color: 'var(--bs-success)' }}>Worth it!</p>
                    </>
                  )}
                {movieData.worthWatching === WorthWatchingStatus.Down
                  && (
                    <>
                      <StyledDislikeIcon role="button" className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
                        <StyleWatchWorthIcon icon={regular('thumbs-down')} onClick={() => setShowReviewForm!(false)} />
                      </StyledDislikeIcon>
                      <p className="fs-3 fw-bold m-0 align-self-center" style={{ color: '#FF1800' }}>Not worth it!</p>
                    </>
                  )}

                {movieData.worthWatching === WorthWatchingStatus.NoRating
                  && <div className="fw-bold m-0 align-self-center text-light text-center">Not yet rated</div>}
              </div>

              {/* Worth Watch Icons */}
              <div className="mt-3">
                <WorthWatchIcon
                  movieData={movieData}
                  setWorthIt={setWorthIt}
                  liked={liked}
                  setLike={setLike}
                  disLiked={disLiked}
                  setDisLike={setDisLike}
                />
              </div>
            </StyledVerticalBorder>
          </Col>
          <Col xs={6} md={3} className="p-0 mt-4 mt-md-0">
            <p className="fs-3 fw-bold text-center">Gore factor</p>
            {movieData.goreFactorRatingUsersCount === 0
              ? <p className="fs-3 fw-bold m-0 align-self-center text-light text-center">Not yet rated</p>
              : (
                <div className="mt-2 d-flex justify-content-center">
                  <CustomRatingText
                    rating={movieData.userData ? movieData.userData?.goreFactorRating : 0}
                    icon={solid('burst')}
                    ratingType="burst"
                    customWidth="1.638rem"
                    customHeight="1.563rem"
                    ratingCount={`(${movieData.goreFactorRatingUsersCount ? movieData.goreFactorRatingUsersCount : 0})`}
                  />
                </div>
              )}
            <div className="mt-4 d-flex justify-content-center">
              <BorderButton
                buttonClass="d-flex rate-btn bg-black d-flex"
                variant="black"
                icon={solid('burst')}
                iconClass={`me-2 ${hasGoreFactor ? 'text-primary' : ''}`}
                iconSize="sm"
                lable={hasGoreFactor ? String(movieData.userData ? movieData.userData?.goreFactorRating : 'Rate') : 'Rate'}
                handleClick={() => { setShowGoreRating(true); setShowReviewForm!(false); }}
              />
            </div>
          </Col>
          <div ref={reviewButtonRef} id="writeReview" className="d-none d-md-flex justify-content-center mt-3">
            <RoundButton className="w-50 fw-bold" onClick={() => { handleReviwRedirect(); handleScroll!(); }}>Write a review</RoundButton>
          </div>
          <div
            id="buyNow"
            className="d-none d-md-flex d-lg-none d-xl-flex justify-content-center mt-4"
          >
            <a href={to} target="_blank" className="text-decoration-none" rel="noreferrer">
              <RoundButton className="px-5 fw-bold">
                Buy now
              </RoundButton>
            </a>
          </div>
          <StyledBorder className="d-md-none my-3" />
        </Row>
      </div>
      {showRating && <MoviesModal rateType="rating" show={showRating} setShow={setShowRating} movieData={movieData} setMovieData={setMovieData} ButtonType="rating" hasRating={hasRating} />}
      {showGoreRating && <MoviesModal rateType="goreFactorRating" show={showGoreRating} setShow={setShowGoreRating} movieData={movieData} setMovieData={setMovieData} ButtonType="goreFactorRating" hasGoreFactor={hasGoreFactor} />}
      {showShareLinks
        && (
          <ShareLinksModal
            copyLinkUrl={urlForMovie(params?.id!)}
            show={showShareLinks}
            setShow={setShowShareLinks}
          />
        )}
    </AboutMovieDetails>
  );
}

AboutDetails.defaultProps = {
  setReviewForm: false,
  reviewButtonRef: null,
  reviewSmallButtonRef: null,
  handleScroll: undefined,
  setShowReviewForm: undefined,
};

export default AboutDetails;
