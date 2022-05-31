import React, { useState } from 'react';
import {
  Col,
  Form,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap';
import UnauthenticatedSiteWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import RoundButton from '../../../components/ui/RoundButton';

function DatingSetupAboutMe() {
  const [message, setMessage] = useState('');
  const [char, setChar] = useState(0);

  const handleMessageChange = (e: any) => {
    const charCount = e.target.value.length;
    setChar(charCount);
    setMessage(e.target.value);
  };
  return (
    <UnauthenticatedSiteWrapper>
      <Form>
        <Row>
          <Col xs={12}>
            <Form.Label>Tell people about yourself</Form.Label>
          </Col>
          <Col xs={12}>
            <InputGroup>
              <FormControl
                maxLength={1000}
                rows={8}
                as="textarea"
                aria-label="With textarea"
                value={message}
                onChange={handleMessageChange}
                placeholder="Type here..."
              />
            </InputGroup>
          </Col>
          <Col xs={12}>
            <Form.Text className="mt-2 d-sm-flex justify-content-end">
              {char}
              /1000 characters
            </Form.Text>
          </Col>
          <Col sm={5} md={4} className="mt-5">
            <RoundButton className="w-100" type="submit">
              Next step
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </UnauthenticatedSiteWrapper>
  );
}

export default DatingSetupAboutMe;
