import { useState, useEffect } from 'react';
import { getSessionToken } from '../utils/session-utils';

const useSessionToken = () => {
  const [token, setToken] = useState({
    isLoading: true,
    value: null as (null | string),
  });
  useEffect(() => {
    getSessionToken().then((val) => {
      setToken({ isLoading: false, value: val });
    }).catch(() => {
      setToken((prev) => ({ ...prev, isLoading: false }));
    });
  }, []);
  return token;
};

export default useSessionToken;
