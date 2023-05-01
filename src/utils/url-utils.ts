export const urlForUserPost = (userName:string, id:string) => `/${userName}/posts/${id}`;

export const urlForNewsPost = (rssfeedProviderId:string, id:string) => `/app/news/partner/${rssfeedProviderId}/posts/${id}`;

export const urlForMovie = (id:string) => `/app/movies/${id}/details`;

export const urlForEvent = (id:string) => `/app/events/${id}`;

// eslint-disable-next-line prefer-regex-literals
export const isPostDetailsPage = (pathname: string) => new RegExp('/.+/posts/.+').test(pathname); // e.g, pathname = '/slasher-test-user1/posts/6450086566a60138c4e2b293'
