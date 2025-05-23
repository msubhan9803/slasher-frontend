import React from 'react';
import {
  Card,
  Col,
  Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import RoundButton from '../../../components/ui/RoundButton';
import DatingPageWrapper from '../components/DatingPageWrapper';

function DatingWelcome() {
  return (
    <DatingPageWrapper>
      <Row className="text-center pt-4 justify-content-center">
        <Col md={8}>
          <h1>Welcome!</h1>
          <p className="fs-5">
            We want you to have a good experience!
            <br />
            Here are some ways to help…
          </p>
          <Card className="my-5 bg-dark p-4 rounded-3">
            <Card.Body className="text-start">
              <Card.Text className="d-flex">
                <FontAwesomeIcon icon={solid('check')} size="lg" className="me-3 text-primary" />
                <span>
                  <h2 className="h6 mb-0">Be Respectful.</h2>
                  <p className="fw-light m-0 text-light">Treat others with respect.</p>
                </span>
              </Card.Text>
              <Card.Text className="d-flex">
                <FontAwesomeIcon icon={solid('check')} size="lg" className="me-3 text-primary" />
                <span>
                  <h2 className="h6 mb-0">Be honest.</h2>
                  <p className="fw-light m-0 text-light">Keep the info in your profile truthful. Show current photos. Be yourself.</p>
                </span>
              </Card.Text>
              <Card.Text className="d-flex">
                <FontAwesomeIcon icon={solid('check')} size="lg" className="me-3 text-primary" />
                <span>
                  <h2 className="h6 mb-0">Report bad behavior.</h2>
                  <p className="fw-light m-0 text-light">We want to keep this fun for everyone.</p>
                </span>
              </Card.Text>
              <Card.Text className="d-flex">
                <FontAwesomeIcon icon={solid('check')} size="lg" className="me-3 text-primary" />
                <span>
                  <h2 className="h6 mb-0">Be safe.</h2>
                  <p className="fw-light m-0 pe-md-5 text-light">
                    Don’t give your personal info to anyone if you aren’t comfortable.
                    <Link className="text-primary" to="/app/dating/welcome"> Click here </Link>
                    for safety tips.
                  </p>
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Row className="justify-content-center">
            <Col md={5}>
              <RoundButton className="w-100">Agree</RoundButton>
            </Col>
          </Row>
        </Col>
      </Row>
    </DatingPageWrapper>
  );
}

export default DatingWelcome;
