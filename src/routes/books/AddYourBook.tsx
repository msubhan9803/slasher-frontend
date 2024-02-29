import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import CharactersCounter from '../../components/ui/CharactersCounter';
import CustomText from '../../components/ui/CustomText';
import PhotoUploadInput from '../../components/ui/PhotoUploadInput';
import RoundButton from '../../components/ui/RoundButton';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';

const noteList = [
  'A listing in the book database with your cover art, description, link to buy your book, and more.',
  'A second listing in the Slasher Indie section.',
  'Create posts and updates about your book that also appear on the timeline.',
  'People on Slasher can follow your book and get notifIed of new posts.',
];
function AddYourBook() {
  const [, setImageUpload] = useState<File | null | undefined>();
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="bg-dark px-md-4 py-4 py-md-5 rounded-3 bg-mobile-transparent">
          <div className="d-flex justify-content-between">
            <p className="mb-0 fs-4 text-light">Add your book and reach horror fans looking for books on Slasher!</p>
            <div className="d-none d-md-block">
              <span className="text-primary h2">$20.00</span>
              <small className="text-light">/month</small>
            </div>
          </div>
          <div className="my-3">
            <CustomText text="Save time and build your audience by listing your books." textColor="#DBDBDB" textClass="mb-0 fs-4" />
            <CustomText text="Here’s what you get:" textColor="#DBDBDB" textClass="mb-0 fs-4" />
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
              <PhotoUploadInput
                height="9.688rem"
                variant="outline"
                onChange={(file) => {
                  setImageUpload(file);
                }}
              />
              <h3 className="text-center mb-1 mt-3">Upload cover art</h3>
              <CustomText text="Recommended size:" textColor="#A6A6A6" textClass="text-center fs-5 mb-0" />
              <CustomText text="240x360 pixels (jpg, png)" textColor="#A6A6A6" textClass="text-center fs-5" />
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
                    <CharactersCounter
                      counterClass="float-end fs-5 me-2"
                      charCount={charCount}
                      totalChar={1000}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Control type="text" placeholder="Year" className="fs-5" />
              <Form.Control type="text" placeholder="Where to buy (Website link)" className="mt-3 fs-5" />
              <p className="my-4 fs-5">You can add more details later on the “Edit book” screen.</p>
              <Row>
                <Col md={4} lg={6} xl={4} className="mt-1">
                  <RoundButton className="w-100 fs-3" size="lg">Submit</RoundButton>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default AddYourBook;
