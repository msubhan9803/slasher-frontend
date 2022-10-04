import React, {
  useState,
} from 'react';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import CustomDatePicker from '../../../components/ui/CustomDatePicker';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';

const CustomSpan = styled(Form.Text)`
  margin-top: -1.43rem;
  margin-right: .5rem;
`;
const CustomCol = styled(Col)`
  width: 13.125rem !important;
`;
const CustomText = styled.p`
  color: #A6A6A6
`;
const StyleButton = styled.div`
  .deactivate-btn {
    border: 1px solid #3A3B46;
  &:hover {
    border: 1px solid #3A3B46;
    }
  }
  @media (max-width: 767px) {
    .update-btn{
      width: 100%;
    }
    .deactivate-btn{
      width: 100%;
    }
  }
`;
function PlacesEdit() {
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [, setImageUpload] = useState<File>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  };
  return (
    <div className="bg-dark bg-mobile-transparent p-md-4 pb-0 pb-md-4 mt-3">
      <Row>
        <Col className="h-100">
          <Row className="h-100">
            <CustomCol xs={12} md={3} className="mx-auto mx-md-0">
              <PhotoUploadInput
                height="9.688rem"
                variant="outline"
                onChange={(file) => {
                  setImageUpload(file);
                }}
                className="w-100"
              />
            </CustomCol>
            <Col xs={12} md={7}>
              <h2 className="text-center text-md-start  mb-1 mt-3 ms-3 mt-md-0">Change cover photo</h2>
              <CustomText className="text-light text-center text-md-start ms-3 fs-5 mb-0">Recommended size: 830x467 pixels</CustomText>
              <CustomText className="text-light text-center text-md-start ms-3 fs-5">(jpg, png)</CustomText>
            </Col>
          </Row>
        </Col>
      </Row>
      <h2 className="d-md-block mt-4">Place information</h2>
      <Row>
        <Col md={6} className="mt-3">
          <Form.Select aria-label="Category" defaultValue="" className="fs-4">
            <option value="" disabled>Category</option>
          </Form.Select>
        </Col>
        <Col md={6} className="mt-3">
          <Form.Control type="text" placeholder="Business name" className="fs-4" />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Form.Group className="mb-3" controlId="Place description">
            <Form.Control
              maxLength={1000}
              rows={7}
              as="textarea"
              value={description}
              onChange={handleMessageChange}
              placeholder="Place description"
              style={{ resize: 'none' }}
              className="fs-4"
            />
            <CustomSpan className="float-end fs-4">{`${charCount}/${1000} characters`}</CustomSpan>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col><Form.Control type="text" placeholder="Website" className="fs-4" /></Col>
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
        <Col md={6} className="mt-3"><Form.Control type="text" placeholder="Street" className="fs-4" /></Col>
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
      <StyleButton className="mt-4 mb-1 d-block d-md-flex justify-content-between align-items-center">
        <RoundButton className="update-btn fs-3 fw-bold px-5">Update place</RoundButton>
        <RoundButton className="deactivate-btn mt-4 mt-md-0 fs-3 fw-bold px-4 bg-black text-white">
          Deactivate listing
        </RoundButton>
      </StyleButton>
    </div>
  );
}
export default PlacesEdit;
