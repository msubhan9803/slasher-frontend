/* eslint-disable max-len */
import { useState } from 'react';
import { UpdateCastApiPayload, updateCastApi } from '../../api/businessListings';

export default function useUpdateCast() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [success, setSuccess] = useState<boolean>(false);

  const updateCast = async (payload: UpdateCastApiPayload, callback?: () => void) => {
    setLoading(true);
    setErrorMessages([]);
    setSuccess(false);

    try {
      await updateCastApi(payload);
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
    updateCast,
    loading,
    errorMessages,
    success,
  };
}
