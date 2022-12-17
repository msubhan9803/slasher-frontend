import React, { useState } from 'react';
import {
  Button,
  Col, Container, Form, Row,
} from 'react-bootstrap';
import DatingPageWrapper from '../components/DatingPageWrapper';
import GreenTick from '../../../images/dating-green-tick.png';
import HeartEmoji from '../../../images/dating-heart-icon.png';
import CustomSelect from '../../../components/ui/CustomSelect';
import FormOptions from './form-options';
import RoundButton from '../../../components/ui/RoundButton';

function GreenTicked({ text }: { text: string }) {
  return (
    <div>
      <img src={GreenTick} alt="green tick" className="me-2" />
      <span>{text}</span>
    </div>
  );
}

function DatingSubscription() {
  const [userHasAgreedToTerms, setUserHasAgreedToTerms] = useState(false);
  const [planMonths, setPlanMonths] = useState(1);

  return (
    <DatingPageWrapper>
      <Container className="bg-dark rounded-3 py-5">
        <img className="d-flex mx-auto mb-4" src={HeartEmoji} alt="heart" style={{ width: 60 }} />
        <h1 className="text-center mb-3">Slasher Dating is FREE to try!</h1>
        <div className="text-center text-light mb-4">Choose a premium plan for even more!</div>

        <Row className="w-50 mx-auto">
          <Col>
            <h2>Free</h2>
            <GreenTicked text="Browse Profiles" />
            <GreenTicked text="Send likes (3 per day)" />
          </Col>
          <Col>
            <h2>Premium</h2>
            <div className="text-primary fw-bold mb-2">Get more</div>
            <GreenTicked text="Browse profiles" />
            <GreenTicked text="Send unlimited likes" />
            <GreenTicked text="See who likes you" />
            <GreenTicked text="See who messages you" />
            <GreenTicked text="Send messages" />
          </Col>
        </Row>

        <Row className="w-50 mx-auto">
          <div>Select one</div>
          <Row>
            <Col md={6}>
              <Button
                variant="form"
                className="w-100"
                name="1-month"
                active={planMonths === 1}
                onClick={() => setPlanMonths(1)}
              >
                <span className="text-success fw-bold">1</span>
                <span> month</span>
                <span>$20</span>
              </Button>
            </Col>
            <Col md={6}>
              <Button
                variant="form"
                className="w-100"
                name="3-month"
                active={planMonths === 3}
                onClick={() => setPlanMonths(3)}
              >
                <span className="text-success fw-bold">3</span>
                <span>months</span>
                <span>$50</span>
              </Button>
            </Col>
            <Col md={6}>
              <Button
                variant="form"
                className="w-100"
                name="6-month"
                active={planMonths === 6}
                onClick={() => setPlanMonths(6)}
              >
                <span className="text-success fw-bold">6</span>
                <span>months</span>
                <span>$90</span>
              </Button>
            </Col>
          </Row>
        </Row>

        <Row className="mx-2 mt-5 mb-4 align-items-start">
          <Col>
            <CustomSelect
              name="height"
              options={FormOptions.countryOptions}
              label="Select Country"
            />
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label className="d-none d-sm-block ">Zip code</Form.Label>
              <Form.Control type="text" placeholder="Please enter your zip code" />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mx-2">
          <div className="">{FormOptions.subscriptionAutoRenewMessage}</div>
          <div className="mt-4">
            <label htmlFor="term-agreement-checkbox">
              <input
                id="dating-term-agreement-checkbox"
                type="checkbox"
                checked={userHasAgreedToTerms}
                onChange={() => setUserHasAgreedToTerms(!userHasAgreedToTerms)}
                className="me-2"
              />
              By clicking or tapping the checkout button, you agree to our
              {' '}
              <span className="text-primary fw-bold">terms</span>
              .
            </label>
          </div>
          <RoundButton className="mt-4 px-5 col-auto">Checkout</RoundButton>
        </Row>
      </Container>
    </DatingPageWrapper>
  );
}

export default DatingSubscription;
