import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import styled from 'styled-components';
import CustomDatePicker from '../../../components/ui/CustomDatePicker';

const CustomSpan = styled(Form.Text)`
  margin-top: -1.77rem;
  margin-right: .7rem;
`;
function PlaceInformation({
  description, charCount, startDate, setStartDate, endDate, setEndDate, handleMessageChange,
}: any) {
  return (
    <>
      <Row>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Select defaultValue="">
            <option value="" disabled> Category </option>
          </Form.Select>
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Control type="text" placeholder="Place name" className="fs-4" />
        </Col>
      </Row>
      <Form.Group className="mt-3 fs-5" controlId="Overview">
        <Form.Control
          maxLength={113}
          rows={8}
          as="textarea"
          value={description}
          onChange={handleMessageChange}
          placeholder="Description"
          style={{ resize: 'none' }}
          className="fs-4"
        />
        <CustomSpan className="float-end fs-4">{`${charCount}/${113} characters`}</CustomSpan>
      </Form.Group>
      <Form.Control type="text" placeholder="Website" className="fs-4 mt-3" />
      <Row>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <CustomDatePicker date={startDate} setDate={setStartDate} label="Start date (if not open all year)" />
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <CustomDatePicker date={endDate} setDate={setEndDate} label="End date (if not open all year)" />
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Control type="text" placeholder="Street Address" className="fs-4" />
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Control type="text" placeholder="City" className="fs-4" />
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Select defaultValue="">
            <option value="" disabled> State/Province </option>
          </Form.Select>
        </Col>
        <Col md={6} lg={12} xl={6} className="mt-3">
          <Form.Select defaultValue="">
            <option value="" disabled> Country  </option>
          </Form.Select>
        </Col>
      </Row>
    </>
  );
}

export default PlaceInformation;
