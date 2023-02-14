import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import CustomModal from '../ui/CustomModal';
import RoundButton from '../ui/RoundButton';
import SortData from './SortData';

interface FilterDialogProps {
  showKeys: boolean;
  setShowKeys: (val: boolean) => void;
  selectedKey?: (e: string) => void;
  applyFilter?: () => void;
  sortoptions?: OptionsProps[];
  onSelectSort?(e: React.ChangeEvent<HTMLSelectElement>): void | undefined;
  groupHomePosts?: boolean;
}
interface OptionsProps {
  value: string;
  label: string;
}
const KeyboardButtons = styled(Button)`
  width: 2.5rem;
  height: 2.5rem;
`;
function FilterModal({
  showKeys, setShowKeys, selectedKey, applyFilter, sortoptions,
  onSelectSort, groupHomePosts,
}: FilterDialogProps) {
  const [keyboard, setKeyboard] = useState<string[]>([]);
  const [key, setKey] = useState<string>('');
  const generateAlphabet = () => {
    const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 97).toUpperCase());
    const number = [...Array(10)].map((_, i) => String.fromCharCode(i + 48));
    setKeyboard([...number, ...alphabet, '#']);
  };
  const generateGroupsType = () => {
    const groupsType = ['Review', 'Discussion', 'Help', 'Recommended', 'Opinions wanted', 'Hidden gem',
      'News', 'Event', 'Gorefest', 'Cosplay', 'My work', 'Collaboration', 'For sale', 'Want to buy'];
    setKeyboard(groupsType);
  };
  useEffect(() => {
    if (groupHomePosts) {
      generateGroupsType();
    } else {
      generateAlphabet();
    }
  }, [groupHomePosts]);
  const handleCloseKeys = () => {
    setShowKeys(false);
  };

  const keyValue = useCallback(() => {
    if (selectedKey && key !== '') {
      selectedKey(key);
    }
  }, [key, selectedKey]);

  const onClickApplyFilter = () => {
    if (applyFilter) {
      applyFilter();
      handleCloseKeys();
    }
  };

  useEffect(() => {
    keyValue();
  }, [keyValue]);
  return (
    <CustomModal
      show={showKeys}
      centered
      onHide={handleCloseKeys}
      className="px-3 px-md-0"
      scrollable
    >
      <Modal.Header className={`border-0 shadow-none m-0 ${groupHomePosts ? 'justify-content-end' : ''}`} closeButton>
        {!groupHomePosts && <Modal.Title className="fs-2">Filter Options</Modal.Title>}
      </Modal.Header>
      <Modal.Body className="pb-5">
        {!groupHomePosts && (
          <div className="d-lg-none mb-4">
            <Modal.Title className="fs-3 mb-2">Sort</Modal.Title>
            <SortData onSelectSort={onSelectSort} sortoptions={sortoptions} title="Sort: " type="sort" />
          </div>
        )}
        <h2 className={`fs-3 mb-3 ${groupHomePosts ? 'text-primary' : ''} text-center `}>{groupHomePosts ? 'Filters' : 'Title starts with:'}</h2>
        <div className="align-items-center d-flex flex-wrap justify-content-center mb-4">
          {keyboard.map((keys) => (
            groupHomePosts
              ? (
                <Button
                  key={keys}
                  onClick={() => { selectedKey!(keys); handleCloseKeys(); }}
                  className={`py-2 px-3 text-white fs-3 border shadow-none align-items-center d-flex fw-normal justify-content-center m-2 rounded-pill ${key !== keys ? 'bg-dark' : ' bg-primary'}`}
                >
                  {keys}
                </Button>
              )
              : (
                <KeyboardButtons
                  key={keys}
                  onClick={() => setKey(keys)}
                  className={`text-white fs-3 border-0 shadow-none align-items-center d-flex fw-normal justify-content-center m-2 rounded-circle ${key !== keys ? 'bg-dark' : ' bg-primary'}`}
                >
                  {keys}
                </KeyboardButtons>
              )
          ))}
        </div>
        {!groupHomePosts && (
        <RoundButton
          variant="primary"
          type="submit"
          className="w-100 fs-3 "
          onClick={onClickApplyFilter}
        >
          Apply filter
        </RoundButton>
        )}
      </Modal.Body>
    </CustomModal>
  );
}

FilterModal.defaultProps = {
  selectedKey: null,
  applyFilter: null,
  sortoptions: null,
  onSelectSort: undefined,
  groupHomePosts: false,
};

export default FilterModal;
