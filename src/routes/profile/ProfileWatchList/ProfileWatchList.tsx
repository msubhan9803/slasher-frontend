import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import FilterModal from '../../../components/filter-sort/FilterModal';
import FilterOptions from '../../../components/filter-sort/FilterOptions';
import SortData from '../../../components/filter-sort/SortData';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PosterCardList from '../../../components/ui/Poster/PosterCardList';
import CustomSearchInput from '../../../components/ui/CustomerSearchInput';
import ProfileHeader from '../ProfileHeader';
import MoviePost from '../../../images/movie-poster.jpg';

const allMovies = [
  {
    id: 1, name: 'Dreamcatcher: Get ready for a killer night out', image: MoviePost, year: '2022', liked: true,
  },
  {
    id: 2, name: 'The Djinn', image: MoviePost, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Ghost Lab', image: MoviePost, year: '2022', liked: true,
  },
  {
    id: 4, name: 'Dreamcatcher: Get ready for a killer night out', image: MoviePost, year: '2022', liked: true,
  },
  {
    id: 5, name: 'The Exorcist', image: MoviePost, year: '2022', liked: true,
  },
  {
    id: 6, name: 'Spiral: From the Book of Saw', image: MoviePost, year: '2022', liked: false,
  },
  {
    id: 7, name: 'The Night House', image: MoviePost, year: '2022', liked: true,
  },
  {
    id: 8, name: 'Zombie Reddy', image: MoviePost, year: '2022', liked: true,
  },
];
function ProfileWatchList() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [search, setSearch] = useState<string>('');
  const [showKeys, setShowKeys] = useState<boolean>(false);

  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="watchedList" />
      <Row className="mt-3 mb-md-3 align-items-center">
        <Col md={4} className="my-3 my-md-0 order-md-second order-md-first">
          <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
        </Col>
        <Col md={4} className="text-center">
          <FilterOptions setShowKeys={setShowKeys} showKeys={showKeys} />
        </Col>
        <Col md={4} className="d-none d-lg-block">
          <SortData title="Sort: " className="rounded-5" />
        </Col>
      </Row>
      {showKeys && (<FilterModal showKeys={showKeys} setShowKeys={setShowKeys} />)}
      <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4">
        <div className="m-md-2">
          <PosterCardList dataList={allMovies} />
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileWatchList;
