import { Button } from 'react-bootstrap';
import styled from 'styled-components';

const RoundButton = styled(Button)`
  height: ${(props) => (props.height ?? 'auto')};
  border-radius: 50rem;
`;

export default RoundButton;
