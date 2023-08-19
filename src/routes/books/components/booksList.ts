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

export const bookDetail = {
  movieDBId: 1068010,
  rating: 3,
  ratingUsersCount: 3,
  goreFactorRating: 1.5,
  goreFactorRatingUsersCount: 2,
  worthWatching: 1,
  worthWatchingUpUsersCount: 0,
  worthWatchingDownUsersCount: 1,
  userData: {
    rating: 0,
    goreFactorRating: 0,
    worthWatching: 0,
    reviewPostId: '648bf52b58c72e648f7dca74',
  },
};

export const bookReviewList = [
  {
    _id: '64927a94d106495a2beaec8b',
    id: '64927a94d106495a2beaec8b',
    postDate: '2023-06-21T04:20:36.443Z',
    message: 'movie review created',
    images: [],
    userName: 'ladaniavadh',
    profileImage: 'https://d13qdlbrji2lqg.cloudfront.net/placeholders/default_user_icon.png',
    userId: '62a4d4a3273dee001941f32d',
    likeIcon: true,
    likeCount: 1,
    commentCount: 6,
    rating: 3,
    goreFactor: 2,
    worthWatching: 0,
    movieId: '64477b42b12f5efbb3468ff4',
    spoilers: false,
  },
  {
    _id: '648ea1bbb02c1fb3a8cdb8db',
    id: '648ea1bbb02c1fb3a8cdb8db',
    postDate: '2023-06-18T06:18:35.563Z',
    message: 'ghj gvbhjnk njk',
    images: [],
    userName: 'slasher-test-user212',
    profileImage: 'https://d13qdlbrji2lqg.cloudfront.net/placeholders/default_user_icon.png',
    userId: '63ab68c496b28d00122ec102',
    likeIcon: false,
    likeCount: 1,
    commentCount: 15,
    rating: 4,
    goreFactor: 1,
    worthWatching: 1,
    movieId: '64477b42b12f5efbb3468ff4',
    spoilers: false,
  },
  {
    _id: '648bf52b58c72e648f7dca74',
    id: '648bf52b58c72e648f7dca74',
    postDate: '2023-06-16T05:37:47.420Z',
    message: 'test reviwew dsd😊 okkkk @slasher-test-user1 @Slasher-Test-User4 #ok dsfs ok😂',
    images: [],
    userName: 'slasher-test-user1',
    profileImage: 'https://d13qdlbrji2lqg.cloudfront.net/placeholders/default_user_icon.png',
    userId: '63ab684096b28d00122ec0de',
    likeIcon: false,
    likeCount: 0,
    commentCount: 3,
    rating: 0,
    goreFactor: 0,
    worthWatching: 0,
    movieId: '64477b42b12f5efbb3468ff4',
    spoilers: false,
  },
];
