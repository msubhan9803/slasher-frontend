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
    title: 'Add your movie and reach horror fans looking for movies on Slasher!',
    shortTitle: 'Add your movie',
    noteList: [
      'A listing in the movie database with your cover art, description, trailers, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your movie that also appear on the timeline.',
      'People on Slasher can follow your movie and get notified of new posts.',
    ],
    linkFieldLabel: 'Link to watch your movie',
  },
  books: {
    title: 'Add your book and reach horror fans on Slasher more easily!',
    shortTitle: 'Add your book',
    noteList: [
      'A listing in the book database with your cover art, description, trailers, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your book that also appear on the timeline.',
      'People on Slasher can follow your book and get notified of new posts.',
    ],
    linkFieldLabel: 'Link to buy book',
  },
  podcaster: {
    title: 'Add your podcast and reach horror fans on Slasher more easily!',
    shortTitle: 'Add your podcast',
    noteList: [
      'A listing in the podcast database with your cover art, description, trailers, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your podcast that also appear on the timeline.',
      'People on Slasher can follow your podcast and get notified of new posts.',
    ],
    linkFieldLabel: 'Link to listen to your podcast',
  },
  musician: {
    title: 'Add your music and reach horror fans on Slasher more easily!',
    shortTitle: 'Add your music',
    noteList: [
      'A listing in the music database with your cover art, description, trailers, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your music that also appear on the timeline.',
      'People on Slasher can follow your music and get notified of new posts.',
    ],
    linkFieldLabel: 'Link to listen to your music',
  },
  artist: {
    title: 'Add your art and reach horror fans on Slasher more easily!',
    shortTitle: 'Add your art',
    noteList: [
      'A listing in the art database with your cover art, description, trailers, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your art that also appear on the timeline.',
      'People on Slasher can follow your art and get notified of new posts.',
    ],
    linkFieldLabel: 'Link to view your art',
  },
  vendor: {
    title: 'Add your vendor listing and reach horror fans on Slasher more easily!',
    shortTitle: 'Add your vendor listing',
    noteList: [
      'A listing in the vendor database with your cover art, description, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your products that also appear on the timeline.',
      'People on Slasher can follow your vendor profile and get notified of new posts.',
    ],
    linkFieldLabel: 'Link to your vendor store',
  },
  video_creator: {
    title: 'Add your video content and reach horror fans on Slasher more easily!',
    shortTitle: 'Add your video content',
    noteList: [
      'A listing in the video creator database with your cover art, description, trailers, and more.',
      'A second listing in the Slasher Indie section.',
      'Create posts and updates about your video content that also appear on the timeline.',
      'People on Slasher can follow your video content and get notified of new posts.',
    ],
    linkFieldLabel: 'Link to watch your videos',
  },
};

export default config;
