import React, { useState } from 'react';
import RoundButton from '../../../components/ui/RoundButton';
import DatingPageWrapper from '../components/DatingPageWrapper';
import DatingMatchModal from './DatingMatchModal';

function DatingMatch() {
  const [subscriberMatchShow, setSubscriberMatchShow] = useState<boolean>(false);
  const [subscriber, setSubscriber] = useState<string>('');

  const handleMatch = (type: string) => {
    setSubscriberMatchShow(!subscriberMatchShow);
    setSubscriber(type);
  };

  return (
    <DatingPageWrapper>
      <div className="mt-5 pt-5 mt-md-0 pt-md-0">
        <div className="d-flex justify-content-center">
          <p>Dating Deck</p>
        </div>
        <div className="d-flex justify-content-center ">
          <RoundButton className="mx-2" onClick={() => handleMatch('Subscriber')}>Subscriber match</RoundButton>
          <RoundButton className="mx-2" onClick={() => handleMatch('Non-Subscriber')}>Non-subscriber match</RoundButton>
        </div>
        <DatingMatchModal
          show={subscriberMatchShow}
          setShow={setSubscriberMatchShow}
          isSubscriber={subscriber}
        />
      </div>
    </DatingPageWrapper>
  );
}

export default DatingMatch;
