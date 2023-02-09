import styled from 'styled-components';

const RightSidebarWrapper = styled.div`
  padding-bottom: 1em;
  width: 319px;
  height: calc(100vh - 93.75px);
  overflow-y: hidden;
  position: sticky;
  top: 93.75px;
  overflow-x: hidden;
  padding-right: 1rem;
  &:hover {
    overflow-y: overlay;
  }
`;

export default RightSidebarWrapper;
