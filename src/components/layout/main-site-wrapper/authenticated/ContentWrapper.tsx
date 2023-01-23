import styled from 'styled-components';

export const ContentSidbarWrapper = styled.div`
  display: flex;
`;

export const ContentPageWrapper = styled.div`
  width: 100%;
  @media (min-width: 980px) {
    width: calc(100% - 295px);
    padding: 0px 1rem;
  }   
`;
