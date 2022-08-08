import React from 'react';
import { Col, Row } from 'react-bootstrap';
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
}

function PosterCardList({ dataList }: PosterCardProps) {
  return (

    <Row className="mt-0">
      {dataList && dataList.length > 0 ? dataList.map((listDetail: CardListProps) => (
        <Col xs={4} md={3} lg={4} xl={3} key={listDetail.id}>
          <PosterCard
            name={listDetail.name}
            poster={listDetail.image}
            year={listDetail.year}
            liked={listDetail.liked}
          />
        </Col>
      )) : (
        <h1 className="h4 text-center mb-0">No data found</h1>
      )}
    </Row>
  );
}

export default PosterCardList;
