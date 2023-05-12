/* eslint-disable max-lines */
import React from 'react';
import RemoteWordPressContent from './RemoteWordPressContent';
import { WORDPRESS_SITE_URL } from '../../constants';

interface Props {
  className?: string;
}

function PrivacyPolicy({ className }: Props) {
  return (
    <div className={className}>
      <RemoteWordPressContent
        url={`${WORDPRESS_SITE_URL}/wp-json/wp/v2/pages/?slug=privacy`}
        fallbackContent={(
          <a href={`${WORDPRESS_SITE_URL}/privacy`} target="_blank" rel="noreferrer">Privacy Policy (click to view)</a>
        )}
      />
    </div>
  );
}

PrivacyPolicy.defaultProps = {
  className: '',
};

export default PrivacyPolicy;
