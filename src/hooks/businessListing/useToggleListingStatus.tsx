import { useState } from 'react';
import { toggleListingStatus } from '../../api/businessListings';

export default function useToggleListingStatus() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[] | undefined>();
  const [success, setSuccess] = useState<boolean>(false);

  const toggleStatus = async (listingId: string, businessType: string) => {
    setLoading(true);
    setErrorMessages(undefined);
    setSuccess(false);

    try {
      await toggleListingStatus(listingId, businessType);
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setErrorMessages([err.response.data.message]);
      setLoading(false);
    }
  };

  return {
    toggleStatus,
    loading,
    errorMessages,
    success,
  };
}
