import {
  Row, Col, Form, Button,
} from 'react-bootstrap';
import {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomText from '../../CustomText';
import PhotoUploadInput from '../../PhotoUploadInput';
import { BusinessListing } from '../../../../routes/business-listings/type';

type Props = {
  setValue: UseFormSetValue<BusinessListing>;
  fields: FieldArrayWithId<BusinessListing, 'casts', 'id'>[];
  append: UseFieldArrayAppend<BusinessListing, 'casts'>;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<BusinessListing>;
};

export default function Casts({
  setValue,
  fields,
  append,
  remove,
  register,
}: Props) {
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
        }}
        onClick={() => append({ name: '', characterName: '', castImage: null })}
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
