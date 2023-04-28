import { Button } from 'react-bootstrap';
import styled from 'styled-components';

export const CustomVisibilityButton = styled(Button)`
  background-color: rgb(31, 31, 31);
  border-color: #3a3b46 !important;
  &:hover {
    background-color: rgb(31, 31, 31);
  }
  &:focus {
    background-color: rgb(31, 31, 31);
  }
  margin-top: 0.7px;
  right: 0;
  z-index: 9 !important;
  margin-right: 0.7px;
  width: 4rem;
`;
