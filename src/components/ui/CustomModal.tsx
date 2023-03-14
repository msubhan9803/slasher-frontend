import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import closeIcon from '../../images/x-circle.svg';

const CustomModal = styled(Modal)`
  .modal-content {
    background-color: var(--bs-black);
  }
  .btn-close {
    margin: 0;
    background: url("${closeIcon}") center/4em auto no-repeat;
    opacity: 1;
  }
`;

export default CustomModal;
