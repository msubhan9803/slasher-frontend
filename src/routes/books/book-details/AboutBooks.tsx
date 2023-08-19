import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import {
  Navigate, Route, Routes, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import AboutBookPoster from '../../../images/book-detail-poster.jpg';
import Switch from '../../../components/ui/Switch';
import BookSummary from './BookSummary';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { BookIconProps } from '../components/BookProps';
import BookEdit from '../book-edit/BookEdit';
import BookOverview from './BookOverview';
import { BookIconList, bookDetail } from '../components/booksList';
import BookPosts from '../book-posts/BookPosts';
import BorderButton from '../../../components/ui/BorderButton';
import CustomGroupIcons from '../../../components/ui/CustomGroupIcons';
import RoundButton from '../../../components/ui/RoundButton';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import BookReviews from '../book-reviews/BookReviews';
import { enableDevFeatures } from '../../../env';

const StyledBookPoster = styled.div`
aspect - ratio: 0.67;
  img{
  object - fit: cover;
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

function AboutBooks() {
  const [searchParams] = useSearchParams();
  const [reviewForm, setReviewForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const queryParam = searchParams.get('view');
  // const loginUserId = useAppSelector((state) => state.user.user.id);
  const selfView = false;
  const tabs = (selfView ? tabsForSelf : tabsForViewer).filter(filterEnableDevFeatures);
  const navigate = useNavigate();
  const params = useParams();
  useEffect(() => {
    if (params.summary === 'edit' && queryParam !== 'self') { navigate(`/books/${params.id}/details`); }
  });
  const [bgColor, setBgColor] = useState<boolean>(false);
  const [bookIconListData, setbookIconListData] = useState(BookIconList);
  const handleBookAddRemove = (labelName: string) => {
    const tempBookIconList = [...bookIconListData];
    tempBookIconList.map((iconList) => {
      const tempBookIcon = iconList;
      if (tempBookIcon.label === labelName) {
        tempBookIcon.addBook = !tempBookIcon.addBook;
      }
      return tempBookIcon;
    });
    setbookIconListData(tempBookIconList);
  };
  return (
    <div>
      <div className="bg-dark p-4 pb-0 rounded-2 mb-3">
        <Row className="justify-content-center">
          <Col xs={6} sm={5} md={4} lg={6} xl={5} className="text-center">
            <StyledBookPoster className="mx-md-4">
              <Image src={AboutBookPoster} className="rounded-4 w-100 h-100" alt="Book poster" />
            </StyledBookPoster>
            <div className="d-none d-xl-block mt-3">
              <span className="h3">Your lists</span>
              <div className="mt-2 d-flex justify-content-between">
                {bookIconListData.map((iconList: BookIconProps) => (
                  <CustomGroupIcons
                    key={iconList.label}
                    label={iconList.label}
                    icon={iconList.icon}
                    iconColor={iconList.iconColor}
                    width={iconList.width}
                    height={iconList.height}
                    addData={iconList.addBook}
                    onClickIcon={handleBookAddRemove}
                  />
                ))}
              </div>
              <div className="d-none d-xl-block mb-2">
                <RoundButton variant="black" className="w-100">Create to list</RoundButton>
              </div>
            </div>
          </Col>
          <Col xl={7}>
            <BookSummary
              // reviewForm={reviewForm}
              setReviewForm={setReviewForm}
              // showReviewForm={showReviewForm}
              setShowReviewForm={setShowReviewForm}
            />
          </Col>
        </Row>
        <Row className="d-xl-none justify-content-center mt-2 mt-xl-2">
          <Col xs={10} sm={7} md={5} lg={9} className="text-center">
            <span className="h3">Your lists</span>
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
                  onClickIcon={() => handleBookAddRemove(iconList.label)}
                />
              ))}
            </div>
          </Col>
          <div className="d-block d-xl-none">
            <RoundButton variant="black" className="w-100">Create a list</RoundButton>
          </div>
          <div className="d-block d-md-none d-lg-block mt-3">
            <RoundButton className="w-100">Buy now</RoundButton>
          </div>
        </Row>
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
              <BookOverview />
              <BookPosts />
            </>
          )}
        />
        <Route
          path="reviews"
          element={(
            <BookReviews
              reviewForm={reviewForm}
              setReviewForm={setReviewForm}
              bookReviewData={bookDetail}
              setBookReviewData={() => { }}
              handleScroll={() => { }}
              showReviewForm={showReviewForm}
              setShowReviewForm={setShowReviewForm}
            />
          )}
        />
        <Route path="edit" element={<BookEdit />} />
      </Routes>
    </div>
  );
}
AboutBooks.defaultProps = {
  selectedTab: '',
};
export default AboutBooks;
