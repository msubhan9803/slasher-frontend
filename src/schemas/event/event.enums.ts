// Note: It's unfortunate that these are strings rather than numbers, but we need to keep them
// as strings in the database to be compatible with the old API.
export enum EventActiveStatus {
  Inactive = '0',
  Active = '1',
  Deactivated = '2',
}
