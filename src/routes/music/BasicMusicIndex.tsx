import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DateTime } from 'luxon';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BasicMusicIndexList from './BasicMusicIndexList';
import MusicRightSideNav from './components/MusicRightSideNav';
import { useAppSelector } from '../../redux/hooks';
import { setMusic } from '../../redux/slices/musicSlice';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { getMusic } from '../../api/music';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import CreateBusinessListingButton from '../../components/layout/right-sidebar-wrapper/components/CreateBusinessListingButton';

function BasicMusicIndex() {
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const { music, lastRetrievalTime } = useAppSelector<any>((state) => state.music);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!lastRetrievalTime
      || DateTime.now().diff(DateTime.fromISO(lastRetrievalTime)).as('minutes') > 5
    ) {
      setLoadingPosts(true);
      getMusic().then((res: any) => {
        dispatch(setMusic(res.data));
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
            <h1 className="h2">Music</h1>
            {loadingPosts && <LoadingIndicator />}
            {!loadingPosts && music?.length > 0 && (
              <BasicMusicIndexList music={music} />
            )}
            {!loadingPosts && music?.length === 0
              && (
              <div className="py-3 fw-bold" style={{ borderBottom: '1px solid var(--stroke-and-line-separator-color)' }}>
                No Data Found
              </div>
              )}
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <MusicRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BasicMusicIndex;
