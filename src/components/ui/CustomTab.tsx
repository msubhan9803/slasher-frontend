import styled from 'styled-components';
import CustomScrollbar from './CustomScrollbar';

const CustomTabs = styled(CustomScrollbar)`
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    padding-top:1.25rem;
    padding-bottom:1.25rem;
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
      border-bottom:  0.188rem solid var(--bs-primary);
      margin-bottom:1px;
    }
  }
`;

export default CustomTabs;
