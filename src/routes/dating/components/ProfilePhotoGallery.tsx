import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import RemoveProfileDialog from '../profile/edit/RemoveProfileDialog';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';

interface Image {
  title: string;
  image: string;
  id: number
}

interface Props {
  imageIndex: number;
  imageUpload: Image[];
  setImageUpload: (value: Image[]) => void;
  confirmationRemove?: boolean;
}

function ProfilePhotoGallery({
  imageIndex, imageUpload, setImageUpload, confirmationRemove,
}: Props) {
  const [show, setShow] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const handleRemoveFile = () => {
    const newArr = [...imageUpload];
    newArr[imgIndex].image = '';
    setImageUpload(newArr);
    setShow(false);
  };

  const handleFileChange = (file: any, index: number) => {
    if (file === undefined) {
      setImgIndex(index);
      if (confirmationRemove) {
        setShow(true);
      } else { handleRemoveFile(); }
    }
    if (file) {
      const newArr = [...imageUpload];
      const images = URL.createObjectURL(file);
      newArr[index].image = images;
      setImageUpload(newArr);
    }
  };
  return (
    <div className="text-start">
      <PhotoUploadInput
        height="9.688rem"
        variant="outline"
        onChange={(file: any) => {
          handleFileChange(file, imageIndex);
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
