import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import RoundButton from './RoundButton';

interface BorderButtonProps {
  buttonClass: string;
  variant?: string;
  icon?: IconDefinition;
  iconClass?: string;
  iconSize?: SizeProp;
  lable?: string;
  handleClick?: (value: boolean) => void;
  toggleBgColor?: boolean;
  toggleButton?: boolean;
  customButtonCss?: string;
}

interface StylButtonProps {
  customCss?: string
}

const StyleBorderButton = styled(RoundButton) <StylButtonProps>`
  ${(props) => props.customCss}
  border: 1px solid #3A3B46;
    &:hover {
    border: 1px solid #3A3B46;
  }
  .share-btn {
    padding: 0 1.25rem;
      svg {
        width: 1.055rem;
        height: 1.125rem;
    }
    p {
      font-size: 1rem;
    }
  }
  .rate-btn {
    padding: 0 1.438rem;
      svg {
        width: 1.179rem;
        height: 1.125rem;
    }
      p {
        font-size: 1rem;
    }
  }
`;

function BorderButton({
  buttonClass, variant, icon, iconClass, iconSize, lable,
  handleClick, toggleBgColor, toggleButton, customButtonCss,
}: BorderButtonProps) {
  return (
    toggleButton ? (
      <StyleBorderButton
        customCss={customButtonCss}
        onClick={handleClick}
        className={`rounded-pill ${toggleBgColor ? 'bg-primary border-primary' : 'bg-black'} ${buttonClass}`}
        variant={variant}
      >
        {toggleBgColor ? 'Follow' : 'Unfollow'}
      </StyleBorderButton>
    ) : (
      <StyleBorderButton
        onClick={handleClick}
        className={`align-items-center bg-black py-2 ${buttonClass}`}
        variant={variant}
      >
        {icon ? (
          <>
            <FontAwesomeIcon icon={icon} size={iconSize} className={iconClass} />
            <p className="fs-3 fw-bold m-0">{lable}</p>
          </>
        ) : (
          lable
        )}
      </StyleBorderButton>
    )

  );
}

BorderButton.defaultProps = {
  variant: '',
  icon: null,
  iconClass: '',
  lable: '',
  iconSize: null,
  toggleBgColor: false,
  toggleButton: false,
  customButtonCss: false,
  handleClick: undefined,
};

export default BorderButton;
