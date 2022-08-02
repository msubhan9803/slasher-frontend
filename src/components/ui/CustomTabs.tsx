import styled from 'styled-components';
import CustomScrollbar from './CustomScrollbar';

const CustomTabs = styled(CustomScrollbar)`
  overflow-x: scroll;
  overflow-y: hidden;
  .nav-link {
    padding-bottom: 1rem;
    border: none;
    color: #ffffff;
    &:hover {
      border-color: transparent;
      color: var(--bs-primary);
    }
    &.active {
      color: var(--bs-primary);
      background-color: transparent;
      border-bottom:  0.188rem solid var(--bs-primary);
    }
  }
`;

export default CustomTabs;
