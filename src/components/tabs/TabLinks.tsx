import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import CustomTabs from '../ui/CustomTabs';

interface TabLinksProps {
  tabLink: TabProps[];
  setSelectedTab: (value: string) => void;
  selectedTab?: string;
}
interface TabProps {
  value: string;
  label: string;
}

function TabLinks({ tabLink, setSelectedTab, selectedTab }: TabLinksProps) {
  return (
    <CustomTabs className="bg-dark bg-mobile-transparent rounded-3">
      <Tabs activeKey={selectedTab} className="border-0 justify-content-between flex-nowrap mt-3" onSelect={(tab: any) => setSelectedTab(tab)}>
        {tabLink.map(({ value, label }) => (
          <Tab key={value} eventKey={value} title={label} />
        ))}
      </Tabs>
    </CustomTabs>
  );
}

TabLinks.defaultProps = {
  selectedTab: 'all-books',
};

export default TabLinks;
