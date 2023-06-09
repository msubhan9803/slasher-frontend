/* eslint-disable max-lines */
import React from 'react';
import RemoteWordPressContent from './RemoteWordPressContent';
import { WORDPRESS_SITE_URL } from '../../constants';

interface Props {
  className?: string;
}

function CommunityStandardsAndRules({ className }: Props) {
  return (
    <div className={className}>
      <RemoteWordPressContent
        forceShowFallbackContent
        url={`${WORDPRESS_SITE_URL}/wp-json/wp/v2/pages/?slug=rules`}
        fallbackContent={(
          <a href={`${WORDPRESS_SITE_URL}/rules`} target="_blank" rel="noreferrer">Community Standards and Rules (click to view)</a>
        )}
      />
    </div>
  );
}

CommunityStandardsAndRules.defaultProps = {
  className: '',
};

export default CommunityStandardsAndRules;
