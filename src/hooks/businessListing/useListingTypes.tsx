import { useEffect, useState } from 'react';
import { fetchListingTypes } from '../../api/businessListings';
import { BusinessListingType } from '../../routes/business-listings/type';

export default function useListingTypes() {
  const [listingTypes, setListingTypes] = useState<BusinessListingType[]>([]);

  const fetchBusinessListingTypes = async () => {
    try {
      const { data } = await fetchListingTypes();
      return data as BusinessListingType[];
    } catch (err: any) {
      return [];
    }
  };

  useEffect(() => {
    fetchBusinessListingTypes().then((res) => setListingTypes(res));
  }, []);

  return {
    listingTypes,
  };
}
