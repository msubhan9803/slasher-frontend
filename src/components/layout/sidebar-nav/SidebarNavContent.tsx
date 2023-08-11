import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Nav } from 'react-bootstrap';
import { App } from '@capacitor/app';
import SidebarNavItem from './SidebarNavItem';
import {
  enableDevFeatures, GOOGLE_PLAY_DOWNLOAD_URL, APP_STORE_DOWNLOAD_URL, WORDPRESS_SITE_URL,
  isNativePlatform,
} from '../../../constants';
import RoundButtonLink from '../../ui/RoundButtonLink';

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
  comingSoon?: boolean
};

const topMenuListItems: MenuListItem[] = [
  {
    label: 'News & Reviews', icon: solid('newspaper'), iconColor: '#0094FF', to: '/app/news', id: 1,
  },
  {
    label: 'Events', icon: solid('calendar-day'), iconColor: '#05FF00', to: '/app/events', id: 2,
  },
  {
    label: 'Movies', icon: solid('film'), iconColor: '#FF343E', to: '/app/movies/all', id: 3,
  },
  {
    label: 'Books', icon: solid('book-skull'), iconColor: '#D88100', to: '/app/books', id: 4,
  },
  {
    label: 'Podcasts', icon: solid('podcast'), iconColor: '#8F00FF', to: '/app/podcasts', id: 5,
  },
  {
    label: 'Music', icon: solid('headphones'), iconColor: '#7C4DFF', to: '/app/music', id: 6,
  },
  {
    label: 'Art', icon: solid('palette'), iconColor: '#799F0C', to: '/app/art', id: 7,
  },
  {
    label: 'Groups', icon: solid('user-group'), iconColor: '#E1B065', to: '/app/groups', id: 10, comingSoon: true,
  },
  {
    label: 'Places', icon: solid('location-dot'), iconColor: '#FFC700', to: '/app/places', id: 11, comingSoon: true,
  },
  {
    label: 'Dating', icon: solid('heart'), iconColor: '#FF0000', to: '/app/dating', id: 12, comingSoon: true,
  },
  {
    label: 'Video Channels', icon: solid('tv'), iconColor: '#00E676', to: '/app/videos', id: 13, comingSoon: true,
  },
  {
    label: 'Shopping', icon: solid('store'), iconColor: '#00D2FF', to: '/app/shopping', id: 14, comingSoon: true,
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
  const [buildNumber, setBuildNumber] = useState<string>();
  const [versionNumber, setVersionNumber] = useState<string>();

  const getAppVersion = async () => {
    if (isNativePlatform) {
      setVersionNumber((await App.getInfo()).version);
      setBuildNumber((await App.getInfo()).build);
    } else {
      setVersionNumber(process.env.REACT_APP_VERSION);
    }
  };

  useEffect(() => {
    getAppVersion();
  }, []);

  return (
    <>
      <RoundButtonLink
        usePlainAnchorTag
        to="mailto:help@slasher.tv?subject=Slasher%20Bug%20Report"
        variant="primary"
        className="w-100"
        style={{ marginBottom: '0.75rem' }}
      >
        Report a bug
      </RoundButtonLink>
      <Nav>
        {menuListItems.map((menuItem) => (
          <SidebarNavItem
            id={menuItem.id}
            key={menuItem.id}
            label={menuItem.label}
            icon={menuItem.icon}
            iconColor={menuItem.iconColor}
            to={menuItem.to}
            className={menuItem.desktopOnly ? 'd-none d-lg-flex' : ''}
            comingSoon={menuItem.comingSoon || false}
            onToggleCanvas={menuItem.comingSoon ? undefined : onToggleCanvas}
          />
        ))}
        <ul className="list-inline mt-4 link-hover-underline fs-6">
          {
            enableDevFeatures
            && (
              <>
                <li className="mb-4"><a className="text-light text-decoration-none" href={GOOGLE_PLAY_DOWNLOAD_URL} target="_blank" rel="noreferrer">Download for Android</a></li>
                <li className="mb-4"><a className="text-light text-decoration-none" href={APP_STORE_DOWNLOAD_URL} target="_blank" rel="noreferrer">Download for iOS</a></li>
              </>
            )
          }
          <li className="mb-4"><a className="text-light text-decoration-none" href={`${WORDPRESS_SITE_URL}/advertise`} target="_blank" rel="noreferrer">Advertise on Slasher</a></li>
          <li className="mb-4"><a className="text-light text-decoration-none" href={`${WORDPRESS_SITE_URL}/policies`} target="_blank" rel="noreferrer">Terms &amp; Policies</a></li>
          <li className="mb-4"><a className="text-light text-decoration-none" href={`${WORDPRESS_SITE_URL}/about`} target="_blank" rel="noreferrer">About</a></li>
          <li className="text-light text-decoration-none">
            &copy;
            {' '}
            {new Date().getFullYear()}
            {' '}
            Slasher Corp
            {versionNumber && ` • v${versionNumber}`}
            {buildNumber && ` (${buildNumber})`}
          </li>
        </ul>
        <br />
      </Nav>
    </>
  );
}
SidebarNavContent.defaultProps = {
  onToggleCanvas: () => { },
};
export default SidebarNavContent;
