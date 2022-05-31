import React from 'react';
import {
  Button,
  Col,
  Container,
  Row,
} from 'react-bootstrap';
import RoundButtton from '../../components/ui/RoundButton';

function RegistrationTerms() {
  return (
    <Container className="">
      <h1 className="h3">
        Please scroll down to review our Terms and Conditions,
        Privacy Policy, End User License Agreement, and Community Standards
      </h1>
      <h2 className="h3 mt-5">Terms and Conditions</h2>
      <p>
        Contrary to popular belief, Lorem Ipsum is not simply random text.
        It has roots in a piece of classical Latin literature from 45 BC,
        making it over 2000 years old. Richard McClintock, a Latin professor
        at Hampden-Sydney College in Virginia, looked up one of the more obscure
        Latin words, consectetur, from a Lorem Ipsum passage, and going through the
        cites of the word in classical literature, discovered the undoubtable source.
        Lorem Ipsum comes from sections 1.10.32 and 1.10.33
      </p>
      <h1 className="h3 mt-5">Privacy</h1>
      <p>
        Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots
        in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
        Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked
        up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and
        going through the cites of the word in classical literature, discovered the undoubtable
        source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33
      </p>
      <h1 className="h3 mt-5 pt-4">I agree</h1>
      <p>
        By clicking Sign up, you agree that you are at least 17 years of age, and that you agree
        with our Terms and Conditions, Privacy Policy, End User License Agreement, and Community
        Standards.
      </p>
      <Row className="mt-5">
        <Col sm={4} md={3} className="mb-sm-0 mb-3">
          <RoundButtton className="w-100" variant="info" type="submit">
            Previous step
          </RoundButtton>
        </Col>
        <Col sm={4} md={3}>
          <RoundButtton className="w-100" type="submit">
            Sign up
          </RoundButtton>
        </Col>
      </Row>
    </Container>
  );
}

export default RegistrationTerms;
