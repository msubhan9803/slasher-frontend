import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {
  useState, useRef, MutableRefObject, ChangeEvent,
} from 'react';
import {
  Col, Container, Form, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';

const CustomDatePicker = styled(Form.Control)`
  color-scheme: dark;
`;
const ImageContainer = styled.div`
  height: 12.5rem;
  width:12.5rem;
  background-color: #1F1F1F;
  border: 0.125rem solid #3A3B46;
  cursor:pointer;
`;
const CustomSpan = styled(Form.Text)`
  margin-top: -1.43rem;
  margin-right: .5rem;
`;
const CustomCol = styled(Col)`
  width: 13.125rem !important;
`;
const CustomContainer = styled(Container)`
  background-color: #1B1B1B;
`;
const CustomText = styled.p`
  color: #A6A6A6
`;
function EventSuggestion() {
  const stratDateRef = useRef() as MutableRefObject<HTMLInputElement>;
  const endDateRef = useRef() as MutableRefObject<HTMLInputElement>;
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [imageUpload, setImageUpload] = useState<string>('');
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
      <h1 className="h4 d-md-block d-none">Suggest Event</h1>
      <CustomContainer className="rounded p-4">
        <Row className="align-items-center d-md-none mb-3">
          <Col xs={2}>
            <FontAwesomeIcon icon={solid('arrow-left')} size="lg" className="text-light rounded-circle text-start" />
          </Col>
          <Col xs={8}>
            <h3 className="h4 text-center my-0">Event Suggestion</h3>
          </Col>
        </Row>
        <Row>
          <Col className="h-100">
            <Row className="h-100">
              <CustomCol xs={7} md={3} className="ms-4 ms-md-0">
                <label htmlFor="file-upload" className="d-inline">
                  {imageUpload.length === 0
                    && (
                      <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0 pe-auto">
                        <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
                        <FontAwesomeIcon
                          icon={solid('plus')}
                          size="sm"
                          role="button"
                          className="position-absolute bg-primary text-white rounded-circle"
                          style={{ padding: '0.313rem 0.438rem', top: '11.62rem', left: '11.62rem' }}
                        />
                      </ImageContainer>
                    )}
                </label>
                {imageUpload.length > 0
                  && (
                    <ImageContainer className="position-relative d-flex align-items-center rounded border-0">
                      <Image
                        src={imageUpload}
                        alt="Dating profile photograph"
                        className="w-100 h-100 img-fluid rounded"
                      />
                      <FontAwesomeIcon
                        icon={solid('times')}
                        size="sm"
                        role="button"
                        className="position-absolute bg-white text-primary rounded-circle"
                        style={{ padding: '0.313rem 0.438rem', top: '11.62rem', left: '11.62rem' }}
                        onClick={() => setImageUpload('')}
                      />
                    </ImageContainer>
                  )}
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
              </CustomCol>
              <Col>
                <h3 className="text-center text-md-start h5 mb-1 mt-1 mt-md-0">Add Photo</h3>
                <CustomText className="text-light text-center text-md-start small mb-0">Recommended size: 830x300 pixels</CustomText>
                <CustomText className="text-light text-center text-md-start small ">(Jpg, Png)</CustomText>
              </Col>
            </Row>
          </Col>
        </Row>
        <h2 className="h4 d-md-block mt-4">Event Information</h2>
        <Row>
          <Col md={6} className="mt-3">
            <Form.Select aria-label="Event Category" defaultValue="">
              <option value="" disabled>Event Category</option>
            </Form.Select>
          </Col>
          <Col md={6} className="mt-3">
            <Form.Control type="text" placeholder="Event Name" />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <Form.Group className="mb-3" controlId="Event description">
              <Form.Control
                maxLength={1000}
                rows={10}
                as="textarea"
                value={description}
                onChange={handleMessageChange}
                placeholder="Event description"
                style={{ resize: 'none' }}
              />
              <CustomSpan className="float-end">{`${charCount}/${1000} characters`}</CustomSpan>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col><Form.Control type="text" placeholder="Event Website" /></Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3">
            <CustomDatePicker
              placeholder="Start Date"
              type="text"
              ref={stratDateRef}
              onFocus={() => { (stratDateRef.current.type = 'date'); }}
              onBlur={() => { (stratDateRef.current.type = 'date'); }}
            />
          </Col>
          <Col md={6} className="mt-3">
            <CustomDatePicker
              placeholder="End Date"
              type="text"
              ref={endDateRef}
              onFocus={() => { (endDateRef.current.type = 'date'); }}
              onBlur={() => { (endDateRef.current.type = 'date'); }}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3"><Form.Control type="text" placeholder="Street Address" /></Col>
          <Col md={6} className="mt-3">
            <Form.Control type="text" placeholder="City" />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3">
            <Form.Select aria-label="State/Province" defaultValue="">
              <option value="" disabled>State/Province</option>
            </Form.Select>
          </Col>
          <Col md={6} className="mt-3">
            <Form.Select aria-label="Country" defaultValue="">
              <option value="" disabled>Country</option>
            </Form.Select>
          </Col>
        </Row>
        <Row className="my-4 pe-md-5">
          <Col md={6}>
            <RoundButton className="w-100 mb-5 mb-md-0" size="lg">Send</RoundButton>
          </Col>
        </Row>
      </CustomContainer>
    </AuthenticatedPageWrapper>
  );
}
export default EventSuggestion;
