/* eslint-disable max-lines */
import React from 'react';
import RemoteWordPressContent from './RemoteWordPressContent';
import { WORDPRESS_SITE_URL } from '../../constants';

interface Props {
  className?: string;
}

function EndUserLicenseAgreement({ className }: Props) {
  return (
    <div className={className}>
      <RemoteWordPressContent
        forceShowFallbackContent
        url={`${WORDPRESS_SITE_URL}/wp-json/wp/v2/pages/?slug=eula`}
        fallbackContent={(
          <a href={`${WORDPRESS_SITE_URL}/eula`} target="_blank" rel="noreferrer">End User License Agreement (click to view)</a>
        )}
      />
    </div>
  );
}

EndUserLicenseAgreement.defaultProps = {
  className: '',
};

export default EndUserLicenseAgreement;
