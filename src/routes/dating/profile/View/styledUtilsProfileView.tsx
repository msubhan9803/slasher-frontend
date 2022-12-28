import styled from 'styled-components';

const SM_BREAKPOINT_BOOTSTRAP = '576px';

export const Heading = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5625rem;

  /* margin-bottom for mobile screens */
  @media(max-width: ${SM_BREAKPOINT_BOOTSTRAP}){
    margin-bottom: 1rem;
  }
`;
export const SubHeading = styled.div.attrs({
  className: 'text-light',
})``;

export const Section = styled.div.attrs({
  className: 'bg-dark',
})`
  padding: 1.875rem;
  margin-bottom: 1.25rem;
  border-radius: 0.625rem;

  /* Padding for mobile screens */
  @media(max-width: ${SM_BREAKPOINT_BOOTSTRAP}){
    padding: 1rem;
  }
`;
export const Title = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
`;
export const Gender = styled.div`
  color: #FF1800;
  font-size: 1rem;
`;
export const HeroProfileImg = styled.div`
  max-width: 210px;
  margin-right: 1.875rem
`;
