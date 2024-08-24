import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Nav } from 'react-bootstrap';
import SidebarNavItem from './SidebarNavItem';
import {
  GOOGLE_PLAY_DOWNLOAD_URL, APP_STORE_DOWNLOAD_URL, WORDPRESS_SITE_URL,
  isNativePlatform,
} from '../../../constants';
import RoundButtonLink from '../../ui/RoundButtonLink';
import { getAppVersion } from '../../../utils/version-utils';
import { enableDevFeatures } from '../../../env';
import SticyBannerAdSpaceCompensation from '../../SticyBannerAdSpaceCompensation';
import { useAppSelector } from '../../../redux/hooks';
import { UserType } from '../../../types';

const MAX_ALLOWED_COMING_SOON_ITEMS_IN_MENU = 1;

interface Props {
  onToggleCanvas?: () => void;
}

type MenuListItem = {
  label: string,
  icon: any,
  iconColor: string,
  to: string,
  id: any,
  desktopOnly?: boolean,
  comingSoon?: boolean,
  rotate?: number
  isAdmin?: boolean;
};

const topMenuListItems: MenuListItem[] = [
  {
    label: 'My Listings', icon: solid('list-check'), iconColor: '#00D2FF', to: '/app/my-listings', id: 16, rotate: 0,
  },
  {
    label: 'News & Reviews', icon: solid('newspaper'), iconColor: '#0094FF', to: '/app/news', id: 1, rotate: 0,
  },
  {
    label: 'Events', icon: solid('calendar-day'), iconColor: '#05FF00', to: '/app/events', id: 2, rotate: 0,
  },
  // {
  //   label: 'Deals', icon: solid('tag'), iconColor: '#9E9E9E', to: 'https://deals.slasher.tv/', id: 15, rotate: 90,
  // },
  {
    label: 'Movies', icon: solid('film'), iconColor: '#FF343E', to: '/app/movies/all', id: 3, rotate: 0,
  },
  {
    label: 'Books', icon: solid('book-skull'), iconColor: '#D88100', to: '/app/books/all', id: 4, rotate: 0,
  },
  {
    label: 'Podcasts', icon: solid('podcast'), iconColor: '#8F00FF', to: '/app/podcasts', id: 5, rotate: 0,
  },
  {
    label: 'Music', icon: solid('headphones'), iconColor: '#7C4DFF', to: '/app/music', id: 6, rotate: 0,
  },
  {
    label: 'Art', icon: solid('palette'), iconColor: '#799F0C', to: '/app/art', id: 7, rotate: 0,
  },
  {
    label: 'Groups', icon: solid('user-group'), iconColor: '#E1B065', to: '/app/groups', id: 10, comingSoon: true, rotate: 0,
  },
  {
    label: 'Places', icon: solid('location-dot'), iconColor: '#FFC700', to: '/app/places', id: 11, comingSoon: true, rotate: 0,
  },
  {
    label: 'Dating', icon: solid('heart'), iconColor: '#FF0000', to: '/app/dating', id: 12, comingSoon: true, rotate: 0,
  },
  {
    label: 'Video Channels', icon: solid('tv'), iconColor: '#00E676', to: '/app/videos', id: 13, comingSoon: true, rotate: 0,
  },
  {
    label: 'Shopping', icon: solid('store'), iconColor: '#00D2FF', to: '/app/shopping', id: 14, comingSoon: true, rotate: 0,
  },
  {
    label: 'Manage Listing', icon: solid('list-check'), iconColor: '#00D2FF', to: '/app/admin/listing-management', id: 15, rotate: 0, isAdmin: true,
  },
];

const bottomMenuListItems: MenuListItem[] = [
  {
    label: 'Settings', icon: solid('gear'), iconColor: '#888888', to: '/app/account', id: 8, desktopOnly: true,
  },
  {
    label: 'Help', icon: solid('circle-question'), iconColor: '#9E9E9E', to: '/app/help', id: 9, desktopOnly: true,
  },
];

let menuListItems = topMenuListItems.filter(
  (item) => enableDevFeatures || !item.comingSoon,
);
const numberOfComingSoonItemsToShow = Math.min(
  MAX_ALLOWED_COMING_SOON_ITEMS_IN_MENU,
  topMenuListItems.length - menuListItems.length,
);

for (let i = 0; i < numberOfComingSoonItemsToShow; i += 1) {
  menuListItems.push({
    label: 'Coming Soon', icon: solid('question'), iconColor: '#FF1700', to: '#', id: `comingSoon-${i}`, comingSoon: true,
  });
}

menuListItems = menuListItems.concat(bottomMenuListItems);

function SidebarNavContent({ onToggleCanvas }: Props) {
  const userData = useAppSelector((state) => state.user);

  const filterAdminRoutes = (routesList: MenuListItem[]) => {
    if (userData.user.userType !== UserType.Admin) {
      return routesList.filter((item) => !item.isAdmin);
    }

    return routesList;
  };

  return (
    <Nav>
      {filterAdminRoutes(menuListItems).map((menuItem) => (
        <SidebarNavItem
          id={menuItem.id}
          key={menuItem.id}
          label={menuItem.label}
          icon={menuItem.icon}
          rotate={menuItem.rotate}
          iconColor={menuItem.iconColor}
          to={menuItem.to}
          className={menuItem.desktopOnly ? 'd-none d-lg-flex' : ''}
          comingSoon={menuItem.comingSoon || false}
          onToggleCanvas={menuItem.comingSoon ? undefined : onToggleCanvas}
        />
      ))}
      <RoundButtonLink
        usePlainAnchorTag
        to="mailto:help@slasher.tv?subject=Slasher%20Bug%20Report"
        variant="primary"
        className="w-100"
        style={{ marginBottom: '0.75rem' }}
      >
        Report a bug
      </RoundButtonLink>
      <ul className="list-inline mt-4 link-hover-underline fs-6">

        {!isNativePlatform && (
        <>
          <li className="mb-4"><a className="text-light text-decoration-none" href={GOOGLE_PLAY_DOWNLOAD_URL} target="_blank" rel="noreferrer">Download for Android</a></li>
          <li className="mb-4"><a className="text-light text-decoration-none" href={APP_STORE_DOWNLOAD_URL} target="_blank" rel="noreferrer">Download for iOS</a></li>
        </>
        )}

        <li className="mb-4"><a className="text-light text-decoration-none" href={`${WORDPRESS_SITE_URL}/policies`} target="_blank" rel="noreferrer">Terms &amp; Policies</a></li>
        <li className="mb-4"><a className="text-light text-decoration-none" href={`${WORDPRESS_SITE_URL}/about`} target="_blank" rel="noreferrer">About</a></li>
        <li className="mb-4 text-light text-decoration-none">
          &copy;
          {' '}
          {new Date().getFullYear()}
          {' '}
          Slasher Corp
        </li>
        <li className="text-light text-decoration-none">
          {`${getAppVersion()}`}
        </li>
        <SticyBannerAdSpaceCompensation />
      </ul>
      <br />
    </Nav>
  );
}
SidebarNavContent.defaultProps = {
  onToggleCanvas: () => { },
};
export default SidebarNavContent;
