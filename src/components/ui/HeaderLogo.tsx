import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import slasherLogo from '../../images/slasher-logo-medium.png';

const StyledLogoImage = styled(Image)`
  height: 6.6rem;
`;
function HeaderLogo() {
  return <StyledLogoImage src={slasherLogo} alt="Slasher logo" />;
}

export default HeaderLogo;
