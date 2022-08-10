import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, useState } from 'react';
import {
  Col, Form, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';

const ImageContainer = styled.div`
  height: 9.688rem;
  width: 9.688rem;
  border: 1px solid #3A3B46 !important;
  cursor:pointer;import { Form } from 'react-bootstrap';


  @media (max-width: 991px) {
    height:8.75rem;
    width:8.75rem;
    background: #1B1B1B;
  }
`;
const AddIcon = styled(FontAwesomeIcon)`
  padding: 0.25rem 0.313rem;
  top: 8.62rem;
  left: 8.62rem;

  @media (max-width: 991px) {
    padding: 0.25rem 0.313rem;
    top: 7.62rem;
    left: 7.62rem;
  }
`;
const CustomText = styled.p`
  color: #A6A6A6;
`;
const Text = styled.p`
  color: #DBDBDB;
`;
const CustomSpan = styled(Form.Text)`
  margin-top: -1.89rem;
  margin-right: .75rem;
`;

const noteList = [
  'A listing in the book database with your cover art, description, link to buy your book, and more.',
  'A second listing in the Slasher Indie section.',
  'Create posts and updates about your book that also appear on the timeline.',
  'People on Slasher can follow your book and get notifIed of new posts.',
];
function AddYourBook() {
  const [imageUpload, setImageUpload] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target) return;
    if (e.target?.name === 'file' && e?.target?.files?.length) {
      setImageUpload(URL.createObjectURL(e.target.files[0]));
      e.target.value = '';
    }
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <div className="bg-dark px-md-4 py-4 py-md-5 rounded-3 bg-mobile-transparent">
        <div className="d-flex justify-content-between">
          <p className="mb-0 fs-4 text-light">Add your book and reach horror fans looking for books on Slasher!</p>
          <div className="d-none d-md-block">
            <span className="text-primary h2">$20.00</span>
            <small className="text-light">/month</small>
          </div>
        </div>
        <div className="my-3">
          <Text className="mb-0 fs-4">Save time and build your audience by listing your books.</Text>
          <Text className="mb-0 fs-4">Here’s what you get:</Text>
        </div>
        <div>
          {noteList.map((notes: string) => (
            <div className="d-flex" key={notes}>
              <FontAwesomeIcon role="button" icon={solid('check')} size="sm" className="text-primary pe-2 mt-1" />
              <p className="fs-4 text-light">
                {notes}
              </p>
            </div>
          ))}
        </div>
        <div className="d-block d-sm-none">
          <span className="text-primary h2">$20.00</span>
          <span className="text-light fs-5">/month</span>
        </div>
        <Row className="h-100 mt-5 mt-sm-3">
          <Col xs={12} md="auto">
            <label htmlFor="file-upload" className="d-flex justify-content-center">
              {imageUpload.length === 0
                && (
                  <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0 pe-auto">
                    <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
                    <AddIcon
                      icon={solid('plus')}
                      size="sm"
                      role="button"
                      className="position-absolute bg-primary text-white rounded-circle"
                    />
                  </ImageContainer>
                )}
            </label>
            <div className="d-flex justify-content-center">
              {imageUpload.length > 0
                && (
                  <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0">
                    <Image
                      src={imageUpload}
                      alt="Dating profile photograph"
                      className="w-100 h-100 img-fluid rounded"
                    />
                    <AddIcon
                      icon={solid('times')}
                      size="sm"
                      role="button"
                      className="position-absolute bg-white text-primary rounded-circle"
                      onClick={() => setImageUpload('')}
                    />
                  </ImageContainer>
                )}
            </div>
            <input
              id="file-upload"
              type="file"
              name="file"
              className="d-none"
              accept="image/*"
              onChange={(e) => {
                handleFileChange(e);
              }}
            />
            <h3 className="text-center mb-1 mt-3">Upload cover art</h3>
            <CustomText className="text-center fs-5 mb-0">Recommended size:</CustomText>
            <CustomText className="text-center fs-5 ">240x360 pixels (jpg, png)</CustomText>
          </Col>
          <Col>
            <Row>
              <Col>
                <Form.Control type="text" placeholder="Title" className="fs-5" />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Form.Group className="mb-3 fs-5" controlId="Overview">
                  <Form.Control
                    maxLength={1000}
                    rows={5}
                    as="textarea"
                    value={description}
                    onChange={handleMessageChange}
                    placeholder="Overview"
                    style={{ resize: 'none' }}
                    className="fs-5"
                  />
                  <CustomSpan className="float-end fs-5">{`${charCount}/${1000} characters`}</CustomSpan>
                </Form.Group>
              </Col>
            </Row>
            <Form.Control type="text" placeholder="Year" className="fs-5" />
            <Form.Control type="text" placeholder="Where to buy (Website link)" className="mt-3 fs-5" />
            <p className="my-4 fs-5">You can add more details later on the “Edit book” screen.</p>
            <Row>
              <Col md={4} lg={6} xl={4} className="mt-1">
                <RoundButton className="w-100 p-1 fs-3" size="lg">Submit</RoundButton>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default AddYourBook;
