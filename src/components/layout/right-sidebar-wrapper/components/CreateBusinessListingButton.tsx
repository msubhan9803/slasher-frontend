import { useLocation } from 'react-router-dom';
import RoundButtonLink from '../../../ui/RoundButtonLink';
import { BusinessType } from '../../../../routes/business-listings/type';

type Props = {
  type?: BusinessType;
};

function CreateBusinessListingButton({ type }: Props) {
  const location = useLocation();
  const isMoviesPage = type === BusinessType.MOVIES ? type : location.pathname.includes('movies');
  const isPodcaster = type === BusinessType.PODCASTER ? type : location.pathname.includes('podcasts');
  const isMusician = type === BusinessType.MUSICIAN ? type : location.pathname.includes('music');
  const isArtist = type === BusinessType.ARTIST ? type : location.pathname.includes('art');

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

CreateBusinessListingButton.defaultProps = {
  type: undefined,
};

export default CreateBusinessListingButton;
