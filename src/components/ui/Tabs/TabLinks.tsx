import React, { useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { createTheme, ThemeProvider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useSessionToken from '../../../hooks/useSessionToken';

interface TabLinksProps {
  tabLink: TabProps[];
  selectedTab?: string;
  toLink: string;
  params?: string;
  display?: string;
  tabsClass?: string;
  tabsClassSmall?: string;
  overrideOnClick?: (val: any, pathname?: string) => void;
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
  .MuiTabs-flexContainer{
    justify-content: start;
  }
`;
const StyledBadge = styled.div`
  width: 24px;
  height: 24px;
`;
function TabLinks({
  tabLink, selectedTab, toLink, params, display, tabsClass, tabsClassSmall, overrideOnClick,
}: TabLinksProps) {
  const [tabValue, setTabValue] = React.useState<any>(selectedTab);
  const navigate = useNavigate();

  useEffect(() => {
    setTabValue(selectedTab);
  }, [selectedTab]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const url = newValue ? `${toLink}/${newValue}` : toLink;
    navigate(url);
  };
  const color = 'var(--bs-link-color)';
  const token = useSessionToken();
  const userIsLoggedIn = !token.isLoading && token.value;

  const theme = createTheme({
    components: {
      MuiTabs: {
        styleOverrides: {
          flexContainer: {
            justifyContent: tabsClass,
            '@media (max-width:1199px)': {
              justifyContent: tabsClassSmall,
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
  if (token.isLoading) { return null; }
  return (
    <ThemeProvider theme={theme}>
      <StyleTabs className={`${display === 'underline' ? '' : 'bg-dark bg-mobile-transparent rounded-3'}`}>
        <Tabs
          value={(tabValue)}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons={false}
          aria-label="scrollable prevent tabs example"
        >
          {tabLink.map(({ value, label, badge }) => {
            let to = '';
            if (userIsLoggedIn && params) {
              to = `${toLink}/${value}${params}`;
            } else if (userIsLoggedIn) {
              to = `${toLink}/${value}`;
            }
            return (
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
                to={to}
                className="text-decoration-none shadow-none"
                onClick={(e: any) => {
                  e.preventDefault();
                  setTabValue(value);
                  if (overrideOnClick) {
                    overrideOnClick(e, to);
                  }
                }}
              />
            );
          })}
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
  tabsClass: 'space-between',
  tabsClassSmall: 'space-between',
  overrideOnClick: undefined,
};

export default TabLinks;
