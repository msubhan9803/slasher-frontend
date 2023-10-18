import axios from 'axios';
import { apiUrl } from '../env';
import { getSessionToken } from '../utils/session-utils';

export async function getBooks() {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return axios.get(`${apiUrl}/api/v1/books`, { headers });
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
