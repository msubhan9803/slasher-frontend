/* eslint-disable max-lines */
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button,
  Col, Container, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Country, State } from 'country-state-city';
import { useNavigate } from 'react-router-dom';
import CustomDatePicker from '../../../components/ui/CustomDatePicker';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';
import { suggestEvent, getEventCategoriesOption } from '../../../api/event';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import CustomText from '../../../components/ui/CustomText';
import { sortInPlace } from '../../../utils/text-utils';
import useProgressButton from '../../../components/ui/ProgressButton';
import CustomSelect from '../../../components/filter-sort/CustomSelect';
import { useAppSelector } from '../../../redux/hooks';

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
  'Baker Island',
  'Jarvis Island',
  'Johnston Atoll',
  'Kingman Reef',
  'Midway Atoll',
  'Navassa Island',
  'Palmyra Atoll',
  'United States Minor Outlying Islands',
  'United States Virgin Islands',
  'Wake Island',
  'Howland Island',
  // NOTE: We want to show `District of Columbia` in our list of US states.
  // 'District of Columbia',
];
// eslint-disable-next-line max-len
const filterUndesirableStatesFn = (state: string) => !STATES_TO_REMOVE_FROM_US.map((s) => s.toLowerCase()).includes(state.toLowerCase());

function getStatesbyCountryName(countryName: string) {
  if (!countryName) { return []; }
  const countryIso = Country.getAllCountries().find((c) => c.name === countryName)?.isoCode;
  // If no country iso code found then use `countryName` as `state`
  if (!countryIso) { return [{ value: countryName, label: countryName }]; }
  let statesOfCountry = State.getStatesOfCountry(
    countryIso,
  ).map((state) => state.name);

  if (countryIso === 'US') {
    statesOfCountry = statesOfCountry.filter(filterUndesirableStatesFn);
  }
  // const statesOfCountryBJect =
  // If country has no states then use `countryName` as `state`
  return statesOfCountry.length === 0
    ? [{ value: countryName, label: countryName }]
    : statesOfCountry.map((state) => ({ value: state, label: state }));
}

const COUNTRIES_TO_ADD = ['Trust Territories'];
function getCountries() {
  const fromLibraray = Country.getAllCountries().map((c) => c.name);
  const countries = sortInPlace([...fromLibraray, ...COUNTRIES_TO_ADD]);
  return countries.map((country) => ({ value: country, label: country }));
}

interface Option {
  label: string;
  value: string;
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
  startDate: Date | null;
  endDate: Date | null;
}
type EventFormKeys = keyof EventForm;

const CustomCol = styled(Col)`
  width: 13.125rem !important;
`;
const CustomContainer = styled(Container)`
  background-color: #1B1B1B;
`;

function prettifyErrorMessages(errorMessageList: string[]) {
  return errorMessageList.map((errorMessage) => errorMessage
    .replace('event_type', 'Event category')
    .replace('event_info', 'Event description')
    .replace('name', 'Event name')
    .replace('country', 'Country')
    .replace('state', 'State/Province')
    .replace('address', 'Address')
    .replace('city', 'City')
    .replace('endDate', 'End date')
    .replace('startDate', 'Start date')
    .replace('should not be empty', 'is required'))
    .filter((errorMessage) => !errorMessage.includes('Invalid')) // remove duplicate error message for empty fields
    .sort((a) => (a.includes('Event category') ? -1 : 1)); // make the Event category to appear first in the `errorMessageList`;
}

const INITIAL_EVENTFORM: EventForm = {
  name: '', eventType: '', country: '', state: '', city: '', eventInfo: '', url: '', author: '', address: '', startDate: null, endDate: null,
};

