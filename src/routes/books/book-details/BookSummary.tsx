/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import ShareButton from '../../../components/ui/ShareButton';
import RoundButton from '../../../components/ui/RoundButton';
import BooksModal from '../components/BooksModal';
import BorderButton from '../../../components/ui/BorderButton';
import CustomRatingText from '../../../components/ui/CustomRatingText';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import { WorthWatchingStatus } from '../../../types';
import WorthWatchIcon, { StyledLikeIcon, StyledDislikeIcon } from '../../movies/components/WorthWatchIcon';
import { bookDetail } from '../components/booksList';
import ShareLinksModal from '../../../components/ui/ShareLinksModal';
import { urlForMovie } from '../../../utils/url-utils';

interface Props {
  setReviewForm: (val: boolean) => void;
  setShowReviewForm: (val: boolean) => void;
}
const StyleWatchWorthIcon = styled(FontAwesomeIcon)`
  width: 0.995rem;
  height: 0.997rem;
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
    color: var(--bs-orange);
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
      font-size: 1rem;
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
      font-size: 1rem;
    }
  }

`;
const StyledVerticalBorder = styled.div`
  border-right: 1px solid #3A3B46;
  @media(min-width: 767px) {
    border-left: 1px solid #3A3B46;
  }
`;
function BookSummary({
  setReviewForm, setShowReviewForm,
}: Props) {
  const [worthIt, setWorthIt] = useState<WorthWatchingStatus | null>(null);
  const [showGoreRating, setShowGoreRating] = useState(false);
  const [liked, setLike] = useState<boolean>(
    bookDetail.userData.worthWatching === WorthWatchingStatus.Up,
  );
  const [disLiked, setDisLike] = useState<boolean>(
    bookDetail.userData.worthWatching === WorthWatchingStatus.Down,
  );
  const reviewButtonRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const navigate = useNavigate();
  const [showRating, setShowRating] = useState(false);
  const [showShareLinks, setShowShareLinks] = useState(false);
  const hasRating = bookDetail.userData !== null && bookDetail.userData?.rating !== 0;
  const hasGoreFactor = bookDetail.userData !== null && bookDetail.userData?.goreFactorRating !== 0;
  const handleShowShareLinks = () => setShowShareLinks(true);
  const handleReviwRedirect = () => {
    setReviewForm!(true);
    setShowReviewForm!(true);
    if (params['*'] !== 'reviews') {
      navigate(`/app/books/${params.id}/reviews`, { state: { bookId: params.id } });
    }
  };
  return (
    <AboutBookDetails className="text-xl-start pt-4">
      <Row className="justify-content-center mt-2 mt-xl-0">
        <Col xs={12}>
          <h1 className="fw-semibold m-0 text-center text-xl-start">
            The Turn Of The Screw
          </h1>
        </Col>
      </Row>
      <div className="py-3 pb-xxl-0 align-items-center d-flex justify-content-between justify-content-md-center justify-content-lg-between text-light">
        <p className="m-0 fs-3">George R.R Martin</p>
        <div className="ms-2 d-block d-sm-none d-lg-block d-xxl-none">
          <ShareButton />
        </div>
      </div>
      <div className="d-flex  justify-content-between">
        <div className="d-flex justify-content-between align-items-center">
          <span className="fs-3 d-lg-flex text-center">
            <span className="m-0 fw-bold">
              Year:&nbsp;
            </span>
            <span className="m-0 text-light"> 1921</span>
          </span>
          <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-lg-2 text-primary" />
          <span className="fs-3 d-lg-flex text-center">
            <span className="m-0 fw-bold">
              Pages:&nbsp;
            </span>
            <span className="m-0 text-light"> 447</span>
          </span>
          <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-lg-2 text-primary" />
          <span className="fs-3 fw-lignt d-lg-flex text-center">
            <span className="m-0 fw-bold">
              ISBN:&nbsp;
            </span>
            <span className="m-0 text-light"> 272423118X</span>
          </span>
          <div className="ms-2 ms-xl-3 d-none d-sm-block d-lg-none d-xxl-block">
            <div className="d-flex justify-content-end justify-content-md-center">
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
          </div>
        </div>
        <div><ShareButton /></div>
      </div>

      <StyledBorder className="d-md-none mt-4" />
      <Row className="justify-content-between mt-4">
        <Col xs={12} md={3} className="px-0">
          <div className="d-flex justify-content-between d-md-block align-items-center mx-2 mx-lg-0">
            <p className="fw-bold text-md-center mb-0 mb-md-3">User rating</p>

            {bookDetail.ratingUsersCount === 0
              ? <p className="fw-bold m-0 align-self-center text-light text-center">Not yet rated</p>
              : (
                <div className="d-flex mt-md-3 justify-content-md-center">
                  <CustomRatingText
                    rating={bookDetail.rating}
                    icon={solid('star')}
                    ratingType="star"
                    customWidth="1.638rem"
                    customHeight="1.563rem"
                    ratingCount={`(${bookDetail.ratingUsersCount ? bookDetail.ratingUsersCount : 0})`}
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
              lable={hasRating ? String(bookDetail.userData ? bookDetail.userData?.rating : 'Rate') : 'Rate'}
              handleClick={() => {
                setShowRating(true);
                //  setShowReviewForm!(false);
              }}
            />
          </div>
          <div id="reviewSmallBUtton" className="d-flex justify-content-center my-3 d-md-none ">
            <RoundButton
              className="w-100 fw-bold"
              onClick={() => { handleReviwRedirect(); }}
            >
              {' '}
              Write a review
            </RoundButton>
          </div>
          <StyledBorder className="d-md-none" />
        </Col>
        <Col xs={6} md={5} className="p-0">
          <StyledVerticalBorder className="mt-4 mt-md-0">
            <p className="fw-bold text-center">Worth watching?</p>
            <div className="d-flex justify-content-center" style={{ height: 30 }}>
              {bookDetail.worthWatching === WorthWatchingStatus.Up
                && (
                  <>
                    <StyledLikeIcon className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
                      <StyleWatchWorthIcon icon={regular('thumbs-up')} />
                    </StyledLikeIcon>
                    <p className="fw-bold m-0 align-self-center" style={{ color: 'var(--bs-success)' }}>Worth it!</p>
                  </>
                )}
              {bookDetail.worthWatching === WorthWatchingStatus.Down
                && (
                  <>
                    <StyledDislikeIcon role="button" className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
                      <StyleWatchWorthIcon icon={regular('thumbs-down')} />
                    </StyledDislikeIcon>
                    <p className="fs-3 fw-bold m-0 align-self-center" style={{ color: '#FF1800' }}>Not worth it!</p>
                  </>
                )}

              {bookDetail.worthWatching === WorthWatchingStatus.NoRating
                && <div className="fw-bold m-0 align-self-center text-light text-center">Not yet rated</div>}
            </div>

            {/* Worth Watch Icons */}
            <div className="mt-3">
              <WorthWatchIcon
                movieData={bookDetail}
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
          {bookDetail.goreFactorRatingUsersCount === 0
            ? <p className="fs-3 fw-bold m-0 align-self-center text-light text-center">Not yet rated</p>
            : (
              <div className="mt-2 d-flex justify-content-center">
                <CustomRatingText
                  rating={bookDetail.userData ? bookDetail.userData?.goreFactorRating : 0}
                  icon={solid('burst')}
                  ratingType="burst"
                  customWidth="1.638rem"
                  customHeight="1.563rem"
                  ratingCount={`(${bookDetail.goreFactorRatingUsersCount ? bookDetail.goreFactorRatingUsersCount : 0})`}
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
              lable={hasGoreFactor ? String(bookDetail.userData ? bookDetail.userData?.goreFactorRating : 'Rate') : 'Rate'}
              handleClick={() => {
                setShowGoreRating(true);
                // setShowReviewForm!(false);
              }}
            />
          </div>
        </Col>
        <div
          ref={reviewButtonRef}
          id="writeReview"
          className="d-none d-md-flex justify-content-center mt-4 pt-3"
        >
          <RoundButton
            className="w-50 fw-bold"
            onClick={() => { handleReviwRedirect(); }}
          >
            Write a review
          </RoundButton>
        </div>
        <div
          id="buyNow"
          className="d-none d-md-flex d-lg-none d-xl-flex justify-content-center mt-4"
        >
          <RoundButton className="px-5 fw-bold">
            Buy now
          </RoundButton>
        </div>
        <StyledBorder className="d-md-none my-3" />
      </Row>
      {showRating && <BooksModal rateType="rating" show={showRating} setShow={setShowRating} bookData={bookDetail} setBookData={() => { }} ButtonType="rating" hasRating={hasRating} />}
      {showGoreRating && <BooksModal rateType="goreFactorRating" show={showGoreRating} setShow={setShowGoreRating} bookData={bookDetail} setBookData={() => { }} ButtonType="goreFactorRating" hasGoreFactor={hasGoreFactor} />}
      {showShareLinks
        && (
          <ShareLinksModal
            copyLinkUrl={urlForMovie(params?.id!)}
            show={showShareLinks}
            setShow={setShowShareLinks}
          />
        )}
    </AboutBookDetails>
  );
}

export default BookSummary;
