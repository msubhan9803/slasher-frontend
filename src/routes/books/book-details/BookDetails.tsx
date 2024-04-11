/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import React, {
  useEffect, useLayoutEffect, useMemo, useState,
} from 'react';
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
  BookData,
  BookPageCache,
} from '../../../types';
import { getBookById } from '../../../api/books';
import SticyBannerAdSpaceCompensation from '../../../components/SticyBannerAdSpaceCompensation';

function BookDetails() {
  const location = useLocation();
  const pageStateCache = useMemo(() => getPageStateCache(location) ?? { bookData: undefined, additionalBookData: undefined }, [location]);
  const params = useParams();
  const [bookData, setBookData] = useState<BookData | undefined>(
    hasPageStateCache(location) ? pageStateCache.bookData : undefined,
  );
  const [initialDataLoadedFromCache, setInitialDataLoadedFromCache] = useState(false);

  useEffect(() => {
    if (params.id && (!bookData || bookData?.isUpdated)) {
      getBookById(params.id)
        .then((res) => {
          setBookData(res.data as any);
          // Update `pageStateCache`
          setPageStateCache<BookPageCache>(location, {
            ...getPageStateCache(location), bookData: res.data,
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

  useEffect(() => {
    if (hasPageStateCache(location) && !initialDataLoadedFromCache) {
      setInitialDataLoadedFromCache(true);
      setBookData(pageStateCache.bookData);
    }
  }, [pageStateCache, location, initialDataLoadedFromCache]);

  useEffect(() => (() => {
    if (bookData) {
      setPageStateCache<BookPageCache>(location, {
        ...getPageStateCache(location), bookData,
      });
    }
  }), [bookData, location]);

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
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <BooksRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BookDetails;
