/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import {
  Navigate, Route, Route, Routes, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import Switch from '../../../components/ui/Switch';
import AboutDetails from './AboutDetails';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { BookIconProps } from '../components/BookProps';
import BookEdit from '../book-edit/BookEdit';
import BookOverview from './BookOverview';
import { BookIconList } from '../components/booksList';
import BookPosts from '../book-posts/BookPosts';
import BorderButton from '../../../components/ui/BorderButton';
import CustomGroupIcons from '../../../components/ui/CustomGroupIcons';
import RoundButton from '../../../components/ui/RoundButton';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import BookReviews from '../book-reviews/BookReviews';
import { enableDevFeatures } from '../../../env';
import { BookData } from '../../../types';
import { addBookUserStatus, deleteBookUserStatus, getBooksIdList } from '../../../api/books';
import BookReviewDetails from '../book-reviews/BookReviewDetails';

const StyledBookPoster = styled.div`
  aspect-ratio: 0.67;
  img{
    object-fit: cover;
    box-shadow: 0 0 0 1px var(--poster-border-color);
  }
`;
type OptionType = { value: string, label: string, devOnly?: boolean };
const tabsForAllViews: OptionType[] = [
  { value: 'details', label: 'Details' },
  { value: 'reviews', label: 'Reviews' },
];
const tabsForSelf: OptionType[] = [
  ...tabsForAllViews,
  { value: 'edit', label: 'Edit' },
];
const tabsForViewer = tabsForAllViews;
const filterEnableDevFeatures = (t: OptionType) => (enableDevFeatures ? true : (!t.devOnly));

type AboutBooksProps = {
  bookData: BookData;
  setBookData: (val: any) => void;
};

function AboutBooks({ bookData, setBookData }: AboutBooksProps) {
  const [searchParams] = useSearchParams();
  const [reviewForm, setReviewForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [bookIdList, setBookIdList] = useState();
  const queryParam = searchParams.get('view');
  // const loginUserId = useAppSelector((state) => state.user.user.id);
  const selfView = false;
  const tabs = (selfView ? tabsForSelf : tabsForViewer).filter(filterEnableDevFeatures);
  const navigate = useNavigate();
  const params = useParams();
  const reviewButtonRef = useRef<HTMLDivElement>(null);
  const reviewSmallButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.summary === 'edit' && queryParam !== 'self') { navigate(`/books/${params.id}/details`); }
  });

  const [bgColor, setBgColor] = useState<boolean>(false);
  const [bookIconListData, setBookIconListData] = useState(BookIconList);

  const handleBookAddRemove = (labelName: string, isFavorite: boolean) => {
    if (params.id && !isFavorite) {
      addBookUserStatus(params.id, labelName)
        .then((res) => {
          if (res.data.success) {
            const tempBookIconList = [...bookIconListData];
            tempBookIconList.forEach((bookIcon) => {
              if (bookIcon.key === labelName) {
                // eslint-disable-next-line no-param-reassign
                bookIcon.addBook = !bookIcon.addBook;
              }
            });
            setBookIconListData(tempBookIconList);
          }
        });
    } else if (params.id && isFavorite) {
      deleteBookUserStatus(params.id, labelName)
        .then((res) => {
          if (res.data.success) {
            const tempBookIconList = [...bookIconListData];
            tempBookIconList.forEach((bookIcon) => {
              if (bookIcon.key === labelName) {
                // eslint-disable-next-line no-param-reassign
                bookIcon.addBook = !bookIcon.addBook;
              }
            });
            setBookIconListData(tempBookIconList);
          }
        });
    }
  };

  useEffect(() => {
    if (params) {
      getBooksIdList(params.id)
        .then((res) => setBookIdList(res.data));
    }
  }, [params]);

  useEffect(() => {
    const updateBookIconList = () => {
      if (bookIdList) {
        BookIconList.forEach((bookIcon) => {
          const { key } = bookIcon;
          if (key in bookIdList) {
            // eslint-disable-next-line no-param-reassign
            bookIcon.addBook = !!bookIdList[key];
          }
        });
        setBookIconListData(BookIconList);
      }
    };
    updateBookIconList();
  }, [bookIdList]);

  return (
    <div>
      <div className="bg-dark p-4 pb-0 rounded-2 mb-3">
        <Row className="justify-content-center">
          <Col xs={10} sm={7} lg={8} xl={5} className="text-center">
            <div>
              <StyledBookPoster className="mx-4">
                <Image src={bookData?.coverImage?.image_path} alt="book poster" className="rounded-3 w-100 h-100" />
              </StyledBookPoster>
              <div className="d-none d-xl-block mt-3">
                <span className="h3">Your lists</span>
                <div className="mt-2 d-flex justify-content-between">
                  {bookIconListData.map((iconList: BookIconProps) => (
                    <CustomGroupIcons
                      key={iconList.key}
                      label={iconList.label}
                      icon={iconList.icon}
                      iconColor={iconList.iconColor}
                      width={iconList.width}
                      height={iconList.height}
                      addData={iconList.addBook}
                      onClickIcon={() => handleBookAddRemove(
                        iconList.key,
                        iconList.addBook,
                      )}
                    />
                  ))}
                </div>
                {enableDevFeatures
                  && (
                    <div className="d-none d-xl-block mb-2">
                      <RoundButton variant="black" className="w-100">Create to list</RoundButton>
                    </div>
                  )}
              </div>
            </div>
          </Col>
          <Col xl={7}>
            <AboutDetails
              setReviewForm={setReviewForm}
              bookData={bookData}
              setBookData={setBookData}
              reviewButtonRef={reviewButtonRef}
              reviewSmallButtonRef={reviewSmallButtonRef}
              setShowReviewForm={setShowReviewForm}
            />
          </Col>
        </Row>
        <Row className="d-xl-none justify-content-center mt-2 mt-xl-2">
          <Col xs={12} sm={7} md={5} lg={9} className="text-center">
            <span className="fs-5">Your lists</span>
            <div className="mt-2 d-flex justify-content-around">
              {bookIconListData.map((iconList: BookIconProps) => (
                <CustomGroupIcons
                  key={iconList.label}
                  label={iconList.label}
                  icon={iconList.icon}
                  iconColor={iconList.iconColor}
                  width={iconList.width}
                  height={iconList.height}
                  addData={iconList.addBook}
                  onClickIcon={() => handleBookAddRemove(
                    iconList.key,
                    iconList.addBook,
                  )}
                />
              ))}
            </div>
          </Col>
          {enableDevFeatures
            && (
              <div className="d-block d-xl-none">
                <RoundButton variant="black" className="w-100">Create a list</RoundButton>
              </div>
            )}
          <div className="d-block d-md-none d-lg-block mt-3">
            <RoundButton className="w-100">Buy now</RoundButton>
          </div>
        </Row>
        {enableDevFeatures
          && (
            <>
              <StyledBorder className="d-md-none mt-4" />
              <Row className="d-lg-none mt-3 mb-2 text-center">
                <Col xs={12}>
                  <p className="text-center fw-bold mt-2">Get updates for this book</p>
                  <BorderButton
                    customButtonCss="width: 100% !important;"
                    buttonClass={`${bgColor ? 'text-black' : ' text-white'} `}
                    toggleBgColor={bgColor}
                    handleClick={() => setBgColor(!bgColor)}
                    toggleButton
                  />
                </Col>
              </Row>
              <Row className="align-items-center justify-content-center mt-4 mb-2 d-lg-none">
                <Col>
                  <div className="align-items-center d-flex justify-content-center">
                    <span className="mb-2">Push notifications</span>
                    <Switch id="bookPushNotificationsSwitch" className="ms-4" />
                  </div>
                </Col>
              </Row>
            </>
          )}
        <Row className="justify-content-center justify-content-xl-start">
          <Col xs={12} md={6} lg={queryParam === 'self' ? 10 : 12} xl={9}>
            <TabLinks
              tabsClass="start"
              tabsClassSmall="start"
              tabLink={tabs}
              toLink={`/app/books/${params.id}`}
              selectedTab={params && params['*']!.startsWith('reviews/') ? 'reviews' : params['*']}
              params={queryParam === 'self' ? '?view=self' : ''}
            />
          </Col>
        </Row>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="details" replace />} />
        <Route
          path="details"
          element={(
            <>
              <BookOverview description={bookData.description || ''} />
              {enableDevFeatures && <BookPosts />}
            </>
          )}
        />
        <Route
          path="reviews"
          element={(
            <BookReviews
              reviewForm={reviewForm}
              setReviewForm={setReviewForm}
              bookReviewData={bookData}
              setBookReviewData={setBookData}
              handleScroll={() => { }}
              showReviewForm={showReviewForm}
              setShowReviewForm={setShowReviewForm}
            />
          )}
        />
        <Route path="reviews/:postId" element={<BookReviewDetails />} />
        <Route path="edit" element={<BookEdit />} />
      </Routes>
    </div>
  );
}
AboutBooks.defaultProps = {};
export default AboutBooks;
