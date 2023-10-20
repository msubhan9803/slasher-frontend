/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import BooksRightSideNav from '../components/BooksRightSideNav';
import AboutBooks from './AboutBooks';
import { enableDevFeatures } from '../../../env';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { getPageStateCache, hasPageStateCache, setPageStateCache } from '../../../pageStateCache';
import {
  BookPageCache,
} from '../../../types';
import { getBookById } from '../../../api/books';

function BookDetails() {
  const location = useLocation();
  const pageStateCache: BookPageCache = getPageStateCache(location)
    ?? { bookData: undefined, additionalBookData: undefined };
  const params = useParams();
  const [bookData, setBookData] = useState<any | undefined>(
    hasPageStateCache(location) ? pageStateCache.bookData : undefined,
  );

  useEffect(() => {
    if (params.id && !bookData) {
      getBookById(params.id)
        .then((res) => {
          setBookData(res.data as any);
          // TODO: fix page state cache
          // Update `pageStateCache`
          setPageStateCache<BookPageCache>(location, {
            ...getPageStateCache(location), additionalBookData: res.data,
          });
        });
    }
  }, [location, bookData, params]);

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant' as any,
    });
  }, []);

  if (!bookData) {
    return <LoadingIndicator />;
  }

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Container fluid className="mb-5">
          {enableDevFeatures
            && (
              <>
                <RoundButton className="d-lg-none w-100 my-3">Add your book</RoundButton>
                <h1 className="text-center text-primary h3 d-lg-none">Claim this listing</h1>
              </>
            )}
          <AboutBooks
            bookData={bookData}
            setBookData={setBookData}
          />
        </Container>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BookDetails;
