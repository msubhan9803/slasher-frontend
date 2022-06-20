import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Nav } from 'react-bootstrap';
import SidebarNavItem from './SidebarNavItem';

function SidebarNavContent() {
  return (
    <Nav className="flex-column">
      <SidebarNavItem label="Movies" icon={solid('video')} color="#FF3A44" id={1} />
      <SidebarNavItem label="News" icon={solid('newspaper')} color="#0094FF" id={2} />
      <SidebarNavItem label="Events" icon={solid('calendar-day')} color="#05FF00" id={3} />
      <SidebarNavItem label="Books" icon={solid('book')} color="#FF8A00" id={4} />
      <SidebarNavItem label="Podcasts" icon={solid('podcast')} color="#8F00FF" id={5} />
    </Nav>
  );
}
export default SidebarNavContent;
