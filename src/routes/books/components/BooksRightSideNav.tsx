import FriendRequests from '../../../components/layout/right-sidebar-wrapper/components/FriendRequests';
import NotificationSetting from '../../../components/layout/right-sidebar-wrapper/components/NotificationSetting';
import RecentMessages from '../../../components/layout/right-sidebar-wrapper/components/RecentMessages';
import AdvertisementBox from '../../../components/layout/right-sidebar-wrapper/components/AdvertisementBox';
import { enableDevFeatures } from '../../../env';
import CreateBusinessListingButton from '../../../components/layout/right-sidebar-wrapper/components/CreateBusinessListingButton';

function BooksRightSideNav() {
  return (
    <>
      <CreateBusinessListingButton />

      {enableDevFeatures && <NotificationSetting />}
      <AdvertisementBox />
      <RecentMessages />
      <FriendRequests />
    </>
  );
}

export default BooksRightSideNav;
