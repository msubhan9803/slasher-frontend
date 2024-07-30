import { useState } from 'react';
import { createListing } from '../../api/businessListings';
import { BusinessListing } from '../../routes/business-listings/type';

export default function useCreateListing() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [success, setSuccess] = useState<boolean>(false);

  const createBusinessListing = async (listing: BusinessListing) => {
    setLoading(true);
    setErrorMessages([]);
    setSuccess(false);

    try {
      await createListing(listing);
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setErrorMessages(err.response.data.message);
    }
  };

  return {
    createBusinessListing,
    loading,
    errorMessages,
    success,
  };
}
