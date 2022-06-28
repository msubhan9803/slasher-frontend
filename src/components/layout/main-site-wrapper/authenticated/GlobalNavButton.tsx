import React from 'react';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import GlobalNavItemInnerElement from './GlobalNavItemInnerElement';

const StyledButton = styled(Button)`
  text-decoration: none;
`;

interface Props {
  label: string;
  icon: IconDefinition;
  iconSize: SizeProp;
  onClick: () => void,
  badge?: number;
  badgeIconClassName?: string
}

function GlobalNavButton({
  label, icon, iconSize, onClick, badge, badgeIconClassName,
}: Props) {
  return (
    <StyledButton variant="link" onClick={onClick} className="p-0 w-100">
      <GlobalNavItemInnerElement
        label={label}
        icon={icon}
        iconSize={iconSize}
        badge={badge}
        badgeIconClassName={badgeIconClassName}
      />
    </StyledButton>
  );
}

GlobalNavButton.defaultProps = {
  badgeIconClassName: '',
  badge: null,
};

export default GlobalNavButton;
