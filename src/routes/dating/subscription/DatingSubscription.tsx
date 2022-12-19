import React, { useState } from 'react';
import {
  Button,
  Col, Container, Form, Row,
} from 'react-bootstrap';
import DatingPageWrapper from '../components/DatingPageWrapper';
import GreenTick from '../../../images/dating-green-tick.png';
import RoundedGreenTick from '../../../images/dating-round-tick.png';
import DatingBestDeal from '../../../images/dating-best-deal-sticker.png';
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

function ResponsiveContainer({ children }: any) {
  return (
    <>
      <Container className="d-none d-md-block bg-dark rounded-3 py-5 px-4">
        {children}
      </Container>
      <div className="d-md-none">
        {children}
      </div>
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
              <Button
                variant={planMonths === 1 ? 'success' : 'dark'}
                className="mx-auto bg-dark mb-3 position-relative rounded-4 p-4 d-flex justify-content-between align-items-center"
                name="1-month"
                onClick={() => setPlanMonths(1)}
                style={{ borderColor: planMonths === 1 ? '#00FF0A' : '#464646', borderWidth: 2, width: '93%' }}
              >
                {planMonths === 1 && <img className="position-absolute" src={RoundedGreenTick} width="30" alt="rounded active tick" style={{ right: -15 }} />}
                <div className="d-flex justify-content-center align-items-center">
                  <span className="text-success fw-bold fs-1 me-3">1</span>
                  <span className="fw-normal text-light"> month</span>
                </div>
                <span className="text-primary me-3 fs-2">$20</span>
              </Button>
              <Button
                variant={planMonths === 3 ? 'success' : 'dark'}
                className="mx-auto bg-dark mb-3 position-relative rounded-4 p-4 d-flex justify-content-between align-items-center"
                name="3-month"
                onClick={() => setPlanMonths(3)}
                style={{
                  borderColor: planMonths === 3 ? '#00FF0A' : '#464646', borderWidth: 2, width: '93%',
                }}
              >
                {planMonths === 3 && <img className="position-absolute" src={RoundedGreenTick} width="30" alt="rounded active tick" style={{ right: -15 }} />}
                <div className="d-flex justify-content-center align-items-center">
                  <span className="text-success fw-bold fs-1 me-3">3</span>
                  <span className="fw-normal text-light"> months</span>
                </div>
                <div className="text-primary me-3 fs-2 d-flex flex-column align-items-end">
                  <div>$50</div>
                  <div className="fs-3 fw-normal text-light">Save $10</div>
                </div>
              </Button>
              <Button
                variant={planMonths === 6 ? 'success' : 'dark'}
                className="mx-auto bg-dark mb-3 position-relative rounded-4 px-4 pb-4 d-flex justify-content-between align-items-center"
                name="6-month"
                onClick={() => setPlanMonths(6)}
                style={{
                  borderColor: planMonths === 6 ? '#00FF0A' : '#464646', borderWidth: 2, width: '93%', paddingTop: 30,
                }}
              >
                {planMonths === 6 && <img className="position-absolute" src={RoundedGreenTick} width="30" alt="rounded active tick" style={{ right: -15 }} />}
                <img className="position-absolute top-0 start-0" src={DatingBestDeal} height="30" alt="Best Deal Sticker" />

                <div className="d-flex justify-content-center align-items-center">
                  <span className="text-success fw-bold fs-1 me-3">6</span>
                  <span className="fw-normal text-light"> months</span>
                </div>
                <div className="text-primary me-3 fs-2 d-flex flex-column align-items-end">
                  <div>$90</div>
                  <div className="fs-3 fw-normal text-light">Save $30</div>
                </div>
              </Button>
            </Row>
          </Col>
        </Row>

        <Row xs={1} md={2} className="mt-5 mb-4 align-items-start gx-2 gy-3">
          <Col>
            <CustomSelect
              name="height"
              options={FormOptions.countryOptions}
              label="Select Country"
            />
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
