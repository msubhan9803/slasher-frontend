import React, { useState } from 'react';
import { sendDebugTexttToGoogleAnalytics } from '../utils/google-analytics-utils';
import { analyticsId } from '../constants';

function DebugGoogleAnalytics() {
  const [text, setText] = useState('some event text here...');
  const handleSendEvent = () => sendDebugTexttToGoogleAnalytics(text);
  return (
    <div>
      <b>
        Google Analytics:
        {' '}
        {analyticsId ? 'Active' : 'Inactive'}
      </b>
      <br />
      {analyticsId
        && (
          <>
            <input value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={handleSendEvent} type="button">Send event</button>
          </>
        )}
    </div>
  );
}

export default DebugGoogleAnalytics;
