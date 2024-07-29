/* eslint-disable max-lines */
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useForm, useFieldArray, SubmitHandler, Resolver,
} from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import CustomText from '../../../components/ui/CustomText';
import RoundButton from '../../../components/ui/RoundButton';
import ListingTitle from '../../../components/ui/BusinessListing/ListingTitle';
import ListingOverview from '../../../components/ui/BusinessListing/ListingOverview';
import ListingPromotionDetails from '../../../components/ui/BusinessListing/ListingPromotionDetails';
import ListingImage from '../../../components/ui/BusinessListing/ListingImage';
import ListingConfig from '../listingConfig';
import { BusinessListing, BusinessType, ListingType } from '../type';
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

const schema = yup.object().shape({
  // title: yup.string().required('Title is required'),
  // yearReleased: yup.number().required('Year released is required').positive().integer(),
  // description: yup.string().required('Description is required'),
});

function CreateBusinessListing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingType: ListingType = (searchParams.get('type') as ListingType);
  const listingConfig = ListingConfig[listingType];
  const [, setImageUpload] = useState<File | null | undefined>();
  const [charCount, setCharCount] = useState<number>(0);

  const {
    control, register, handleSubmit, setValue, watch,
  } = useForm<BusinessListing>({
    resolver: yupResolver<BusinessListing>(schema as yup.ObjectSchema<BusinessListing, yup.AnyObject, any, ''>),
    defaultValues: {
      _id: null,
      businesstype: listingType as string,
      listingType: '66a0d7bd5e030b27bc304463',
      image: null,
      title: null,
      overview: null,
      link: null,
      isActive: null,
      author: null,
      pages: null,
      isbn: null,
      yearReleased: null,
      countryOfOrigin: null,
      durationInMinutes: null,
      officialRatingReceived: null,
      trailerLinks: null,
      casts: [{
        castImage: null,
        name: '',
        characterName: '',
      }],
    },
  });

  const {
    createBusinessListing, loading, error, success,
  } = useCreateListing();

  const image = watch('image');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'casts',
  });

  const visibilityConfig = useMemo(() => ({
    yearReleased: ([BusinessType.MOVIES, BusinessType.BOOKS] as string[]).includes(listingType),
    countryOfOrigin: ([BusinessType.MOVIES] as string[]).includes(listingType),
    durationInMinutes: ([BusinessType.MOVIES] as string[]).includes(listingType),
    officialRatingReceived: ([BusinessType.MOVIES] as string[]).includes(listingType),
    trailerLinks: ([BusinessType.MOVIES] as string[]).includes(listingType),
    casts: ([BusinessType.MOVIES] as string[]).includes(listingType),

    link: ([BusinessType.MOVIES, BusinessType.BOOKS] as string[]).includes(listingType),

    author: ([BusinessType.BOOKS] as string[]).includes(listingType),
    pages: ([BusinessType.BOOKS] as string[]).includes(listingType),
    isbn: ([BusinessType.BOOKS] as string[]).includes(listingType),
  }), [listingType]);

  const onSubmit: SubmitHandler<BusinessListing> = async (data) => {
    try {
      await createBusinessListing(data);
    } catch (err) {
      console.error(err);
    }
  };

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
          <h1 className="text-center mb-0 h2">{listingConfig.shortTitle}</h1>
        </Col>
      </Row>

      <div className="bg-dark px-md-4 py-4 py-md-5 rounded-3 bg-mobile-transparent">
        <div className="d-flex justify-content-between">
          <h2 className="mb-0 fw-bold">
            {listingConfig.title}
          </h2>
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

        <ListingPromotionDetails noteList={listingConfig.noteList} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <ListingImage image={image} setValue={setValue} />

          <Row>
            <ListingTitle name="title" register={register} />
            <ListingOverview
              name="overview"
              register={register}
              charCount={charCount}
            />

            <YearReleased name="yearReleased" register={register} isVisible={visibilityConfig.yearReleased} />

            <CountryOfOrigin name="countryOfOrigin" register={register} isVisible={visibilityConfig.countryOfOrigin} />
            <MovieDuration name="durationInMinutes" register={register} isVisible={visibilityConfig.durationInMinutes} />
            <MovieRating name="officialRatingReceived" register={register} isVisible={visibilityConfig.officialRatingReceived} />

            <Author name="author" register={register} isVisible={visibilityConfig.author} />
            <Pages name="pages" register={register} isVisible={visibilityConfig.pages} />
            <Isbn name="isbn" register={register} isVisible={visibilityConfig.isbn} />

            <Trailers name="trailerLinks" register={register} isVisible={visibilityConfig.trailerLinks} />
            <ListingLink text={listingConfig.linkFieldLabel} name="link" register={register} isVisible={visibilityConfig.link} />

            <Casts
              setValue={setValue}
              fields={fields}
              append={append}
              remove={remove}
              register={register}
              isVisible={visibilityConfig.casts}
            />

            <Pricing />
            <PaymentInfo />
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
