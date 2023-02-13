import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SidebarNavItem from './SidebarNavItem';
import { enableDevFeatures } from '../../../utils/configEnvironment';

interface Props {
  onToggleCanvas?: () => void;
}

type MenuType = {
  label: string, icon: any, iconColor: string, to: string, id: any, desktopOnly?: boolean
};

const sidebarMenuList: MenuType[] = [
  {
    label: 'News & Reviews', icon: solid('newspaper'), iconColor: '#0094FF', to: '/app/news', id: 1,
  },
  {
    label: 'Groups', icon: solid('user-group'), iconColor: '#E1B065', to: '/app/groups', id: 2,
  },
  {
    label: 'Events', icon: solid('calendar-day'), iconColor: '#05FF00', to: '/app/events', id: 3,
  },
  {
    label: 'Places', icon: solid('location-dot'), iconColor: '#FFC700', to: '/app/places', id: 4,
  },
  {
    label: 'Dating', icon: solid('heart'), iconColor: '#FF0000', to: '/app/dating', id: 5,
  },
  {
    label: 'Podcasts', icon: solid('podcast'), iconColor: '#8F00FF', to: '/app/podcasts', id: 6,
  },
  {
    label: 'Video Channels', icon: solid('tv'), iconColor: '#00E676', to: '/app/videos', id: 7,
  },
  {
    label: 'Shopping', icon: solid('store'), iconColor: '#00D2FF', to: '/app/shopping', id: 8,
  },
  {
    label: 'Movies', icon: solid('film'), iconColor: '#FF343E', to: '/app/movies', id: 9,
  },
  {
    label: 'Books', icon: solid('book-skull'), iconColor: '#D88100', to: '/app/books', id: 10,
  },
  {
    label: 'Music', icon: solid('headphones'), iconColor: '#7C4DFF', id: 11, to: '/app/music',
  },
  {
    label: 'Art', icon: solid('palette'), iconColor: '#799F0C', id: 12, to: '/app/art',
  },
  {
    label: 'Help', icon: solid('circle-question'), iconColor: '#9E9E9E', id: 13, to: '/app/help', desktopOnly: true,
  },
  {
    label: 'Settings', icon: solid('gear'), iconColor: '#888888', id: 14, to: '/app/account/settings', desktopOnly: true,
  },
];
const customSidebarMenuList = enableDevFeatures
  ? sidebarMenuList
  : sidebarMenuList.map((item, idx) => {
    const { label } = item;
    if (label === 'Places' || label === 'Dating' || label === 'Podcasts' || label === 'Video Channels' || label === 'Shopping' || label === 'Books' || label === 'Music' || label === 'Art' || label === 'Help') {
      return {
        label: 'Coming Soon', icon: solid('question'), iconColor: '#FF1700', to: '#', id: `comingSoon-${idx}`,
      };
    }
    return item;
  })
    // order `Coming Soon` tab items in the end
    .sort((_, b) => (b.label !== 'Coming Soon' ? 0 : -1));

function SidebarNavContent({ onToggleCanvas }: Props) {
  return (
    <Nav>
      {customSidebarMenuList.map((menu) => (
        <SidebarNavItem
          id={menu.id}
          key={menu.id}
          label={menu.label}
          icon={menu.icon}
          iconColor={menu.iconColor}
          to={menu.to}
          className={menu.desktopOnly ? 'd-none d-md-flex' : ''}
          onToggleCanvas={onToggleCanvas}
        />
      ))}
      <ul className="list-inline mt-4 link-hover-underline fs-6">
        <li><Link className="text-light text-decoration-none" to="/">Download the app</Link></li>
        <li><Link className="text-light text-decoration-none" to="/">Advertise on Slasher</Link></li>
        <li><Link className="text-light text-decoration-none" to="/">Terms &amp; Policies</Link></li>
        <li className="text-light text-decoration-none">
          &copy;
          {' '}
          {new Date().getFullYear()}
          {' '}
          Slasher Corp
        </li>
      </ul>
      <br />
    </Nav>
  );
}
SidebarNavContent.defaultProps = {
  onToggleCanvas: () => { },
};
export default SidebarNavContent;
