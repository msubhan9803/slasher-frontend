import React from 'react';
import { Badge, Tab, Tabs } from 'react-bootstrap';
import styled from 'styled-components';
import CustomTabs from './CustomTabs';

interface TabLinksProps {
  tabLink: TabProps[];
  setSelectedTab: (value: string) => void;
  selectedTab?: string;
  className?: string;
}
interface TabProps {
  value: string;
  label: string;
  badge?: number;
}

const StyledBadge = styled(Badge)`
  width: 24px;
  height: 24px;
  line-height: 2;
`;

function TabLinks({
  tabLink, setSelectedTab, selectedTab, className,
}: TabLinksProps) {
  return (
    <CustomTabs className="bg-dark bg-mobile-transparent rounded-3">
      <Tabs activeKey={selectedTab} className={`border-0 flex-nowrap mt-3 fs-3 ${className}`} onSelect={(tab: any) => setSelectedTab(tab)}>
        {tabLink.map(({ value, label, badge }) => (
          <Tab
            key={value}
            eventKey={value}
            title={
              badge
                ? (
                  <>
                    {label}
                    <StyledBadge className="bg-primary ms-2 p-0 rounded-circle text-black">{badge}</StyledBadge>
                  </>
                )
                : label
            }
          />
        ))}
      </Tabs>
    </CustomTabs>
  );
}

TabLinks.defaultProps = {
  selectedTab: 'all',
  className: '',
};

export default TabLinks;
