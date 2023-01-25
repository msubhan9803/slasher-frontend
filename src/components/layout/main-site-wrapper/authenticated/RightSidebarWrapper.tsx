import styled from 'styled-components';

const RightSidebarWrapper = styled.div`
  width: 334px;
  height: calc(100vh - 125px);
  overflow-y: hidden;
  position: sticky;
  top: 125px;
  overflow-x: hidden;
  &:hover {
    overflow-y: auto;
  }
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export default RightSidebarWrapper;
