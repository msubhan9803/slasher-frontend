import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BasicPodcastsList from './BasicPodcastsList';
import PodcastsSidebar from './components/PodcastsSidebar';
import { useAppSelector } from '../../redux/hooks';
import { setpodcastsInitialData } from '../../redux/slices/podcasts';
import { getPodcasts } from '../../api/podcasts';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { CustomHeader, TableRow } from '../../components/ui/customTable';

function BasicPodcastsIndex() {
  const podcasts = useAppSelector<any>((state) => state.podcasts);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const dispatch = useDispatch();
  useEffect(() => {
    if (!podcasts.podcasts.length) {
      setLoadingPosts(true);
      getPodcasts().then((res: any) => {
        if (res) {
          dispatch(setpodcastsInitialData(res.data));
          setLoadingPosts(false);
        }
      }).catch((error) => {
        setErrorMessage(error.response.data.message);
      });
    } else {
      setLoadingPosts(false);
    }
  }, [dispatch, podcasts?.podcasts?.length]);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
          <div className="m-md-2">
            <CustomHeader>Podcasts</CustomHeader>
            {loadingPosts && <LoadingIndicator />}
            {!loadingPosts && podcasts?.podcasts?.length > 0 && (
              <BasicPodcastsList podcasts={podcasts && podcasts?.podcasts} />
            )}
            {/* eslint-disable-next-line max-len */}
            {!loadingPosts && podcasts?.podcasts?.length === 0 && <TableRow>No Data Found</TableRow>}
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <PodcastsSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BasicPodcastsIndex;
