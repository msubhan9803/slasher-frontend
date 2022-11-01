import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export default async function getMovies(lastRetrievedMovieId = null, search = '', e = '') {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = '?limit=20&sortBy=releaseDate';
  if (lastRetrievedMovieId) {
    queryParameter += `&after=${lastRetrievedMovieId}`;
  }

  if (search) {
    queryParameter += `&nameContains=${search}`;
  }

  if (e && e === 'alphabetical') {
    queryParameter = '?limit=20&sortBy=name';
  }

  if (e && e === 'releaseDate') {
    queryParameter = '?limit=20&sortBy=releaseDate';
  }

  if (e && e === 'userRating') {
    queryParameter = '?limit=20&sortBy=rating';
  }

  return axios.get(`${apiUrl}/movies${queryParameter}`, { headers });
}
