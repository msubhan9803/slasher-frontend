import React from 'react';
import { DateTime } from 'luxon';
import styled from 'styled-components';
import CustomPopover from '../../components/ui/CustomPopover';
import RoundButton from '../../components/ui/RoundButton';

const StyleBorderButton = styled(RoundButton)`
  border: 1px solid #3A3B46;
  &:hover {
    border: 1px solid #3A3B46;
  }
`;
function NotificationTimestamp({
  isoDateString,
  show,
  onMarkAllReadClick,
  popoverOption,
  handleLikesOption,
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
          <StyleBorderButton className="text-white bg-black px-4 me-2" onClick={() => onMarkAllReadClick()}>Mark all read</StyleBorderButton>
          <span className="d-lg-none">
            <CustomPopover
              popoverOptions={popoverOption}
              onPopoverClick={handleLikesOption}
            />
          </span>
        </div>
      )}
    </div>
  );
}

export default NotificationTimestamp;
