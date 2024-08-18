import { useEffect, useState } from 'react';
import { fetchMyListings } from '../../api/businessListings';
import { BusinessListing } from '../../routes/business-listings/type';
import { useAppSelector } from '../../redux/hooks';

type MyListingResponse = {
  books?: BusinessListing[] | null | undefined;
  movies?: BusinessListing[] | null | undefined;
  podcaster?: BusinessListing[] | null | undefined;
  artist?: BusinessListing[] | null | undefined;
  musician?: BusinessListing[] | null | undefined;
  vendor?: BusinessListing[] | null | undefined;
  video_creator?: BusinessListing[] | null | undefined;
};

export default function useMyListings() {
  const userRef = useAppSelector((state) => state.user.user.id);
  const [listings, setListings] = useState<MyListingResponse>();
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [listingError, setListingError] = useState<string | null>(null);

  const fetchBusinessListings = async () => {
    setLoadingListings(true);
    setListingError(null);

    try {
      const { data } = await fetchMyListings({ userRef: userRef as string });
      setListings(data as MyListingResponse);
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
