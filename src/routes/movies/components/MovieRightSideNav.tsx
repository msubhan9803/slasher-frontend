import { useParams } from 'react-router-dom';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import NotificationSetting from '../../../components/layout/right-sidebar-wrapper/components/NotificationSetting';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import CreateBusinessListingButton from '../../../components/layout/right-sidebar-wrapper/components/CreateBusinessListingButton';

function MovieRightSideNav() {
  const params = useParams();
  return (
    <>
      <CreateBusinessListingButton />

      {params.id && params.summary && <NotificationSetting />}
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default MovieRightSideNav;
