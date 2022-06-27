import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Nav } from 'react-bootstrap';
import SidebarNavItem from './SidebarNavItem';

const sidebarMenuList = [
  {
    label: 'News & Reviews', icon: solid('newspaper'), color: '#0094FF', id: 1, to: '/',
  },
  {
    label: 'Events', icon: solid('calendar-day'), color: '#05FF00', id: 2, to: '/',
  },
  {
    label: 'Places', icon: solid('location-dot'), color: '#FFC700', id: 3, to: '/',
  },
  {
    label: 'Dating', icon: solid('heart'), color: '#FF0000', id: 4, to: '/',
  },
  {
    label: 'Podcasts', icon: solid('podcast'), color: '#8F00FF', id: 5, to: '/',
  },
  {
    label: 'Video Channels', icon: solid('tv'), color: '#00E676', id: 6, to: '/',
  },
  {
    label: 'Shopping / Vendors', icon: solid('store'), color: '#00D2FF', id: 7, to: '/',
  },
  {
    label: 'Movies', icon: solid('film'), color: '#FF343E', id: 8, to: '/',
  },
  {
    label: 'Books', icon: solid('book'), color: '#D88100', id: 9, to: '/',
  },
  {
    label: 'Music', icon: solid('headphones'), color: '#7C4DFF', id: 10, to: '/',
  },
  {
    label: 'Art', icon: solid('headphones'), color: '#799F0C', id: 11, to: '/',
  },
  {
    label: 'Help', icon: solid('circle-question'), color: '#9E9E9E', id: 12, to: '/',
  },
];

function SidebarNavContent() {
  return (
    <Nav className="flex-column">
      {sidebarMenuList.map((menu) => (
        <SidebarNavItem
          label={menu.label}
          icon={menu.icon}
          color={menu.color}
          id={menu.id}
          to={menu.to}
        />
      ))}
    </Nav>
  );
}
export default SidebarNavContent;
