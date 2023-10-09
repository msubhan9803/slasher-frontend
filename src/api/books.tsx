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

export type BookDetailResType = {
  _id: string,
  logo: null,
  type: 0,
  createdBy: null,
  name: string,
  author: string[],
  numberOfPages: number,
  isbnNumber: string[],
  publishDate: string,
  description: string,
  covers: number[],
  coverEditionKey: string,
  bookId: string,
  status: 1,
  deleted: 0,
  __v: 0,
  createdAt: string,
  updatedAt: string
};
export async function getBookById(bookId: string) {
  const token = await getSessionToken();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return axios.get<BookDetailResType>(`${apiUrl}/api/v1/books/${bookId}`, { headers });
}
