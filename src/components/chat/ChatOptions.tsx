import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

function ChatOptions() {
  return (
    <div className="d-flex justify-content-end">
      <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="2x" />
    </div>
  );
}

export default ChatOptions;
