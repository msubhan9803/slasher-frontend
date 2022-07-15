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
  width: 6.25rem;
  height: 6.25rem;
  background-color: #1F1F1F;
  border: 0.125rem solid #3A3B46
`;
const UploadImageContainer = styled.div`
  height: 12.5rem;
  background-color: #1F1F1F;
  border: .063rem solid #3A3B46
`;
const CustomSpan = styled(Form.Text)`
  margin-top: -1.43rem;
  margin-right: .5rem;
`;
function EventSuggestion() {
  const stratDateRef = useRef() as MutableRefObject<HTMLInputElement>;
  const endDateRef = useRef() as MutableRefObject<HTMLInputElement>;
  const inputFile = useRef<HTMLInputElement>(null);
  const [uploadEventPost, setUploadEventPost] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  };
  const handleFileChange = (eventImage: ChangeEvent<HTMLInputElement>) => {
    if (!eventImage.target) return;
    if (eventImage.target.name === 'eventPost' && eventImage.target && eventImage.target.files) {
      const uploadEventPostList = [...uploadEventPost];
      const fileList = eventImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        const image = URL.createObjectURL(eventImage.target.files[list]);
        uploadEventPostList.push(image);
      }
      setUploadEventPost(uploadEventPostList);
    }
  };
  const handleRemoveFile = (eventImage: string) => {
    const removePostImage = uploadEventPost.filter((image) => image !== eventImage);
    setUploadEventPost(removePostImage);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <h1 className="h4 d-md-block d-none">Suggest Event</h1>
      <Container style={{ backgroundColor: '#1F1F1F' }} className="rounded p-4">
        <Row className="justify-content-between">
          <Col xs={12} className="mb-3 mb-md-0">
            <input
              type="file"
              name="eventPost"
              className="d-none"
              accept="image/*"
              onChange={(eventPost) => {
                handleFileChange(eventPost);
              }}
              multiple
              ref={inputFile}
            />
            <UploadImageContainer onClick={() => inputFile.current?.click()} className="d-flex flex-column justify-content-center align-items-center w-100 rounded">
              <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
              <p>Upload event photos</p>
            </UploadImageContainer>
          </Col>
        </Row>
        <Row className="h-100">
          {uploadEventPost.length > 0 && (
            <Row className=" mt-3  d-md-flex">
              {uploadEventPost.map((eventPost: string) => (
                <Col key={eventPost} className="mb-3" xs="auto">
                  <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0">
                    <Image
                      src={eventPost}
                      alt="Event photograph"
                      className="w-100 h-100 img-fluid rounded"
                    />
                    <FontAwesomeIcon
                      icon={solid('times')}
                      size="xs"
                      role="button"
                      className="position-absolute bg-white text-primary rounded-circle"
                      style={{
                        padding: '0.313rem 0.438rem',
                        top: '5.313rem',
                        left: '5.313rem',
                      }}
                      onClick={() => handleRemoveFile(eventPost)}
                    />
                  </ImageContainer>
                </Col>
              ))}
            </Row>
          )}
        </Row>
        <Row>
          <Col xs={12} md={6} className="mt-3">
            <Form.Select aria-label="Event Category" defaultValue="">
              <option value="" disabled>
                Event Category
              </option>
            </Form.Select>
          </Col>
          <Col xs={12} md={6} className="mt-3">
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
              />
              <CustomSpan className="float-end">
                {`${charCount}/${1000} characters`}
              </CustomSpan>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Control type="text" placeholder="Event Website" />
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6} className="mt-3">
            <CustomDatePicker
              placeholder="Start Date"
              type="text"
              ref={stratDateRef}
              onFocus={() => { (stratDateRef.current.type = 'date'); }}
              onBlur={() => { (stratDateRef.current.type = 'text'); }}
            />
          </Col>
          <Col xs={12} md={6} className="mt-3">
            <CustomDatePicker
              placeholder="End Date"
              type="text"
              ref={endDateRef}
              onFocus={() => { (endDateRef.current.type = 'date'); }}
              onBlur={() => { (endDateRef.current.type = 'text'); }}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6} className="mt-3">
            <Form.Select aria-label="Country" defaultValue="">
              <option value="" disabled>
                Country
              </option>
            </Form.Select>
          </Col>
          <Col xs={12} md={6} className="mt-3">
            <Form.Select aria-label="State/Province" defaultValue="">
              <option value="" disabled>
                State/Province
              </option>
            </Form.Select>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6} className="mt-3">
            <Form.Control type="text" placeholder="City" />
          </Col>
          <Col xs={12} md={6} className="mt-3">
            <Form.Control type="text" placeholder="Street Address" />
          </Col>
        </Row>
        <Row className="justify-content-center my-5">
          <Col md={6} lg={5}>
            <RoundButton className="w-100" size="lg">
              Send
            </RoundButton>
          </Col>
        </Row>
      </Container>
    </AuthenticatedPageWrapper>
  );
}
export default EventSuggestion;
