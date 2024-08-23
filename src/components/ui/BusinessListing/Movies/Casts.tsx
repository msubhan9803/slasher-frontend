import {
  Row, Col, Form, Button,
} from 'react-bootstrap';
import {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomText from '../../CustomText';
import PhotoUploadInput from '../../PhotoUploadInput';
import { BusinessListing } from '../../../../routes/business-listings/type';

type Props = {
  setValue: UseFormSetValue<BusinessListing>;
  fields: FieldArrayWithId<BusinessListing, 'casts', 'id'>[];
  append: UseFieldArrayAppend<BusinessListing, 'casts'>;
  remove: (index: number) => void;
  register: UseFormRegister<BusinessListing>;
  isVisible: boolean;
};

export default function Casts({
  setValue,
  fields,
  append,
  remove,
  register,
  isVisible,
}: Props) {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <h2 className="fw-bold mt-4 mb-2">Top billed cast</h2>

      {fields.map((field, index) => (
        <Row key={field.id} className="h-100 my-3 m-0">
          <Col xs={12} className="mb-2">
            <Row>
              <Col>
                <div className="d-flex align-items-center gap-4">
                  <PhotoUploadInput
                    height="9.688rem"
                    variant="outline"
                    onChange={(file) => {
                      setValue(`casts.${index}.castImage`, file);
                    }}
                    defaultPhotoUrl={field.castImage as string}
                  />

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
                </div>
              </Col>
              <Col xs="auto" className="text-end">
                <FontAwesomeIcon
                  role="button"
                  icon={solid('trash')}
                  className="trash-icon"
                  onClick={() => remove(index)}
                />
              </Col>
            </Row>
          </Col>

          <Col xs="12" md="6" className="my-2">
            <Form.Control
              type="text"
              placeholder="Cast member name"
              {...register(`casts.${index}.name`)}
              className="fs-4"
            />
          </Col>

          <Col xs="12" md="6" className="my-2">
            <Form.Control
              type="text"
              placeholder="Name of their character"
              {...register(`casts.${index}.characterName`)}
              className="fs-4"
            />
          </Col>
        </Row>
      ))}

      <Button
        variant="link"
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          width: 'fit-content',
        }}
        onClick={() => append({
          _id: uuidv4(), name: '', characterName: '', castImage: null,
        })}
      >
        <CustomText
          text="+ Add more cast members"
          textColor="#FF1800"
          textClass="fs-4 fw-bold"
        />
      </Button>
    </>
  );
}
