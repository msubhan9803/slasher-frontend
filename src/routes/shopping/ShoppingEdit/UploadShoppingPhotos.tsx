import React, { ChangeEvent, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';

const ImageContainer = styled.div`
  height: 9.688rem;
  width: 9.688rem;
  border: 1px solid #3A3B46 !important;
  cursor:pointer;

  @media (max-width: 991px) {
    height:8.75rem;
    width:8.75rem;
    background: #1B1B1B;
  }
`;
const AddIcon = styled.div`
  width: 1.329rem;
  height: 1.329rem;
  top: 8.62rem;
  left: 8.62rem;

  @media (max-width: 991px) {
    top: 7.62rem;
    left: 7.62rem;
    .fa-plus {
      margin-right: 0.125rem;
    }
  }
`;

interface UploadPhotosProps {
  id: string;
}
function UploadShoppingPhotos({ id }: UploadPhotosProps) {
  const [imageUpload, setImageUpload] = useState<string>('');
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target) return;
    if (e.target?.name === 'file' && e?.target?.files?.length) {
      setImageUpload(URL.createObjectURL(e.target.files[0]));
      e.target.value = '';
    }
  };
  return (
    <div>
      <label htmlFor={`file-upload-${id}`} className="d-flex justify-content-center">
        {imageUpload.length === 0
          && (
            <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0 pe-auto">
              <FontAwesomeIcon icon={solid('camera')} size="lg" className="text-light bg-primary p-3 rounded-circle " />
              <AddIcon className="d-flex justify-content-center align-items-center position-absolute text-white rounded-circle bg-primary">
                <FontAwesomeIcon
                  icon={solid('plus')}
                  size="1x"
                />
              </AddIcon>
            </ImageContainer>
          )}
      </label>
      <div className="d-flex justify-content-center">
        {imageUpload.length > 0
          && (
            <ImageContainer className="position-relative d-flex justify-content-center align-items-center rounded border-0">
              <Image
                src={imageUpload}
                alt="Dating profile photograph"
                className="w-100 h-100 img-fluid rounded"
              />
              <AddIcon onClick={() => setImageUpload('')} className="d-flex justify-content-center align-items-center position-absolute text-primary rounded-circle bg-white">
                <FontAwesomeIcon
                  icon={solid('times')}
                  size="1x"
                  role="button"
                />
              </AddIcon>
            </ImageContainer>
          )}
      </div>
      <input
        id={`file-upload-${id}`}
        type="file"
        name="file"
        className="d-none"
        accept="image/*"
        onChange={(e) => {
          handleFileChange(e);
        }}
      />
    </div>
  );
}

export default UploadShoppingPhotos;
