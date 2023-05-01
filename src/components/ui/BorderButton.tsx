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
  iconStyle?: React.CSSProperties | undefined;
  iconSize?: SizeProp;
  lable?: string;
  handleClick?: (value: boolean) => void;
  toggleBgColor?: boolean;
  toggleButton?: boolean;
  customButtonCss?: string;
}

interface StylButtonProps {
  customcss?: string
}

const StyleBorderButton = styled(RoundButton) <StylButtonProps>`
  ${(props) => props.customcss}
  border: 1px solid #3A3B46;
    &:hover {
    border: 1px solid #3A3B46;
  }
  .share-btn {
    padding-right: 0 1.25rem;
    padding-left: 0 1.25rem;
      svg {
        width: 1.055rem;
        height: 1.125rem;
    }
    p {
      font-size: 1rem;
    }
  }
  .rate-btn {
    padding-right: 1.438rem;
    padding-left: 1.438rem;
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
  buttonClass, variant, icon, iconClass, iconSize, iconStyle, lable,
  handleClick, toggleBgColor, toggleButton, customButtonCss,
}: BorderButtonProps) {
  return (
    toggleButton ? (
      <StyleBorderButton
        customcss={customButtonCss}
        onClick={handleClick}
        className={`rounded-pill ${toggleBgColor ? 'bg-black' : 'bg-primary border-primary'} ${buttonClass}`}
        variant={variant}
      >
        {toggleBgColor ? 'Unfollow' : 'Follow'}
      </StyleBorderButton>
    ) : (
      <StyleBorderButton
        onClick={handleClick}
        className={`align-items-center bg-black ${buttonClass}`}
        variant={variant}
      >
        {icon ? (
          <>
            <FontAwesomeIcon icon={icon} size={iconSize} className={iconClass} style={iconStyle} />
            <p className="m-0">{lable}</p>
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
  iconStyle: {},
  lable: '',
  iconSize: null,
  toggleBgColor: false,
  toggleButton: false,
  customButtonCss: false,
  handleClick: undefined,
};

export default BorderButton;
