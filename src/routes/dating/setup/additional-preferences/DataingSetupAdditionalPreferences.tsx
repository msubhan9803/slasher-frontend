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
      <Row>
        <Col xs={12}>
          <h1 className="h6 text-center">
            On this screen, you can set your filters.
            <br />
            You will be able to change these later on the dating preferences screen.
          </h1>

          <div className="mt-5">
            <DatingAdditionalPreferences />
            <Row className="d-flex justify-content-center">
              <Col md={6} className="my-4">
                <RoundButton className="w-100" type="submit">
                  Next Step
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
