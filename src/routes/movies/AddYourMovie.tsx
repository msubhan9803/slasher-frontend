import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';
import PhotoUploadInput from '../../components/ui/PhotoUploadInput';

const CustomText = styled.p`
  color: #A6A6A6;
`;
const Text = styled.p`
  color: #DBDBDB;
`;
const CustomSpan = styled(Form.Text)`
  margin-top: -1.43rem;
  margin-right: .5rem;
`;

const noteList = [
  'A listing in the movie database with your cover art, description, trailers, and more.',
  'A second listing in the Slasher Indie section.',
  'Create posts and updates about your movie that also appear on the timeline.',
  'People on Slasher can follow your movie and get notifIed of new posts.',
];
function AddYourMovie() {
  const [, setImageUpload] = useState<File>();
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Row className="d-md-none pt-2">
        <Col xs="auto" className="ms-2"><FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="2x" /></Col>
        <Col><h1 className="text-center mb-0 h2">Add your movie</h1></Col>
      </Row>
      <div className="bg-dark px-md-4 py-4 py-md-5 rounded-3 bg-mobile-transparent">
        <div className="d-flex justify-content-between">
          <h2 className="mb-0">Add your movie and reach horror fans looking for movies on Slasher!</h2>
          <div className="d-none d-md-block">
            <span className="text-primary h2">$20.00</span>
            <small className="text-light">/month</small>
          </div>
        </div>
        <div className="my-3">
          <Text className="mb-0 fs-4">Save time and build your audience by listing your movies.</Text>
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
        <div className="d-block d-md-none">
          <span className="text-primary h2">$20.00</span>
          <small className="text-light">/month</small>
        </div>
        <Row className="h-100 mt-5 mt-md-3">
          <Col xs={12} md="auto">
            <PhotoUploadInput
              height="9.688rem"
              variant="outline"
              onChange={(file) => {
                setImageUpload(file);
              }}
            />
            <h3 className="text-center mb-1 mt-3">Upload cover art</h3>
            <CustomText className="text-center fs-5 mb-0">Recommended size:</CustomText>
            <CustomText className="text-center fs-5 ">600x900 pixels (Jpg, Png)</CustomText>
          </Col>
          <Col>
            <Row>
              <Col>
                <Form.Control type="text" placeholder="Title" className="fs-4" />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Form.Group className="mb-3 fs-5" controlId="Overview">
                  <Form.Control
                    maxLength={113}
                    rows={6}
                    as="textarea"
                    value={description}
                    onChange={handleMessageChange}
                    placeholder="Overview"
                    style={{ resize: 'none' }}
                    className="fs-4"
                  />
                  <CustomSpan className="float-end fs-5">{`${charCount}/${113} characters`}</CustomSpan>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Control type="text" placeholder="Movie trailer (YouTube link)" className="fs-5" />
              </Col>
            </Row>
            <p className="my-4 fs-4">You can add more details later on the “Edit movie” screen.</p>
            <Row>
              <Col md={4} className="mt-1">
                <RoundButton className="w-100 p-1 fs-3" size="lg">Submit</RoundButton>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </AuthenticatedPageWrapper>
  );
}
export default AddYourMovie;
