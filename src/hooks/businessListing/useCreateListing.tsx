import { useState } from 'react';
import { toast } from 'react-toastify';
import { createListing } from '../../api/businessListings';
import { BusinessListing } from '../../routes/business-listings/type';

export default function useCreateListing() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createBusinessListing = async (listing: BusinessListing) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // eslint-disable-next-line no-debugger
      debugger;
      await createListing(listing);
      setSuccess(true);

      toast(
        <div>
          <p>Success</p>
          <p>
            Listing created successfully
          </p>
        </div>,
        {
          theme: 'dark',
          type: 'success',
        },
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred');

        toast(
          <div>
            <p>Error</p>
            <p>
              {err.message}
            </p>
          </div>,
          {
            theme: 'dark',
            type: 'error',
          },
        );
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    createBusinessListing,
    loading,
    error,
    success,
  };
}
