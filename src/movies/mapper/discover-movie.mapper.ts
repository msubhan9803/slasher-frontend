import { MovieActiveStatus, MovieType } from '../../schemas/movie/movie.enums';
import { Movie } from '../../schemas/movie/movie.schema';
import { DiscoverMovieDto } from '../dto/discover-movie.dto';

export class DiscoverMovieMapper {
    public static toDomain(movieApiResponse: DiscoverMovieDto): Movie {
        const dbObj = new Movie();
        dbObj.movieDBId = movieApiResponse.id;
        dbObj.name = movieApiResponse.title;
        dbObj.adult = movieApiResponse.adult;
        dbObj.backDropPath = movieApiResponse.backdrop_path;
        dbObj.descriptions = movieApiResponse.overview;
        dbObj.logo = movieApiResponse.poster_path;
        dbObj.popularity = movieApiResponse.vote_average;
        dbObj.releaseDate = movieApiResponse.release_date;
        dbObj.type = MovieType.MovieDb;

        // Movies fromt TMDB are always set to Active when created
        dbObj.status = MovieActiveStatus.Active;

        return dbObj;
    }
}
