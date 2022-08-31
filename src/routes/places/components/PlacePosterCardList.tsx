import React from 'react';
import { Col, Row } from 'react-bootstrap';
import PlacePosterCard from './PlacePosterCard';

interface PosterCardListProps {
  dataList: PlaceListProps[],
}
interface PlaceListProps {
  id: number;
  image: string;
  place: string;
  type: string;
  rating: string;
  description: string;
  location: string;
  distance: string;
  date: string;
}
function PlacePosterCardList({ dataList }: PosterCardListProps) {
  return (
    <Row className="mt-0">
      {dataList && dataList.length > 0 ? dataList.map((listDetail: PlaceListProps) => (
        <Col sm={6} lg={12} xl={6} key={listDetail.id}>
          <PlacePosterCard listDetail={listDetail} />
        </Col>
      )) : (
        <h1 className="h4 text-center mb-0">No data found</h1>
      )}
    </Row>
  );
}

export default PlacePosterCardList;
