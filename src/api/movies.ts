import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function getMovies(search = '', sortValue = '', lastRetrievedMovieId?: string | null) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?limit=20&sortBy=${sortValue}`;
  if (lastRetrievedMovieId) {
    queryParameter += `&after=${lastRetrievedMovieId}`;
  }

  if (search) {
    queryParameter += `&nameContains=${search}`;
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
export async function getMoviesById(id: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/movies/${id}`, { headers });
}
export async function getMoviesDataById(movieDBId: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/movies/movieDbData/${movieDBId}`, { headers });
}
