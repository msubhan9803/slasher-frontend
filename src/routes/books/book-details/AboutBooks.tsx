import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ListIcon from '../components/ListIcon';
import AboutBookPoster from '../../../images/book-detail-poster.jpg';
import Switch from '../../../components/ui/Switch';
import RoundButton from '../../../components/ui/RoundButton';
import BookSummary from './BookSummary';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { BookIconProps } from '../components/BookProps';
import BookEdit from '../book-edit/BookEdit';
import CreatePostInput from '../book-posts/CreatePostInput';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import postImage from '../../../images/book-post-image.jpg';
import BookOverview from './BookOverview';
import BookComments from '../components/BookComments';
import ReportModal from '../../../components/ui/ReportModal';
import { BookIconList } from '../components/booksList';

const StyledBookPoster = styled.div`
aspect - ratio: 0.67;
  img{
  object - fit: cover;
}
`;
const FollowStyledButton = styled(RoundButton)`
width: 21.125rem;
border: 1px solid #3A3B46;
  &: hover, &:focus{
  border: 1px solid #3A3B46;
}
`;
const tabsForSelf = [
  { value: 'details', label: 'Details' },
  { value: 'posts', label: 'Posts' },
  { value: 'edit', label: 'Edit' },
];
const tabsForViewer = [
  { value: 'details', label: 'Details' },
  { value: 'posts', label: 'Posts' },
];
const postData = [
  {
    id: 1,
    userName: 'Aly khan',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'A retired cop battles a murderer who never gets his hands dirty when he kills. And a man stumbles into a league of immortal assassins, who kill to protect their.',
    postUrl: postImage,
    likeIcon: false,
  },
];
const popoverOptions = ['Edit', 'Delete'];
function AboutBooks() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const tabs = queryParam === 'self' ? tabsForSelf : tabsForViewer;
  const navigate = useNavigate();
  const params = useParams();
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

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
      <div className="bg-dark p-4 pb-0 rounded-2">
        <Row className="justify-content-center">
          <Col xs={6} sm={5} md={4} lg={6} xl={5} className="text-center">
            <StyledBookPoster className="mx-md-4">
              <Image src={AboutBookPoster} className="rounded-4 w-100 h-100" />
            </StyledBookPoster>
            <div className="d-none d-xl-block mt-3">
              <span className="h3">Your lists</span>
              <div className="mt-2 d-flex justify-content-between">
                {bookIconListData.map((iconList: BookIconProps) => (
                  <ListIcon
                    key={iconList.label}
                    label={iconList.label}
                    icon={iconList.icon}
                    iconColor={iconList.iconColor}
                    width={iconList.width}
                    height={iconList.height}
                    addBook={iconList.addBook}
                    onClickIcon={() => handleBookAddRemove(iconList.label)}
                  />
                ))}
              </div>
            </div>
          </Col>
          <Col xl={7}>
            <BookSummary />
          </Col>
        </Row>
        <Row className="d-xl-none justify-content-center mt-4 mt-xl-2">
          <Col xs={10} sm={7} md={5} lg={9} className="text-center">
            <span className="h3">Your lists</span>
            <div className="mt-2 d-flex justify-content-around">
              {bookIconListData.map((iconList: BookIconProps) => (
                <ListIcon
                  key={iconList.label}
                  label={iconList.label}
                  icon={iconList.icon}
                  iconColor={iconList.iconColor}
                  width={iconList.width}
                  height={iconList.height}
                  addBook={iconList.addBook}
                  onClickIcon={() => handleBookAddRemove(iconList.label)}
                />
              ))}
            </div>
          </Col>
        </Row>
        <Row className="d-lg-none mt-3 mb-2 text-center">
          <Col xs={12}>
            <p className="text-center fw-bold">Get updates for this book</p>
            <FollowStyledButton variant="lg" onClick={() => setBgColor(!bgColor)} className={`rounded-pill shadow-none ${bgColor ? 'bg-primary border-primary' : 'bg-black'} `}>
              {bgColor ? 'Follow' : 'Unfollow'}
            </FollowStyledButton>
          </Col>
        </Row>
        <Row className="align-items-center justify-content-center mt-4 mb-2 d-lg-none">
          <Col sm={5}>
            <div className="align-items-center d-flex justify-content-center">
              <span className="mb-2">Push notifications</span>
              <Switch id="pushNotificationsSwitch" className="ms-4" />
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center justify-content-xl-start">
          <Col xs={12} md={6} lg={queryParam === 'self' ? 10 : 12} xl={9}>
            <TabLinks tabLink={tabs} toLink={`/books/${params.id}`} selectedTab={params.summary} params={queryParam === 'self' ? '?view=self' : ''} />
          </Col>
        </Row>
      </div>
      {params.summary === 'details' && (
        <>
          <BookOverview />
          <BookComments />
        </>
      )}
      {params.summary === 'posts' && (
        <>
          <CreatePostInput />
          <PostFeed
            postFeedData={postData}
            popoverOptions={popoverOptions}
            isCommentSection={false}
            onPopoverClick={handlePopoverOption}
          />
        </>
      )}
      {queryParam === 'self' && params.summary === 'edit' && <BookEdit />}
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </div>
  );
}
AboutBooks.defaultProps = {
  selectedTab: '',
};
export default AboutBooks;
