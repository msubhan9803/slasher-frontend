import React, { useState } from 'react';
import styled from 'styled-components';
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
import { Heading, Section } from '../../components/styledUtils';

interface Images {
  title: string;
  image: string;
  id: number
}
const HEADING = 'bg-secondary h2 m-0 mb-3 p-3 rounded-3';
const SECTION_INNER = 'row gx-3 mx-auto';

const ResponsiveContainer = styled.div`
  padding-left: 0px;
  padding-right: 0px;
  @media (min-width: 991px){
    padding-left: 50px;
    padding-right: 50px;
  }
`;

const Title = styled.h1`
  margin-bottom: 30px;
`;

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
      <ResponsiveContainer>
        <Title className="h1">Edit Dating Profile</Title>
        <Form>
          <Row className="mx-0 mb-5">
            <Heading className={HEADING}>My Photos</Heading>
            <Section className={SECTION_INNER}>
              {imageUpload.map((image, imageIndex) => (
                <Col key={image.id} xs={4} className="my-3">
                  <ProfilePhotoGallery
                    imageIndex={imageIndex}
                    imageUpload={imageUpload}
                    setImageUpload={setImageUpload}
                    confirmationRemove={false}
                    isSlim
                  />
                </Col>
              ))}
            </Section>

          </Row>
          <Row className="mx-0 mb-4">
            <h2 className={HEADING}>My Information</h2>
            <Section className={SECTION_INNER}>
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
            </Section>

            <Row className="">
              <Section className={SECTION_INNER}>
                <Col sm={6} lg={12} xl={6} className="mb-4">
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
                <Col md={6} lg={12} xl={6}>
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
              </Section>
            </Row>
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
      </ResponsiveContainer>
    </DatingPageWrapper>
  );
}
export default DatingProfileEdit;
