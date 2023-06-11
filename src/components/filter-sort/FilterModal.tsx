import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import CustomModal from '../ui/CustomModal';
import RoundButton from '../ui/RoundButton';
import CustomSelect from './CustomSelect';

interface FilterDialogProps {
  showKeys: boolean;
  setShowKeys: (val: boolean) => void;
  selectedKey?: string;
  applyFilter?: (keyValue: string, sortValue?: string) => void;
  sortoptions?: OptionsProps[];
  sortVal?: string
  postType?: string;
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
  sortVal, postType,
}: FilterDialogProps) {
  const [keyboard, setKeyboard] = useState<string[]>([]);
  const [key, setKey] = useState<string>('');
  const [selectedSortValue, seSelectedSortValue] = useState<string>('');

  useEffect(() => {
    setKey(selectedKey!.toUpperCase());
  }, [selectedKey]);
  useEffect(() => {
    seSelectedSortValue(sortVal!);
  }, [sortVal]);

  const generateAlphabet = () => {
    const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 97).toUpperCase());
    const number = [...Array(10)].map((_, i) => String.fromCharCode(i + 48));
    setKeyboard(['#', ...number, ...alphabet]);
  };
  const generateGroupsType = () => {
    const groupsType = ['Review', 'Discussion', 'Help', 'Recommended', 'Opinions wanted', 'Hidden gem',
      'News', 'Event', 'Gorefest', 'Cosplay', 'My work', 'Collaboration', 'For sale', 'Want to buy'];
    setKeyboard(groupsType);
  };
  useEffect(() => {
    if (postType === 'group-post') {
      generateGroupsType();
    } else {
      generateAlphabet();
    }
  }, [postType]);
  const handleCloseKeys = () => {
    setShowKeys(false);
  };

  const onClickApplyFilter = (keyVal?: string) => {
    if (applyFilter) {
      applyFilter(postType === 'group-post' ? keyVal! : key, selectedSortValue);
      handleCloseKeys();
    }
  };

  return (
    <CustomModal
      show={showKeys}
      centered
      onHide={handleCloseKeys}
      className="px-3 px-md-0"
      scrollable
    >
      <Modal.Header className={`border-0 m-0 ${postType === 'group-post' ? 'justify-content-end' : ''}`} closeButton>
        {postType !== 'group-post' && <Modal.Title className="fs-2">Filter Options</Modal.Title>}
      </Modal.Header>
      <Modal.Body className="pb-5">
        {postType !== 'group-post' && (
          <div className="d-lg-none mb-4">
            <Modal.Title className="fs-3 mb-2">Sort</Modal.Title>
            <CustomSelect value={selectedSortValue} onChange={seSelectedSortValue} options={sortoptions} type="sort" />
          </div>
        )}
        <h2 className={`fs-3 mb-3 ${postType === 'group-post' ? 'text-primary' : ''} text-center `}>{postType === 'group-post' ? 'Filters' : 'Title starts with:'}</h2>
        <div className="align-items-center d-flex flex-wrap justify-content-center mb-4">
          {keyboard.map((keys) => (
            postType === 'group-post'
              ? (
                <Button
                  key={keys}
                  onClick={() => { onClickApplyFilter(keys); }}
                  className={`px-3 text-white fs-3 border align-items-center d-flex fw-normal justify-content-center m-2 rounded-pill ${key !== keys ? 'bg-dark' : ' bg-primary'}`}
                >
                  {keys}
                </Button>
              )
              : (
                <KeyboardButtons
                  key={keys}
                  onClick={() => setKey(keys)}
                  className={`text-white fs-3 border-0 align-items-center d-flex fw-normal justify-content-center m-2 rounded-circle ${key !== keys ? 'bg-dark' : ' bg-primary'}`}
                >
                  {keys}
                </KeyboardButtons>
              )
          ))}
        </div>
        {postType !== 'group-post' && (
          <RoundButton
            variant="primary"
            type="submit"
            className="w-100"
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
  selectedKey: '',
  applyFilter: null,
  sortoptions: null,
  sortVal: 'name',
  postType: '',
};

export default FilterModal;
