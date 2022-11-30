import React from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import DatingAdditionalInfo from '../../components/DatingAdditionalInfo/DatingAdditionalInfo';
import RoundButton from '../../../../components/ui/RoundButton';
import DatingPageWrapper from '../../components/DatingPageWrapper';
import { Section } from '../../components/styledUtils';

function DatingSetupAdditionalInfo() {
  return (
    <DatingPageWrapper>
      <Form>
        <DatingAdditionalInfo />
        <Section>
          <Row className="d-flex justify-content-start mt-2">
            <Col md={4}>
              <RoundButton className="w-100" size="sm" height="40px">
                Next step
              </RoundButton>
            </Col>
          </Row>
        </Section>
      </Form>
    </DatingPageWrapper>
  );
}
export default DatingSetupAdditionalInfo;
