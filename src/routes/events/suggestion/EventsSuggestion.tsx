/* eslint-disable max-lines */
import React, {
  ChangeEvent,
  useEffect,
  useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Container, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import Cookies from 'js-cookie';
import RoundButton from '../../../components/ui/RoundButton';
import CustomDatePicker from '../../../components/ui/CustomDatePicker';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';
import { suggestEvent, getEventCategoriesOption } from '../../../api/event';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import { stateOptions } from '../../../utils/location-utils';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';

interface Option {
  event_name: string;
  _id: string;
}
interface Value {
  name: string;
  eventType: string;
  country: string;
  state: string;
  city: string;
  eventInfo: string;
  url: string;
  author?: string;
  file?: File | undefined;
  address: string;
}

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
  const [, setImageUpload] = useState<File>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [optionLoading, setOptionLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<Option[]>([]);
  const userId = Cookies.get('userId');
  const [eventSuggestionFormValue, setEventSuggestionFormValue] = useState<Value>({
    name: '', eventType: '', country: '', state: '', city: '', eventInfo: '', url: '', author: '', address: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const handleChange = (value: any, key: string) => {
    const eventSuggestionFormValues = { ...eventSuggestionFormValue };
    (eventSuggestionFormValues as any)[key] = value;
    setEventSuggestionFormValue(eventSuggestionFormValues);
  };
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
    handleChange(e.target.value, 'eventInfo');
  };
  useEffect(() => {
    setOptionLoading(true);
    getEventCategoriesOption().then((res) => {
      setOptionLoading(false);
      setOptions(res.data);
    }).catch(() => { });
  }, []);
  const onSendEventData = () => {
    const {
      name, eventType, country, state, eventInfo, url, city, file, address,
    } = eventSuggestionFormValue;

    suggestEvent(name, userId || '', eventType, country, state, city, eventInfo, url || '', file, startDate, endDate, address).then(() => {
      setErrors([]);
    }).catch((error) => {
      setErrors(error.response.data.message);
    });
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <CustomContainer className="rounded p-md-4 pb-0 pb-md-4">
          <Row className="d-md-none bg-dark pt-2">
            <Col xs="auto" className="ms-2"><FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="2x" /></Col>
            <Col><h2 className="text-center">Event Suggest</h2></Col>
          </Row>
          <Row>
            <Col className="h-100">
              <Row className="h-100">
                <CustomCol xs={12} md={3} className="mx-auto mx-md-0">
                  <PhotoUploadInput
                    height="9rem"
                    variant="outline"
                    onChange={(file) => {
                      setImageUpload(file);
                      handleChange(file, 'file');
                    }}
                    className="w-100"
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
              <Form.Select aria-label="Event Category" defaultValue="" className="fs-4" onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(e.target.value, 'eventType')}>
                <option value="" disabled>Event Category</option>
                {optionLoading ? <option value="" disabled>Loading event categories…</option>
                  : options.map((option: Option) => (
                    /* eslint no-underscore-dangle: 0 */
                    <option key={option._id} value={option._id}>{option.event_name}</option>
                  ))}
              </Form.Select>
            </Col>
            <Col md={6} className="mt-3">
              <Form.Control type="text" placeholder="Event Name" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'name')} />
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
            <Col><Form.Control type="text" placeholder="Event website" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'url')} /></Col>
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
            <Col md={6} className="mt-3"><Form.Control type="text" placeholder="Street Address" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'address')} /></Col>
            <Col md={6} className="mt-3">
              <Form.Control type="text" placeholder="City" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'city')} />
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mt-3">
              <Form.Select aria-label="State/Province" defaultValue="" className="fs-4" onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(e.target.value, 'state')}>
                <option value="" disabled>State/Province</option>
                {stateOptions.map((state) => (
                  <option key={state.value} value={state.value}>{state.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} className="mt-3">
              <Form.Select aria-label="Country" defaultValue="" className="fs-4" onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(e.target.value, 'country')}>
                <option value="" disabled>Country</option>
                <option value="United States">United States</option>
              </Form.Select>
            </Col>
          </Row>
          {errors.length > 0 && <ErrorMessageList errorMessages={errors} className="mt-4" />}
          <Row className="my-4 pe-md-5">
            <Col md={5}>
              <RoundButton className="w-100 mb-5 mb-md-0 p-1" size="lg" onClick={() => onSendEventData()}>Send</RoundButton>
            </Col>
          </Row>
        </CustomContainer>
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}
export default EventSuggestion;
