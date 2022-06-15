import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Nav } from 'react-bootstrap';
import SidebarNavItem from './SidebarNavItem';

function SidebarNavContent() {
  return (
    <Nav className="flex-column">
      <SidebarNavItem label="Movies" icon={solid('video')} color="#FF3A44" />
      <SidebarNavItem label="News" icon={solid('newspaper')} color="#0094FF" />
      <SidebarNavItem label="Events" icon={solid('calendar-day')} color="#05FF00" />
      <SidebarNavItem label="Books" icon={solid('book')} color="#FF8A00" />
      <SidebarNavItem label="Podcasts" icon={solid('podcast')} color="#8F00FF" />
    </Nav>
  );
}
export default SidebarNavContent;
