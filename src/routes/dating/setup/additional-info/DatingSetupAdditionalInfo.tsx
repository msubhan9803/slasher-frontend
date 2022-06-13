import React from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import DatingAdditionalInfo from '../../components/DatingAdditionalInfo/DatingAdditionalInfo';
import RoundButton from '../../../../components/ui/RoundButton';
import DatingPageWrapper from '../../components/DatingPageWrapper';

function DatingSetupAdditionalInfo() {
  return (
    <DatingPageWrapper>
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
    </DatingPageWrapper>
  );
}
export default DatingSetupAdditionalInfo;
