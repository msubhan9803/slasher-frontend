import React from 'react';
import PublicHomeBody from './public-home-body/PublicHomeBody';
import PublicHomeFooter from './public-home-footer/PublicHomeFooter';
import PublicHomeHeader from './public-home-header/PublicHomeHeader';

function PublicHomePage() {
  return (
    <>
      <PublicHomeHeader />
      <PublicHomeBody />
      <PublicHomeFooter />
    </>
  );
}

export default PublicHomePage;
