import styled from 'styled-components';

const RightSidebarWrapper = styled.div`
  width: 334px;
  height: calc(100vh - 125px);
  overflow-y: hidden;
  position: sticky;
  top: 125px;
  &:hover {
    overflow-y: auto;
  }
  ::-webkit-scrollbar {
    width: 0 !important
  }
`;

export default RightSidebarWrapper;
