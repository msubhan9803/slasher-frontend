import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

function NotificationTimestamp({ date }: any) {
    const [timestampTitle, setTimestampTitle] = useState<string>();

    useEffect(() => {
        if (date) {
            if (DateTime.now().diff(DateTime.fromISO(date)).as('hour') <= 24) {
                setTimestampTitle('Today');

            } else if (DateTime.now().diff(DateTime.fromISO(date)).as('hour') > 24
                && DateTime.now().diff(DateTime.fromISO(date)).as('week') <= 1) {
                setTimestampTitle('This week');

            } else if (DateTime.now().diff(DateTime.fromISO(date)).as('week') > 1
                && DateTime.now().diff(DateTime.fromISO(date)).as('month') <= 1) {
                setTimestampTitle('This month');

            } else if (DateTime.now().diff(DateTime.fromISO(date)).as('month') > 1) {
                setTimestampTitle('Older notifications');

            }
        }
    }, [date]);

    return (
        <h1 className="h3 fw-semibold mb-0">
            {timestampTitle}
        </h1>
    );
}

export default NotificationTimestamp;
