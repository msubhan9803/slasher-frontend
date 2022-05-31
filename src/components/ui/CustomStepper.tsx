import React from 'react';

import Stepper from '@mui/material/Stepper';
import { ThemeProvider } from '@mui/material/styles';
import styled from 'styled-components';
import materialUiTheme from '../../styles/materialUiTheme';

interface Props {
  activeStep: number;
  children: React.ReactNode;
}

const StyledStepper = styled(Stepper)`
  .MuiStepConnector-root {
    .MuiStepConnector-line {
      border-color: var(--bs-gray-dark);
    }
    &.Mui-active {
      .MuiStepConnector-line {
        border-color: var(--bs-primary);
      }
    }
    &.Mui-completed {
      .MuiStepConnector-line {
        border-color: var(--bs-primary);
      }
    }
  }

  .MuiStepConnector-horizontal {
    top: 1.4em;
    left: calc(-50% + 25px);
    right: calc(50% + 25px);
    color: red;
  }
  .MuiStepLabel-root {
    .MuiStepLabel-label {
      color: var(--bs-body-color);
    }
    svg {
      width: 1.75em;
      height: 1.75em;
      color: var(--bs-primary);

      text {
        font-size: 0.6rem;
      }
    }
    &.Mui-disabled svg {
      color: var(--bs-gray-dark);
    }
  }
`;

function CustomStepper({ activeStep, children }: Props) {
  return (
    <ThemeProvider theme={materialUiTheme}>
      <StyledStepper activeStep={activeStep}>
        {children}
      </StyledStepper>
    </ThemeProvider>
  );
}

export default CustomStepper;
