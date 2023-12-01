import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import CustomPackages from '../../../components/ui/CustomPackages';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';
import RoundButton from '../../../components/ui/RoundButton';
import ShoppingInformation from './ShoppingInformation';
import SticyBannerAdSpaceCompensation from '../../../components/SticyBannerAdSpaceCompensation';

const noteList = [
  'A listing in the Shopping area of Slasher with your logo, description, link to your website, and more.',
  'Create posts and updates about your shop that also appear on the timeline.',
  'People on Slasher can follow your shop and get notifIed of new posts.',
];
function BecomeVendor() {
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
              <PhotoUploadInput
                height="9.688rem"
                variant="outline"
                onChange={(file) => {
                  setImageUpload(file);
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
          <CustomPackages />
          <Row className="mt-5">
            <Col md={4} lg={6} xl={4}>
              <RoundButton className="w-100 p-1 fs-3" size="lg">Submit</RoundButton>
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

export default BecomeVendor;
