import React from 'react';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import IconWithTextNavItemInnerElement from './IconWithTextNavItemInnerElement';

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

function IconWithTextNavButton({
  label, icon, iconSize, onClick, badge, badgeIconClassName,
}: Props) {
  return (
    <StyledButton variant="link" onClick={onClick} className="p-0 w-100">
      <IconWithTextNavItemInnerElement
        label={label}
        icon={icon}
        iconSize={iconSize}
        badge={badge}
        badgeIconClassName={badgeIconClassName}
      />
    </StyledButton>
  );
}

IconWithTextNavButton.defaultProps = {
  badgeIconClassName: '',
  badge: null,
};

export default IconWithTextNavButton;
