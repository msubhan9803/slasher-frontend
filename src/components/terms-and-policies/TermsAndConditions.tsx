/* eslint-disable max-lines */
import React from 'react';
import RemoteWordPressContent from './RemoteWordPressContent';
import { WORDPRESS_SITE_URL } from '../../constants';

interface Props {
  className?: string;
}

function TermsAndConditions({ className }: Props) {
  return (
    <div className={className}>
      <RemoteWordPressContent
        forceShowFallbackContent
        url={`${WORDPRESS_SITE_URL}/wp-json/wp/v2/pages/?slug=terms-and-conditions`}
        fallbackContent={(
          <a href={`${WORDPRESS_SITE_URL}/terms-and-conditions`} target="_blank" rel="noreferrer">Terms and Conditions (click to view)</a>
        )}
      />
    </div>
  );
}

TermsAndConditions.defaultProps = {
  className: '',
};

export default TermsAndConditions;
