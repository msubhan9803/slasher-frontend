import { useParams } from 'react-router-dom';
import BusinessListingPosts from '../../../components/ui/BusinessListing/BusinessListingPosts';
import BusinessListingHeader from '../../../components/ui/BusinessListing/BusinessListingHeader';

export default function BusinessListingDetail() {
  const params = useParams();

  return (
    <>
      <BusinessListingHeader businessListingRef={params.id as string} />
      <BusinessListingPosts businessListingRef={params.id as string} />
    </>
  );
}
