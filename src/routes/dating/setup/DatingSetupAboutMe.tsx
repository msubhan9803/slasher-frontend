import React, { useState } from 'react';
import {
  Col,
  Form,
  Row,
} from 'react-bootstrap';
import AuthenticatedSiteWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';
import RoundButton from '../../../components/ui/RoundButton';

const maxLength = 1000;

function DatingSetupAboutMe() {
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleMessageChange = (e: any) => {
    setCharCount(e.target.value.length);
    setMessage(e.target.value);
  };
  return (
    <AuthenticatedSiteWrapper>
      <Form>
        <Form.Group className="mb-3" controlId="about-me">
          <Form.Label>Tell people about yourself</Form.Label>
          <Form.Control
            maxLength={maxLength}
            rows={10}
            as="textarea"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type here..."
          />
          <Form.Text className="float-end">
            {`${charCount}/${maxLength} characters`}
          </Form.Text>
          <div className="clearfix" />
        </Form.Group>
        <Row>
          <Col sm={5} md={4} className="mt-5">
            <RoundButton className="w-100" type="submit">
              Next step
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </AuthenticatedSiteWrapper>
  );
}

export default DatingSetupAboutMe;
