import React from 'react';
import { DateTime } from 'luxon';
import CustomPopover from '../../components/ui/CustomPopover';
import BorderButton from '../../components/ui/BorderButton';

function NotificationTimestamp({
  isoDateString,
  show,
  onMarkAllReadClick,
  popoverOption,
  onPopoverClick,
}: any) {
  const labelForIsoDateString = (value: string) => {
    const dateTime = DateTime.fromISO(value);

    if (DateTime.now().diff(dateTime).as('hour') <= 24) {
      return 'Today';
    } if (DateTime.now().diff(dateTime).as('week') <= 1) {
      return 'This week';
    } if (DateTime.now().diff(dateTime).as('month') <= 1) {
      return 'This month';
    }
    return 'Older notifications';
  };

  return (
    <div className={`d-flex align-items-center ${show ? 'justify-content-between' : 'justify-content-start'}`}>
      <h1 className={`h3 fw-semibold  ${show ? 'm-0' : 'mb-2 mt-5'}`}>
        {labelForIsoDateString(isoDateString)}
      </h1>
      {show && (
        <div className="d-flex align-items-center">
          <BorderButton
            buttonClass="text-white px-4 me-2"
            lable="Mark all read"
            handleClick={onMarkAllReadClick}
          />
          <span className="d-lg-none">
            <CustomPopover
              popoverOptions={popoverOption}
              onPopoverClick={onPopoverClick}
            />
          </span>
        </div>
      )}
    </div>
  );
}

export default NotificationTimestamp;
