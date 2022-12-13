import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';
import PosterCard from './PosterCard';

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
  return (
    <Row className="mt-0">
      {dataList && dataList.length > 0 ? dataList.map((listDetail: CardListProps) => (
        /* eslint no-underscore-dangle: 0 */
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
      )) : (
        <h1 className="h2 text-center mb-0">No data found</h1>
      )}
    </Row>
  );
}

export default PosterCardList;
