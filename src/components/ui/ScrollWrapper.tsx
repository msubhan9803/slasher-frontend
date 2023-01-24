import styled from 'styled-components';

const ScrollWrapper = styled.div`
  height: calc(100vh - 340px);
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow-y: auto;
`;

export default ScrollWrapper;
