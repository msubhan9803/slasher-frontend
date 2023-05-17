import { useState, useEffect } from 'react';
import { getSessionToken } from '../utils/session-utils';

/** USAGE: When using this hook in components make sure you wait for token to be loaded.
 * For e.g,
 * const token = useSessionToken();
 * ...
 * if (!token.isLoading){ // access `token.value` here }
 */
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
