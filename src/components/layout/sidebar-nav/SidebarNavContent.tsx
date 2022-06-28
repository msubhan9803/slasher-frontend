import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Nav } from 'react-bootstrap';
import SidebarNavItem from './SidebarNavItem';

const sidebarMenuList = [
  {
    label: 'News & Reviews', icon: solid('newspaper'), color: '#0094FF', to: '/news',
  },
  {
    label: 'Events', icon: solid('calendar-day'), color: '#05FF00', to: '/events',
  },
  {
    label: 'Places', icon: solid('location-dot'), color: '#FFC700', to: '/places',
  },
  {
    label: 'Dating', icon: solid('heart'), color: '#FF0000', to: '/dating',
  },
  {
    label: 'Podcasts', icon: solid('podcast'), color: '#8F00FF', to: '/podcasts',
  },
  {
    label: 'Video Channels', icon: solid('tv'), color: '#00E676', to: '/videos',
  },
  {
    label: 'Shopping / Vendors', icon: solid('store'), color: '#00D2FF', to: '/shopping',
  },
  {
    label: 'Movies', icon: solid('film'), color: '#FF343E', to: '/movies',
  },
  {
    label: 'Books', icon: solid('book-skull'), color: '#D88100', to: '/books',
  },
  {
    label: 'Music', icon: solid('headphones'), color: '#7C4DFF', id: 10, to: '/music',
  },
  {
    label: 'Art', icon: solid('palette'), color: '#799F0C', id: 11, to: '/art',
  },
  {
    label: 'Help', icon: solid('circle-question'), color: '#9E9E9E', id: 12, to: '/help', desktopOnly: true,
  },
];

function SidebarNavContent() {
  return (
    <Nav className="flex-column">
      {sidebarMenuList.map((menu) => (
        <SidebarNavItem
          key={menu.label}
          label={menu.label}
          icon={menu.icon}
          color={menu.color}
          to={menu.to}
          className={menu.desktopOnly ? 'd-none d-md-block' : ''}
        />
      ))}
    </Nav>
  );
}
export default SidebarNavContent;
