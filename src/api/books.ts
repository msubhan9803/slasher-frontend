import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';

export async function getBooks(
  search: string,
  sortVal: string,
  key: string,
  lastRetrievedMovieId?: string | null,
) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let queryParameter = `?limit=10&sortBy=${sortVal}`;
  if (lastRetrievedMovieId) {
    queryParameter += `&after=${lastRetrievedMovieId}`;
  }
  if (search) {
    queryParameter += `&nameContains=${encodeURIComponent(search)}`;
  }
  if (key) {
    queryParameter += `&startsWith=${encodeURIComponent(key)}`;
  }
  return axios.get(`${apiUrl}/api/v1/books${queryParameter}`, { headers });
}

type BookDetailResType = any;
export async function getBookById(bookId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get<BookDetailResType>(`${apiUrl}/api/v1/books/${bookId}`, { headers });
}

export async function createOrUpdateRating(id: string, rating: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.put(`${apiUrl}/api/v1/books/${id}/rating`, { rating }, { headers });
}
export async function createOrUpdateGoreFactor(id: string, goreFactorRating: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.put(`${apiUrl}/api/v1/books/${id}/gore-factor`, { goreFactorRating }, { headers });
}
export async function createOrUpdateWorthReading(id: string, worthReading: number) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.put(`${apiUrl}/api/v1/books/${id}/worth-reading`, { worthReading }, { headers });
}
export async function deleteRating(id: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.delete(`${apiUrl}/api/v1/books/${id}/rating`, { headers });
}
export async function deleteGoreFactor(id: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.delete(`${apiUrl}/api/v1/books/${id}/gore-factor`, { headers });
}
export async function deleteWorthReading(id: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.delete(`${apiUrl}/api/v1/books/${id}/worth-reading`, { headers });
}
export async function getBooksIdList(id: any) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/books/${id}/lists`, { headers });
}
export async function addBookUserStatus(id: string, category: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/books/${id}/lists/${category}`, {}, { headers });
}
export async function deleteBookUserStatus(id: string, category: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.delete(`${apiUrl}/api/v1/books/${id}/lists/${category}`, { headers });
}

export async function removeSuggestedbook(bookId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.post(`${apiUrl}/api/v1/books/recent/block`, { bookId }, { headers });
}
