import React, { useState } from 'react';
import {
  Col, Image, Row, Tab, Tabs,
} from 'react-bootstrap';
import styled from 'styled-components';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useSearchParams } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import ListIcon from './ListIcon';
import AboutBookPoster from '../../../images/book-detail-poster.jpg';
import Switch from '../../../components/ui/Switch';
import RoundButton from '../../../components/ui/RoundButton';
import BookSummary from './BookSummary';

interface QueryParamProps {
  queryParam: boolean
}
const StyleTabs = styled(Tabs) <QueryParamProps>`
border-bottom: 0.2rem solid var(--bs-dark);
  overflow-x: auto;
  overflow-y: hidden;
  .nav-item {
    ${(props) => !props.queryParam && 'margin-right: 2rem; flex-grow: 0;'};
    .nav-link {
      padding-bottom: 1rem !important;
      border: none;
      color: #ffffff;
      &:hover {
        border-color: transparent;
        color: var(--bs-primary);
      }
      &.active {
        color: var(--bs-primary);
        background-color: transparent;
        border-bottom:  0.222rem solid var(--bs-primary);
      }
      .btn {
        ${(props) => !props.queryParam && 'width: max-content;'};
      }
    }
  }

  @media (max-width: 992px) {
    .nav-item {
      ${(props) => !props.queryParam && 'margin-right: 0; flex-grow: 1;'};
      .btn {
        ${(props) => (!props.queryParam ? 'width: 100%;' : 'width: 75%')};
      } 
    }
  }

`;
const StyledBookPoster = styled.div`
aspect - ratio: 0.67;
  img{
  object - fit: cover;
}
`;
const FollowStyledButton = styled(RoundButton)`
width: 21.125rem;
border: 0.063rem solid #3A3B46;
  &: hover, &:focus{
  border: 0.063rem solid #3A3B46;
}
`;
const BookIconList = [
  {
    label: 'Favorite', icon: solid('heart'), iconColor: '#8F00FF', width: '1.445rem', height: '1.445rem', addBook: false,
  },
  {
    label: 'Watch', icon: solid('check'), iconColor: '#32D74B', width: '1.445rem', height: '1.033rem', addBook: false,
  },
  {
    label: 'Watchlist', icon: solid('list-check'), iconColor: '#FF8A00', width: '1.498rem', height: '1.265rem', addBook: true,
  },
  {
    label: 'Buy', icon: solid('bag-shopping'), iconColor: '#FF1800', width: '1.098rem', height: '1.265rem', addBook: false,
  },
];
interface BookIconProps {
  label: string;
  icon: IconDefinition;
  iconColor: string;
  margin?: string;
  width: string;
  height: string;
  addBook: boolean;
}
interface AboutBooksProps {
  setSelectedTab: (value: string) => void;
  selectedTab?: string;
}
function AboutBooks({ setSelectedTab, selectedTab }: AboutBooksProps) {
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
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');

  return (
    <div>
      <div className="bg-dark mt-3 p-4 pb-0 rounded-2">
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
            <div className="d-none d-xl-block">
              <StyleTabs justify queryParam={queryParam === 'self'} activeKey={selectedTab} onSelect={(tab: any) => setSelectedTab(tab)} className={`${queryParam === 'self' ? 'justify-content-between' : 'justify-content-center justify-content-xl-start'} fs-3 px-2 border-0`}>
                <Tab eventKey="details" title="Details" />
                <Tab eventKey="posts" title="Posts" />
                {queryParam === 'self' && <Tab eventKey="edit" title="Edit" />}
              </StyleTabs>
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
        <Row className="mt-4 d-xl-none justify-content-center">
          <Col xs={queryParam === 'self' ? 10 : 12} sm={6} md={5} lg={8} xl={4}>
            <StyleTabs justify queryParam={queryParam === 'self'} activeKey={selectedTab} onSelect={(tab: any) => setSelectedTab(tab)} className={`${queryParam === 'self' ? 'justify-content-between mx-3' : 'justify-content-center justify-content-xl-start'} fs-3 border-0`}>
              <Tab eventKey="details" title="Details" />
              <Tab eventKey="posts" title="Posts" />
              {queryParam === 'self' && <Tab eventKey="edit" title="Edit" />}
            </StyleTabs>
          </Col>
        </Row>
      </div>
    </div>
  );
}
AboutBooks.defaultProps = {
  selectedTab: '',
};

export default AboutBooks;
