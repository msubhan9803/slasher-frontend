import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import BooksModal from '../components/BooksModal';
import UploadCoverArt from './UploadCoverArt';

const StyleButton = styled.div`
  .deactivate-btn {
    border: 1px solid #3A3B46;
  &:hover {
    border: 1px solid #3A3B46;
    }
  }
  @media (max-width: 767px) {
    .update-btn{
      width: 100%;
    }
    .deactivate-btn{
      width: 100%;
    }
  }
`;
const CustomForm = styled(Form)`
  .form-control {
    resize: none;
  }
`;

function BookEdit() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setMessage(e.target.value);
  };
  return (
    <div className="bg-dark bg-mobile-transparent mt-md-4 p-4 rounded-2">
      <CustomForm>
        <div className="mb-4 d-block d-lg-flex align-items-center">
          <div className="d-flex justify-content-center me-lg-4">
            <UploadCoverArt id="cover-art" />
          </div>
          <div className="text-center text-lg-start mt-4 mt-lg-0">
            <h1 className="h3 mb-2">Upload cover art</h1>
            <div className="d-flex text-light d-lg-block justify-content-center">
              <p className="fs-5 mb-0">
                Recommended size: 300x360 pixels
              </p>
              <p className="fs-5 mb-0">
                (jpg, png)
              </p>
            </div>
          </div>
        </div>
        <Form.Control type="text" placeholder="Title" className="fs-5 mb-4" />
        <Form.Control
          maxLength={1000}
          rows={4}
          as="textarea"
          value={message}
          onChange={handleMessageChange}
          placeholder="Overview"
          className="fs-5"
        />
        <Form.Text className="float-end fs-6" style={{ marginTop: '-25px', marginRight: '10px' }}>
          {`${charCount}/1000 characters`}
        </Form.Text>
        <Row className="mt-4">
          <Col lg={6}>
            <Form.Control type="text" placeholder="Year" className="fs-5 mb-4" />
          </Col>
          <Col lg={6}>
            <Form.Control type="text" placeholder="Author" className="fs-5 mb-4" />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <Form.Control type="text" placeholder="Number of pages" className="fs-5 mb-4" />
          </Col>
          <Col lg={6}>
            <Form.Control type="text" placeholder="ISBN" className="fs-5 mb-4" />
          </Col>
        </Row>
        <Form.Control type="text" placeholder="Where to buy (Website link)" className="fs-5 mb-4" />
        <StyleButton className="mt-4 mb-1 d-block d-md-flex justify-content-between align-items-center">
          <RoundButton className="update-btn fs-3 fw-bold px-5">Update</RoundButton>
          <RoundButton className="deactivate-btn mt-4 mt-md-0 fs-3 fw-bold px-4 bg-black text-white" onClick={() => setShow(true)}>
            Deactivate listing
          </RoundButton>
        </StyleButton>
        <BooksModal show={show} setShow={setShow} ButtonType="deactivate" />
      </CustomForm>
    </div>
  );
}

export default BookEdit;
