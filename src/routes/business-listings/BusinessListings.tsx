import {
  Navigate, Route, Routes,
  useParams,
} from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import NotFound from '../../components/NotFound';
import CreateBusinessListing from './create-post/CreateBusinessListing';
import {
  ContentSidbarWrapper,
  ContentPageWrapper,
} from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import BusinessListingPosts from './BusinessListingPosts/BusinessListingPosts';
import { getUser } from '../../api/users';

function SharedHeaderProfilePages() {
  return (
    <Routes>
      <Route path="/" element={(<Navigate to="posts" replace />)} />
      <Route path="create" element={<CreateBusinessListing />} />

      <Route path="detail/:id">
        <Route index element={<Navigate to="posts" replace />} />
        <Route path="posts" element={<BusinessListingPosts />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function BusinessListings() {
  const { userName: userNameOrId } = useParams<string>();

  const loadUser = useCallback(() => {
    getUser(userNameOrId!)
      .then((res) => {
        console.log('res: ', res);
      });
  }, [userNameOrId]);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="*" element={<SharedHeaderProfilePages />} />
        </Routes>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BusinessListings;
