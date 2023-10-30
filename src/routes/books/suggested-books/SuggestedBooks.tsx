/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button, Col, Row } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { suggestBooks } from '../components/booksList';
import PosterCard from '../../../components/ui/Poster/PosterCard';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';

const StyleBooks = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;
  .casts-image { aspect-ratio: 1; }
  &::-webkit-scrollbar { display: none; }
`;

const LoadingIndicatorSpacer = styled.div`
  height:12.857rem;
`;

const slideBookRight = () => {
  const slider = document.getElementById('slideBook');
  if (slider !== null) {
    slider.scrollLeft += 300;
  }
};
const slideBookLeft = () => {
  const slider = document.getElementById('slideBook');
  if (slider !== null) {
    slider.scrollLeft -= 300;
  }
};
function SuggestedBooks() {
  const [loading, setLoading] = useState(false);

  const renderNoSuggestionsAvailable = () => (
    <div className="ms-3 ms-md-0" style={{ marginBottom: 50 }}>
      No books suggestions available right now, but check back later for more!
    </div>
  );

  if (loading) {
    return (
      <div className="p-md-3 pt-md-1 ">
        <LoadingIndicatorSpacer className="d-flex align-items-center justify-content-center">
          <LoadingIndicator />
        </LoadingIndicatorSpacer>
      </div>
    );
  }

  return (
    <div>
      {!suggestBooks || suggestBooks.length === 0 ? renderNoSuggestionsAvailable() : (
        <div className="p-0 rounded-2">
          <div className="d-flex align-items-center position-relative">
            <Button tabIndex={0} aria-label="chevron left icon" className="position-absolute d-none d-md-block p-0 prev bg-transparent border-0" onClick={slideBookLeft}>
              <FontAwesomeIcon icon={solid('chevron-left')} size="lg" className="text-white" />
            </Button>
            <Button tabIndex={0} aria-label="chevron right icon" style={{ right: 0 }} className="position-absolute d-none d-md-block p-0 next bg-transparent border-0" onClick={slideBookRight}>
              <FontAwesomeIcon icon={solid('chevron-right')} size="lg" className="text-white" />
            </Button>
            <StyleBooks
              id="slideBook"
              className="d-flex flex-nowrap w-100 mx-md-4 g-0"
              tabIndex={-1}
            >
              <Row className="flex-nowrap">
                {suggestBooks.map((listDetail: any) => (
                  <Col xs={4} md={3} lg={4} xl={3} key={listDetail._id}>
                    <Link
                      className="m-1"
                      // eslint-disable-next-line max-len
                      // onClick={() => {
                      // deletePageStateCache(`/app/movies/${listDetail._id}`);
                      // onSelect!(listDetail._id!); }}
                      to={`/app/movies/${listDetail._id}`}
                    >
                      <PosterCard
                        name={listDetail.name}
                        poster={listDetail.logo}
                        year={listDetail.releaseDate ? DateTime.fromISO(listDetail.releaseDate).toFormat('yyyy') : listDetail.year}
                        worthWatching={listDetail.worthWatching}
                        rating={listDetail.rating}
                      />
                    </Link>
                  </Col>
                ))}
              </Row>
            </StyleBooks>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuggestedBooks;
