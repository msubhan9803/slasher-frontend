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

export default function ListingImage({ setValue, image }: Props) {
  return (
    <Container>
      <UploadCol xs={12} md="auto">
        <StyledPhotoUploadInput
          height="9.688rem"
          variant="outline"
          onChange={(file) => {
            setValue('image', file);
          }}
          defaultPhotoUrl={image as string}
        />
      </UploadCol>

      <InfoCol xs={12} md="auto">
        <h3 className="mb-1 mt-3">Upload cover art</h3>
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
