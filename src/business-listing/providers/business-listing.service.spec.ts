/* eslint-disable max-lines */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { bookBusinessListingFactory } from '../../../test/factories/bookBusinessListing.factory';
import { moviesFactory } from '../../../test/factories/movies.factory';
import { MovieActiveStatus, MovieType } from '../../schemas/movie/movie.enums';
import { MoviesService } from '../../movies/providers/movies.service';
import { MovieDocument } from '../../schemas/movie/movie.schema';
import { movieBusinessListingFactory } from '../../../test/factories/movieBusinessListing.factory';
import { AppModule } from '../../app.module';
import { BusinessListing } from '../../schemas/businessListing/businessListing.schema';
import { UserDocument } from '../../schemas/user/user.schema';
import { artistBusinessListingFactory } from '../../../test/factories/artistBusinessListing.factory';
import { podcastBusinessListingFactory } from '../../../test/factories/podcastBusinessListing.factory';
import { vendorBusinessListingFactory } from '../../../test/factories/vendorBusinessListing.factory';
import { videoCreatorBusinessListingFactory } from '../../../test/factories/videoCreatorBusinessListing.factory';
import { musicCreatorBusinessListingFactory } from '../../../test/factories/musicBusinessListing.factory';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { BusinessListingService } from './business-listing.service';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { BusinessType } from '../../schemas/businessListing/businessListing.enums';
import { BookDocument } from '../../schemas/book/book.schema';
import { BooksService } from '../../books/providers/books.service';
import { booksFactory } from '../../../test/factories/books.factory';
import { BookActiveStatus, BookType } from '../../schemas/book/book.enums';

