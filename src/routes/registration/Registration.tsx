import React, { useEffect, useState } from 'react';
import { Step, Stepper } from 'react-form-stepper';
import { ConnectorStyleProps } from 'react-form-stepper/dist/components/Connector/ConnectorTypes';
import { StepStyleDTO } from 'react-form-stepper/dist/components/Step/StepTypes';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import styled from 'styled-components';
import UnauthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedSiteWrapper';
import RegistrationIdentity from './RegistrationIdentity';
import RegistrationSecurity from './RegistrationSecurity';
import RegistrationTerms from './RegistrationTerms';

const connectorsStyle: ConnectorStyleProps = {
  disabledColor: '#bdbdbd',
  activeColor: '#ed1d24',
  completedColor: '#a10308',
  size: 1,
  stepSize: '2em',
  style: 'solid',
};

const stepsStyle: StepStyleDTO = {
  activeBgColor: '#ed1d24',
  activeTextColor: '#ffffff',
  completedBgColor: '#a10308',
  completedTextColor: '#ffffff',
  inactiveBgColor: '#e0e0e0',
  inactiveTextColor: '#ffffff',
  size: '2em',
  circleFontSize: '1rem',
  labelFontSize: '0.875rem',
  borderRadius: '50%',
  fontWeight: 500,
};

function Registration() {
  const navigate = useNavigate();
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

  const StepperStyled = styled(Stepper)`
  
  `;

  return (
    <UnauthenticatedSiteWrapper>
      <div className="registration">
        <h1 className="h3">Create account</h1>
        <div>
          <StepperStyled
            activeStep={goSteps}
            // styleConfig={stepsStyle}
            // connectorStyleConfig={connectorsStyle}
            stepClassName="py-2 px-3 rounded-circle border-0"
          >
            <Step onClick={() => { setGoSteps(0); navigate('/registration/identity'); }} label="Step 1" />
            <Step onClick={() => { setGoSteps(1); navigate('/registration/security'); }} label="Step 2" />
          </StepperStyled>
        </div>
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
