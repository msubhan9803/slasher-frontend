import { ListingType } from './type';

type Config = {
  [key in ListingType]: {
    title: string;
    shortTitle: string;
    noteList: string[];
    linkFieldLabel: string;
  };
};

const config: Config = {
  movies: {
    title:
      'Add your movie and reach horror fans looking for movies on Slasher!',
    shortTitle: 'Add your movie',
    noteList: [
      'A listing in the movie database with your cover art, description, trailers, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your movie that also appear on the timeline.',
      'People on Slasher can follow your movie and get notifIed of new posts.',
    ],
    linkFieldLabel: 'Link to watch your movie',
  },
  books: {
    title:
      'Add your book and reach horror fans on Slasher more easily!',
    shortTitle: 'Add your book',
    noteList: [
      'A listing in the movie database with your cover art, description, trailers, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your book that also appear on the timeline.',
      'People on Slasher can follow your book and get notifIed of new posts.',
    ],
    linkFieldLabel: 'Link to buy book',
  },
};

export default config;
