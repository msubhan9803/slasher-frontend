import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SidebarNavItem from './SidebarNavItem';

const sidebarMenuList = [
  {
    label: 'News & Reviews', icon: solid('newspaper'), iconColor: '#0094FF', to: '/news',
  },
  {
    label: 'Events', icon: solid('calendar-day'), iconColor: '#05FF00', to: '/events',
  },
  {
    label: 'Places', icon: solid('location-dot'), iconColor: '#FFC700', to: '/places',
  },
  {
    label: 'Dating', icon: solid('heart'), iconColor: '#FF0000', to: '/dating',
  },
  {
    label: 'Podcasts', icon: solid('podcast'), iconColor: '#8F00FF', to: '/podcasts',
  },
  {
    label: 'Video Channels', icon: solid('tv'), iconColor: '#00E676', to: '/videos',
  },
  {
    label: 'Shopping', icon: solid('store'), iconColor: '#00D2FF', to: '/shopping',
  },
  {
    label: 'Movies', icon: solid('film'), iconColor: '#FF343E', to: '/movies',
  },
  {
    label: 'Books', icon: solid('book-skull'), iconColor: '#D88100', to: '/books',
  },
  {
    label: 'Music', icon: solid('headphones'), iconColor: '#7C4DFF', id: 10, to: '/music',
  },
  {
    label: 'Art', icon: solid('palette'), iconColor: '#799F0C', id: 11, to: '/art',
  },
  {
    label: 'Help', icon: solid('circle-question'), iconColor: '#9E9E9E', id: 12, to: '/help', desktopOnly: true,
  },
];

function SidebarNavContent() {
  return (
    <Nav>
      {sidebarMenuList.map((menu) => (
        <SidebarNavItem
          key={menu.label}
          label={menu.label}
          icon={menu.icon}
          iconColor={menu.iconColor}
          to={menu.to}
          className={menu.desktopOnly ? 'd-none d-md-flex' : ''}
        />
      ))}
      <ul className="list-inline mt-4 link-hover-underline">
        <li><Link className="text-light small" to="/">Download the app</Link></li>
        <li><Link className="text-light small" to="/">Advertise on Slasher</Link></li>
        <li><Link className="text-light small" to="/">Terms &amp; Policies</Link></li>
        <li className="text-light small">&copy; 2022 Slasher Corp</li>
      </ul>
      <br />
    </Nav>
  );
}
export default SidebarNavContent;
