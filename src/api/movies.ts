import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '../constants';

export async function getMovies(
  search: string,
  sortValue: string,
  key: string,
  lastRetrievedMovieId?: string | null,
) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?limit=20&sortBy=${sortValue}`;
  if (lastRetrievedMovieId) {
    queryParameter += `&after=${lastRetrievedMovieId}`;
  }
  if (search) {
    queryParameter += `&nameContains=${encodeURIComponent(search)}`;
  }
  if (key) {
    queryParameter += `&startsWith=${encodeURIComponent(key)}`;
  }
  return axios.get(`${apiUrl}/api/v1/movies${queryParameter}`, { headers });
}

export async function getMoviesById(id: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/api/v1/movies/${id}`, { headers });
}
export async function getMoviesDataById(movieDBId: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/api/v1/movies/movieDbData/${movieDBId}`, { headers });
}
export async function getMoviesIdList(id: any) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/movies/${id}/lists`, { headers });
}
export async function addMovieUserStatus(id: string, category: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/movies/${id}/lists/${category}`, {}, { headers });
}
export async function deleteMovieUserStatus(id: string, category: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/movies/${id}/lists/${category}`, { headers });
}
export async function createOrUpdateRating(id: string, rating: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.put(`${apiUrl}/api/v1/movies/${id}/rating`, { rating }, { headers });
}
export async function createOrUpdateGoreFactor(id: string, goreFactorRating: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.put(`${apiUrl}/api/v1/movies/${id}/gore-factor`, { goreFactorRating }, { headers });
}
export async function createOrUpdateWorthWatching(id: string, worthWatching: number) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.put(`${apiUrl}/api/v1/movies/${id}/worth-watching`, { worthWatching }, { headers });
}
export async function deleteRating(id: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.delete(`${apiUrl}/api/v1/movies/${id}/rating`, { headers });
}
export async function deleteGoreFactor(id: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.delete(`${apiUrl}/api/v1/movies/${id}/gore-factor`, { headers });
}
export async function deleteWorthWatching(id: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.delete(`${apiUrl}/api/v1/movies/${id}/worth-watching`, { headers });
}
