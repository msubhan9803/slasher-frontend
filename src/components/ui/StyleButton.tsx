import styled from 'styled-components';

export const StyleButton = styled.div`
  .deactivate-btn {
    border: 1px solid #3A3B46;
  &:hover {
    border: 1px solid #3A3B46;
    }
  }
  @media (max-width: 767px) {
    .update-btn{
      width: 100%;
    }
    .deactivate-btn{
      width: 100%;
    }
  }
`;
