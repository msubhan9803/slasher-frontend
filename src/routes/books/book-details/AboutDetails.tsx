/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import RoundButton from '../../../components/ui/RoundButton';
import BooksModal from '../components/BooksModal';
import BorderButton from '../../../components/ui/BorderButton';
import CustomRatingText from '../../../components/ui/CustomRatingText';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import { BookData, WorthReadingStatus } from '../../../types';
import ShareLinksModal from '../../../components/ui/ShareLinksModal';
import { urlForMovie } from '../../../utils/url-utils';
import { generateAmazonAffiliateLinkForBook, getPrefferedISBN } from '../../../utils/text-utils';
import { getYearFromDate } from '../../../utils/date-utils';
import WorthWatchIcon, { StyledDislikeIcon, StyledLikeIcon } from '../components/WorthWatchIcon';
import { createOrUpdateWorthReading, deleteWorthReading } from '../../../api/books';
import { updateBookUserData } from '../components/updateBookDataUtils';

interface Props {
  bookData: BookData,
  setBookData: React.Dispatch<React.SetStateAction<BookData | undefined>>
  setReviewForm: (val: boolean) => void;
  reviewButtonRef?: any;
  reviewSmallButtonRef?: any;
  setShowReviewForm?: (value: boolean) => void;
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

function AboutDetails({
  bookData, setBookData, setReviewForm, setShowReviewForm, reviewButtonRef,
  reviewSmallButtonRef,
}: Props) {
  const [showRating, setShowRating] = useState(false);
  const [showGoreRating, setShowGoreRating] = useState(false);
  const [showShareLinks, setShowShareLinks] = useState(false);

  const [worthIt, setWorthIt] = useState<WorthReadingStatus | null>(null);
  const [liked, setLike] = useState<boolean>(
    bookData.userData.worthReading === WorthReadingStatus.Up,
  );
  const [disLiked, setDisLike] = useState<boolean>(
    bookData.userData.worthReading === WorthReadingStatus.Down,
  );
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.id && worthIt !== null) {
      if (worthIt === WorthReadingStatus.NoRating) {
        deleteWorthReading(params.id)
          .then((res) => {
            updateBookUserData(res.data, 'worthReading', setBookData!);
          });
      } else {
        createOrUpdateWorthReading(params.id, worthIt).then((res) => {
          updateBookUserData(res.data, 'worthReading', setBookData!);
        });
      }
    }
  }, [worthIt, params, setBookData]);

  const handleShowShareLinks = () => setShowShareLinks(true);
  const handleReviwRedirect = () => {
    setReviewForm!(true);
    setShowReviewForm!(true);
    if (params['*'] !== 'reviews') {
      navigate(`/app/books/${params.id}/reviews`, { state: { bookId: params.id } });
    }
  };

  const hasRating = bookData.userData !== null && bookData.userData?.rating !== 0;
  const hasGoreFactor = bookData.userData !== null && bookData.userData?.goreFactorRating !== 0;
  const to = generateAmazonAffiliateLinkForBook(bookData.name, bookData.author?.join(', '));
  const isbn = getPrefferedISBN(bookData.isbnNumber);
  const year = getYearFromDate(bookData.publishDate);
  return (
    <AboutBookDetails className="text-xl-start pt-4">
      <Row className="justify-content-center mt-2 mt-xl-0">
        <Col xs={12}>
          <h1 className="fw-semibold m-0 text-center text-xl-start">
            {bookData.name}
          </h1>
        </Col>
      </Row>
      <div className="py-3 pb-xxl-0 align-items-center d-flex justify-content-between justify-content-md-center justify-content-lg-between text-light">
        <p className="m-0 fs-3">{bookData.author?.join(', ')}</p>
        <div className="ms-2 d-block d-sm-none d-lg-block d-xxl-none">
          <BorderButton
            buttonClass="d-flex d-xxl-none share-btn"
            variant="lg"
            icon={solid('share-nodes')}
            iconClass="me-2"
            iconSize="sm"
            lable="Share"
            handleClick={handleShowShareLinks}
          />
        </div>
      </div>
      <div className="d-flex  justify-content-between">
        <div className="d-flex justify-content-between align-items-center">
          {year && (
            <span className="fs-3 d-lg-flex text-center">
              <span className="m-0 fw-bold">
                Year:&nbsp;
              </span>
              <span className="m-0 text-light">{year}</span>
            </span>
          )}

          {bookData.numberOfPages
            && (
              <>
                <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-lg-2 text-primary" />
                <span className="fs-3 d-lg-flex text-center">
                  <span className="m-0 fw-bold">
                    Pages:&nbsp;
                  </span>
                  <span className="m-0 text-light">{bookData.numberOfPages}</span>
                </span>
              </>
            )}
          {isbn && (
            <>
              <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-lg-2 text-primary" />
              <span className="fs-3 fw-lignt d-lg-flex text-center">
                <span className="m-0 fw-bold">
                  ISBN:&nbsp;
                </span>
                <span className="m-0 text-light">{isbn}</span>
              </span>
            </>
          )}
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
      </div>

      <StyledBorder className="d-md-none mt-4" />
      <Row className="justify-content-between mt-4">
        <Col xs={12} md={3} className="px-0">
          <div className="d-flex justify-content-between d-md-block align-items-center mx-2 mx-lg-0">
            <p className="fw-bold text-md-center mb-0 mb-md-3">User rating</p>

            {bookData.ratingUsersCount === 0
              ? <p className="fw-bold m-0 align-self-center text-light text-center">Not yet rated</p>
              : (
                <div className="d-flex mt-md-3 justify-content-md-center">
                  <CustomRatingText
                    rating={bookData.rating}
                    icon={solid('star')}
                    ratingType="star"
                    customWidth="1.638rem"
                    customHeight="1.563rem"
                    ratingCount={`(${bookData.ratingUsersCount ? bookData.ratingUsersCount : 0})`}
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
              lable={hasRating ? String(bookData.userData ? bookData.userData?.rating : 'Rate') : 'Rate'}
              handleClick={() => { setShowRating(true); setShowReviewForm!(false); }}
            />
          </div>
          <div ref={reviewSmallButtonRef} id="reviewSmallBUtton" className="d-flex justify-content-center my-3 d-md-none ">
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
              {bookData.worthReading === WorthReadingStatus.Up
                && (
                  <>
                    <StyledLikeIcon className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
                      <StyleWatchWorthIcon icon={regular('thumbs-up')} />
                    </StyledLikeIcon>
                    <p className="fw-bold m-0 align-self-center" style={{ color: 'var(--bs-success)' }}>Worth it!</p>
                  </>
                )}
              {bookData.worthReading === WorthReadingStatus.Down
                && (
                  <>
                    <StyledDislikeIcon role="button" className="d-flex justify-content-center align-items-center shadow-none bg-transparent me-2 rounded-circle">
                      <StyleWatchWorthIcon icon={regular('thumbs-down')} />
                    </StyledDislikeIcon>
                    <p className="fs-3 fw-bold m-0 align-self-center" style={{ color: '#FF1800' }}>Not worth it!</p>
                  </>
                )}

              {bookData.worthReading === WorthReadingStatus.NoRating
                && <div className="fw-bold m-0 align-self-center text-light text-center">Not yet rated</div>}
            </div>

            {/* Worth Watch Icons */}
            <div className="mt-3">
              <WorthWatchIcon
                bookData={bookData}
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
          {bookData.goreFactorRatingUsersCount === 0
            ? <p className="fs-3 fw-bold m-0 align-self-center text-light text-center">Not yet rated</p>
            : (
              <div className="mt-2 d-flex justify-content-center">
                <CustomRatingText
                  rating={bookData.userData ? bookData.userData?.goreFactorRating : 0}
                  icon={solid('burst')}
                  ratingType="burst"
                  customWidth="1.638rem"
                  customHeight="1.563rem"
                  ratingCount={`(${bookData.goreFactorRatingUsersCount ? bookData.goreFactorRatingUsersCount : 0})`}
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
              lable={hasGoreFactor ? String(bookData.userData ? bookData.userData?.goreFactorRating : 'Rate') : 'Rate'}
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
          <a href={to} target="_blank" className="text-decoration-none" rel="noreferrer">
            <RoundButton className="px-5 fw-bold">
              Buy now
            </RoundButton>
          </a>
        </div>
        <StyledBorder className="d-md-none my-3" />
      </Row>
      {showRating && <BooksModal rateType="rating" show={showRating} setShow={setShowRating} bookData={bookData} setBookData={setBookData} ButtonType="rating" hasRating={hasRating} />}
      {showGoreRating && <BooksModal rateType="goreFactorRating" show={showGoreRating} setShow={setShowGoreRating} bookData={bookData} setBookData={setBookData} ButtonType="goreFactorRating" hasGoreFactor={hasGoreFactor} />}
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
AboutDetails.defaultProps = {
  reviewButtonRef: null,
  reviewSmallButtonRef: null,
  setShowReviewForm: undefined,
};
export default AboutDetails;
