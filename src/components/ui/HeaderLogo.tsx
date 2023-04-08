import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import slasherLogo from '../../images/slasher-beta-logo-medium.png';

interface LogoImageProps {
  height: string,
}

interface Props {
  logo?: string,
  height?: string,
}

const StyledLogoImage = styled(Image) <LogoImageProps>`
  height: ${(prop) => prop.height};
`;
function HeaderLogo({ logo, height }: Props) {
  return <StyledLogoImage height={height!} src={logo!} alt="Slasher logo" />;
}

HeaderLogo.defaultProps = {
  logo: slasherLogo,
  height: '5rem',
};

export default HeaderLogo;
