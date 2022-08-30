import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { createTheme, ThemeProvider } from '@mui/material';
import { Link } from 'react-router-dom';

interface TabLinksProps {
  tabLink: TabProps[];
  selectedTab?: string;
  toLink: string;
  params?: string;
}
interface TabProps {
  value: string;
  label: string;
}
function TabLinks({
  tabLink, selectedTab, toLink, params,
}: TabLinksProps) {
  const color = '#ffffff';
  const theme = createTheme({
    components: {
      MuiTabs: {
        styleOverrides: {
          flexContainer: {
            justifyContent: tabLink.length > 3 ? 'space-between' : 'start',
            '@media (max-width:1199px)': {
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
      <div className="bg-dark bg-mobile-transparent rounded-3">
        <Tabs
          value={(selectedTab)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="scrollable auto tabs example"
        >
          {tabLink.map(({ value, label }) => (
            <Tab
              key={value}
              value={value}
              label={label}
              component={Link}
              to={params ? `${toLink}/${value}${params}` : `${toLink}/${value}`}
            />
          ))}
        </Tabs>
      </div>
    </ThemeProvider>
  );
}

TabLinks.defaultProps = {
  selectedTab: 'all',
  params: '',
};

export default TabLinks;
