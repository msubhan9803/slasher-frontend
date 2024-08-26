import { useEffect, useState } from 'react';
import { fetchListingDetailForEdit } from '../../api/businessListings';
import { BusinessListing } from '../../routes/business-listings/type';

export default function useListingDetailForEdit(listingId: string) {
  const [listingDetail, setListingDetail] = useState<BusinessListing>();
  const [loadingListingDetail, setLoadingListingDetail] = useState<boolean>(true);
  const [listingDetailError, setListingDetailError] = useState<string | null>(null);

  const fetchBusinessListingDetail = async () => {
    setLoadingListingDetail(true);
    setListingDetailError(null);

    try {
      const { data } = await fetchListingDetailForEdit(listingId);
      setListingDetail(data as BusinessListing);
    } catch (err: any) {
      if (err.response.data.statusCode === 400) {
        setListingDetailError(err.response.data.message);
      }
    } finally {
      setLoadingListingDetail(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      fetchBusinessListingDetail();
    }
  }, [listingId]);

  return {
    listingDetail,
    loadingListingDetail,
    listingDetailError,
    refetchBusinessListing: fetchBusinessListingDetail,
  };
}
