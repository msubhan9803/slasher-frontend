import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col, Form } from 'react-bootstrap';
import CustomText from '../../CustomText';
import PhotoUploadInput from '../../PhotoUploadInput';

type Props = {
  setImageUpload: (
    value: React.SetStateAction<File | null | undefined>
  ) => void;
};

export default function Casts({ setImageUpload }: Props) {
  return (
    <>
      <Row className="h-100 my-3">
        <h2 className="fw-bold my-2">Trailers</h2>

        <Col xs={12} md="auto">
          <PhotoUploadInput
            height="9.688rem"
            variant="outline"
            onChange={(file) => {
              setImageUpload(file);
            }}
          />
        </Col>

        <Col xs={12} md="auto">
          <div>
            <h3 className="mb-1 mt-3">Add cast member photo</h3>
            <CustomText
              text="Upload 138x175 px image in JPG/PNG"
              textColor="#A6A6A6"
              textClass="fs-5 mb-0"
            />
            <CustomText
              text="format, under 1MB"
              textColor="#A6A6A6"
              textClass="fs-5"
            />
          </div>
        </Col>
      </Row>

      <Col xs="12" md="6" className="my-2">
        <Form.Control
          type="text"
          placeholder="Cast member name"
          className="fs-4"
        />
      </Col>

      <Col xs="12" md="6" className="my-2">
        <Form.Control
          type="text"
          placeholder="Name of their character"
          className="fs-4"
        />
      </Col>

      <CustomText
        text="+ Add more cast members"
        textColor="#FF1800"
        textClass="mb-0 fs-4 fw-bold"
      />
    </>
  );
}
