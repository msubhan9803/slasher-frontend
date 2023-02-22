import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BasicMusicIndexList from './BasicMusicIndexList';
import MusicRightSideNav from './components/MusicRightSideNav';
import { useAppSelector } from '../../redux/hooks';
import { setMusicInitialData } from '../../redux/slices/musicSlice';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { getMusic } from '../../api/music';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { CustomHeader, TableRow } from '../../components/ui/customTable';

function BasicMusicIndex() {
  const music = useAppSelector<any>((state) => state.music);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const dispatch = useDispatch();
  useEffect(() => {
    if (!music?.music?.length) {
      setLoadingPosts(true);
      getMusic().then((res: any) => {
        if (res) {
          dispatch(setMusicInitialData(res.data));
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
            <CustomHeader>Music</CustomHeader>
            {loadingPosts && <LoadingIndicator />}
            {!loadingPosts && music?.music?.length > 0 && (
              <BasicMusicIndexList music={music && music?.music} />
            )}
            {!loadingPosts && music?.music?.length === 0 && <TableRow>No Data Found</TableRow>}
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
