import React, { useState } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
  Image,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import RoundButton from '../../../../components/ui/RoundButton';
import RemoveProfileDialog from './RemoveProfileDialog';
import DatingAdditionalInfo from '../../components/DatingAdditionalInfo/DatingAdditionalInfo';
import CustomSelect from '../../../../components/ui/CustomSelect';
import { sexualOrientationOptions } from '../../components/DatingAdditionalInfo/additional-info-form-options';
import DatingPageWrapper from '../../components/DatingPageWrapper';

interface Images {
  title: string;
  image: string;
  id: number
}
const ImageContainer = styled.div`
  height: 115px;
  background-color: #1F1F1F;
  border: 2px solid #3A3B46;
`;

function DatingEditProfile() {
  const [imageUpload, setImageUpload] = useState<Images[]>([
    { title: '', image: '', id: 1 },
    { title: '', image: '', id: 2 },
    { title: '', image: '', id: 3 },
    { title: '', image: '', id: 4 },
    { title: '', image: '', id: 5 },
    { title: '', image: '', id: 6 },
  ]);
  const [gender, setGender] = useState('male');
  const [show, setShow] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [message, setMessage] = useState('');

  const handleMessageChange = (e: any) => {
    setMessage(e.target.value);
  };

  const handleRemoveFile = () => {
    const newArr = [...imageUpload];
    newArr[imgIndex].image = '';
    setImageUpload(newArr);
    setShow(false);
  };

  const handleFileChange = (e: any, index: number) => {
    if (!e.target) {
      return;
    }
    if (e.target?.name === 'file') {
      const newArr = [...imageUpload];
      const image = URL.createObjectURL(e.target.files[0]);
      newArr[index].image = image;
      setImageUpload(newArr);
    }
  };

  return (
    <DatingPageWrapper>
      <h1 className="h3 mb-5">Edit Dating Profile</h1>
      <Form>
        <Row className="mx-0 mb-5">
          <h2 className="bg-secondary h5 p-3 rounded-3">My Photos</h2>
          {imageUpload.map((image, imageIndex) => (
            <Col key={image.id} xs={4} lg={2} className="my-3">
              <ImageContainer className="position-relative w-100 rounded border-0">
                {image.image === ''
                  ? (
                    <Form.Label role="button" htmlFor={`file-upload-${imageIndex}`} className="align-items-center d-flex form-label h-100 justify-content-center">
                      <FontAwesomeIcon
                        icon={solid('camera')}
                        size="lg"
                        className="text-light bg-primary p-3 rounded-circle "
                      />
                    </Form.Label>
                  )
                  : (
                    <>
                      <div className="position-absolute w-100 d-flex justify-content-between px-1 py-2">
                        <FontAwesomeIcon onClick={() => { setShow(true); setImgIndex(imageIndex); }} icon={solid('times')} size="xs" role="button" className="bg-primary rounded-circle" style={{ padding: '8px 10px' }} />
                        <Form.Label htmlFor={`file-upload-${imageIndex}`} className="d-flex">
                          <FontAwesomeIcon icon={solid('pencil')} size="xs" role="button" className="pe-auto bg-primary p-2 rounded-circle" />
                        </Form.Label>
                      </div>
                      <Image
                        src={image.image}
                        alt="UploadImage.."
                        className="w-100 h-100 img-fluid rounded"
                      />
                    </>
                  )}
                <input
                  key={image.id}
                  id={`file-upload-${imageIndex}`}
                  type="file"
                  name="file"
                  className="d-none"
                  accept="image/*"
                  onChange={(e) => {
                    handleFileChange(e, imageIndex);
                    e.target.value = '';
                  }}
                />
              </ImageContainer>
              <Form.Check
                inline
                label="Make primary photo"
                name="primary-photo"
                type="radio"
                id={`primary-photo-radio-${imageIndex}`}
                className="text-start mt-2"
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
                placeholder="Enter Descriptions..."
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
                  onClick={(e: any) => setGender(e.target.name)}
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
                  onClick={(e: any) => setGender(e.target.name)}
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
        <RemoveProfileDialog show={show} setShow={setShow} handleRemoveFile={handleRemoveFile} />
      </Form>
    </DatingPageWrapper>
  );
}
export default DatingEditProfile;
