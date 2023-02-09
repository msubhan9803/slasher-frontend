import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';

interface CustomFavoriteIconsProps {
  handleRemoveFavorite: (value: boolean) => void;
  favorite: boolean;
  iconClass: string;
  buttonClass: string;
  mobileView?: boolean;
}

interface FavoriteIconProps {
  responsiveCheck?: boolean;
}

const FavoriteIconDiv = styled.div<FavoriteIconProps>`
${(props) => (props.responsiveCheck
    ? 'margin-top: 1.429rem; margin-left: 3.214rem;width: 1.5rem;height: 1.5rem;border: 1px solid #3A3B46;'
    : '  top: 0;left: 6.5rem;width: 1.5rem;height: 1.5rem;border: 1px solid #3A3B46;')
}
`;
function CustomFavoriteIcons({
  handleRemoveFavorite, favorite, iconClass, buttonClass, mobileView,
}: CustomFavoriteIconsProps) {
  return (
    <FavoriteIconDiv
      responsiveCheck={mobileView}
      role="button"
      className={buttonClass}
    >
      <FontAwesomeIcon icon={solid('times')} size="lg" className={iconClass} onClick={() => handleRemoveFavorite(!favorite)} />
    </FavoriteIconDiv>
  );
}

CustomFavoriteIcons.defaultProps = {
  mobileView: false,
};

export default CustomFavoriteIcons;