function EventSuggestion() {
  const [charCount, setCharCount] = useState<number>(0);
  const [, setImageUpload] = useState<File | null | undefined>();
  const [loadingEventCategories, setLoadingEventCategories] = useState<boolean>(false);
  const [options, setOptions] = useState<Option[]>([]);
  const userId = useAppSelector((state) => state.user.user.id);
  const [eventForm, setEventForm] = useState<EventForm>(INITIAL_EVENTFORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [isEventSuggestionSuccessful, setIsEventSuggestionSuccessful] = useState(false);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const navigate = useNavigate();

  const resetFormData = () => {
    setImageUpload(undefined);
    setCharCount(0);
    setEventForm({ ...INITIAL_EVENTFORM });
    // NOTE: This is a temporary hack to clear out the image after the submission.  I'm doing this
    // for speed, but we should update the PhotoUploadInput component later so that it takes
    // it value as a prop and can be cleared.
    (document.querySelector('button[aria-label="photo"]') as HTMLButtonElement)?.click();
  };
  const handleChange = useCallback((value: any, key: EventFormKeys) => {
    // Remove event suggestion successful message on getting any user input
    setIsEventSuggestionSuccessful(false);

    if (key === 'country') {
      setEventForm({ ...eventForm, [key]: value, state: '' });
      return;
    }
    setEventForm({ ...eventForm, [key]: value });
  }, [eventForm]);
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    handleChange(e.target.value, 'eventInfo');
  };
  useEffect(() => {
    // Make sure that page is at top when this component is mounted (Issue discussed in SD-961).
    window.scrollTo({
      top: 0,
      behavior: 'instant' as any,
    });
    setLoadingEventCategories(true);
    getEventCategoriesOption().then((res) => {
      setLoadingEventCategories(false);
      const eventCategory = res.data.map(
        (event: any) => ({ value: event._id, label: event.event_name }),
      );
      setOptions(eventCategory);
    }).catch(() => { });
  }, []);
  const onSendEventData = () => {
    const {
      name, eventType, eventInfo, url, city, file, address,
      startDate, endDate, country, state,
    } = eventForm;

    setProgressButtonStatus('loading');
    setIsEventSuggestionSuccessful(false);
    suggestEvent(name, userId || '', eventType, country, state, city, eventInfo, url || '', file, startDate, endDate, address).then(() => {
      setProgressButtonStatus('success');
      setErrors([]);
      resetFormData();
      setIsEventSuggestionSuccessful(true);
    }).catch((error) => {
      setProgressButtonStatus('failure');
      setErrors(prettifyErrorMessages(error.response.data.message));
      setIsEventSuggestionSuccessful(false);
    });
  };

  const requiredFieldElement = (
    <p className="m-0 py-2">
      <span className="text-primary">* </span>
      required
    </p>
  );

  return (
    <div>
      <CustomContainer className="rounded p-lg-4 pb-0 pb-lg-4">
        <Row className="d-lg-none mb-2 bg-dark pt-2 justify-content-between">
          <Col />
          <Col xs="auto"><h2 className="text-center">Suggest event</h2></Col>
          <Col className="ms-2 text-end">
            <Button variant="link" className="p-0 px-1" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={solid('xmark')} size="lg" />
            </Button>
          </Col>
        </Row>
        <Row>
          <Col className="h-100">
            <Row className="h-100">
              <CustomCol xs={12} md={3} className="mx-auto mx-md-0">
                <PhotoUploadInput
                  height="9rem"
                  variant="outline"
                  onChange={(file: File | null | undefined) => {
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

            <CustomSelect
              value={eventForm.eventType}
              onChange={(val) => { handleChange(val, 'eventType'); }}
              placeholder={
                loadingEventCategories ? 'Loading event categories...' : 'Event category'
              }
              options={
                loadingEventCategories
                  ? [{ value: 'disabled', label: 'Loading event categories...' }]
                  : options
              }
              type="form"
            />
            {requiredFieldElement}
          </Col>
          <Col md={6} className="mt-3">
            <Form.Control value={eventForm.name} aria-label="Event name" type="text" placeholder="Event name" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'name')} />
            {requiredFieldElement}
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <Form.Group className="mb-3" controlId="Event description">
              <Form.Control
                maxLength={1000}
                rows={10}
                as="textarea"
                value={eventForm.eventInfo}
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
            <Form.Control value={eventForm.url} aria-label="Event website" type="text" placeholder="Event website" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'url')} />
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3">
            <CustomDatePicker date={eventForm.startDate} setDate={(value: any) => handleChange(value, 'startDate')} label="Start date" />
            {requiredFieldElement}
          </Col>
          <Col md={6} className="mt-3">
            <CustomDatePicker date={eventForm.endDate} setDate={(value: any) => handleChange(value, 'endDate')} label="End date" />
            {requiredFieldElement}
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3">
            <CustomSelect
              value={eventForm.country}
              onChange={(val) => { handleChange(val, 'country'); }}
              placeholder="Country"
              options={getCountries()}
              type="form"
            />
            {requiredFieldElement}
          </Col>
          <Col md={6} className="mt-3">
            <CustomSelect
              value={eventForm.state}
              onChange={(val) => { handleChange(val, 'state'); }}
              placeholder="State/Province"
              options={getStatesbyCountryName(eventForm.country)}
              type="form"
            />
            {requiredFieldElement}
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mt-3">
            <Form.Control value={eventForm.address} aria-label="Street address" type="text" placeholder="Street address" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'address')} />
          </Col>
          <Col md={6} className="mt-3">
            <Form.Control value={eventForm.city} aria-label="City" type="text" placeholder="City" className="fs-4" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'city')} />
            {requiredFieldElement}
          </Col>
        </Row>
        <ErrorMessageList errorMessages={errors} className="mt-4" />
        {isEventSuggestionSuccessful && (
          <Alert variant="info" className="my-4">
            Thank you for your suggestion!
          </Alert>
        )}
        <Row className="my-4 pe-md-5">
          <Col md={5}>
            <ProgressButton label="Send" className="w-100 mb-5 mb-md-0 p-1" onClick={onSendEventData} />
          </Col>
        </Row>
      </CustomContainer>
    </div>
  );
}
export default EventSuggestion;