describe('BusinessListingService', () => {
  let app: INestApplication;
  let connection: Connection;
  let businessListingService: BusinessListingService;
  let usersService: UsersService;
  let moviesService: MoviesService;
  let booksService: BooksService;
  let artistListing: BusinessListing;
  let podcastListing: BusinessListing;
  let vendorListing: BusinessListing;
  let videoCreatorListing: BusinessListing;
  let musicCreatorListing: BusinessListing;
  let movieListing: BusinessListing;
  let bookListing: BusinessListing;
  let movie: MovieDocument;
  let book: BookDocument;
  let activeUser: UserDocument;
  let user1: UserDocument;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    connection = moduleRef.get<Connection>(getConnectionToken());
    businessListingService = moduleRef.get<BusinessListingService>(
      BusinessListingService,
    );
    usersService = moduleRef.get<UsersService>(UsersService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    booksService = moduleRef.get<BooksService>(BooksService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(
      userFactory.build({ userName: 'superman1' }),
    );
    user1 = await usersService.create(
      userFactory.build({ userName: 'Michael' }),
    );

    // Creating Artist Listing
    const artistBusinessListing = artistBusinessListingFactory.build();
    artistBusinessListing.userRef = activeUser._id;
    artistListing = await businessListingService.createListing(
      artistBusinessListing,
    );

    // Creating Podcast Listing
    const podcastBusinessListing = podcastBusinessListingFactory.build();
    podcastBusinessListing.userRef = activeUser._id;
    podcastListing = await businessListingService.createListing(
      podcastBusinessListing,
    );

    // Creating Vendor Listing
    const vendorBusinessListing = vendorBusinessListingFactory.build();
    vendorBusinessListing.userRef = activeUser._id;
    vendorListing = await businessListingService.createListing(
      vendorBusinessListing,
    );

    // Creating Video Creator Listing
    const videoCreatorBusinessListing = videoCreatorBusinessListingFactory.build();
    videoCreatorBusinessListing.userRef = activeUser._id;
    videoCreatorListing = await businessListingService.createListing(
      videoCreatorBusinessListing,
    );

    // Creating Music Creator Listing
    const musicCreatorBusinessListing = musicCreatorBusinessListingFactory.build();
    musicCreatorBusinessListing.userRef = activeUser._id;
    musicCreatorListing = await businessListingService.createListing(
      musicCreatorBusinessListing,
    );

    // Creating Movie Listing
    const movieBusinessListing = movieBusinessListingFactory.build();
    movie = await moviesService.create(
      moviesFactory.build({
        type: MovieType.UserDefined,
        name: movieBusinessListing.title,
        descriptions: movieBusinessListing.overview,
        trailerUrls: Object.values(movieBusinessListing.trailerLinks).map(
          (trailer: string) => trailer,
        ),
        countryOfOrigin: movieBusinessListing.countryOfOrigin,
        durationInMinutes: movieBusinessListing.durationInMinutes,
        rating: parseInt(movieBusinessListing.officialRatingReceived, 10),
        releaseDate: new Date(movieBusinessListing.yearReleased, 0),
        status: MovieActiveStatus.Active,
        watchUrl: movieBusinessListing.link,
      }),
    );

    movieListing = await businessListingService.createListing({
      ...movieBusinessListing,
      movieRef: movie._id,
      userRef: activeUser._id,
    });

    // Creating Book Listing
    const bookBusinessListing = bookBusinessListingFactory.build();
    const {
      title,
      overview,
      yearReleased,
      author,
      pages,
      isbn,
      officialRatingReceived,
      link,
    } = movieBusinessListing;

    book = await booksService.create(
      booksFactory.build({
        type: BookType.UserDefined,
        name: title,
        sort_name: '',
        author: [author],
        numberOfPages: pages,
        isbnNumber: [isbn],
        description: overview,
        status: BookActiveStatus.Active,
        coverEditionKey: 'empty',
        publishDate: new Date(yearReleased),
        rating: parseInt(officialRatingReceived, 10),
        buyUrl: link,
        userRef: activeUser._id,
      }),
    );

    bookListing = await businessListingService.createListing({
      ...bookBusinessListing,
      bookRef: book._id,
      userRef: activeUser._id,
    });
  });

  it('should be defined', () => {
    expect(businessListingService).toBeDefined();
  });

  describe('#checkPreparation', () => {
    it('artist business listing should be defined', () => {
      expect(artistListing).toBeDefined();
    });
    it('podcast business listing should be defined', () => {
      expect(podcastListing).toBeDefined();
    });
    it('vendor business listing should be defined', () => {
      expect(vendorListing).toBeDefined();
    });
    it('video creator business listing should be defined', () => {
      expect(videoCreatorListing).toBeDefined();
    });
    it('music creator business listing should be defined', () => {
      expect(musicCreatorListing).toBeDefined();
    });
    it('movie business listing should be defined', () => {
      expect(movieListing).toBeDefined();
    });
    it('book business listing should be defined', () => {
      expect(bookListing).toBeDefined();
    });
    it('active user should be defined', () => {
      expect(activeUser).toBeDefined();
    });
    it('user 1 should be defined', () => {
      expect(user1).toBeDefined();
    });
  });

  describe('#createListing', () => {
    it('successfully creates artist business listing', async () => {
      const createdListing = await businessListingService.findOne(
        artistListing._id.toString(),
      );
      expect(createdListing).toBeTruthy();
      expect(createdListing.title).toEqual(artistListing.title);
    });

    it('successfully creates podcast business listing', async () => {
      const createdListing = await businessListingService.findOne(
        podcastListing._id.toString(),
      );
      expect(createdListing).toBeTruthy();
      expect(createdListing.title).toEqual(podcastListing.title);
    });

    it('successfully creates vendor business listing', async () => {
      const createdListing = await businessListingService.findOne(
        vendorListing._id.toString(),
      );
      expect(createdListing).toBeTruthy();
      expect(createdListing.title).toEqual(vendorListing.title);
    });

    it('successfully creates video creator business listing', async () => {
      const createdListing = await businessListingService.findOne(
        videoCreatorListing._id.toString(),
      );
      expect(createdListing).toBeTruthy();
      expect(createdListing.title).toEqual(videoCreatorListing.title);
    });

    it('successfully creates music creator business listing', async () => {
      const createdListing = await businessListingService.findOne(
        musicCreatorListing._id.toString(),
      );
      expect(createdListing).toBeTruthy();
      expect(createdListing.title).toEqual(musicCreatorListing.title);
    });

    it('successfully creates movie business listing', async () => {
      const createdListing = await businessListingService.findOne(
        movieListing._id.toString(),
      );
      expect(createdListing).toBeTruthy();
      expect(createdListing.title).toEqual(movieListing.title);
    });

    it('successfully creates book business listing', async () => {
      const createdListing = await businessListingService.findOne(
        bookListing._id.toString(),
      );
      expect(createdListing).toBeTruthy();
      expect(createdListing.title).toEqual(bookListing.title);
    });
  });

  describe('#getAllListings', () => {
    it('retrieves all active business listings', async () => {
      const listings = await businessListingService.getAllListings(null);

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });

    it('retrieves artist business listing with pagination', async () => {
      const listings = await businessListingService.getAllListings(
        BusinessType.ARTIST,
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });

    it('retrieves podcast business listing with pagination', async () => {
      const listings = await businessListingService.getAllListings(
        BusinessType.PODCASTER,
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });

    it('retrieves vendor business listing with pagination', async () => {
      const listings = await businessListingService.getAllListings(
        BusinessType.VENDOR,
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });

    it('retrieves video creator business listing with pagination', async () => {
      const listings = await businessListingService.getAllListings(
        BusinessType.VIDEO_CREATOR,
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });

    it('retrieves music creator business listing with pagination', async () => {
      const listings = await businessListingService.getAllListings(
        BusinessType.MUSICIAN,
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });

    it('retrieves movie business listing with pagination', async () => {
      const listings = await businessListingService.getAllListings(
        BusinessType.MOVIES,
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });

    it('retrieves book business listing with pagination', async () => {
      const listings = await businessListingService.getAllListings(
        BusinessType.BOOKS,
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });
  });

  describe('#getAllListingsForAdmin', () => {
    it('retrieves all business listings for admin', async () => {
      const listings = await businessListingService.getAllListingsForAdmin(
        null,
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });
  });

  describe('#getAllMyListings', () => {
    it('retrieves all listings associated with a user', async () => {
      const listings = await businessListingService.getAllMyListings(
        activeUser._id.toString(),
      );

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
      for (let index = 0; index < listings.length; index += 1) {
        const listing = listings[index];
        expect(listing.userRef.toString()).toEqual(activeUser._id.toString());
      }
    });
  });

  describe('#update', () => {
    it('finds the artist business listing and updates the details', async () => {
      const updateData = {
        title: 'Updated Business Title',
        address: '4567 Updated St, Suite 2',
      };
      const updatedListing = await businessListingService.update(
        artistListing._id.toString(),
        updateData,
      );
      expect(updatedListing.title).toEqual(updateData.title);
      expect(updatedListing.address).toEqual(updateData.address);
    });

    it('finds the podcast business listing and updates the details', async () => {
      const updateData = {
        title: 'Updated Podcast Title',
      };
      const updatedListing = await businessListingService.update(
        podcastListing._id.toString(),
        updateData,
      );
      expect(updatedListing.title).toEqual(updateData.title);
    });

    it('finds the vendor business listing and updates the details', async () => {
      const updateData = {
        title: 'Updated Vendor Title',
      };
      const updatedListing = await businessListingService.update(
        vendorListing._id.toString(),
        updateData,
      );
      expect(updatedListing.title).toEqual(updateData.title);
    });

    it('finds the video creator business listing and updates the details', async () => {
      const updateData = {
        title: 'Updated Video Creator Title',
      };
      const updatedListing = await businessListingService.update(
        videoCreatorListing._id.toString(),
        updateData,
      );
      expect(updatedListing.title).toEqual(updateData.title);
    });

    it('finds the music creator business listing and updates the details', async () => {
      const updateData = {
        title: 'Updated Music Creator Title',
      };
      const updatedListing = await businessListingService.update(
        musicCreatorListing._id.toString(),
        updateData,
      );
      expect(updatedListing.title).toEqual(updateData.title);
    });

    it('finds the movie business listing and updates the details', async () => {
      const updateData = {
        title: 'Updated Movie Title',
      };
      const updatedListing = await businessListingService.update(
        movieListing._id.toString(),
        updateData,
      );
      expect(updatedListing.title).toEqual(updateData.title);
    });

    it('finds the book business listing and updates the details', async () => {
      const updateData = {
        title: 'Updated Book Title',
      };
      const updatedListing = await businessListingService.update(
        bookListing._id.toString(),
        updateData,
      );
      expect(updatedListing.title).toEqual(updateData.title);
    });
  });

  describe('#findOne', () => {
    it('finds the artist business listing details', async () => {
      const foundListing = await businessListingService.findOne(
        artistListing._id.toString(),
      );
      expect(foundListing.title).toEqual(artistListing.title);
    });
    it('finds the podcast business listing details', async () => {
      const foundListing = await businessListingService.findOne(
        podcastListing._id.toString(),
      );
      expect(foundListing.title).toEqual(podcastListing.title);
    });
    it('finds the vendor business listing details', async () => {
      const foundListing = await businessListingService.findOne(
        vendorListing._id.toString(),
      );
      expect(foundListing.title).toEqual(vendorListing.title);
    });
    it('finds the video creator business listing details', async () => {
      const foundListing = await businessListingService.findOne(
        videoCreatorListing._id.toString(),
      );
      expect(foundListing.title).toEqual(videoCreatorListing.title);
    });
    it('finds the music creator business listing details', async () => {
      const foundListing = await businessListingService.findOne(
        musicCreatorListing._id.toString(),
      );
      expect(foundListing.title).toEqual(musicCreatorListing.title);
    });
    it('finds the movie business listing details', async () => {
      const foundListing = await businessListingService.findOne(
        movieListing._id.toString(),
      );
      expect(foundListing.title).toEqual(movieListing.title);
    });
    it('finds the book business listing details', async () => {
      const foundListing = await businessListingService.findOne(
        bookListing._id.toString(),
      );
      expect(foundListing.title).toEqual(bookListing.title);
    });
  });

  describe('#updateAll', () => {
    it('updates all fields of artist business listing', async () => {
      const updateData = artistBusinessListingFactory.build();
      const updatedListing = await businessListingService.updateAll(
        artistListing._id.toString(),
        updateData as BusinessListing,
      );

      expect(updatedListing).toBeTruthy();
      expect(updatedListing.title).toEqual(updateData.title);
      expect(updatedListing.overview).toEqual(updateData.overview);
      expect(updatedListing.isActive).toEqual(updateData.isActive);
    });

    it('updates all fields of podcast business listing', async () => {
      const updateData = podcastBusinessListingFactory.build();
      const updatedListing = await businessListingService.updateAll(
        podcastListing._id.toString(),
        updateData as BusinessListing,
      );

      expect(updatedListing).toBeTruthy();
      expect(updatedListing.title).toEqual(updateData.title);
      expect(updatedListing.overview).toEqual(updateData.overview);
      expect(updatedListing.isActive).toEqual(updateData.isActive);
    });

    it('updates all fields of vendor business listing', async () => {
      const updateData = vendorBusinessListingFactory.build();
      const updatedListing = await businessListingService.updateAll(
        vendorListing._id.toString(),
        updateData as BusinessListing,
      );

      expect(updatedListing).toBeTruthy();
      expect(updatedListing.title).toEqual(updateData.title);
      expect(updatedListing.overview).toEqual(updateData.overview);
      expect(updatedListing.isActive).toEqual(updateData.isActive);
    });

    it('updates all fields of video creator business listing', async () => {
      const updateData = videoCreatorBusinessListingFactory.build();
      const updatedListing = await businessListingService.updateAll(
        videoCreatorListing._id.toString(),
        updateData as BusinessListing,
      );

      expect(updatedListing).toBeTruthy();
      expect(updatedListing.title).toEqual(updateData.title);
      expect(updatedListing.overview).toEqual(updateData.overview);
      expect(updatedListing.isActive).toEqual(updateData.isActive);
    });

    it('updates all fields of music creator business listing', async () => {
      const updateData = musicCreatorBusinessListingFactory.build();
      const updatedListing = await businessListingService.updateAll(
        musicCreatorListing._id.toString(),
        updateData as BusinessListing,
      );

      expect(updatedListing).toBeTruthy();
      expect(updatedListing.title).toEqual(updateData.title);
      expect(updatedListing.overview).toEqual(updateData.overview);
      expect(updatedListing.isActive).toEqual(updateData.isActive);
    });
  });
});
