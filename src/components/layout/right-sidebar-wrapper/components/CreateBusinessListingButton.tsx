import React from 'react';
import { useLocation } from 'react-router-dom';
import RoundButtonLink from '../../../ui/RoundButtonLink';

function CreateBusinessListingButton() {
  const location = useLocation();
  const isMoviesPage = location.pathname.includes('movies');

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
