import { useEffect, useState } from 'react';
import { fetchListings } from '../../api/businessListings';
import { BusinessListing, ListingType } from '../../routes/business-listings/type';

export default function useListingsByType(businesstype: ListingType) {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [listingError, setListingError] = useState<string | null>(null);

  const fetchBusinessListings = async () => {
    setLoadingListings(true);
    setListingError(null);

    try {
      const { data } = await fetchListings({ businesstype });
      setListings(data as BusinessListing[]);
    } catch (err: any) {
      setListingError('Failed to fetch listings');
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchBusinessListings();
  }, []);

  return {
    listings,
    loadingListings,
    listingError,
  };
}
