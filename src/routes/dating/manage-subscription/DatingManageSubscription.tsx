import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import RoundButton from '../../../components/ui/RoundButton';
import DatingPageWrapper from '../components/DatingPageWrapper';
import DatingManageSubscriptionModal from './CancelSubscriptionModal';
import DatingSubscriptionMobile from './DatingSubscriptionMobile';

// This hook is to mimic subscription state at the moment of ui development only
const useTestState = () => {
  enum Sub {
    paid,
    free,
    cancelled,
  }
  const [testState, setTestState] = useState(Sub.paid);
  const PAID = testState === Sub.paid;
  const FREE = testState === Sub.free;
  const CANCELLED = testState === Sub.cancelled;
  const setPaid = () => setTestState(Sub.paid);
  const setFree = () => setTestState(Sub.free);
  const setCancelled = () => setTestState(Sub.cancelled);
  return {
    setPaid,
    setFree,
    setCancelled,
    PAID,
    FREE,
    CANCELLED,
  };
};

function DatingManageSubscription() {
  const [cancelSubShow, setCancelSubShow] = useState<boolean>(false);
  const testState = useTestState();

  const handleCancelSub = () => {
    setCancelSubShow(true);
  };

  return (
    <DatingPageWrapper>
      <div className="p-4 bg-dark rounded-3">
        <Row className="mb-4">
          <h2 className="fw-bold">Manage Subscription</h2>
        </Row>
        {/* Show on screens: md, xl, xxl */}
        <Row className="d-none d-md-flex d-lg-none d-xl-flex">
          <Col xs={2}>
            <div className="text-light mb-2">Status</div>
            {(testState.FREE || testState.PAID) && <div className="text-success fw-bold">Active</div>}
            {testState.CANCELLED && <div className="text-primary fw-bold">Cancelled</div>}
          </Col>

          <Col xs={3}>
            <div className="text-light mb-2">Plan</div>
            {testState.PAID && (
              <div>
                <div className="d-flex">
                  <span className="text-white fw-bold me-2 mb-2">6 months plan</span>
                  <span>$90</span>
                </div>
                <div className="text-light">3 months (pending)</div>
              </div>
            )}
            {testState.FREE && (
              <div>
                <div className="text-white fw-bold">Free</div>
                <div>$0</div>
              </div>
            )}
            {testState.CANCELLED && (
              <div>
                <div className="text-white fw-bold">6 months plan</div>
                <div>$90</div>
              </div>
            )}
          </Col>

          <Col xs={3}>
            {(testState.FREE || testState.PAID) && (
              <div>
                <div className="text-light mb-2">Renews on</div>
                {testState.PAID && <div className="text-white fw-bold">06/18/2022</div>}
                {testState.FREE && <div className="text-white fw-bold">-</div>}
              </div>
            )}
            {testState.CANCELLED && (
              <div>
                <div className="text-light mb-2">Expires on</div>
                <div className="text-white fw-bold">06/18/2022</div>
              </div>
            )}
          </Col>

          <Col xs={4} className="pe-3">
            {testState.PAID && (
              <>
                <RoundButton className="btn-secondary w-100 mx-2 mb-2">Edit subscription</RoundButton>
                <RoundButton className="btn-secondary w-100 border-primary mx-2 text-nowrap" onClick={handleCancelSub}>
                  Cancel subscription
                </RoundButton>
              </>
            )}
            {testState.FREE && <RoundButton className="btn-primary w-100 mx-2 m-auto">Upgrade to premium</RoundButton>}
            {testState.CANCELLED && <RoundButton className="btn-primary w-100 mx-2 m-auto">Renew</RoundButton>}
          </Col>
        </Row>

        {/* Show on screens: xs, sm, lg */}
        <DatingSubscriptionMobile
          className="d-flex d-md-none d-lg-flex d-xl-none w-100 m-0 g-0"
          {...{ testState, handleCancelSub }}
        />

        <DatingManageSubscriptionModal show={cancelSubShow} setShow={setCancelSubShow} />
      </div>

      {/* For Testing Only */}
      <div className="mt-5 pt-5">
        <div>
          Testing Only
        </div>
        <RoundButton onClick={testState.setPaid} className={`px-4 mb-2 me-3 ${testState.PAID ? 'btn-primary' : 'btn-secondary'}`}>
          Paid
        </RoundButton>
        <RoundButton onClick={testState.setFree} className={`px-4 mb-2 me-3 ${testState.FREE ? 'btn-primary' : 'btn-secondary'}`}>
          Free
        </RoundButton>
        <RoundButton onClick={testState.setCancelled} className={`px-4 mb-2 me-3 ${testState.CANCELLED ? 'btn-primary' : 'btn-secondary'}`}>
          Cancelled
        </RoundButton>
      </div>
    </DatingPageWrapper>
  );
}

export default DatingManageSubscription;
