import styled from 'styled-components';
import { UseFormSetValue } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import CustomText from '../CustomText';
import PhotoUploadInput from '../PhotoUploadInput';
import { BusinessListing } from '../../../routes/business-listings/type';

type Props = {
  image: string | File | null | undefined;
  setValue: UseFormSetValue<BusinessListing>;
};

const Container = styled(Row)`
  height: 100%;
  margin: 1rem 0;
  display: flex;
  justify-content: start;
  align-items: center;
  text-align: center;

  @media (max-width: 576px) {
    justify-content: center;
    flex-direction: column;
  }

  @media (max-width: 768px) and (min-width: 979px) {
    max-width: 100% !important;
  }
`;

const UploadCol = styled(Col)`
  @media (max-width: 576px) {
    margin-bottom: 1rem;
  }
`;

const StyledPhotoUploadInput = styled(PhotoUploadInput)`
  @media (max-width: 576px) {
    margin: auto;
  }
`;

const InfoCol = styled(Col)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;

  @media (max-width: 576px) {
    align-items: center;
  }
`;

export default function CoverPhoto({ setValue, image }: Props) {
  return (
    <div className="d-block d-md-flex align-items-center">
      <PhotoUploadInput
        className="mx-auto mx-md-0 me-md-3"
        height="10rem"
        variant="outline"
        defaultPhotoUrl={image as string}
        onChange={(file) => {
          setValue('coverPhoto', file);
        }}
      />
      <div className="text-center text-md-start mt-4 mt-md-0">
        <h1 className="h3 mb-2 fw-bold">Upload cover photo</h1>
        <div className="d-block justify-content-center">
          <p className="fs-5 text-light mb-0">
            Recommended size: 830x320 pixels
          </p>
          <p className="fs-5 text-light mb-0">
            (jpg, png)
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Container>
      <UploadCol xs={12} sm={5} lg="auto">
        <StyledPhotoUploadInput
          height="9.688rem"
          variant="outline"
          onChange={(file) => {
            setValue('coverPhoto', file);
          }}
          defaultPhotoUrl={image as string}
        />
      </UploadCol>

      <InfoCol xs={12} sm={7} lg="auto">
        <h3 className="mb-1 mt-3">Upload cover photo</h3>
        <CustomText
          text="Recommended size:"
          textColor="#A6A6A6"
          textClass="fs-5 mb-0"
        />
        <CustomText
          text="600x900 pixels (Jpg, Png)"
          textColor="#A6A6A6"
          textClass="fs-5"
        />
      </InfoCol>
    </Container>
  );
}
