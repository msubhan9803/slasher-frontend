/* eslint-disable prefer-regex-literals */
export const urlForUserPost = (userName: string, id: string) => `/${userName}/posts/${id}`;

export const urlForNewsPost = (rssfeedProviderId: string, id: string) => `/app/news/partner/${rssfeedProviderId}/posts/${id}`;

export const urlForMovie = (id: string) => `/app/movies/${id}/details`;

export const urlForEvent = (id: string) => `/app/events/${id}`;

export const MONGODB_ID = '[a-f\\d]{24}';

export const isHomePage = (pathname: string) => pathname === '/app/home'; // e.g, pathname = '/app/home'
export const isPostDetailsPage = (pathname: string) => new RegExp(`/.+/posts/${MONGODB_ID}$`).test(pathname); // e.g, pathname = '/slasher-test-user1/posts/6450086566a60138c4e2b293'
export const isNewsPartnerPageSubRoutes = (pathname: string) => new RegExp(`/app/news/partner/${MONGODB_ID}`).test(pathname); // e.g, pathname = '/app/news/partner/6036639a657a566248b973f7'
export const isMovieDetailsPageSubRoutes = (pathname: string) => new RegExp(`/app/movies/${MONGODB_ID}/.+`).test(pathname);
export const isBookDetailsPageSubRoutes = (pathname: string) => new RegExp(`/app/books/${MONGODB_ID}/.+`).test(pathname);
export const isEventDetailsPage = (pathname: string) => new RegExp(`/app/events/${MONGODB_ID}$`).test(pathname); // e.g., pathname = '/app/events/63864eb94e08320019545b9a'
export const isConversationPage = (pathname: string) => new RegExp(`/app/messages/conversation/${MONGODB_ID}$`).test(pathname); // e.g., pathname = '/app/messages/conversation/63ab6a5b6de562001116f7fc'
export const isUserProfilePage = (pathname: string) => new RegExp('^(?!/app).*').test(pathname); // e.g, pathname = '/slasher-test-user1/about'

export const showBackButtonInIos = (pathname: string) => [isPostDetailsPage,
  isNewsPartnerPageSubRoutes, isMovieDetailsPageSubRoutes, isEventDetailsPage,
  isConversationPage, isUserProfilePage].some((fn) => fn(pathname));

export const getLastNonProfilePathname = (
  pathnameHistory: Array<string>,
  userName: string,
) => {
  // Find last page not having blocked user's `userName` in the pathname
  let lastPathname = (pathnameHistory as any).findLast((pathname: string) => !pathname.includes(userName ?? ''));
  if (!lastPathname) {
    lastPathname = '/app/home';
  }
  return lastPathname;
};
