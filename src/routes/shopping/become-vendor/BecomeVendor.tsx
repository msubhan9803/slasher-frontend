import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import Packages from './Packages';
import ShoppingInformation from './ShoppingInformation';

const ImageContainer = styled.div`
  height: 9.688rem;
  width: 9.688rem;
  border: 1px solid #3A3B46 !important;
  cursor:pointer;
  @media (max-width: 991px) {
    height:8.75rem;
    width:8.75rem;
    background: #1B1B1B;
  }
`;
const AddIcon = styled.div`
  width: 1.329rem;
  height: 1.329rem;
  bottom: -0.35rem;
  right: -0.35rem;
`;
const noteList = [
  'A listing in the Shopping area of Slasher with your logo, description, link to your website, and more.',
  'Create posts and updates about your shop that also appear on the timeline.',
  'People on Slasher can follow your shop and get notifIed of new posts.',
];
function BecomeVendor() {
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
      <div className="bg-dark px-md-4 py-4 rounded-3 bg-mobile-transparent">
        <h1 className="h2 mb-0 fw-bold">Add your shop and reach horror fans on Slasher more easily!</h1>
        <div className="my-3 text-light">
          <p className="mb-0 fs-4">Save time and build your audience by listing your shop.</p>
          <p className="mb-0 fs-4">Here’s what you get:</p>
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
        <div className="d-md-flex h-100 mt-3">
          <div className="me-md-4">
            <label htmlFor="file-upload" className="d-flex justify-content-center">
              {imageUpload.length === 0
                && (
                  <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0 pe-auto">
                    <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
                    <AddIcon className="text-center position-absolute bg-primary text-white rounded-circle">
                      <FontAwesomeIcon
                        icon={solid('plus')}
                        size="sm"
                        role="button"
                      />
                    </AddIcon>
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
                    <AddIcon className="text-center position-absolute bg-white text-primary rounded-circle">
                      <FontAwesomeIcon
                        icon={solid('times')}
                        size="sm"
                        role="button"
                        onClick={() => setImageUpload('')}
                      />
                    </AddIcon>

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
          </div>
          <div className="mt-3 mt-md-0 text-center text-md-start">
            <h3 className="h2 fw-bold">Add logo</h3>
            <p className="fs-5 mb-0 text-light">Recommended size: 180x180 pixels</p>
            <p className="fs-5 text-light">(jpg, png)</p>
          </div>
        </div>
        <h2 className="my-4 pt-2 fw-bold">Shop information</h2>
        <ShoppingInformation
          description={description}
          charCount={charCount}
          handleMessageChange={handleMessageChange}
        />
        <h2 className="my-4 pt-2 fw-bold">Select package</h2>
        <Packages />
        <Row className="mt-5">
          <Col md={4} lg={6} xl={4}>
            <RoundButton className="w-100 p-1 fs-3" size="lg">Submit</RoundButton>
          </Col>
        </Row>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default BecomeVendor;
