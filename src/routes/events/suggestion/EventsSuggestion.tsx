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
import { Country, State } from 'country-state-city';
import RoundButton from '../../../components/ui/RoundButton';
import CustomDatePicker from '../../../components/ui/CustomDatePicker';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';
import { suggestEvent, getEventCategoriesOption } from '../../../api/event';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import CustomText from '../../../components/ui/CustomText';
import { sortInPlace } from '../../../utils/text-utils';

// NOTE: From the state list of US, we get US states along with US territories.
// We don't want to show US territories as states of US but individual countries.
// https://slasher.atlassian.net/browse/SD-920
const STATES_TO_REMOVE_FROM_US = [
  'American Samoa',
  'Guam',
  'Northern Mariana Islands',
  'Puerto Rico',
  'Trust Territories',
  'Virgin Islands',
];
// eslint-disable-next-line max-len
const filterUndesirableStatesFn = (state: string) => !STATES_TO_REMOVE_FROM_US.map((s) => s.toLowerCase()).includes(state.toLowerCase());

function getStatesbyCountryName(countryName: string): string[] {
  const countryIso = Country.getAllCountries().find((c) => c.name === countryName)?.isoCode;
  // If no country iso code found then use `countryName` as `state`
  if (!countryIso) { return [countryName]; }
  const statesOfCountry = State.getStatesOfCountry(
    countryIso,
  ).map((state) => state.name).filter(filterUndesirableStatesFn);
  // If country has no states then use `countryName` as `state`
  return statesOfCountry.length === 0 ? [countryName] : statesOfCountry;
}

const COUNTRIES_TO_ADD = ['Trust Territories'];
function getCountries() {
  const fromLibraray = Country.getAllCountries().map((c) => c.name);
  return sortInPlace([...fromLibraray, ...COUNTRIES_TO_ADD]);
}

interface Option {
  event_name: string;
  _id: string;
}
interface EventForm {
  name: string;
  eventType: string;
  country: string;
  state: string;
  city: string;
  eventInfo: string;
  url: string;
  author?: string;
  file?: File | null | undefined;
  address: string;
}
type EventFormKeys = keyof EventForm;

const CustomCol = styled(Col)`
  width: 13.125rem !important;
`;
const CustomContainer = styled(Container)`
  background-color: #1B1B1B;
`;

function EventSuggestion() {
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [, setImageUpload] = useState<File | null | undefined>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [optionLoading, setOptionLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<Option[]>([]);
  const userId = Cookies.get('userId');
  const [eventForm, setEventForm] = useState<EventForm>({
    name: '', eventType: '', country: '', state: '', city: '', eventInfo: '', url: '', author: '', address: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const handleChange = (value: any, key: EventFormKeys) => {
    const isUsTerritory = key === 'country' && STATES_TO_REMOVE_FROM_US.map((s) => s.toLowerCase()).includes(value.toLowerCase());
    if (isUsTerritory) {
      // we set state name same as territory name for a `LIST` of US territories
      setEventForm({ ...eventForm, country: value, state: value });
    } else {
      setEventForm({ ...eventForm, [key]: value, state: key === 'country' ? '' : eventForm.state });
    }
  };
  // TODO-SAHIL: Remove this
  Object.assign(window, { eventForm });
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
    } = eventForm;

    suggestEvent(name, userId || '', eventType, country, state, city, eventInfo, url || '', file, startDate, endDate, address).then(() => {
      setErrors([]);
    }).catch((error) => {
      setErrors(error.response.data.message);
    });
  };

  return (
    <div>
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
                <CustomText text="Recommended size: 830x467 pixels" textColor="#A6A6A6" textClass="text-light text-center text-md-start small mb-0" />
                <CustomText text="(jpg, png)" textColor="#A6A6A6" textClass="text-light text-center text-md-start small" />
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
                  <option key={option._id} value={option._id}>{option.event_name}</option>
                ))}
            </Form.Select>
          </Col>
          <Col md={6} className="mt-3">
            <Form.Control aria-label="Event Name" type="text" placeholder="Event Name" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'name')} />
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
                aria-label="Event description"
              />
              <CharactersCounter
                counterClass="float-end fs-4 me-2"
                charCount={charCount}
                totalChar={1000}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Control aria-label="Event website" type="text" placeholder="Event website" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'url')} />
          </Col>
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
          <Col md={6} className="mt-3">
            <Form.Select aria-label="Country" defaultValue="" className="fs-4" onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(e.target.value, 'country')}>
              <option value="" disabled>Country</option>
              {getCountries().map((country) => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6} className="mt-3">
            <Form.Select aria-label="State/Province" defaultValue={eventForm.state} className="fs-4" onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(e.target.value, 'state')}>
              <option value="" disabled>State/Province</option>
              {getStatesbyCountryName(eventForm.country).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3">
            <Form.Control aria-label="Street Address" type="text" placeholder="Street Address" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'address')} />
          </Col>
          <Col md={6} className="mt-3">
            <Form.Control aria-label="City" type="text" placeholder="City" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'city')} />
          </Col>
        </Row>
        <ErrorMessageList errorMessages={errors} className="mt-4" />
        <Row className="my-4 pe-md-5">
          <Col md={5}>
            <RoundButton className="w-100 mb-5 mb-md-0 p-1" size="lg" onClick={() => onSendEventData()}>Send</RoundButton>
          </Col>
        </Row>
      </CustomContainer>
    </div>
  );
}
export default EventSuggestion;
