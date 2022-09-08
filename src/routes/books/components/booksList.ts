import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import BookPoster from '../../../images/book-poster.jpg';

export const allBooks = [
  {
    id: 1, name: 'Home Sweet Horror', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", image: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'The Kite Runner', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 5, name: 'The ExorcistNot Once But Twice', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 6, name: 'Tom Clancy communist Strike Back', image: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 7, name: 'Shatter me', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 8, name: 'Verity', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 9, name: 'Environmental citizenship', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 10, name: 'Carrie', image: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const slasherIndieBooks = [
  {
    id: 1, name: 'Home Sweet Horror', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", image: `${BookPoster}`, year: '2022', liked: false,
  },
];

export const favoriteBooks = [
  {
    id: 1, name: 'The ExorcistNot Once But Twice', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: 'Tom Clancy communist Strike Back', image: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Shatter me', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'Verity', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 5, name: 'Environmental citizenship', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 6, name: 'Carrie', image: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const readBooks = [
  {
    id: 1, name: 'Home Sweet Horror', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", image: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'Verity', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 5, name: 'Environmental citizenship', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 6, name: 'Carrie', image: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const readingListBooks = [
  {
    id: 1, name: 'Home Sweet Horror', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", image: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'The Kite Runner', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 5, name: 'The ExorcistNot Once But Twice', image: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const buyListBooks = [
  {
    id: 1, name: 'Home Sweet Horror', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", image: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 4, name: 'The Kite Runner', image: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const myBooks = [
  {
    id: 1, name: 'Home Sweet Horror', image: `${BookPoster}`, year: '2022', liked: true,
  },
  {
    id: 2, name: "The Viking's revenge", image: `${BookPoster}`, year: '2022', liked: false,
  },
  {
    id: 3, name: 'Papá rico, papá pobre', image: `${BookPoster}`, year: '2022', liked: true,
  },
];

export const BookIconList = [
  {
    label: 'Favorite', icon: solid('heart'), iconColor: '#8F00FF', width: '1.445rem', height: '1.445rem', addBook: false,
  },
  {
    label: 'Watch', icon: solid('check'), iconColor: '#32D74B', width: '1.445rem', height: '1.033rem', addBook: false,
  },
  {
    label: 'Watchlist', icon: solid('list-check'), iconColor: '#FF8A00', width: '1.498rem', height: '1.265rem', addBook: true,
  },
  {
    label: 'Buy', icon: solid('bag-shopping'), iconColor: '#FF1800', width: '1.098rem', height: '1.265rem', addBook: false,
  },
];
