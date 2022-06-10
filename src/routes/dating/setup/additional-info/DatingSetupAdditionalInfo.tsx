import React from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import AuthenticatedSiteWrapper from '../../../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';
import DatingAdditionalInfo from '../../DatingAdditionalInfo';
import RoundButton from '../../../../components/ui/RoundButton';

function DatingSetupAdditionalInfo() {
  return (
    <AuthenticatedSiteWrapper>
      <Form>
        <DatingAdditionalInfo />
        <Row className="d-flex justify-content-center mt-5">
          <Col md={6} lg={5}>
            <RoundButton className="w-100" size="lg">
              Next step
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </AuthenticatedSiteWrapper>
  );
}
export default DatingSetupAdditionalInfo;
