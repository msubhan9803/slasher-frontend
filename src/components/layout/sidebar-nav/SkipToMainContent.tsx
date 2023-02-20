import React from 'react';
import { MAIN_CONTENT_ID } from '../../../constants';

function SkipToMainContent() {
  return (
    <a id="skip-to-main-content-link" className="visually-hidden-focusable" href={`#${MAIN_CONTENT_ID}`}>Skip to main content</a>
  );
}

export default SkipToMainContent;
