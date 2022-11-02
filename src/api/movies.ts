import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from './constants';

export default async function getMovies(search = '', shortValue = '', lastRetrievedMovieId?: string | null) {
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

  if (shortValue && shortValue === 'alphabetical') {
    queryParameter = '?limit=20&sortBy=name';
  }

  if (shortValue && shortValue === 'releaseDate') {
    queryParameter = '?limit=20&sortBy=releaseDate';
  }

  if (shortValue && shortValue === 'userRating') {
    queryParameter = '?limit=20&sortBy=rating';
  }

  return axios.get(`${apiUrl}/movies${queryParameter}`, { headers });
}

export async function getMoviesByFirstName(key: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/movies/firstBySortName?startsWith=${key}`, { headers });
}
