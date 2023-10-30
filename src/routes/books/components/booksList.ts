/* eslint-disable max-lines */
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import BookPoster from '../../../images/book-detail-poster.jpg';

export const suggestBooks = [
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', worthWatching: 2, rating: 3.5,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', worthWatching: 1, rating: 5,
  },
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', worthWatching: 2, rating: 3.5,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', worthWatching: 1, rating: 5,
  },
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', worthWatching: 2, rating: 3.5,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', worthWatching: 1, rating: 5,
  },
];
export const allBooks = [
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'The Kite Runner', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 5, name: 'The ExorcistNot Once But Twice', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 6, name: 'Tom Clancy communist Strike Back', logo: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 7, name: 'Shatter me', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 8, name: 'Verity', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 9, name: 'Environmental citizenship', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 10, name: 'Carrie', logo: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const slasherIndieBooks = [
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', liked: false,
  },
];

export const favoriteBooks = [
  {
    id: 1, name: 'The ExorcistNot Once But Twice', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: 'Tom Clancy communist Strike Back', logo: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Shatter me', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'Verity', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 5, name: 'Environmental citizenship', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 6, name: 'Carrie', logo: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const readBooks = [
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'Verity', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 5, name: 'Environmental citizenship', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 6, name: 'Carrie', logo: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const readingListBooks = [
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'The Kite Runner', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 5, name: 'The ExorcistNot Once But Twice', logo: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const buyListBooks = [
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', logo: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'The Kite Runner', logo: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const myBooks = [
  {
    id: 1, name: 'Home Sweet Horror', logo: `${BookPoster}`, year: '2022', liked: true, isDeactivate: true,
  },
  {
    id: 2, name: "The Viking's revenge", logo: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', logo: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const BookIconList = [
  {
    label: 'Favorite', key: 'favorite', icon: solid('heart'), iconColor: '#8F00FF', width: '1.445rem', height: '1.445rem', addBook: false,
  },
  {
    label: 'Read', key: 'read', icon: solid('check'), iconColor: '#32D74B', width: '1.445rem', height: '1.033rem', addBook: false,
  },
  {
    label: 'Reading list', key: 'readingList', icon: solid('list-check'), iconColor: '#FF8A00', width: '1.498rem', height: '1.265rem', addBook: false,
  },
  {
    label: 'Buy', key: 'buy', icon: solid('bag-shopping'), iconColor: '#FF1800', width: '1.098rem', height: '1.265rem', addBook: false,
  },
];
