export enum MovieType {
  Free = 0,
  MovieDb = 1,
  UserDefined = 2,
}

export enum MovieActiveStatus {
  Inactive = 0,
  Active = 1,
  Deactivated = 2,
}

export enum MovieDeletionStatus {
  NotDeleted = 0,
  Deleted = 1,
}

export type Cast = {
  castImage?: string;
  name: string;
  characterName: string;
};
