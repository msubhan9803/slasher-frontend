import styled from 'styled-components';
import CustomScrollbar from '../CustomScrollbar';

const CustomTabs = styled(CustomScrollbar)`
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    padding-bottom: 1rem !important;
    border: none;
    color: #ffffff;
    width: max-content;
    &:hover {
      border-color: transparent;
      color: var(--bs-primary);
    }
    &.active {
      color: var(--bs-primary);
      background-color: transparent;
      border-bottom: 0.27rem solid var(--bs-primary);
    }
  }
`;

export default CustomTabs;
