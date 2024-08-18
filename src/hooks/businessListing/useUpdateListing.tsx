/* eslint-disable max-len */
import { useState } from 'react';
import { updateListing } from '../../api/businessListings';
import { BusinessListing } from '../../routes/business-listings/type';

export default function useUpdateListing() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [success, setSuccess] = useState<boolean>(false);

  const updateBusinessListing = async (listing: BusinessListing, handleAfterSuccessfullApi: () => void) => {
    setLoading(true);
    setErrorMessages([]);
    setSuccess(false);

    try {
      await updateListing(listing);
      setSuccess(true);
      setLoading(false);
      handleAfterSuccessfullApi();
    } catch (err: any) {
      setErrorMessages(err.response.data.message);
      setLoading(false);
    }
  };

  return {
    updateBusinessListing,
    loading,
    errorMessages,
    success,
  };
}
