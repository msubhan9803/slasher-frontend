import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import RoundButton from './RoundButton';

function SocialGroupList({ listItems }: any) {
  return (
    listItems.map((item: any) => (
      <div className="mb-3 p-3 rounded-3" key={item._id} style={{ backgroundColor: '#1b1b1b' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 fw-bold">{item.contentHeading}</h1>
            <p className="text-light m-0">{item.content}</p>
          </div>
          <div>
            <RoundButton
              size="sm"
              variant="form"
              name="leave-join"
              className={`${item.ljGroup ? 'text-black' : 'text-white'} px-4 mx-2 d-none d-md-inline d-lg-none d-xl-inline`}
              active={item.ljGroup}
            >
              {item.ljGroup ? 'Join Group' : 'Leave Group'}
            </RoundButton>
            {item.pinned && (
              <Button aria-label="thumbtack" size="sm" className="ms-3 text-primary" variant="link">
                <FontAwesomeIcon style={{ width: '21.01px', height: '28px' }} icon={solid('thumbtack')} />
              </Button>
            )}
          </div>
        </div>
        <RoundButton
          size="sm"
          variant="form"
          name="leave-join"
          className={`${item.ljGroup ? 'text-black' : 'text-white'} w-100 mt-2 d-md-none d-lg-inline d-xl-none`}
          active={item.ljGroup}
        >
          {item.ljGroup ? 'Join Group' : 'Leave Group'}
        </RoundButton>
      </div>
    ))
  );
}

export default SocialGroupList;
