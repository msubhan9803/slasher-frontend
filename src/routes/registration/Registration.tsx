import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Step, StepLabel } from '@mui/material';
import { Col, Container, Row } from 'react-bootstrap';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationSecurity from './RegistrationSecurity';
import CustomStepper from '../../components/ui/CustomStepper';

function Registration() {
  const [goSteps, setGoSteps] = useState<any>(0);
  const location: any = useLocation();

  const nextStep = (st: any) => {
    setGoSteps(st);
  };

  useEffect(() => {
    if (location.pathname === '/registration/security') {
      setGoSteps(1);
    } else if (location.pathname === '/registration/terms') {
      setGoSteps(2);
    } else {
      setGoSteps(0);
    }
  }, []);

  return (
    <UnauthenticatedSiteWrapper>
      <div className="registration">
        <h1 className="h3">Create account</h1>
        <Container className="my-3 my-md-4">
          <Row className="justify-content-center">
            <Col xs={12} md={10}>
              <CustomStepper activeStep={goSteps}>
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
        </Container>
        <Routes>
          <Route path="/" element={<Navigate to="identity" replace />} />
          <Route path="identity" element={<RegistrationIdentity changeStep={nextStep} step={goSteps} />} />
          <Route path="security" element={<RegistrationSecurity changeStep={nextStep} step={goSteps} />} />
        </Routes>
      </div>
    </UnauthenticatedSiteWrapper>
  );
}

export default Registration;
