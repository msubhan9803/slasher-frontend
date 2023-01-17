import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { Link, useLocation } from 'react-router-dom';
import PosterCard from './PosterCard';
import checkAdsPosterCardList from './checkAdsPosterCardList';
import useBootstrapBreakpointName from '../../../hooks/useBootstrapBreakpoint';
import PubWiseAd from '../PubWiseAd';

interface PosterCardProps {
  dataList: CardListProps[] | [];
  pubWiseAdUnitDivId?: string;
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

function PosterCardList({ dataList, pubWiseAdUnitDivId }: PosterCardProps) {
  const bp = useBootstrapBreakpointName();

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
            {pubWiseAdUnitDivId && show && <PubWiseAd className="text-center mb-3" id={pubWiseAdUnitDivId} autoSequencer />}
          </React.Fragment>
        );
      })}
    </Row>
  );
}

PosterCardList.defaultProps = {
  pubWiseAdUnitDivId: '',
};

export default PosterCardList;
