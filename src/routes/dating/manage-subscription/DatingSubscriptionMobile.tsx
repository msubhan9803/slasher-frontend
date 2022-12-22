import React from 'react';
import { Col, Row } from 'react-bootstrap';
import RoundButton from '../../../components/ui/RoundButton';

function DatingSubscriptionMobile({ className, testState, handleCancelSub }: any) {
  return (
    <Row className={`${className}`}>
      <Row xs={2} className="g-0">
        <Col>
          <div className="mb-2 text-light">Status</div>
          {(testState.FREE || testState.PAID) && <div className="text-success fw-bold">Active</div>}
          {testState.CANCELLED && <div className="text-primary fw-bold">Cancelled</div>}
        </Col>

        <Col>
          {(testState.FREE || testState.PAID) && (
          <div>
            <div className="mb-2 text-light">Renews on</div>
            {testState.PAID && <div className="text-white fw-bold">06/18/2022</div>}
            {testState.FREE && <div className="text-white fw-bold">-</div>}
          </div>
          )}
          {testState.CANCELLED && (
          <div>
            <div className="text-light">Expires on</div>
            <div className="text-white fw-bold">06/18/2022</div>
          </div>
          )}
        </Col>
      </Row>

      <hr className="my-4" />

      <Row className="g-0">
        <div className="mb-2 text-light">Plan</div>
        {testState.PAID && (
          <Row className="g-0">
            <Col>
              <div className="text-white fw-bold">6 months plan </div>
              <div className="text-light">$90</div>
            </Col>
            <Col className="text-light">3 months (pending)</Col>
          </Row>
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
            <div className="text-light">$90</div>
          </div>
        )}
      </Row>

      <Row className="g-0 mt-4">
        {testState.PAID && (
          <>
            <RoundButton className="btn-secondary w-100 mb-3">Edit subscription</RoundButton>
            <RoundButton className="btn-secondary w-100 border-primary text-nowrap" onClick={handleCancelSub}>
              Cancel subscription
            </RoundButton>
          </>
        )}
        {testState.FREE && <RoundButton className="btn-primary w-100 mx-2">Upgrade to premium</RoundButton>}
        {testState.CANCELLED && <RoundButton className="btn-primary w-100 mx-2">Renew</RoundButton>}
      </Row>
    </Row>
  );
}

export default DatingSubscriptionMobile;
