import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
} from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomModal from '../../components/ui/CustomModal';

export default function VerificationEmailNotReceived() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <Row className="justify-content-center">
      <Col lg="8" className="mt-3 mt-lg-2 align-self-center text-center">
        <h1 className="h2">Verification Email Not Received</h1>
        <p className="mt-4">
          If you created a Slasher account and never received the
          verification email to activate your account, please
          enter your email address below and we will send another activation
          email to you. Please allow up to 30 minutes to receive a new email
          and be sure to check your spam folder if you do not see it within 30 minutes.
        </p>

        <Form className="my-5">
          <Row className="flex-column align-items-center">
            <Col xs="10" sm="8" lg="6">
              <Form.Control className="text-white shadow-none" type="email" placeholder="Email address" />
              <Button size="lg" className="mt-4 w-100" onClick={handleShow}>Send</Button>
            </Col>
          </Row>
        </Form>

        <p>
          If you have already done this and never received the email,
          please let us know by emailing us at&nbsp;
          <Link to="/verification-email-not-received" className="text-decoration-none text-primary">
            help@slasher.tv
          </Link>
          &nbsp;from the email address you used when you created your
          account and include your Slasher username as well. We will
          be happy to help you!
        </p>
        <CustomModal
          show={show}
          centered
          onHide={handleClose}
        >
          <Modal.Header className="border-0 shadow-none" closeButton />
          <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
            <FontAwesomeIcon icon={solid('envelope')} size="6x" className="text-primary" />
            <h3>
              This email address
              <br />
              does not exist
            </h3>
            <p>
              Please email&nbsp;
              <Link to="/verification-email-not-received" className="text-decoration-none text-primary">
                help@slasher.tv
              </Link>
              &nbsp;for assistance
            </p>
          </Modal.Body>
        </CustomModal>
      </Col>
    </Row>
  );
}
