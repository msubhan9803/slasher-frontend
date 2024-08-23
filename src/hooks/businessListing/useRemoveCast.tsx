/* eslint-disable max-len */
import { useState } from 'react';
import { removeCastApi } from '../../api/businessListings';

export default function useRemoveCast() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [success, setSuccess] = useState<boolean>(false);

  const removeCast = async (movieRef: string, castRef: string, callback?: () => void) => {
    setLoading(true);
    setErrorMessages([]);
    setSuccess(false);

    try {
      await removeCastApi(movieRef, castRef);
      setSuccess(true);
      setLoading(false);

      if (callback) {
        callback();
      }
    } catch (err: any) {
      setErrorMessages(err.response.data.message);
      throw Error(err.response.data.message);
    }
  };

  return {
    removeCast,
    loading,
    errorMessages,
    success,
  };
}
