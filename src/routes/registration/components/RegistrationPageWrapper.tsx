import { Step, StepLabel } from '@mui/material';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import UnauthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import CustomStepper from '../../../components/ui/CustomStepper';

interface Props {
  children: React.ReactNode;
  activeStep: number;
}

function RegistrationPageWrapper({ children, activeStep }: Props) {
  return (
    <UnauthenticatedPageWrapper>
      <h1 className="h3">Create account</h1>
      <Row className="justify-content-center my-5">
        <Col xs={12} md={10}>
          <CustomStepper activeStep={activeStep}>
            <Step>
              <StepLabel />
            </Step>
            <Step>
              <StepLabel />
            </Step>
            <Step>
              <StepLabel />
            </Step>
          </CustomStepper>
        </Col>
      </Row>
      {children}
    </UnauthenticatedPageWrapper>
  );
}

export default RegistrationPageWrapper;
