import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import CustomModal from '../ui/CustomModal';
import RoundButton from '../ui/RoundButton';
import SortData from './SortData';

interface FilterDialogProps {
  showKeys: boolean;
  setShowKeys: (val: boolean) => void;
}
const KeyboardButtons = styled(Button)`
  width: 2.5rem;
  height: 2.5rem;
`;
function FilterModal({ showKeys, setShowKeys }: FilterDialogProps) {
  const [keyboard, setKeyboard] = useState<string[]>([]);
  const [key, setKey] = useState<string>('');
  const generateAlphabet = () => {
    const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 97).toUpperCase());
    const number = [...Array(10)].map((_, i) => String.fromCharCode(i + 48));
    setKeyboard([...number, ...alphabet, '#']);
  };
  useEffect(() => { generateAlphabet(); }, []);
  const handleCloseKeys = () => {
    setShowKeys(false);
  };
  return (
    <CustomModal
      show={showKeys}
      centered
      onHide={handleCloseKeys}
      className="px-3 px-md-0"
      scrollable
    >
      <Modal.Header className="border-0 shadow-none m-0" closeButton>
        <Modal.Title className="fs-2 mx-auto">Filter</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-5">
        <div className="d-lg-none mb-4">
          <Modal.Title className="fs-3 mb-2">Sort</Modal.Title>
          <SortData />
        </div>
        <Modal.Title className="fs-3 mb-1">Jump to</Modal.Title>
        <div className="align-items-center d-flex flex-wrap justify-content-center mb-4">
          {keyboard.map((keys) => (
            <KeyboardButtons
              key={keys}
              onClick={() => setKey(keys)}
              className={`text-white fs-3 border-0 shadow-none align-items-center d-flex fw-normal justify-content-center m-2 rounded-circle ${key !== keys ? 'bg-dark' : ' bg-primary'}`}
            >
              {keys}
            </KeyboardButtons>
          ))}
        </div>
        <RoundButton
          variant="primary"
          type="submit"
          className="w-100 fs-3 "
        >
          Apply filter
        </RoundButton>
      </Modal.Body>
    </CustomModal>
  );
}

export default FilterModal;
