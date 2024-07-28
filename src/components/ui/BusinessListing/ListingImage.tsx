import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col } from 'react-bootstrap';
import CustomText from '../CustomText';
import PhotoUploadInput from '../PhotoUploadInput';

type Props = {
  setImageUpload: (value: React.SetStateAction<File | null | undefined>) => void;
};

export default function ListingImage({ setImageUpload }: Props) {
  return (
    <Row className="h-100 my-3">
      <Col xs={12} md="auto">
        <PhotoUploadInput
          height="9.688rem"
          variant="outline"
          onChange={(file) => {
            setImageUpload(file);
          }}
        />
      </Col>

      <Col xs={12} md="auto" style={{ margin: 'auto 0 auto 0' }}>
        <div>
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
        </div>
      </Col>
    </Row>
  );
}
