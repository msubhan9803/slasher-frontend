import InfiniteScroll from 'react-infinite-scroller';
import {
  ContentPageWrapper,
  ContentSidbarWrapper,
} from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PodcastsSidebar from './components/PodcastsSidebar';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';
import CreateBusinessListingButton from '../../components/layout/right-sidebar-wrapper/components/CreateBusinessListingButton';
import PodcastsListings from './PodcastsListings';
import useListingsByType from '../../hooks/businessListing/useListings';
import { BusinessType } from '../business-listings/type';

function BasicPodcastsIndex() {
  const {
    listings,
    loadingListings,
    listingError,
    loadMoreListings,
    hasMore,
  } = useListingsByType(BusinessType.PODCASTER);

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
            <h1 className="h2 pb-4">Podcasts</h1>

            {loadingListings && <LoadingIndicator />}

            {!loadingListings && listings?.length > 0 && (
              <InfiniteScroll
                pageStart={0}
                loadMore={loadMoreListings}
                hasMore={hasMore}
                loader={<LoadingIndicator key={0} />}
              >
                <PodcastsListings listings={listings} />
              </InfiniteScroll>
            )}

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
        <PodcastsSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default BasicPodcastsIndex;
