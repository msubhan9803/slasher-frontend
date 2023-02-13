import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'react-bootstrap';
import ShareLinksModal from './ShareLinksModal';
import { CustomDropDown } from './UserMessageList/UserMessageListItem';

interface Props {
  text?: boolean;
  textClass?: string;
}

function ShareLinkButton({ text, textClass }: Props) {
  const [showShareLinks, setShowShareLinks] = useState(false);
  const handleShowShareLinks = () => setShowShareLinks(true);
  return (
    <>
      <CustomDropDown>
        <Dropdown.Toggle onClick={handleShowShareLinks} className="cursor-pointer bg-transparent p-0 text-white">
          <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
          {text && <span className={`${textClass} fs-3`}>Share</span>}
        </Dropdown.Toggle>
        <Dropdown.Menu className="bg-black">
          <Dropdown.Item eventKey="Share as a post" className="text-light">Unavailable in Beta.</Dropdown.Item>
        </Dropdown.Menu>
      </CustomDropDown>
      {showShareLinks && <ShareLinksModal show={showShareLinks} setShow={setShowShareLinks} />}
    </>
  );
}

ShareLinkButton.defaultProps = {
  text: false,
  textClass: '',
};

export default ShareLinkButton;
