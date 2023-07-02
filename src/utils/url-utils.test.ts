import {
  isConversationPage,
  isEventDetailsPage,
  isHomePage, isMovieDetailsPageSubRoutes, isNewsPartnerPageSubRoutes, isPostDetailsPage,
  isUserProfilePage,
} from './url-utils';

describe('Page Matchers', () => {
  test('isHomePage', () => {
    const path = '/app/home';
    expect(isHomePage(path)).toBeTruthy();
  });

  test('isPostDetailsPage', () => {
    const url = '/slasher-test-user1/posts/6450086566a60138c4e2b293';
    expect(isPostDetailsPage(url)).toBeTruthy();
  });

  test('isNewsPartnerPageSubRoutes', () => {
    const newsPartnerPage = '/app/news/partner/6036639a657a566248b973f7';
    expect(isNewsPartnerPageSubRoutes(newsPartnerPage)).toBeTruthy();
    const newsPartnerPost = '/app/news/partner/5feda1640902004a842976d6/posts/647423448fc9132a1c01d3d7';
    expect(isNewsPartnerPageSubRoutes(newsPartnerPost)).toBeTruthy();
  });

  test('isMovieDetailsPageSubRoutes', () => {
    const movieDetails = '/app/movies/64477b42b12f5efbb3468ff4/details';
    expect(isMovieDetailsPageSubRoutes(movieDetails)).toBeTruthy();
    const moviePosts = '/app/movies/64477b42b12f5efbb3468ff4/posts';
    expect(isMovieDetailsPageSubRoutes(moviePosts)).toBeTruthy();
    const movieReviews = '/app/movies/64477b42b12f5efbb3468ff4/reviews';
    expect(isMovieDetailsPageSubRoutes(movieReviews)).toBeTruthy();
  });

  test('isEventDetailsPage', () => {
    const eventDetails = '/app/events/63864eb94e08320019545b9a';
    expect(isEventDetailsPage(eventDetails)).toBeTruthy();
  });

  test('isConversationPage', () => {
    const conversationPage = '/app/messages/conversation/63ab6a5b6de562001116f7fc';
    expect(isConversationPage(conversationPage)).toBeTruthy();
  });

  describe('isUserProfilePage', () => {
    test('Good Matches', () => {
      const userAbout = '/slasher-test-user1/about';
      expect(isUserProfilePage(userAbout)).toBeTruthy();
      const userPosts = '/slasher-test-user1/posts';
      expect(isUserProfilePage(userPosts)).toBeTruthy();
      const userFriends = '/slasher-test-user1/friends';
      expect(isUserProfilePage(userFriends)).toBeTruthy();
      const userFriendsRequests = '/slasher-test-user1/friends/request';
      expect(isUserProfilePage(userFriendsRequests)).toBeTruthy();
      const userPhotos = '/slasher-test-user1/photos';
      expect(isUserProfilePage(userPhotos)).toBeTruthy();
      const userWatchedList = '/slasher-test-user1/watched-list';
      expect(isUserProfilePage(userWatchedList)).toBeTruthy();
    });

    test('Non matching paths', () => {
      const homePath = '/app/home';
      expect(isUserProfilePage(homePath)).toBeFalsy();
      const moviesPath = '/app/movies/all';
      expect(isUserProfilePage(moviesPath)).toBeFalsy();
      const eventsPath = '/app/events/by-date';
      expect(isUserProfilePage(eventsPath)).toBeFalsy();
      const booksPath = '/app/books';
      expect(isUserProfilePage(booksPath)).toBeFalsy();
    });
  });
});
