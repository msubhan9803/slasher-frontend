import React, { ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Form } from 'react-bootstrap';
import RemoveProfileDialog from '../profile/edit/RemoveProfileDialog';

const ImageContainer = styled.div`
  aspect-ratio: 1;
  background-color: #1F1F1F;
  border: 2px solid #3A3B46
`;

const ImageAddIconStyle = styled(FontAwesomeIcon)`
  padding: 0.5rem 0.563rem;
  bottom: -0.625rem;
  right: -0.875rem;
`;

const ImageRemoveIconStyle = styled(FontAwesomeIcon)`
  padding: 0.5rem 0.625rem;
  bottom: -0.5rem;
  right: -0.688rem;
`;

interface Image {
  title: string;
  image: string;
  id: number
}

interface Props {
  image: Image;
  imageIndex: number;
  imageUpload: Image[];
  setImageUpload: (value: Image[]) => void;
  confirmationRemove?: boolean;
}

function ProfilePhotoGallery({
  image, imageIndex, imageUpload, setImageUpload, confirmationRemove,
}: Props) {
  const [show, setShow] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const handleRemoveFile = () => {
    const newArr = [...imageUpload];
    newArr[imgIndex].image = '';
    setImageUpload(newArr);
    setShow(false);
  };

  const handleRemoveOnCondition = (index: number) => {
    setImgIndex(index);
    if (confirmationRemove) {
      setShow(true);
    } else { handleRemoveFile(); }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target) {
      return;
    }
    if (e.target?.name === 'file' && e?.target?.files?.length) {
      const newArr = [...imageUpload];
      const images = URL.createObjectURL(e.target.files[0]);
      newArr[index].image = images;
      setImageUpload(newArr);
    }
  };
  return (
    <div className="text-start">
      {
        image.image === ''
          ? (
            <Form.Label role="button" htmlFor={`file-upload-${imageIndex}`} className="d-inline">
              <ImageContainer className="position-relative d-flex justify-content-center align-items-center w-100 rounded">
                <FontAwesomeIcon
                  icon={solid('camera')}
                  size="lg"
                  className="text-light bg-primary p-3 rounded-circle "
                />
                <ImageAddIconStyle
                  icon={solid('plus')}
                  size="xs"
                  role="button"
                  className="position-absolute pe-auto bg-primary rounded-circle"
                />
              </ImageContainer>
            </Form.Label>
          )
          : (
            <ImageContainer className="position-relative d-flex justify-content-center align-items-center w-100 rounded border-0">
              <img
                src={image.image}
                alt="Dating profile photograph"
                className="w-100 h-100 img-fluid rounded"
              />
              <ImageRemoveIconStyle
                icon={solid('times')}
                size="xs"
                role="button"
                className="position-absolute bg-white text-primary rounded-circle"
                onClick={() => handleRemoveOnCondition(imageIndex)}
              />
            </ImageContainer>
          )
      }
      <input
        key={image.id}
        id={`file-upload-${imageIndex}`}
        type="file"
        name="file"
        className="d-none"
        accept="image/*"
        onChange={(e) => {
          handleFileChange(e, imageIndex);
          e.target.value = '';
        }}
      />
      <Form.Check
        inline
        label="Make primary photo"
        name="primary-photo"
        type="radio"
        id={`primary-photo-radio-${imageIndex}`}
        className="mt-2"
      />
      <RemoveProfileDialog
        show={show}
        setShow={setShow}
        handleRemoveFile={handleRemoveFile}
      />
    </div>
  );
}

ProfilePhotoGallery.defaultProps = {
  confirmationRemove: false,
};

export default ProfilePhotoGallery;
