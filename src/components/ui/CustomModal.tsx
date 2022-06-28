import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import closeIcon from '../../images/x-circle.svg';

const CustomModal = styled(Modal)`
  .modal-content {
    background-color: #000000;
  }
  .btn-close {
    background: url("${closeIcon}") center/4em auto no-repeat;
    opacity: 1;
    &:focus {
      box-shadow:none;
    }
  }
`;

export default CustomModal;
