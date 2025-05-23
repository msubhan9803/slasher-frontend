/* eslint-disable max-len */
import React, { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { Link, useLocation } from 'react-router-dom';
import useBootstrapBreakpointName from '../../../hooks/useBootstrapBreakpoint';
import { useAppSelector } from '../../../redux/hooks';
import { deletePageStateCache } from '../../../pageStateCache';
import TpdAd from '../TpdAd';
import { getInfiniteAdSlot } from '../../../utils/tpd-ad-slot-ids';
import checkAdsPosterCardList from '../Poster/checkAdsPosterCardList';
import PosterCard from '../Poster/PosterCard';

interface PosterCardProps {
  dataList: CardListProps[] | [];
  type?: string;
  onSelect?: (value?: string) => void;
  editButton?: boolean | null | undefined;
}
interface CardListProps {
  _id?: string | null;
  name: string;
  image?: string;
  year: string;
  rating?: number;
  logo?: string;
  releaseDate?: string;
  publishDate?: string;
  worthWatching?: number;
  isDeactivate?: boolean;
  listingId: string;
  status?: boolean;
}

function MovieOrBookListingList({
  dataList,
  type,
  onSelect,
  editButton,
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
                onClick={() => {
                  if (type === 'book') {
                    deletePageStateCache(`/app/books/${listDetail._id}`);
                  } else {
                    deletePageStateCache(`/app/movies/${listDetail._id}`);
                  }
                  if (onSelect && listDetail._id) {
                    onSelect(listDetail._id);
                  }
                }}
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
                  editUrl={editButton === true ? `/app/business-listings/create?type=${type}s&id=${listDetail.listingId}` : undefined}
                  status={listDetail.status as boolean}
                />
              </Link>
            </Col>
          </React.Fragment>
        );
      })}
    </Row>
  );
}

MovieOrBookListingList.defaultProps = {
  onSelect: undefined,
  type: 'movies',
  editButton: null,
};

export default MovieOrBookListingList;
