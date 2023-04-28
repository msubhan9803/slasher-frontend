export const urlForUserPost = (userName:string, id:string) => `/${userName}/posts/${id}`;

export const urlForNewsPost = (rssfeedProviderId:string, id:string) => `/app/news/partner/${rssfeedProviderId}/posts/${id}`;

export const urlForMovie = (id:string) => `/app/movies/${id}/details`;

export const urlForEvent = (id:string) => `/app/events/${id}`;
