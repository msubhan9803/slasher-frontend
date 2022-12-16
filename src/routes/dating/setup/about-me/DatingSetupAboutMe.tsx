import React, { useState } from 'react';
import {
  Col,
  Form,
  Row,
} from 'react-bootstrap';
import LengthRestrictedTextArea from '../../../../components/ui/LengthRestrictedTextArea';
import RoundButton from '../../../../components/ui/RoundButton';
import DatingPageWrapper from '../../components/DatingPageWrapper';

function DatingSetupAboutMe() {
  const [message, setMessage] = useState('');

  return (
    <DatingPageWrapper>
      <Form>
        <Form.Group className="mb-3" controlId="about-me">
          <Form.Label><h1 className="fw-bold mb-4">Tell people about yourself</h1></Form.Label>
          <LengthRestrictedTextArea
            maxLength={1000}
            contentDetail={message}
            setContentDetail={setMessage}
            placeholder="Type here..."
          />
        </Form.Group>
        <Row>
          <Col sm={3} className="mt-4">
            <RoundButton className="w-100" type="submit">
              Next step
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </DatingPageWrapper>
  );
}

export default DatingSetupAboutMe;
