/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
import mongoose, { Model } from 'mongoose';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { MoviesService } from '../src/movies/providers/movies.service';
import { MovieDocument, Movie } from '../src/schemas/movie/movie.schema';
import { createApp } from './createApp';
import { generateSortRatingAndRatingUsersCountForMovie } from '../src/schemas/movie/movie.pre-post-hooks';

const calculateAverageMovieRating = async (app: INestApplication) => {
  console.log('STARTED: calculateAverageMovieRating');
  const moviesModel = app.get<Model<MovieDocument>>(getModelToken(Movie.name));
  const moviesService = app.get<MoviesService>(MoviesService);

  let i = 1;
  const sum = 0;
  const numOfItems = 0;

  for await (
    const doc of moviesModel
      .find()
      .cursor()
  ) {
    i += 1;

    // Skipping particular document
    // if (doc._id.toString() === '5da963af01651524ded158b9') {
    //   continue;
    // }

    // Skipping all when a particular document is found
    // if (doc._id.toString() === '5da963af01651524ded158b9') {
    //   break;
    // }

    // Log after every `n` items
    if ((i % 50) === 0) {
      console.log('Last item processed - Movie _id?', doc._id.toString());
      console.log('items processed?', i, '\n');
    }

    // ! Break look after 10 items (TESTING ONLY)
    if (i === 10) { break; }

    // Calculate `ratingUsersCount` from `movieuserstatuses` collection
    const ratingUsersCount = await moviesService.getRatingUsersCount(doc._id.toString());
    // console.log('ratingUsersCount?', ratingUsersCount);

    // Deleting field (make sure field is not defined in schema)
    // doc.set('sortRatingAndRatingUsersCount', undefined, { strict: false });

    // Generate and save `sortRatingAndRatingUsersCount`
    const sortRatingAndRatingUsersCount = generateSortRatingAndRatingUsersCountForMovie(doc.rating, doc.ratingUsersCount, doc._id.toString());
    // console.log('sortRatingAndRatingUsersCount?', sortRatingAndRatingUsersCount);

    // Updating fields
    doc.ratingUsersCount = ratingUsersCount;
    doc.sortRatingAndRatingUsersCount = sortRatingAndRatingUsersCount;

    await doc.save();

    // sum += doc.rating;
    // console.log('sum?', sum);
    // numOfItems += 1;
  }
  // const avg = (sum / numOfItems).toFixed(2);
  // console.log('Details?', { sum, numOfItems, avg });
};

(async () => {
  const app = await createApp();

  await calculateAverageMovieRating(app);
  console.log('\n\n App closing now!');
  await mongoose.disconnect();
  await app.close();
})();
