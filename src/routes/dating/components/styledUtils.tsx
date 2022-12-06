import styled from 'styled-components';

const LG_BREAKPOINT_BOOTSTRAP = '992px';

export const Heading = styled.div`
  padding: 0 2rem;
`;
export const Section = styled.div`
    padding: 0rem;
  @media (min-width: ${LG_BREAKPOINT_BOOTSTRAP}){
    padding: 0 2rem;
  }
`;
