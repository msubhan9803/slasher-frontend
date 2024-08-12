import { Route, Routes } from 'react-router-dom';
import NotFound from '../../components/NotFound';
import CreateBusinessListing from './create-post/CreateBusinessListing';
import {
  ContentSidbarWrapper,
  ContentPageWrapper,
} from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import BusinessListingDetail from './detail/BusinessListingDetail';

function BusinessListings() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="create" element={<CreateBusinessListing />} />
          <Route path="detail/:id" element={<BusinessListingDetail />} />
          <Route path="*" element={<NotFound />} />
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
