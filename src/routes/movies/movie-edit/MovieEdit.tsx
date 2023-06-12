import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';
import RoundButton from '../../../components/ui/RoundButton';
import { StyleButton } from '../../../components/ui/StyleButton';
import MoviesModal from '../components/MoviesModal';
import CustomSelect from '../../../components/filter-sort/CustomSelect';

function MovieEdit() {
  // TODO: If user does not own this movie listing, redirect to details view instead of edit view

  const [show, setShow] = useState(false);
  const [, setImageUpload] = useState<File | null | undefined>();
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setMessage(e.target.value);
  };
  return (
    <div className="bg-dark p-4 rounded-2">
      <Form>

        <div className="mb-4 d-block d-lg-flex align-items-center">
          <div className="d-flex justify-content-center me-lg-4">
            <PhotoUploadInput
              height="9.688rem"
              variant="outline"
              onChange={(file) => {
                setImageUpload(file);
              }}
            />
          </div>
          <div className="text-center text-lg-start mt-4 mt-lg-0">
            <h1 className="h3 mb-2">Upload cover art</h1>
            <div className="d-flex d-lg-block justify-content-center">
              <p className="fs-5 mb-0">
                Recommended size: 600x900 pixels
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
          style={{ resize: 'none' }}
        />
        <CharactersCounter
          counterClass="float-end fs-6 me-2"
          charCount={charCount}
          totalChar={1000}
        />
        <Row className="mt-4">
          <Col lg={6}>
            <Form.Control type="text" placeholder="Release year" className="fs-5 mb-4" />
          </Col>
          <Col lg={6}>
            <Form.Control type="text" placeholder="Country of origin" className="fs-5 mb-4" />
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <Form.Control type="text" placeholder="Movie duration" className="fs-5 mb-4" />
          </Col>
          <Col lg={6}>
            <CustomSelect
              value="Movie rating"
              onChange={() => { }}
              options={[{ value: 'disabled', label: 'Movie rating' }]}
              type="form"
            />
          </Col>
        </Row>
        <h2 className="h2 fw-bold mb-3 mt-2">Trailers</h2>
        <Form.Control type="text" placeholder="Main trailer (YouTube link)" className="fs-5 mb-4" />
        <Form.Control type="text" placeholder="Trailer #2 (YouTube link)" className="fs-5 mb-4" />
        <Form.Control type="text" placeholder="Trailer #3 (YouTube link)" className="fs-5 mb-4" />
        <h2 className="h2 fw-bold mb-3 mt-2">Where to watch</h2>
        <Form.Control type="text" placeholder="Service name  (example: Amazon Prime)" className="fs-5 mb-4" />
        <Form.Control type="text" placeholder="Link" className="fs-5 mb-4" />
        <p className="text-primary h5">+ Add more places to watch</p>
        <h2 className="h2 fw-bold mb-3 mt-4">Top billed cast</h2>
        <div className="mb-4 d-block d-lg-flex align-items-center">
          <div className="d-flex justify-content-center me-lg-4">
            <PhotoUploadInput
              height="9.688rem"
              variant="outline"
              onChange={(file) => {
                setImageUpload(file);
              }}
            />
          </div>
          <div className="text-center text-lg-start mt-4 mt-lg-0">
            <h1 className="h3 mb-2">Add cast member photo</h1>
            <div className="d-flex d-lg-block justify-content-center">
              <p className="fs-5 mb-0 text-light">
                Recommended size: 180x180 pixels
              </p>
              <p className="fs-5 mb-0 text-light">
                (jpg, png)
              </p>
            </div>
          </div>
        </div>
        <Row>
          <Col lg={6}>
            <Form.Control type="text" placeholder="Name" className="fs-5 mb-4" />
          </Col>
          <Col lg={6}>
            <Form.Control type="text" placeholder="Role" className="fs-5 mb-4" />
          </Col>
        </Row>
        <p className="text-primary h5">+ Add more cast members</p>
        <StyleButton className="mt-4 mb-1 d-block d-md-flex justify-content-between align-items-center">
          <RoundButton className="update-btn px-5">Update</RoundButton>
          <RoundButton className="deactivate-btn mt-4 mt-md-0 px-4 bg-black text-white" onClick={() => setShow(true)}>
            Deactivate listing
          </RoundButton>
        </StyleButton>
        <MoviesModal show={show} setShow={setShow} ButtonType="deactivate" />
      </Form>
    </div>
  );
}

export default MovieEdit;
