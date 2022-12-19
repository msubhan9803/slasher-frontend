import { Button } from 'react-bootstrap';
import styled from 'styled-components';

/* NOTE: Sahil: I am adding inversion of color and background only if we pass `$invertColorOnHover`
prop becoz in other places this might not be the default desired behaviour (unsure about it). */
const RoundButton = styled(Button)`
  border-radius: 50rem;
`;

export default RoundButton;
