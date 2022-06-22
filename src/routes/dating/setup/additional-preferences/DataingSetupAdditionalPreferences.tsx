import React from 'react';
import {
  Col,
  Row,
} from 'react-bootstrap';

import AuthenticatedPageWrapper from '../../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../../components/ui/RoundButton';
import DatingAdditionalPreferences from '../../components/DatingAdditionalPreferences';

function DataingSetupAdditionalPreferences() {
  return (
    <AuthenticatedPageWrapper>
      <Row>
        <Col xs={12} md={8}>
          <h1 className="h6 text-center">
            On this screen, you can set your filters.
            {' '}
            <br />
            You will be able to change these later on the dating preferences screen.
          </h1>

          <div className="mt-5">
            <DatingAdditionalPreferences />
            <Row className="d-flex justify-content-center">
              <Col md={6} className="mt-4">
                <RoundButton className="w-100" type="submit">
                  Next Step
                </RoundButton>
              </Col>
            </Row>
          </div>

        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default DataingSetupAdditionalPreferences;
