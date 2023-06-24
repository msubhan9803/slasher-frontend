import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import ImagePickerPng from '../../images/image-picker.png';

interface Props {
  aspectRatio?: string;
  className?: string;
  height?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'outline';
  defaultPhotoUrl?: string;
  onChange?: (file: File | null | undefined) => void;
}

const StyledImageUploadContainer = styled.div`
  position: relative;
  cursor: pointer;
  background: var(--bs-dark);

  &.variant-outline {
    border: 1px solid #3A3B46 !important;
  }

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

function PhotoUploadInput({
  aspectRatio, height, onChange, variant, className, style, defaultPhotoUrl,
}: Props) {
  const [photo, setPhoto] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string>();
  useEffect(() => {
    if (defaultPhotoUrl) { setImageUrl(defaultPhotoUrl); }
  }, [defaultPhotoUrl]);

  useEffect(() => {
    if (onChange && photo) {
      onChange(photo);
      setImageUrl(undefined);
    }
    // NOTE: This is a quick fix to stop an infinite loop error.
    // This component should be rewritten and should accept a value as a prop because
    // that's a better design, and it would allow the component value to be cleared externally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhoto = acceptedFiles?.[0] || null;
    setPhoto(newPhoto);
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
      <img src={ImagePickerPng} width="50" alt="img picker" />
    ));

  return (
    <StyledImageUploadContainer
      {...getRootProps()}
      className={`image-upload d-flex align-items-center justify-content-center rounded ${className} variant-${variant}`}
      style={{ aspectRatio, height, ...style }}
    >
      <input {...getInputProps()} aria-label="onboarding photo" />
      {(!photo && !imageUrl) && renderUploadPlaceholder(isDragActive)}

      {
        photo
        && (
          <img
            src={photo ? URL.createObjectURL(photo) : defaultPhotoUrl}
            alt="Upload preview"
          />
        )
      }

      {
        imageUrl && !photo && (
          <img
            src={imageUrl}
            alt="Upload preview"
          />
        )
      }

      <CornerIconButton
        onClick={
          (photo || imageUrl)
            ? (e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              setPhoto(undefined);
              setImageUrl(undefined);
              if (onChange) { onChange(null); }
            }
            : undefined
        }
        variant="link"
        className={`${photo ? 'photo-selected' : ''} p-1 d-flex align-items-center justify-content-center text-center position-absolute rounded-circle bg-primary text-secondary`}
        aria-label="photo"
      >
        <FontAwesomeIcon
          icon={(photo || imageUrl) ? solid('times') : solid('plus')}
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
  variant: 'default',
  style: {},
  onChange: undefined,
  height: undefined,
  defaultPhotoUrl: undefined,
};

export default PhotoUploadInput;
