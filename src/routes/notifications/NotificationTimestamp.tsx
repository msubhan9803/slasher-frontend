import React from 'react';
import { DateTime } from 'luxon';

function NotificationTimestamp({ isoDateString }: any) {
  const labelForIsoDateString = (value: string) => {
    const dateTime = DateTime.fromISO(value);

    if (DateTime.now().diff(dateTime).as('hour') <= 24) {
      return 'Today';
    } if (DateTime.now().diff(dateTime).as('week') <= 1) {
      return 'This week';
    } if (DateTime.now().diff(dateTime).as('month') <= 1) {
      return 'This month';
    }
    return 'Other notifications';
  };

  return (
    <h1 className="h3 fw-semibold mb-0">
      {labelForIsoDateString(isoDateString)}
    </h1>
  );
}

export default NotificationTimestamp;
