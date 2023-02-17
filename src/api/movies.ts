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
  return axios.get(`${apiUrl}/api/v1/movies${queryParameter}`, { headers });
}

export async function getMoviesByFirstName(key: string) {
  const token = Cookies.get('sessionToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get(`${apiUrl}/api/v1/movies/firstBySortName?startsWith=${key}`, { headers });
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
