import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BasicArtistsIndexList from './BasicArtistsIndexList';
import ArtsRightSideNav from './components/ArtsRigthSideNav';
import { getArts } from '../../api/arts';
import { useAppSelector } from '../../redux/hooks';
import { setArtsInitialData } from '../../redux/slices/artsSlice';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { CustomHeader, TableRow } from '../../components/ui/customTable';

function BasicArtistsIndex() {
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const arts = useAppSelector<any>((state) => state.arts);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!arts?.arts?.length) {
      setLoadingPosts(true);
      getArts().then((res: any) => {
        if (res) {
          dispatch(setArtsInitialData(res.data));
          setLoadingPosts(false);
        }
      }).catch((error) => {
        setErrorMessage(error.response.data.message);
        setLoadingPosts(false);
      });
    } else {
      setLoadingPosts(false)
    };
  }, [dispatch]);
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
            <CustomHeader>Arts</CustomHeader>
            {loadingPosts && <LoadingIndicator />}
            {!loadingPosts && arts?.arts?.length > 0 && (
              <BasicArtistsIndexList arts={arts && arts?.arts} />
            )}
            {!loadingPosts && arts?.arts?.length === 0 && <TableRow>No Data Found</TableRow>}
          </div>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <ArtsRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BasicArtistsIndex;
