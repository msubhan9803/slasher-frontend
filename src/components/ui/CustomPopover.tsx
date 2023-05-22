import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Dropdown, DropdownButton,
} from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
  popoverOptions: string[];
  onPopoverClick: (val: string, popoverClickProps: PopoverClickProps) => void,
  userName?: string;
  message?: string;
  id?: string;
  userId?: string;
  postImages?: string[] | undefined;
  rssfeedProviderId?: string;
}

export interface PopoverClickProps {
  message?: string,
  id?: string,
  userId?: string,
  userName?: string,
  postImages?: string[] | undefined,
  rssfeedProviderId?: string,
}

const StyledPopover = styled.div`
  position: relative;
  left: .755rem;

  .btn.show:focus-visible, .btn:first-child:active:focus-visible {
    box-shadow: 0 0 0 2px var(--stroke-and-line-separator-color) !important;
  }

  .dropstart .dropdown-toggle::before {
    border: none; // remove default bootstrap caret
    margin: 0; // remove default bootstrap caret spacing
  }

  .dropdown-menu {
    background-color: rgb(27,24,24) !important;
    border: 1px solid rgb(56,56,56) !important;
    min-width: 115px;
    z-index: 1;
  }

  .dropdown-menu .side-arrow {
    position: absolute;
    right: -11px;
    top: 10px;
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
  message, id, userId, userName, postImages, rssfeedProviderId,
}: Props) {
  const popoverClickProps = {
    message,
    id,
    userId,
    userName,
    postImages,
    rssfeedProviderId,
  };
  return (
    <StyledPopover>
      <DropdownButton
        variant="link"
        drop="start"
        // The align prop is just here to disable dynamic positioning (which can make the dropdown
        // content move based on screen position). This should match the `drop` prop value.
        align={{ xs: 'start' }}
        flip={false}
        title={(
          <>
            <FontAwesomeIcon icon={solid('ellipsis-vertical')} size="lg" />
            <span className="visually-hidden">Options</span>
          </>
        )}
      >
        {popoverOptions.map((option, i) => (
          <Dropdown.Item
            key={option}
            className="ps-4 shadow-none pb-2 pe-5 pt-2 mb-0 text-light"
            role="button"
            onClick={() => onPopoverClick(option, popoverClickProps as PopoverClickProps)}
          >
            {option}
            {i === 0 && <div className="side-arrow" />}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </StyledPopover>
  );
}

CustomPopover.defaultProps = {
  message: null,
  id: null,
  userId: null,
  userName: null,
  postImages: [],
  rssfeedProviderId: '',
};

export default CustomPopover;
