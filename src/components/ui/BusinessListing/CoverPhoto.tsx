import { FileType } from '../../../routes/business-listings/type';
import PhotoUploadInput from '../PhotoUploadInput';

type Props = {
  image: string | File | null | undefined;
  fileType: FileType;
  handleFileChange: (file: File, type: FileType) => void
};

export default function CoverPhoto({ fileType, handleFileChange, image }: Props) {
  return (
    <div className="d-block d-md-flex align-items-center">
      <PhotoUploadInput
        className="mx-auto mx-md-0 me-md-3"
        height="10rem"
        variant="outline"
        defaultPhotoUrl={image as string}
        onChange={(file) => {
          handleFileChange(file as File, fileType);
        }}
      />
      <div className="text-center text-md-start mt-4 mt-md-0">
        <h1 className="h3 mb-2 fw-bold">Upload cover photo</h1>
        <div className="d-block justify-content-center">
          <p className="fs-5 text-light mb-0">
            Recommended size: 830x320 pixels
          </p>
          <p className="fs-5 text-light mb-0">
            (jpg, png)
          </p>
        </div>
      </div>
    </div>
  );
}
