import styled from 'styled-components';

export const ContentSidbarWrapper = styled.div`
  display: flex;
`;

export const ContentPageWrapper = styled.div`
  width: 100%;
  padding: 0px 1rem;
  @media (min-width: 980px) {
    overflow-y: auto;
    height: calc(100vh - 125px);
    width: calc(100% - 295px);
  }
  ::-webkit-scrollbar {
    width: 0 !important
  }
`;
