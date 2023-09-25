import React from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';

function NotificationBell({ onButtonClick, toggle }: any) {
  return (
    <div className="main">
      <div className="text-center text-md-start d-flex flex-wrap justify-content-center align-items-center align-items-md-start">
        <Button aria-label="notification bell" size="sm" className="p-0" variant="link" onClick={onButtonClick}>
          <FontAwesomeIcon
            size="lg"
            className={`${toggle ? 'text-success' : 'text-primary'} `}
            icon={toggle ? regular('bell') : regular('bell-slash')}
          />
        </Button>
        <p className="fs-6 text-center toggle mt-1 mb-0">{toggle ? 'On' : 'Off'}</p>
      </div>
    </div>
  );
}
export default NotificationBell;
