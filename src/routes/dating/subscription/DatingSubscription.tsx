import React, { useState } from 'react';
import {
  Col, Container, Form, Row,
} from 'react-bootstrap';
import DatingPageWrapper from '../components/DatingPageWrapper';
import GreenTick from '../../../images/dating-green-tick.png';
import HeartEmoji from '../../../images/dating-heart-icon.png';
import CustomSelectWithLabel from '../../../components/ui/CustomSelectWithLabel';
import FormOptions from './form-options';
import RoundButton from '../../../components/ui/RoundButton';
import BuyButton from './components/BuyButton';

function GreenTicked({ text }: { text: string }) {
  return (
    <div>
      <img src={GreenTick} alt="green tick" className="me-2" />
      <span>{text}</span>
    </div>
  );
}

function ResponsiveContainer({ children }: any) {
  return (
    <>
      <Container className="d-none d-md-block bg-dark rounded-3 py-5 px-4">{children}</Container>
      <div className="d-md-none">{children}</div>
    </>
  );
}

function DatingSubscription() {
  const [userHasAgreedToTerms, setUserHasAgreedToTerms] = useState(false);
  const [planMonths, setPlanMonths] = useState(1);

  return (
    <DatingPageWrapper>
      <ResponsiveContainer>
        <img className="d-flex mx-auto mb-4" src={HeartEmoji} alt="heart" style={{ width: 60 }} />
        <h1 className="text-center mb-3">Slasher Dating is FREE to try!</h1>
        <div className="text-center text-light mb-4">Choose a premium plan for even more!</div>

        <Row>
          <Col className="col-12 col-md-10 col-lg-11 col-xl-8 mx-auto">
            <Row>
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

              <div className="text-center mt-5 mb-3">Select one</div>
              <BuyButton currentMonth={1} currentPrice={20} {...{ planMonths, setPlanMonths }} />
              <BuyButton
                currentMonth={3}
                currentPrice={50}
                currentSavings={10}
                {...{ planMonths, setPlanMonths }}
              />
              <BuyButton
                currentMonth={6}
                currentPrice={90}
                currentSavings={30}
                isBestDeal
                {...{ planMonths, setPlanMonths }}
              />
            </Row>
          </Col>
        </Row>

        <Row xs={1} md={2} className="mt-5 mb-4 align-items-start gx-2 gy-3">
          <Col>
            <CustomSelectWithLabel options={FormOptions.countryOptions} label="Select Country" />
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>Zip code</Form.Label>
              <Form.Control type="text" placeholder="Please enter your zip code" />
            </Form.Group>
          </Col>
        </Row>

        <Row className="px-3 px-md-2">
          <div className="p-0">{FormOptions.subscriptionAutoRenewMessage}</div>
          <div className="p-0 mt-4">
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
      </ResponsiveContainer>
    </DatingPageWrapper>
  );
}

export default DatingSubscription;
