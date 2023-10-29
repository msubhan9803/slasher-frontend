// Last updated @ 28 Oct, 2023
// Average rating of movies = sum_of_all_rating_in_movies_colletion / total_number_of_movies
const C = 0.52;

// A minimum number of ratings required for a movie to be considered (you can choose a
// value based on your database size and the level of confidence you want).
const M = 20;

// r is rating of movie
// v is number of ratings of movie
const calculateWeightedRatingOfMovie = (r: number, v: number) => (v / (v + M)) * r + (M / (v + M)) * C;
export const getSortSafeWeightedRating = (r: number, v: number) => calculateWeightedRatingOfMovie(r, v).toFixed(8);
