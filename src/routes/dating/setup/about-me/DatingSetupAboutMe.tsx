import React, { useState } from 'react';
import {
  Col,
  Form,
  Row,
} from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import LengthRestrictedTextArea from '../../../../components/ui/LengthRestrictedTextArea';
import RoundButton from '../../../../components/ui/RoundButton';

function DatingSetupAboutMe() {
  const [message, setMessage] = useState('');

  return (
    <AuthenticatedPageWrapper rightSidebarType="dating">
      <Form>
        <Form.Group className="mb-3" controlId="about-me">
          <Form.Label>Tell people about yourself</Form.Label>
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
    </AuthenticatedPageWrapper>
  );
}

export default DatingSetupAboutMe;
