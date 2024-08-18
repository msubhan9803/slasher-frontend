import { useState } from 'react';
import { updateListingThumbnailOrCoverPhoto } from '../../api/businessListings';
import { FileType, ListingType } from '../../routes/business-listings/type';

export default function useUpdateListingThumbnailOrCoverPhoto(listingType: ListingType) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [success, setSuccess] = useState<boolean>(false);

  const updateThumbnailOrCoverPhoto = async (type: FileType, listingId: string, file: File) => {
    setLoading(true);
    setErrorMessages([]);
    setSuccess(false);

    try {
      await updateListingThumbnailOrCoverPhoto(type, listingId, file, listingType);
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setErrorMessages(err.response.data.message);
      setLoading(false);
    }
  };

  return {
    updateThumbnailOrCoverPhoto,
    loading,
    errorMessages,
    success,
  };
}
