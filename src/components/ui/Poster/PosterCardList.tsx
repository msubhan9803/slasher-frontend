import React, { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { Link, useLocation } from 'react-router-dom';
import PosterCard from './PosterCard';
import checkAdsPosterCardList from './checkAdsPosterCardList';
import useBootstrapBreakpointName from '../../../hooks/useBootstrapBreakpoint';
import PubWiseAd from '../PubWiseAd';
import { useAppSelector } from '../../../redux/hooks';
import { deletePageStateCache } from '../../../pageStateCache';

interface PosterCardProps {
  dataList: CardListProps[] | [];
  type?: string;
  pubWiseAdUnitDivId?: string;
  onSelect?: (value?: string) => void;
}
interface CardListProps {
  id: number;
  name: string;
  image?: string;
  year: string;
  rating?: number;
  _id?: string | null;
  logo?: string;
  releaseDate?: string;
  publishDate?: string;
  worthWatching?: number;
  isDeactivate?: boolean;
}

function PosterCardList({
  dataList, type, pubWiseAdUnitDivId, onSelect,
}: PosterCardProps) {
  const bp = useBootstrapBreakpointName();
  const scrollPosition: any = useAppSelector((state) => state.scrollPosition);
  const location = useLocation();
  useEffect(() => {
    if (dataList.length > 0
      && scrollPosition.position > 0
      && scrollPosition?.pathname === location.pathname) {
      window.scrollTo({
        top: scrollPosition?.position,
        behavior: 'instant' as any,
      });
    }
  }, [dataList, scrollPosition, location.pathname]);
  return (
    <Row className="mt-0">
      {dataList && dataList.length > 0 && dataList.map((listDetail: CardListProps, i, arr) => {
        const show = checkAdsPosterCardList(bp, i, arr);
        return (
          <React.Fragment key={listDetail._id}>
            <Col xs={4} md={3} lg={4} xl={3} key={listDetail._id}>
              <Link
                className="m-1 text-decoration-none"
                // eslint-disable-next-line max-len
                onClick={() => { deletePageStateCache(`/app/movies/${listDetail._id}`); onSelect!(listDetail._id!); }}
                to={type === 'book' ? `/app/books/${listDetail._id}` : `/app/movies/${listDetail._id}`}
              >
                <PosterCard
                  type={type}
                  name={listDetail.name}
                  poster={listDetail.logo}
                  year={listDetail.releaseDate ? DateTime.fromISO(listDetail.releaseDate).toFormat('yyyy') : listDetail.year}
                  worthWatching={listDetail.worthWatching}
                  rating={listDetail.rating}
                  deactivate={listDetail.isDeactivate}
                />
              </Link>
            </Col>
            {pubWiseAdUnitDivId && show && <PubWiseAd className="mb-3" id={pubWiseAdUnitDivId} autoSequencer />}
          </React.Fragment>
        );
      })}
    </Row>
  );
}

PosterCardList.defaultProps = {
  pubWiseAdUnitDivId: '',
  onSelect: undefined,
  type: 'movies',
};

export default PosterCardList;
