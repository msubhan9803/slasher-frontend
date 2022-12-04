import { DiscoverMovieDto } from './discover-movie.dto';

export interface MovieDbDto {
    page: number;
    results: DiscoverMovieDto[];
    total_pages: number;
    total_results: number;
}
