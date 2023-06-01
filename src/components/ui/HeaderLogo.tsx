import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import slasherLogo from '../../images/slasher-beta-logo-medium.png';

interface LogoImageProps {
  height: string,
  margin?: string,
}

interface Props {
  logo?: string,
  height?: string,
  style?: React.CSSProperties,
}

const StyledLogoImage = styled(Image) <LogoImageProps>`
  height: ${(prop) => prop.height};

`;
function HeaderLogo({ logo, height, style }: Props) {
  return <StyledLogoImage height={height!} style={style} src={logo!} alt="Slasher logo" />;
}

HeaderLogo.defaultProps = {
  logo: slasherLogo,
  height: '5rem',
  style: undefined,
};

export default HeaderLogo;
