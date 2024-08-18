import { useEffect, useState } from 'react';
import { fetchListingsAdmin } from '../../api/businessListings';
import { BusinessListing, ListingType } from '../../routes/business-listings/type';

export default function useListingsAdmin(businesstype: ListingType | null) {
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [listingError, setListingError] = useState<string | null>(null);

  const fetchBusinessListings = async () => {
    setLoadingListings(true);
    setListingError(null);

    try {
      const { data } = await fetchListingsAdmin({ businesstype });
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
    refetch: fetchBusinessListings,
  };
}
