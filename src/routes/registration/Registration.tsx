import React, { useState } from 'react';
import { Step, Stepper } from 'react-form-stepper';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationSecurity from './RegistrationSecurity';

function Registration() {
  const navigate = useNavigate();
  const [goSteps, setGoSteps] = useState<any>(0);

  const nextStep = () => {
    setGoSteps(goSteps + 1);
  };

  return (
    <UnauthenticatedSiteWrapper>
      <div className="registration">
        <h1 className="h3">Create account</h1>
        <div>
          <Stepper activeStep={goSteps}>
            <Step onClick={() => { setGoSteps(0); navigate('/registration/identity'); }} label="step 1" />
            <Step onClick={() => { setGoSteps(1); navigate('/registration/security'); }} label="step 2" />
            <Step onClick={() => { setGoSteps(2); navigate('/registration/identity'); }} label="step 3" />
          </Stepper>
        </div>
        {goSteps}
        {typeof goSteps}
        <Routes>
          <Route path="/" element={<Navigate to="identity" replace />} />
          <Route path="identity" element={<RegistrationIdentity onClick={nextStep} step={goSteps} />} />
          <Route path="security" element={<RegistrationSecurity />} />
        </Routes>
      </div>
    </UnauthenticatedSiteWrapper>
  );
}

export default Registration;
