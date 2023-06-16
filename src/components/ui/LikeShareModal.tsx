import React, { useState } from 'react';
import {
  Modal, Tab, Tabs,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import LikeShareModalContent from './LikeShareModalContent';
import { enableDevFeatures } from '../../constants';
import { LikeShareModalResourceName, LikeShareModalTabName } from '../../types';

interface Props {
  modaResourceName: LikeShareModalResourceName | null;
  show: boolean;
  setShow: (value: boolean) => void;
  click: LikeShareModalTabName;
  clickedPostId: string;
  clickedPostLikeCount: number;
  onSelect?: (value: string) => void;
}
interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const StyleTabs = styled(Tabs)`
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    border: none;
    &:hover {
      border-color: transparent;
      color: var(--bs-primary);
    }
    &.active {
      color: var(--bs-primary);
      background-color: transparent;
      border-bottom:  0.188rem solid var(--bs-primary);
    }
  }
`;
const CustomModal = styled(Modal)`
  .modal-content {
    background: var(--bs-black);
  }
`;
const CustomModalHeader = styled(Modal.Header)`
border-bottom: 1px solid #3A3B46;
`;

function LikeShareModal({
  modaResourceName, show, setShow, click, clickedPostId, clickedPostLikeCount, onSelect,
}: Props) {
  const [tab, setTab] = useState<string>(click);
  const closeModal = () => {
    setShow(false);
  };

  return (
    <CustomModal
      show={show}
      centered
      scrollable
      onHide={closeModal}
    >
      <CustomModalHeader className="py-0" closeButton>
        <StyleTabs className="flex-nowrap w-100 border-0" activeKey={tab} onSelect={(e: any) => setTab(e)}>
          <Tab
            disabled={!enableDevFeatures}
            eventKey="like"
            title={(
              <LinearIcon uniqueId="like-button-dialogue" className="pt-2 pb-1">
                <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                <span>{clickedPostLikeCount}</span>
              </LinearIcon>
            )}
          />
          {enableDevFeatures && (
            <Tab
              eventKey="share"
              title={(
                <div className="pt-2 pb-1">
                  <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                  <span>25</span>
                </div>
              )}
            />
          )}
        </StyleTabs>
        <svg width="0" height="0">
          <linearGradient id="like-button-dialogue" x1="00%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
          </linearGradient>
        </svg>
      </CustomModalHeader>
      <Modal.Body className="d-flex flex-column pt-4 px-4">
        {(tab === 'like' || tab === 'share') && <LikeShareModalContent modaResourceName={modaResourceName} resourceId={clickedPostId} onSelect={onSelect} />}
      </Modal.Body>
    </CustomModal>
  );
}

LikeShareModal.defaultProps = {
  onSelect: undefined,
};

export default LikeShareModal;
