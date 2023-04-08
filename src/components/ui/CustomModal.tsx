import { Modal } from 'react-bootstrap';
import styled, { css } from 'styled-components';
import closeIcon from '../../images/x-circle.svg';

const CustomModal = styled(Modal)`
  .modal-content {
    // border: 1px solid var(--bs-black);
    box-shadow: 0 0 0 1px var(--bs-dark);
    background-color: var(--bs-black);
    ${(props) => (props.$widthMarginAuto) && css`
      width: auto;
      margin: auto;
    `}
  }
  .btn-close {
    margin: 0;
    background: url("${closeIcon}") center/4em auto no-repeat;
    opacity: 1;
  }
`;

export default CustomModal;
