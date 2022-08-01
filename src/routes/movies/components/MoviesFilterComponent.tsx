import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Modal } from 'react-bootstrap';
import MoviesSort from './MoviesSort';
import RoundButton from '../../../components/ui/RoundButton';
import CustomModal from '../../../components/ui/CustomModal';

interface Props {
  showKeys: any;
  setShowKeys: any;
}
const KeyboardButtons = styled(Button)`
  width: 2.5rem;
  height: 2.5rem;
`;
const SmallKeyboardButtons = styled(Button)`
  width: 1.875rem;
  height: 1.875rem;
`;
function MoviesFilterComponent({ showKeys, setShowKeys }: Props) {
  const [keyboard, setKeyboard] = useState<string[]>([]);
  const [key, setKey] = useState<string>('');
  const generateAlphabet = () => {
    const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(i + 97).toUpperCase());
    const number = [...Array(10)].map((_, i) => String.fromCharCode(i + 48));
    setKeyboard(['#', ...number, ...alphabet]);
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
        <Modal.Title className="h2 mx-auto">Filter</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pb-5">
        <div className="d-lg-none mb-4">
          <Modal.Title className="h3 mb-2">Sort</Modal.Title>
          <MoviesSort />
        </div>
        <Modal.Title className="h3 mb-1">Jump to</Modal.Title>
        <div className="align-items-center d-flex flex-wrap justify-content-center">
          {keyboard.slice(0, 11).map((keys) => (
            <SmallKeyboardButtons
              key={keys}
              onClick={() => setKey(keys)}
              className={`border-0 shadow-none align-items-center d-flex fw-normal justify-content-center m-2 me-1 rounded-circle ${key !== keys ? 'bg-dark' : ' bg-primary'}`}
            >
              {keys}
            </SmallKeyboardButtons>
          ))}
        </div>
        <div className="align-items-center d-flex flex-wrap justify-content-center mb-4">
          {keyboard.slice(11, 37).map((keys) => (
            <KeyboardButtons
              key={keys}
              onClick={() => setKey(keys)}
              className={`border-0 shadow-none align-items-center d-flex fw-normal justify-content-center m-2 rounded-circle ${key !== keys ? 'bg-dark' : ' bg-primary'}`}
            >
              {keys}
            </KeyboardButtons>
          ))}
        </div>
        <RoundButton
          variant="primary"
          type="submit"
          className="w-100"
        >
          Apply filter
        </RoundButton>
      </Modal.Body>
    </CustomModal>
  );
}

export default MoviesFilterComponent;
