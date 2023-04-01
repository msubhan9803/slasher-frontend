import { Modal } from 'react-bootstrap';
import styled, { css } from 'styled-components';
import closeIcon from '../../images/x-circle.svg';

// Usage Tip: You can pass prop `$modalContentWidth` to provide have custom width
// for the modal content. For example refer: src/routes/movies/components/MoviesModal.tsx
const CustomModal = styled(Modal)`
  .modal-content {
    background-color: var(--bs-black);
    ${(props) => props.$modalContentWidth && css`
      width: ${props.$modalContentWidth}px;
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
