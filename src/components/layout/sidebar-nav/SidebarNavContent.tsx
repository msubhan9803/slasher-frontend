import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Nav } from 'react-bootstrap';
import SidebarNavItem from './SidebarNavItem';

function SidebarNavContent() {
  return (
    <Nav className="flex-column">
      <SidebarNavItem label="Latest Movies" icon={solid('film')} to="/movies/latest" />
      <SidebarNavItem label="Vendors" icon={solid('bag-shopping')} to="/vendors" />
      <SidebarNavItem label="Events" icon={solid('calendar-check')} to="/events" />
      <SidebarNavItem label="Dating" icon={solid('heart')} to="/dating" />
      <SidebarNavItem label="Podcasts" icon={solid('headphones')} to="/podcasts" />
      <SidebarNavItem label="Books" icon={solid('book')} to="/books" />
    </Nav>
  );
}
export default SidebarNavContent;
