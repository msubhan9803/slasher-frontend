import React, { useState } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
} from 'react-bootstrap';
import RoundButton from '../../../../components/ui/RoundButton';
import DatingAdditionalInfo from '../../components/DatingAdditionalInfo/DatingAdditionalInfo';
import CustomSelect from '../../../../components/ui/CustomSelect';
import { sexualOrientationOptions } from '../../components/DatingAdditionalInfo/additional-info-form-options';
import DatingPageWrapper from '../../components/DatingPageWrapper';
import ProfilePhotoGallery from '../../components/ProfilePhotoGallery';

interface Images {
  title: string;
  image: string;
  id: number
}

function DatingProfileEdit() {
  const [imageUpload, setImageUpload] = useState<Images[]>([
    { title: '', image: '', id: 1 },
    { title: '', image: '', id: 2 },
    { title: '', image: '', id: 3 },
    { title: '', image: '', id: 4 },
    { title: '', image: '', id: 5 },
    { title: '', image: '', id: 6 },
  ]);
  const [gender, setGender] = useState('male');
  const [message, setMessage] = useState('');

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <DatingPageWrapper>
      <h1 className="h3 mb-5">Edit Dating Profile</h1>
      <Form>
        <Row className="mx-0 mb-5">
          <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">My Photos</h2>
          {imageUpload.map((image, imageIndex) => (
            <Col key={image.id} xs={4} className="my-3">
              <ProfilePhotoGallery
                imageIndex={imageIndex}
                imageUpload={imageUpload}
                setImageUpload={setImageUpload}
                confirmationRemove
              />
            </Col>
          ))}
        </Row>
        <Row className="mx-0 mb-4">
          <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">My Information</h2>
          <Col>
            <Form.Group className="mb-3" controlId="about-me">
              <Form.Label>About Me</Form.Label>
              <Form.Control
                maxLength={1000}
                rows={5}
                as="textarea"
                value={message}
                onChange={handleMessageChange}
                placeholder="Enter Description..."
              />
              <div className="clearfix" />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mx-0 mb-5">
          <Col sm={6} className="mb-4">
            <p>I am a</p>
            <Row>
              <Col xs={6} lg={5}>
                <Button
                  variant="form"
                  size="lg"
                  className="w-100"
                  name="male"
                  active={gender === 'male'}
                  onClick={(e) => setGender((e.target as HTMLButtonElement).name)}
                >
                  Male
                </Button>
              </Col>
              <Col xs={6} lg={5}>
                <Button
                  variant="form"
                  size="lg"
                  className="w-100"
                  name="female"
                  active={gender === 'female'}
                  onClick={(e) => setGender((e.target as HTMLButtonElement).name)}
                >
                  Female
                </Button>
              </Col>
            </Row>
          </Col>
          <Col md={6}>
            <CustomSelect
              name="sexualOrientation"
              options={sexualOrientationOptions}
              label="My sexual orientation is"
            />
            <p className="mt-2">
              This will display on your profile, unless you choose “Prefer not to
              say”.
            </p>
          </Col>
        </Row>
        <DatingAdditionalInfo />
        <Row className="justify-content-center mt-5">
          <Col md={6} lg={5}>
            <RoundButton className="w-100" size="lg">
              Save changes
            </RoundButton>
          </Col>
        </Row>
      </Form>
    </DatingPageWrapper>
  );
}
export default DatingProfileEdit;
