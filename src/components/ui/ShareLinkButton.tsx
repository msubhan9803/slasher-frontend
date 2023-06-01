import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';
import ShareLinksModal from './ShareLinksModal';

interface Props {
  text?: boolean;
  textClass?: string;
  copyLinkUrl?: string;
}

export const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    border: none;
    &:after {
      display: none;
    }
  }
  .dropdown-toggle[aria-expanded="true"] {
    svg {
      color: var(--bs-primary);
    }
  }
  .dropdown-menu {
    inset: -1.875rem 2.5rem auto auto !important;
  }
  .dropdown-item {
    &:hover {
      background-color: var(--bs-primary) !important;
    }
    &:active {
      background-color: var(--bs-primary) !important;
    }
  }
`;

function ShareLinkButton({ text, textClass, copyLinkUrl }: Props) {
  const [showShareLinks, setShowShareLinks] = useState(false);
  const handleShowShareLinks = () => setShowShareLinks(true);
  return (
    <>
      <CustomDropDown>
        <Dropdown.Toggle aria-label="share" onClick={handleShowShareLinks} className="cursor-pointer bg-transparent p-0 text-white">
          <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
          {text && <span className={`${textClass} fs-3`}>Share</span>}
        </Dropdown.Toggle>
        <Dropdown.Menu className="bg-black">
          <Dropdown.Item eventKey="Share as a post" className="text-light">Unavailable in Beta.</Dropdown.Item>
        </Dropdown.Menu>
      </CustomDropDown>
      {showShareLinks
        && (
          <ShareLinksModal
            copyLinkUrl={copyLinkUrl}
            show={showShareLinks}
            setShow={setShowShareLinks}
          />
        )}
    </>
  );
}

ShareLinkButton.defaultProps = {
  text: false,
  textClass: '',
  copyLinkUrl: '',
};

export default ShareLinkButton;
