import React, {
  useState, ChangeEvent,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Container, Form, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import CustomDatePicker from '../../../components/ui/CustomDatePicker';

const ImageContainer = styled.div`
  height: 12.5rem;
  width:12.5rem;
  background-color: #1F1F1F;
  border: 2px solid #3A3B46;
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
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [imageUpload, setImageUpload] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
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
      <CustomContainer className="rounded p-md-4 pb-0 pb-md-4">
        <Row className="d-md-none bg-dark pt-2">
          <Col xs="auto" className="ms-2"><FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="2x" /></Col>
          <Col><h2 className="text-center">Event Suggest</h2></Col>
        </Row>
        <Row>
          <Col className="h-100">
            <Row className="h-100">
              <CustomCol xs={12} md={3} className="mx-auto mx-md-0">
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
              <Col xs={12} md={7}>
                <h2 className="text-center text-md-start  mb-1 mt-3 mt-md-0">Add Photo</h2>
                <CustomText className="text-light text-center text-md-start small mb-0">Recommended size: 830x467 pixels</CustomText>
                <CustomText className="text-light text-center text-md-start small ">(jpg, png)</CustomText>
              </Col>
            </Row>
          </Col>
        </Row>
        <h2 className="d-md-block mt-4">Event Information</h2>
        <Row>
          <Col md={6} className="mt-3">
            <Form.Select aria-label="Event Category" defaultValue="" className="fs-4">
              <option value="" disabled>Event Category</option>
            </Form.Select>
          </Col>
          <Col md={6} className="mt-3">
            <Form.Control type="text" placeholder="Event Name" className="fs-4" />
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
                className="fs-4"
              />
              <CustomSpan className="float-end fs-4">{`${charCount}/${1000} characters`}</CustomSpan>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col><Form.Control type="text" placeholder="Event website" className="fs-4" /></Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3">
            <CustomDatePicker date={startDate} setDate={setStartDate} label="Start date" />
          </Col>
          <Col md={6} className="mt-3">
            <CustomDatePicker date={endDate} setDate={setEndDate} label="End date" />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3"><Form.Control type="text" placeholder="Street Address" className="fs-4" /></Col>
          <Col md={6} className="mt-3">
            <Form.Control type="text" placeholder="City" className="fs-4" />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3">
            <Form.Select aria-label="State/Province" defaultValue="" className="fs-4">
              <option value="" disabled>State/Province</option>
            </Form.Select>
          </Col>
          <Col md={6} className="mt-3">
            <Form.Select aria-label="Country" defaultValue="" className="fs-4">
              <option value="" disabled>Country</option>
            </Form.Select>
          </Col>
        </Row>
        <Row className="my-4 pe-md-5">
          <Col md={5}>
            <RoundButton className="w-100 mb-5 mb-md-0 p-1" size="lg">Send</RoundButton>
          </Col>
        </Row>
      </CustomContainer>
    </AuthenticatedPageWrapper>
  );
}
export default EventSuggestion;
