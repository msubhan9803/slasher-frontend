import React, { useState } from 'react';
import { sendDebugTexttToGoogleAnalytics } from '../utils/google-analytics-utils';
import { analyticsId } from '../env';

function DebugGoogleAnalytics() {
  const [text, setText] = useState('some event text here...');
  const [count, setCount] = useState(0);
  const handleSendEvent = () => {
    setCount((current) => current + 1);
    sendDebugTexttToGoogleAnalytics(text);
  };
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
            <p>
              <input value={text} onChange={(e) => setText(e.target.value)} />
              <button onClick={handleSendEvent} type="button">Send event</button>
            </p>
            <p>
              {' '}
              Events Sent:
              {' '}
              {count}
            </p>
            <p className="mt-5">
              <div>
                <i>
                  {' '}
                  Tip: You can find these event count in Google Analytics Dashboard:
                  <br />
                  <b>{`debug_text > debugText > ${text}`}</b>
                </i>
              </div>
            </p>
          </>
        )}
    </div>
  );
}

export default DebugGoogleAnalytics;
