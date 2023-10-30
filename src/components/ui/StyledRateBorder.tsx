import styled from 'styled-components';

interface StyledRateBorderProps {
  borderTop?: string;
}

export const StyledRateBorder = styled.div<StyledRateBorderProps>`
  @media (min-width: 89.938rem) {
    border-bottom: 1px solid #3A3B46;
  }
  @media (max-width: 89.938rem) {
    .rating {
      // border-bottom: 1px solid #3A3B46;
      // border-top: 1px solid #3A3B46;
    }
  }
`;

StyledRateBorder.defaultProps = {
  borderTop: '',
};
