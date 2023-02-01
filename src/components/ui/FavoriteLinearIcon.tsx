import styled from 'styled-components';

interface LinearIconProps {
  uniqueId?: string
}

export const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
  .favorite-icon{
    height:3.57rem;
    width:3.57rem;
  }
`;
