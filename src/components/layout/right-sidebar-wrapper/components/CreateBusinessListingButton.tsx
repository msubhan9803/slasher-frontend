import React from 'react';
import { useParams } from 'react-router-dom';
import RoundButtonLink from '../../../ui/RoundButtonLink';

function CreateBusinessListingButton() {
  const params = useParams();

  return (
    <RoundButtonLink
      to="/app/business-listings/create"
      variant="primary"
      className="w-100 my-3"
    >
      Create Business Listing
    </RoundButtonLink>
  );
}

export default CreateBusinessListingButton;
