import React, { useEffect, useRef, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { getRecentlyAddedBooks } from '../../api/users';
import RecentMediaTile from '../../components/layout/right-sidebar-wrapper/components/RecentMediaTile';
import {
  addBookUserStatus, removeSuggestedbook,
} from '../../api/books';

const StyleMovie = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;
  .casts-image { aspect-ratio: 1; }
  &::-webkit-scrollbar { display: none; }
`;

const Card = styled.div`
  position: relative;
  width: 10.625rem;
  padding-right: 1rem;
`;

const LoadingIndicatorSpacer = styled.div`
  height:12.857rem;
`;

function RecentlyAddedBooks() {
  const abortControllerRef = useRef<AbortController | null>();
  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSuggestedBooksList = () => {
    setLoading(true);
    getRecentlyAddedBooks().then((res) => {
      setSuggestedBooks(res.data);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    getSuggestedBooksList();
  }, []);

  const slideFriendRight = () => {
    const slider = document.getElementById('sliderMovie');
    if (slider !== null) {
      slider.scrollLeft += 300;
    }
  };

  const slideFriendLeft = () => {
    const slider = document.getElementById('sliderMovie');
    if (slider !== null) {
      slider.scrollLeft -= 300;
    }
  };

  const renderNoSuggestionsAvailable = () => (
    <div className="ms-3 ms-md-0" style={{ marginBottom: 50 }}>
      No book suggestions available right now, but check back later for more!
    </div>
  );

  const removeBookSuggestion = (bookId: string) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    removeSuggestedbook(bookId).then(() => {
      const newSuggestedBooks = suggestedBooks.filter((book: any) => book._id !== bookId);
      if (newSuggestedBooks?.length) {
        setSuggestedBooks(newSuggestedBooks);
      } else {
        getSuggestedBooksList();
      }
    }).finally(() => {
      abortControllerRef.current = null;
    });
  };

  const onCloseClick = (e: any, bookId: string) => {
    e.preventDefault();
    removeBookSuggestion(bookId);
  };

  const addWatchListClick = (bookId: string) => {
    if (abortControllerRef.current) {
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    addBookUserStatus(bookId, 'readingList')
      .then((res) => {
        if (res.data.success) {
          const newSuggestedBooks = suggestedBooks.filter((book: any) => book._id !== bookId);
          if (newSuggestedBooks?.length) {
            setSuggestedBooks(newSuggestedBooks);
          } else {
            getSuggestedBooksList();
          }
        }
      }).finally(() => {
        abortControllerRef.current = null;
      });
  };

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
      {!suggestedBooks || suggestedBooks.length === 0 ? renderNoSuggestionsAvailable() : (
        <div className="p-md-3 pt-md-1 rounded-2">
          <div className="d-flex align-items-center position-relative">
            <Button tabIndex={0} aria-label="chevron left icon" className="position-absolute d-block p-0 prev bg-transparent border-0" onClick={slideFriendLeft}>
              <FontAwesomeIcon icon={solid('chevron-left')} size="lg" className="text-white" />
            </Button>
            <Button tabIndex={0} aria-label="chevron right icon" style={{ right: 0 }} className="position-absolute d-block p-0 next bg-transparent border-0" onClick={slideFriendRight}>
              <FontAwesomeIcon icon={solid('chevron-right')} size="lg" className="text-white" />
            </Button>
            <StyleMovie
              id="sliderMovie"
              className="d-flex flex-nowrap w-100 mx-4 g-0"
              // style={{ maxWidth: isDesktopResponsiveSize ? '50vw' : '' }}
              tabIndex={-1}
            >
              {suggestedBooks?.map((book: any) => (
                <Card key={book._id}>
                  <div className="d-flex justify-content-center position-relative py-2">
                    <Button variant="link" className="position-absolute p-0 px-2 py-1" style={{ right: '0', zIndex: 999 }} onClick={(e: any) => onCloseClick(e, book?._id)}>
                      <FontAwesomeIcon icon={solid('xmark')} size="lg" />
                      <span className="visually-hidden">Dismiss suggestion</span>
                    </Button>
                    <RecentMediaTile
                      image={book.coverImage.image_path}
                      title={book.name}
                      year={+DateTime.fromISO(book.publishDate).toFormat('yyyy')}
                      numericRating={book?.rating}
                      thumbRating={book?.worthReading}
                      id={book._id}
                      addWatchListClick={addWatchListClick}
                      isBook
                    />
                  </div>
                </Card>
              ))}
            </StyleMovie>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecentlyAddedBooks;
