/* eslint-disable max-len */
import { useState } from 'react';
import { addCastApi, AddCastApiPayload } from '../../api/businessListings';

export default function useAddCast() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [success, setSuccess] = useState<boolean>(false);

  const addCast = async (payload: AddCastApiPayload, callback?: () => void) => {
    setLoading(true);
    setErrorMessages([]);
    setSuccess(false);

    try {
      await addCastApi(payload);
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
    addCast,
    loading,
    errorMessages,
    success,
  };
}
