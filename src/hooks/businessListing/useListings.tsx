import { useEffect, useState } from 'react';
import { fetchListings } from '../../api/businessListings';
import { BusinessListing, ListingType } from '../../routes/business-listings/type';

export default function useListings(businesstype: ListingType | null) {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [listingError, setListingError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 12;

  const fetchBusinessListings = async (after?: string) => {
    setLoadingListings(true);
    setListingError(null);

    try {
      const { data } = await fetchListings({ businesstype, after, limit });

      if (data.length > 0) {
        const array = [...new Set([...listings, ...data]) as any];
        setListings(array);
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      setListingError('Failed to fetch listings');
    } finally {
      setLoadingListings(false);
    }
  };

  const loadMoreListings = () => {
    if (listings.length > 0) {
      const lastListingId = listings[listings.length - 1]._id;
      fetchBusinessListings(lastListingId as string);
    } else {
      fetchBusinessListings();
    }
  };

  useEffect(() => {
    fetchBusinessListings();
  }, [businesstype]);

  return {
    listings,
    loadingListings,
    listingError,
    loadMoreListings,
    hasMore,
  };
}
