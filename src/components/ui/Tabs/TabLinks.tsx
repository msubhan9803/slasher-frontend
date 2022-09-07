import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { createTheme, ThemeProvider } from '@mui/material';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface TabLinksProps {
  tabLink: TabProps[];
  selectedTab?: string;
  toLink: string;
  params?: string;
  display?: string;
  tabsClass?: string;
}
interface TabProps {
  value: string;
  label: string;
  badge?: number;
}
const StyleTabs = styled.div`
  .tab-border {
    border-top: 2px solid #3A3B46;
    margin-top: -2px;
  }
`;
const StyledBadge = styled.div`
  width: 24px;
  height: 24px;
`;
function TabLinks({
  tabLink, selectedTab, toLink, params, display, tabsClass,
}: TabLinksProps) {
  const color = '#ffffff';
  const theme = createTheme({
    components: {
      MuiTabs: {
        styleOverrides: {
          flexContainer: {
            justifyContent: tabLink.length > 3 ? 'space-between' : 'start',
            '@media (max-width:600px)': {
              justifyContent: tabLink.length > 2 ? 'space-between' : 'center',
            },
          },
          indicator: {
            backgroundColor: 'var(--bs-primary) !important',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color,
            textTransform: 'none',
            fontSize: '1.06667rem',
            fontFamily: 'Roboto',
            '&.Mui-selected ': {
              color: 'var(--bs-primary) !important',
            },
            '&:hover': {
              color: 'var(--bs-primary) !important',
            },
          },
        },
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <StyleTabs className={`${display === 'underline' ? '' : 'bg-dark bg-mobile-transparent rounded-3'}`}>
        <Tabs
          value={(selectedTab)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="scrollable auto tabs example"
        >
          {tabLink.map(({ value, label, badge }) => (
            <Tab
              key={value}
              value={value}
              iconPosition="end"
              label={badge
                ? (
                  <>
                    {label}
                    <StyledBadge className="h6 mb-0 d-flex justify-content-center align-items-center bg-primary ms-2 p-0 rounded-circle text-black">
                      {badge}
                    </StyledBadge>
                  </>
                )
                : label}
              component={Link}
              to={params ? `${toLink}/${value}${params}` : `${toLink}/${value}`}
              className="text-decoration-none"
            />
          ))}
        </Tabs>
        {display === 'underline' && <div className="tab-border" />}
      </StyleTabs>
    </ThemeProvider>
  );
}

TabLinks.defaultProps = {
  selectedTab: 'all',
  params: '',
  display: 'default',
  tabsClass: '',
};

export default TabLinks;
