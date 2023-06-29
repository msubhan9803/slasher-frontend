/* eslint-disable prefer-regex-literals */
export const urlForUserPost = (userName:string, id:string) => `/${userName}/posts/${id}`;

export const urlForNewsPost = (rssfeedProviderId:string, id:string) => `/app/news/partner/${rssfeedProviderId}/posts/${id}`;

export const urlForMovie = (id:string) => `/app/movies/${id}/details`;

export const urlForEvent = (id:string) => `/app/events/${id}`;

export const isHomePage = (pathname: string) => pathname === '/app/home'; // e.g, pathname = '/app/home'
export const isPostDetailsPage = (pathname: string) => new RegExp('/.+/posts/[a-f\\d]{24}/.+').test(pathname); // e.g, pathname = '/slasher-test-user1/posts/6450086566a60138c4e2b293'
export const isNewsPartnerPage = (pathname: string) => new RegExp('/app/news/partner/.*').test(pathname); // e.g, pathname = '/app/news/partner/6036639a657a566248b973f7'
export const isMovieDetailsPageSubRoutes = (pathname: string) => new RegExp('/app/movies/[a-f\\d]{24}/.+').test(pathname);
export const isEventDetailsPage = (pathname: string) => new RegExp('/app/events/[a-f\\d]{24}$').test(pathname); // e.g., pathname = 'http://localhost:3000/app/events/5
export const isConversationPage = (pathname: string) => new RegExp('/app/messages/conversation/[a-f\\d]{24}$').test(pathname); // e.g., pathname = 'http://localhost:3000/app/events/5
export const isUserProfilePage = (pathname: string) => new RegExp('^(?!/app).*').test(pathname); // e.g, pathname = '/slasher-test-user1/posts/6450086566a60138c4e2b293'

export const showBackButtonInIos = (pathname: string) => [isPostDetailsPage, isNewsPartnerPage,
  isMovieDetailsPageSubRoutes, isEventDetailsPage,
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
