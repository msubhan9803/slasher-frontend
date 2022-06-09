/* eslint-disable max-lines */
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
import AuthenticatedSiteWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedSiteWrapper';
import RoundButton from '../../components/ui/RoundButton';
import SwitchButtonGroup from '../../components/ui/SwitchButtonGroup';
import DatingInfoSelect from './setup/additional-info/DatingInfoSelect';
import CustomToggleButton from '../../components/ui/CustomToggleButton';
import RemoveProfileDialog from './RemoveProfileDialog';
import {
  educationLevelOptions,
  employmentOptions,
  newToAreaOptions,
  relationshipStatusOptions,
  drinkingOptions,
  smokingOptions,
  parentalStatusOptions,
  religionOptions,
  interestsList,
  bodyTypeOptions,
  tatoosOptions,
} from './setup/additional-info/additional-info-form-options';

interface Images {
  title: string;
  image: string;
  id: number
}
const ImageContainer = styled('div')`
  height: 115px;
  background-color: #1F1F1F;
  border: 2px solid #3A3B46
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
  const [newToArea, setNewToArea] = useState(newToAreaOptions[0].value);
  const [show, setShow] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [message, setMessage] = useState(''); const [interests, setInterests] = useState<Set<string>>(new Set<string>());

  const interestsChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const newSet = new Set<string>(interests);
    if (checked) { newSet.add(value); } else { newSet.delete(value); }
    setInterests(newSet);
  };

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
    <AuthenticatedSiteWrapper>
      <h1 className="h3 mb-5">Edit Dating Profile</h1>
      <Form>
        <Row className="mx-0 mb-5">
          <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">My Photos</h2>
          {imageUpload.map((image, imageIndex) => (
            <Col key={image.id} xs={4} md={2} className="my-3">
              <ImageContainer className="position-relative w-100 rounded border-0">
                {image.image === ''
                  ? (
                    <Form.Label htmlFor={`file-upload-${imageIndex}`} className="align-items-center d-flex form-label h-100 justify-content-center">
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
                        <FontAwesomeIcon onClick={() => { setShow(true); setImgIndex(imageIndex); }} icon={solid('times')} size="xs" className="bg-primary rounded-circle" style={{ padding: '8px 10px' }} />
                        <Form.Label htmlFor={`file-upload-${imageIndex}`} className="d-flex">
                          <FontAwesomeIcon icon={solid('pencil')} size="xs" className="bg-primary p-2 rounded-circle" />
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
        <Row className="mx-0 mb-5">
          <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">My Information</h2>
          <Col xs={12} className="mb-4">
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
          <Col sm={6} className="mb-4">
            <p>I am a</p>
            <Row>
              <Col xs={6} md={5}>
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
              <Col xs={6} md={5}>
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
            <p>My sexual orientation is</p>
            <Form.Select aria-label="Sexual orientation selection" defaultValue="">
              <option value="" disabled>Select One</option>
              <option value="Straight">Straight</option>
              <option value="Gay">Gay</option>
              <option value="Lesbian">Lesbian</option>
              <option value="Bisexual">Bisexual</option>
              <option value="Asexual">Asexual</option>
              <option value="Demisexual">Demisexual</option>
              <option value="Pansexual">Pansexual</option>
              <option value="Queer">Queer</option>
              <option value="Questioning">Questioning</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </Form.Select>
            <p className="mt-2">
              This will display on your profile, unless you choose “Prefer not to
              say”.
            </p>
          </Col>
        </Row>
        <Row className="mx-0 mb-5">
          <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">Appearance</h2>
          <Col xs={12}>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="height"
                  options={[]}
                  label="Height"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="bodyType"
                  options={bodyTypeOptions}
                  label="Body Type"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="tattoos"
                  options={tatoosOptions}
                  label="Tattoos"
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mx-0 mb-5">
          <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">Baisc Info</h2>
          <Col xs={12}>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="relationship"
                  options={relationshipStatusOptions}
                  label="Relationship Status"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="educationLevel"
                  options={educationLevelOptions}
                  label="Education Level"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="employment"
                  options={employmentOptions}
                  label="Employment"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="drinking"
                  options={drinkingOptions}
                  label="Drinking"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="smoking"
                  options={smokingOptions}
                  label="Smoking"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="parentalStatus"
                  options={parentalStatusOptions}
                  label="Parental Status"
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <DatingInfoSelect
                  name="Religion"
                  options={religionOptions}
                  label="Religion"
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mx-0">
          <h2 className="bg-secondary h5 m-0 mb-3 p-3 rounded-3">Interests</h2>
          {interestsList.map((interest: string, index: number) => (
            <Col xs={4} md={2} key={interest}>
              <CustomToggleButton
                id={`interest-${index}`}
                label={interest}
                value={interest}
                checked={interests.has(interest)}
                type="checkbox"
                variant="form"
                className="btn-lg fs-6 my-1 w-100"
                onChange={interestsChangeHandler}
              />
            </Col>
          ))}
          {interestsList.map((check: string, index: number) => (
            <Col xs={6} className="d-block d-md-none" key={check}>
              <Form.Check
                type="checkbox"
                id={`${check} - ${index}`}
                className="mb-2"
                label={check}
              />
            </Col>
          ))}
        </Row>
        <Row>
          <h2 className="mt-5 mb-3">New to area</h2>
          <Col lg={2}>
            <SwitchButtonGroup
              value={newToArea}
              onChange={(val: any) => setNewToArea(val)}
              firstOption={newToAreaOptions[0]}
              secondOption={newToAreaOptions[1]}
            />
          </Col>
        </Row>
        <Row className="justify-content-center mt-5">
          <Col md={4}>
            <RoundButton className="w-100" size="lg">
              Save changes
            </RoundButton>
          </Col>
        </Row>
        <RemoveProfileDialog show={show} setShow={setShow} handleRemoveFile={handleRemoveFile} />
      </Form>
    </AuthenticatedSiteWrapper>
  );
}
export default DatingEditProfile;
