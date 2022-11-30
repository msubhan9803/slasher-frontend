import styled from 'styled-components';

const LG_BREAKPOINT_BOOTSTRAP = '992px';

export const Heading = styled.div.attrs({
  className: 'bg-secondary h2 m-0 mb-3 p-3 rounded-3',
})`
  padding: 0 2rem;
`;
export const Section = styled.div.attrs({
  className: 'row gx-3 mx-auto',
})`
    padding: 0rem;
  @media (min-width: ${LG_BREAKPOINT_BOOTSTRAP}){
    padding: 0 2rem;
  }
`;
