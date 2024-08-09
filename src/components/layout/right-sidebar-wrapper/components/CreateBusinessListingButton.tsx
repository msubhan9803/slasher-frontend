import React from 'react';
import { useLocation } from 'react-router-dom';
import RoundButtonLink from '../../../ui/RoundButtonLink';

function CreateBusinessListingButton() {
  const location = useLocation();
  const isMoviesPage = location.pathname.includes('movies');
  const isPodcaster = location.pathname.includes('podcasts');
  const isMusician = location.pathname.includes('music');
  const isArtist = location.pathname.includes('art');

  if (isMoviesPage) {
    return (
      <RoundButtonLink
        to="/app/business-listings/create?type=movies"
        variant="primary"
        className="w-100 my-3"
      >
        Add your movie
      </RoundButtonLink>
    );
  }

  if (isPodcaster) {
    return (
      <RoundButtonLink
        to="/app/business-listings/create?type=podcaster"
        variant="primary"
        className="w-100 my-3"
      >
        Add your podcast
      </RoundButtonLink>
    );
  }

  if (isMusician) {
    return (
      <RoundButtonLink
        to="/app/business-listings/create?type=musician"
        variant="primary"
        className="w-100 my-3"
      >
        Add your music
      </RoundButtonLink>
    );
  }

  if (isArtist) {
    return (
      <RoundButtonLink
        to="/app/business-listings/create?type=artist"
        variant="primary"
        className="w-100 my-3"
      >
        Add your art
      </RoundButtonLink>
    );
  }

  return (
    <RoundButtonLink
      to="/app/business-listings/create?type=books"
      variant="primary"
      className="w-100 my-3"
    >
      Add your book
    </RoundButtonLink>
  );
}

export default CreateBusinessListingButton;
