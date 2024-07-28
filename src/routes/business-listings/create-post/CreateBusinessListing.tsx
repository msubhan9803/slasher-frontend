import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import CustomText from '../../../components/ui/CustomText';
import RoundButton from '../../../components/ui/RoundButton';
import ListingTitle from '../../../components/ui/BusinessListing/ListingTitle';
import ListingOverview from '../../../components/ui/BusinessListing/ListingOverview';
import ListingPromotionDetails from '../../../components/ui/BusinessListing/ListingPromotionDetails';
import ListingImage from '../../../components/ui/BusinessListing/ListingImage';
import ListingConfig from '../listingConfig';
import { ListingType } from '../type';
import YearReleased from '../../../components/ui/BusinessListing/Movies/YearReleased';
import CountryOfOrigin from '../../../components/ui/BusinessListing/Movies/CountryOfOrigin';
import MovieDuration from '../../../components/ui/BusinessListing/Movies/Duration';
import MovieRating from '../../../components/ui/BusinessListing/Movies/MovieRating';
import Trailers from '../../../components/ui/BusinessListing/Movies/Trailers';
import MovieLink from '../../../components/ui/BusinessListing/Movies/MovieLink';
import Casts from '../../../components/ui/BusinessListing/Movies/Casts';
import Pricing from '../../../components/ui/BusinessListing/Pricing';
import PaymentInfo from '../../../components/ui/BusinessListing/PaymentInfo';

const noteList = [
  'A listing in the movie database with your cover art, description, trailers, and more.',
  'A second listing in the Slasher Indie section.',
  'Create posts and updates about your movie that also appear on the timeline.',
  'People on Slasher can follow your movie and get notifIed of new posts.',
];

function CreateBusinessListing() {
  const [searchParams] = useSearchParams();
  const listingType: ListingType = (searchParams.get('type') as ListingType);
  const listingConfig = ListingConfig[listingType];
  const [, setImageUpload] = useState<File | null | undefined>();
  const [description, setDescription] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  };

  return (
    <div>
      <Row className="d-md-none pt-2">
        <Col xs="auto" className="ms-2">
          <FontAwesomeIcon
            role="button"
            icon={solid('arrow-left-long')}
            size="2x"
          />
        </Col>
        <Col>
          <h1 className="text-center mb-0 h2">{listingConfig.shortTitle}</h1>
        </Col>
      </Row>

      <div className="bg-dark px-md-4 py-4 py-md-5 rounded-3 bg-mobile-transparent">
        <div className="d-flex justify-content-between">
          <h2 className="mb-0 fw-bold">
            Add your movie and reach horror fans looking for movies on Slasher!
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

        <ListingPromotionDetails noteList={noteList} />

        <ListingImage setImageUpload={setImageUpload} />

        <Row>
          <ListingTitle />
          <ListingOverview
            description={description}
            handleMessageChange={handleMessageChange}
            charCount={charCount}
          />
          <YearReleased />
          <CountryOfOrigin />
          <MovieDuration />
          <MovieRating />
          <Trailers />
          <MovieLink />
          <Casts setImageUpload={setImageUpload} />

          <Pricing />
          <PaymentInfo />
        </Row>

        <Row>
          <Col md={4} className="mt-4">
            <RoundButton className="w-100 fs-3" size="lg">
              Submit
            </RoundButton>
          </Col>
        </Row>
      </div>
    </div>
  );
}
export default CreateBusinessListing;
