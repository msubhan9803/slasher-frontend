/* eslint-disable max-lines */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CustomText from '../../../components/ui/CustomText';
import RoundButton from '../../../components/ui/RoundButton';
import Email from '../../../components/ui/BusinessListing/Email';
import ListingTitle from '../../../components/ui/BusinessListing/ListingTitle';
import ListingOverview from '../../../components/ui/BusinessListing/ListingOverview';
import ListingPromotionDetails from '../../../components/ui/BusinessListing/ListingPromotionDetails';
import ListingImage from '../../../components/ui/BusinessListing/ListingImage';
import ListingConfig from '../listingConfig';
import {
  BusinessListing, BusinessType, FileType, ListingType,
} from '../type';
import YearReleased from '../../../components/ui/BusinessListing/YearReleased';
import CountryOfOrigin from '../../../components/ui/BusinessListing/Movies/CountryOfOrigin';
import MovieDuration from '../../../components/ui/BusinessListing/Movies/Duration';
import MovieRating from '../../../components/ui/BusinessListing/Movies/MovieRating';
import Trailers from '../../../components/ui/BusinessListing/Movies/Trailers';
import ListingLink from '../../../components/ui/BusinessListing/ListingLink';
import Casts from '../../../components/ui/BusinessListing/Movies/Casts';
import Pricing from '../../../components/ui/BusinessListing/Pricing';
import PaymentInfo from '../../../components/ui/BusinessListing/PaymentInfo';
import Author from '../../../components/ui/BusinessListing/Books/Author';
import Pages from '../../../components/ui/BusinessListing/Books/Pages';
import Isbn from '../../../components/ui/BusinessListing/Books/Isbn';
import useCreateListing from '../../../hooks/businessListing/useCreateListing';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import WebsiteLink from '../../../components/ui/BusinessListing/WebsiteLink';
import Address from '../../../components/ui/BusinessListing/Address';
import PhoneNumber from '../../../components/ui/BusinessListing/PhoneNumber';
import CoverPhoto from '../../../components/ui/BusinessListing/CoverPhoto';
import Switch from '../../../components/ui/Switch';
import useListingTypes from '../../../hooks/businessListing/useListingTypes';
import useListingDetailForEdit from '../../../hooks/businessListing/useListingDetailForEdit';
import useBusinessListingForm from '../../../hooks/businessListing/useBusinessListingForm';
import useUpdateListingThumbnailOrCoverPhoto from '../../../hooks/businessListing/useUpdateListingThumbnailOrCoverPhoto';
import useUpdateListing from '../../../hooks/businessListing/useUpdateListing';

function CreateBusinessListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingId = searchParams.get('id') as string;
  const listingType: ListingType = searchParams.get('type') as ListingType;
  const listingConfig = ListingConfig[listingType];
  const [charCount, setCharCount] = useState<number>(0);
  const [hasPhysicalPresence, setHasPhysicalPresence] = useState(false);

  const {
    createBusinessListing, errorMessages,
  } = useCreateListing();

  const {
    updateBusinessListing,
    errorMessages: updateBusinessListingErrors,
  } = useUpdateListing();

  const { listingDetail } = useListingDetailForEdit(listingId as string);

  const { updateThumbnailOrCoverPhoto } = useUpdateListingThumbnailOrCoverPhoto(listingType);

  const { listingTypes } = useListingTypes();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    fields,
    append,
    remove,
    getEditedCastsList,
  } = useBusinessListingForm({ listingType, listingDetail });

  const image = watch('image');
  const coverPhoto = watch('coverPhoto');

  const visibilityConfig = useMemo(
    () => ({
      title: true,
      overview: true,

      email: !([BusinessType.MOVIES, BusinessType.BOOKS] as string[]).includes(
        listingType,
      ),
      websiteLink: !(
        [BusinessType.MOVIES, BusinessType.BOOKS] as string[]
      ).includes(listingType),
      address: !(
        [BusinessType.MOVIES, BusinessType.BOOKS] as string[]
      ).includes(listingType),
      phoneNumber: !(
        [BusinessType.MOVIES, BusinessType.BOOKS] as string[]
      ).includes(listingType),
      coverPhoto: !(
        [BusinessType.MOVIES, BusinessType.BOOKS] as string[]
      ).includes(listingType),

      yearReleased: (
        [BusinessType.MOVIES, BusinessType.BOOKS] as string[]
      ).includes(listingType),
      countryOfOrigin: ([BusinessType.MOVIES] as string[]).includes(
        listingType,
      ),
      durationInMinutes: ([BusinessType.MOVIES] as string[]).includes(
        listingType,
      ),
      officialRatingReceived: ([BusinessType.MOVIES] as string[]).includes(
        listingType,
      ),
      trailerLinks: ([BusinessType.MOVIES] as string[]).includes(listingType),
      casts: ([BusinessType.MOVIES] as string[]).includes(listingType),

      link: ([BusinessType.MOVIES, BusinessType.BOOKS] as string[]).includes(
        listingType,
      ),

      author: ([BusinessType.BOOKS] as string[]).includes(listingType),
      pages: ([BusinessType.BOOKS] as string[]).includes(listingType),
      isbn: ([BusinessType.BOOKS] as string[]).includes(listingType),

      physicalAddress: !(
        [BusinessType.MOVIES, BusinessType.BOOKS] as string[]
      ).includes(listingType),
    }),
    [listingType],
  );

  const handleAfterSuccessfullApi = () => {
    toast(
      <div>
        <p>Success!</p>
        <p>
          Successefully &nbsp;
          {listingId ? 'updated' : 'created'}
          &nbsp; your listing
        </p>
      </div>,
      {
        theme: 'dark',
        type: 'success',
      },
    );

    navigate('/app/my-listings');
  };

  const onSubmit: SubmitHandler<BusinessListing> = async (data) => {
    try {
      if (!listingId) {
        await createBusinessListing(data, handleAfterSuccessfullApi);
      } else {
        const editedCastsState = getEditedCastsList();

        await updateBusinessListing(
          {
            ...data,
            bookRef: listingDetail?.bookRef,
            movieRef: listingDetail?.movieRef,
          },
          editedCastsState,
          handleAfterSuccessfullApi,
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePhysicalPresenceSwitch = () => {
    setHasPhysicalPresence(!hasPhysicalPresence);
    setValue('address', '');
  };

  const handleFileChange = (file: File, type: FileType) => {
    if (file) {
      if (listingId) {
        updateThumbnailOrCoverPhoto(type, listingId, file);
      } else {
        setValue(type === FileType.THUMBNAIL ? 'image' : 'coverPhoto', file);
      }
    }
  };

  useEffect(() => {
    if (listingDetail) {
      if (listingDetail?.address) {
        setHasPhysicalPresence(true);
      }
    }
  }, [listingDetail]);

  return (
    <div>
      <Row className="d-md-none pt-2">
        <Col xs="auto" className="ms-2">
          <FontAwesomeIcon
            role="button"
            icon={solid('arrow-left-long')}
            size="2x"
            onClick={() => navigate(-1)}
          />
        </Col>
        <Col>
          <h1 className="text-center mb-0 h2">{listingConfig?.shortTitle}</h1>
        </Col>
      </Row>

      <div className="bg-dark px-md-4 py-4 py-md-5 rounded-3 bg-mobile-transparent">
        <div className="d-flex justify-content-between">
          <h2 className="mb-0 fw-bold">{listingConfig?.title}</h2>
        </div>
        <div className="my-3">
          <CustomText
            text="Save time and build your audience by listing your movies."
            textColor="#DBDBDB"
            textClass="mb-0 fs-4"
          />
          <CustomText
            text="Here’s what you get:"
            textColor="#DBDBDB"
            textClass="mb-0 fs-4"
          />
        </div>

        <ListingPromotionDetails noteList={listingConfig?.noteList} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Row className="my-4">
            <Col md={6} lg={12} xl={6}>
              <div className="d-block d-md-flex align-items-center">
                <ListingImage
                  isSquared={
                    !(
                      [BusinessType.MOVIES, BusinessType.BOOKS] as string[]
                    ).includes(listingType)
                  }
                  image={image}
                  fileType={FileType.THUMBNAIL}
                  handleFileChange={handleFileChange}
                />
              </div>
            </Col>

            {!([BusinessType.MOVIES, BusinessType.BOOKS] as string[]).includes(
              listingType,
            ) && (
              <Col
                md={6}
                lg={12}
                xl={6}
                className="mt-5 mt-md-0 mt-lg-5 mt-xl-0"
              >
                <div className="d-block d-md-flex align-items-center">
                  <CoverPhoto
                    image={coverPhoto}
                    fileType={FileType.COVER_PHOTO}
                    handleFileChange={handleFileChange}
                  />
                </div>
              </Col>
            )}
          </Row>

          <Row>
            <Email
              name="email"
              register={register}
              isVisible={visibilityConfig.email}
            />
            <PhoneNumber
              name="phoneNumber"
              register={register}
              isVisible={visibilityConfig.phoneNumber}
            />

            {visibilityConfig.physicalAddress && (
              <>
                <div className="d-block d-md-flex align-items-center my-2">
                  Do you have physical address?
                  <Switch
                    id="listingAddressSwitch"
                    className="ms-0 ms-md-3"
                    isChecked={hasPhysicalPresence}
                    onSwitchToggle={togglePhysicalPresenceSwitch}
                    yesNoLabel
                  />
                </div>

                {hasPhysicalPresence && (
                  <Address
                    name="address"
                    register={register}
                    isVisible={visibilityConfig.address}
                  />
                )}
              </>
            )}

            <WebsiteLink
              name="websiteLink"
              register={register}
              isVisible={visibilityConfig.websiteLink}
            />

            <ListingTitle
              name="title"
              register={register}
              isVisible={visibilityConfig.title}
            />
            <ListingOverview
              name="overview"
              register={register}
              charCount={charCount}
              isVisible={visibilityConfig.overview}
            />

            <YearReleased
              name="yearReleased"
              register={register}
              isVisible={visibilityConfig.yearReleased}
            />

            <CountryOfOrigin
              name="countryOfOrigin"
              register={register}
              isVisible={visibilityConfig.countryOfOrigin}
            />
            <MovieDuration
              name="durationInMinutes"
              register={register}
              isVisible={visibilityConfig.durationInMinutes}
            />
            <MovieRating
              name="officialRatingReceived"
              register={register}
              isVisible={visibilityConfig.officialRatingReceived}
            />

            <Author
              name="author"
              register={register}
              isVisible={visibilityConfig.author}
            />
            <Pages
              name="pages"
              register={register}
              isVisible={visibilityConfig.pages}
            />
            <Isbn
              name="isbn"
              register={register}
              isVisible={visibilityConfig.isbn}
            />

            <Trailers
              name="trailerLinks"
              register={register}
              isVisible={visibilityConfig.trailerLinks}
            />
            <ListingLink
              text={listingConfig?.linkFieldLabel}
              name="link"
              register={register}
              isVisible={visibilityConfig.link}
            />

            <Casts
              setValue={setValue}
              fields={fields}
              append={append}
              remove={remove}
              register={register}
              isVisible={visibilityConfig.casts}
            />

            <Pricing listingTypes={listingTypes} setValue={setValue} />
            <PaymentInfo />
          </Row>

          <Row>
            <Col xs={12}>
              <ErrorMessageList
                errorMessages={errorMessages ?? updateBusinessListingErrors}
                className="m-0"
              />
            </Col>
          </Row>

          <Row>
            <Col md={4} className="mt-4">
              <RoundButton className="w-100 fs-3" size="lg" type="submit">
                Submit
              </RoundButton>
            </Col>
          </Row>
        </form>
      </div>
    </div>
  );
}
export default CreateBusinessListing;
