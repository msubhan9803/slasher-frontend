import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DateTime } from 'luxon';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BasicArtistsIndexList from './BasicArtistsIndexList';
import ArtistsRightSideNav from './components/ArtistsRightSideNav';
import { getArtists } from '../../api/artists';
import { useAppSelector } from '../../redux/hooks';
import { setArtists } from '../../redux/slices/artistsSlice';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';
import CreateBusinessListingButton from '../../components/layout/right-sidebar-wrapper/components/CreateBusinessListingButton';

function BasicArtistsIndex() {
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const { artists, lastRetrievalTime } = useAppSelector<any>((state) => state.artists);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!lastRetrievalTime
      || DateTime.now().diff(DateTime.fromISO(lastRetrievalTime)).as('minutes') > 5
    ) {
      setLoadingPosts(true);
      getArtists().then((res: any) => {
        dispatch(setArtists(res.data));
      }).catch((error) => {
        setErrorMessage(error.response.data.message);
      }).finally(() => {
        setLoadingPosts(false);
      });
    } else {
      setLoadingPosts(false);
    }
  }, [dispatch, lastRetrievalTime]);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="d-lg-none">
          <CreateBusinessListingButton />
        </div>

        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
          <div className="m-2">
            <h1 className="h2">Art</h1>
            {loadingPosts && <LoadingIndicator />}
            {!loadingPosts && artists?.length > 0 && (
              <BasicArtistsIndexList artists={artists && artists} />
            )}
            {!loadingPosts && artists?.length === 0
              && (
                <div className="py-3 fw-bold" style={{ borderBottom: '1px solid var(--stroke-and-line-separator-color)' }}>
                  No Data Found
                </div>
              )}

          </div>
        </div>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <ArtistsRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BasicArtistsIndex;
