import {
  ContentPageWrapper,
  ContentSidbarWrapper,
} from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';
import CreateBusinessListingButton from '../../components/layout/right-sidebar-wrapper/components/CreateBusinessListingButton';
import useListingsByType from '../../hooks/businessListing/useListings';
import MusicRightSideNav from './components/MusicRightSideNav';
import MusicListings from './MusicListings';
import { BusinessType } from '../business-listings/type';

function BasicMusicIndex() {
  const { listings, loadingListings, listingError } = useListingsByType(BusinessType.MUSICIAN);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="d-lg-none">
          <CreateBusinessListingButton />
        </div>

        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4 pt-lg-4 pb-lg-2">
          {listingError && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={[listingError]} className="m-0" />
            </div>
          )}

          <div className="m-2">
            <h1 className="h2 pb-4">Music</h1>

            {loadingListings && <LoadingIndicator />}

            {!loadingListings && listings?.length > 0 && (
              <MusicListings listings={listings} />
            )}

            {/* eslint-disable-next-line max-len */}
            {!loadingListings && listings?.length === 0 && (
              <div
                className="py-3 fw-bold"
                style={{
                  borderBottom:
                    '1px solid var(--stroke-and-line-separator-color)',
                }}
              >
                No Data Found
              </div>
            )}
          </div>
        </div>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      <RightSidebarWrapper>
        <MusicRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BasicMusicIndex;
