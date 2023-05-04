import styled from 'styled-components';

export const StyledMoviePoster = styled.div`
  aspect-ratio: 0.67;
  img{
    object-fit: cover;
    box-shadow: 0 0 0 1px var(--poster-border-color);
  }
`;
