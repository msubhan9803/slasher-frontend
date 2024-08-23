/* eslint-disable max-len */
import { useState } from 'react';
import { updateListing } from '../../api/businessListings';
import { BusinessListing, EditCastsState } from '../../routes/business-listings/type';
import useAddCast from './useAddCast';
import useUpdateCast from './useUpdateCast';
import useRemoveCast from './useRemoveCast';

export default function useUpdateListing() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [success, setSuccess] = useState<boolean>(false);

  const { addCast } = useAddCast();
  const { updateCast } = useUpdateCast();
  const { removeCast } = useRemoveCast();

  const updateBusinessListing = async (listing: BusinessListing, editedCastsState: EditCastsState[], handleAfterSuccessfullApi: () => void) => {
    setLoading(true);
    setErrorMessages([]);
    setSuccess(false);

    try {
      await updateListing(listing);

      for (let index = 0; index < editedCastsState.length; index += 1) {
        const elem = editedCastsState[index];

        if (elem.isRemoved && !elem.isNew) {
          removeCast(listing.movieRef?._id as string, elem.cast._id as string);

          return;
        }

        if (elem.isUpdated && !elem.isNew) {
          updateCast({
            movieRef: listing.movieRef?._id as string,
            castRef: elem.cast._id as string,
            name: elem.cast.name,
            characterName: elem.cast.characterName,
            castImage: elem.cast.castImage as File,
          });

          return;
        }

        if (elem.isNew) {
          addCast({
            movieRef: listing.movieRef?._id as string,
            name: elem.cast.name,
            characterName: elem.cast.characterName,
            castImage: elem.cast.castImage as File,
          });
        }
      }

      setSuccess(true);
      setLoading(false);
      handleAfterSuccessfullApi();
    } catch (err: any) {
      setErrorMessages(err.response.data.message);
      setLoading(false);
    }
  };

  return {
    updateBusinessListing,
    loading,
    errorMessages,
    success,
  };
}
