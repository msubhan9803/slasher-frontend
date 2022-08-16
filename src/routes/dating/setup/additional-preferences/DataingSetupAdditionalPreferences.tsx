import React from 'react';
import {
  Col,
  Row,
} from 'react-bootstrap';
import RoundButton from '../../../../components/ui/RoundButton';
import DatingAdditionalPreferences from '../../components/DatingAdditionalPreferences';
import DatingPageWrapper from '../../components/DatingPageWrapper';

function DataingSetupAdditionalPreferences() {
  return (
    <DatingPageWrapper>
      <Row className="my-5 py-5 py-md-0 my-md-0">
        <Col xs={12}>
          <div className="bg-dark bg-mobile-transparent p-2 p-md-4 rounded">
            <DatingAdditionalPreferences />
            <Row>
              <Col md={3} lg={5} xl={3} className="mb-4">
                <RoundButton className="w-100" type="submit">
                  Save changes
                </RoundButton>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </DatingPageWrapper>
  );
}

export default DataingSetupAdditionalPreferences;
