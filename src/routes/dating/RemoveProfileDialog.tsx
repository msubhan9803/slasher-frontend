import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Modal,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import ModalContainer from '../../components/ui/CustomModal';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  handleRemoveFile: (value: any) => void;
}

function RemoveProfileDialog({ show, setShow, handleRemoveFile }: Props) {
  return (
    <ModalContainer
      show={show}
      centered
    >
      <Modal.Body className="d-flex flex-column align-items-center text-center py-5">
        <FontAwesomeIcon
          icon={solid('xmark')}
          size="3x"
          className="px-3 py-2 mb-4 rounded-circle border border-primary text-primary"
        />
        <h2 className="h3">
          Are you sure
          <br />
          you want to delete this image?
        </h2>
        <Row className="mt-3 px-4 w-100">
          <Col xs={6}>
            <Button size="lg" className="w-100 bg-light border-light text-dark" onClick={() => setShow(false)}>Cancel</Button>
          </Col>
          <Col xs={6}>
            <Button size="lg" className="w-100" onClick={handleRemoveFile}>Delete</Button>
          </Col>
        </Row>
      </Modal.Body>
    </ModalContainer>
  );
}

export default RemoveProfileDialog;
