import { Button } from 'react-bootstrap';
import styled, { css } from 'styled-components';

/* NOTE: Sahil: I am adding inversion of color and background only if we pass `$invertColorOnHover`
prop becoz in other places this might not be the default desired behaviour (unsure about it). */
const RoundButton = styled(Button)`

  ${(props) => props.$invertColorOnHover && css`
    &:hover{
      color: black !important;
      background-color: white !important;
    }
  `}

  height: ${(props) => (props.height ?? 'auto')};
  border-radius: 50rem;
  border-color: ${(props) => (props.$lightBorder ? '#3A3B46 !important' : 'auto')}
`;

export default RoundButton;
