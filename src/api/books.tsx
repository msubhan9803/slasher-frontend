import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function getBooks(search = '', sortValue = '') {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?limit=20&sortBy=${sortValue}`;
  if (search) {
    queryParameter += `&nameContains=${search}`;
  }
  return axios.get(`${apiUrl}/books${queryParameter}`, { headers });
}
