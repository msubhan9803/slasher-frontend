import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';

interface Props {
  aspectRatio?: string;
  className?: string;
  onChange: (files: File | undefined) => void
}

const StyledImageUploadContainer = styled.div`
  position: relative;
  background: #1f1f1f;
  cursor: pointer;

  img {
    max-height: 100%;
    max-width: 100%;
  }
`;

const CornerIconButton = styled(Button)`
  width: 1.329rem;
  height: 1.329rem;
  bottom: -0.35rem;
  right: -0.35rem;
`;

function PhotoUploadInput({ aspectRatio, onChange, className }: Props) {
  const [photo, setPhoto] = useState<File>();

  useEffect(() => {
    onChange(photo);
  }, [photo]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhoto = acceptedFiles?.[0] || null;
    setPhoto(newPhoto);
    onChange(newPhoto);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
  });

  const renderUploadPlaceholder = (currentlyDragging: boolean) => (currentlyDragging
    ? (
      <p className="m-0">
        Drop file to upload...
      </p>
    )
    : (
      <FontAwesomeIcon
        icon={solid('camera')}
        size="lg"
        className="text-light bg-primary p-3 rounded-circle "
      />
    ));

  return (
    <StyledImageUploadContainer {...getRootProps()} className={`d-flex align-items-center justify-content-center rounded ${className}`} style={{ aspectRatio }}>
      <input {...getInputProps()} />
      {!photo && renderUploadPlaceholder(isDragActive)}
      {
        photo
        && (
          <img
            src={URL.createObjectURL(photo)}
            alt="Upload preview"
          />
        )
      }
      <CornerIconButton
        onClick={
          photo
            ? (e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation(); setPhoto(undefined);
            }
            : undefined
        }
        variant="link"
        className={
          `p-1 d-flex align-items-center justify-content-center text-center position-absolute rounded-circle ${photo ? 'bg-white text-primary' : 'bg-primary text-white'}`
        }
      >
        <FontAwesomeIcon
          icon={photo ? solid('times') : solid('plus')}
          size="sm"
          role="button"
        />
      </CornerIconButton>
    </StyledImageUploadContainer>
  );
}

PhotoUploadInput.defaultProps = {
  aspectRatio: '1',
  className: '',
};

export default PhotoUploadInput;
