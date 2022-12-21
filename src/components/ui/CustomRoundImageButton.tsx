import React from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

type RoundBtnPropsType = {
  className?: string;
  onClick: () => void;
  src: string;
  alt: string;
  label: string;
};

function RoundImageButton({
  onClick, src, alt, className, label,
}: RoundBtnPropsType) {
  return (
    <div className={className}>
      <Button onClick={onClick} type="submit">
        <img src={src} alt={alt} />
      </Button>
      <div className="icon-label">{label}</div>
    </div>
  );
}
RoundImageButton.defaultProps = {
  className: '',
};

const CustomRoundImageButton = styled(RoundImageButton)`
  text-align: center;

  button {
    width: 60px;
    aspect-ratio: 1;
    background: white;
    border-radius: 100%;
    &:hover {
      background: #000 !important;
    }
  }

  .icon-label {
    font-weight: bold;
    margin-top: 18px;
  }
`;

export default CustomRoundImageButton;
