import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { Link, useLocation } from 'react-router-dom';
import PosterCard from './PosterCard';
import checkAdsPosterCardList from './checkAdsPosterCardList';
import useBootstrapBreakpointName from '../../../hooks/useBootstrapBreakpoint';
import PubWiseAd from '../PubWiseAd';
import {
  ALL_MOVIES_DIV_ID, MOVIE_BUY_LIST_DIV_ID, MOVIE_FAVOURITE_DIV,
  MOVIE_INDIE_DIV,
  MOVIE_WATCHED_LIST_DIV_ID, MOVIE_WATCHLIST_DIV_ID,
} from '../../../utils/PubWiseAdUnits';

interface PosterCardProps {
  dataList: CardListProps[] | [];
}
interface CardListProps {
  id: number;
  name: string;
  image: string;
  year: string;
  liked: boolean;
  rating?: number;
  _id?: string | null;
  logo?: string;
  releaseDate?: string;
}

function PosterCardList({ dataList }: PosterCardProps) {
  const bp = useBootstrapBreakpointName();
  const { pathname } = useLocation();

  let PubWiseAdUnitDivId = '';
  if (pathname === '/movies/all') {
    PubWiseAdUnitDivId = ALL_MOVIES_DIV_ID;
  }
  if (pathname === '/movies/favorites') {
    PubWiseAdUnitDivId = MOVIE_FAVOURITE_DIV;
  }
  if (pathname === '/movies/watch-list') {
    PubWiseAdUnitDivId = MOVIE_WATCHLIST_DIV_ID;
  }
  if (pathname === '/movies/watched-list') {
    PubWiseAdUnitDivId = MOVIE_WATCHED_LIST_DIV_ID;
  }
  if (pathname === '/movies/buy-list') {
    PubWiseAdUnitDivId = MOVIE_BUY_LIST_DIV_ID;
  }
  if (pathname === '/movies/slasher-indie') {
    PubWiseAdUnitDivId = MOVIE_INDIE_DIV;
  }

  return (
    <Row className="mt-0">
      {dataList && dataList.length > 0 && dataList.map((listDetail: CardListProps, i, arr) => {
        const show = checkAdsPosterCardList(bp, i, arr);
        return (
          /* eslint no-underscore-dangle: 0 */
          <React.Fragment key={listDetail._id}>
            <Col xs={4} md={3} lg={4} xl={3} key={listDetail._id}>
              <Link to={`/movies/${listDetail._id}/details`}>
                <PosterCard
                  name={listDetail.name}
                  poster={listDetail.logo}
                  year={listDetail.releaseDate ? DateTime.fromISO(listDetail.releaseDate).toFormat('yyyy') : listDetail.year}
                  liked={listDetail.liked}
                  rating={listDetail.rating}
                />
              </Link>
            </Col>
            {PubWiseAdUnitDivId && show && <PubWiseAd className="text-center mb-3" id={PubWiseAdUnitDivId} autoSequencer />}
          </React.Fragment>
        );
      })}
    </Row>
  );
}

export default PosterCardList;
