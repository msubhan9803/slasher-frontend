import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  popoverOptions: string[];
  onPopoverClick: (val: string, popoverClickProps: PopoverClickProps) => void,
  userName?: string;
  content?: string;
  id?: string;
  userId?: string;
  postImages?: string[] | undefined;
}

export interface PopoverClickProps {
  content?: string,
  id?: string,
  userId?: string,
  userName?: string,
  postImages?: string[] | undefined,
}

const StyledPopover = styled.div`
  a{
    &:hover {
      color: var(--bs-primary);
    }
    &:focus-visible {
      color: var(--bs-primary);
    }
  }
  .btn {
    background-color: transparent !important;
    &:after {
      display: none
    }
    &:focus-visible {
      color: var(--bs-primary) !important;
    }
    svg {
      &:hover {
        color: var(--bs-primary) !important;
      }
      &:focus-visible {
        color: var(--bs-primary) !important;
      }
      &:active {
        color: var(--bs-primary) !important;
      }
    }
  }
  .dropdown-menu {
    inset: auto 13px auto auto !important;
    background-color: rgb(27,24,24) !important;
    border: 1px solid rgb(56,56,56) !important;
    min-width: 115px;
    transform: none !important;
    z-index: 1;
    .side-arrow{
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: -10px;
      width: 0.5rem;
      height: 1rem;
      &:before {
        content: "";
        display: block;
        border-style: solid;
        border-width: calc(1rem * 0.5) 0 calc(1rem * 0.5) 0.5rem;
        border-color: transparent;
        position: absolute;
        right: 0;
      }
      &:after {
        content: "";
        display: block;
        border-style: solid;
        border-width: calc(1rem * 0.5) 0 calc(1rem * 0.5) 0.5rem;
        border-color: transparent transparent transparent rgb(56,56,56);
        position: absolute;
        right: 3px;
      }
    }
  }
  .dropdown-item {
    text-decoration: none !important;
    color: white !important;
    &:hover {
      background-color: var(--bs-primary) !important;
    }
    &:focus-visible {
      background-color: var(--bs-primary) !important;
    }
  }
`;

function CustomPopover({
  popoverOptions, onPopoverClick,
  content, id, userId, userName, postImages,
}: Props) {
  const popoverClickProps = {
    content,
    id,
    userId,
    userName,
    postImages,
  };
  return (
    <div>
      <StyledPopover>
        <Dropdown className="d-flex align-items-center">
          <Dropdown.Toggle id="dropdown-basic" className="shadow-none text-white border-0 p-0">
            <FontAwesomeIcon icon={solid('ellipsis-vertical')} size="lg" />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <div className="side-arrow" />
            {popoverOptions.map((option) => (
              <Dropdown.Item
                key={option}
                className="ps-4 shadow-none pb-2 pe-5 pt-2 mb-0 text-light"
                role="button"
                onClick={() => onPopoverClick(option, popoverClickProps as PopoverClickProps)}
              >
                {option}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

      </StyledPopover>
    </div>
  );
}

CustomPopover.defaultProps = {
  content: null,
  id: null,
  userId: null,
  userName: null,
  postImages: [],
};

export default CustomPopover;
