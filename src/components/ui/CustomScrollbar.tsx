import styled from 'styled-components';

const CustomScrollbar = styled.div`
  &::-webkit-scrollbar {
    height: 0.188rem;
  }
  &::-webkit-scrollbar-thumb {
    background: #3A3B46 !important;
    border-radius: 0.625rem;
}
`;

export default CustomScrollbar;
