/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-lines */
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import {
  BusinessListing,
  BusinessType,
  EditCastsState,
} from '../../routes/business-listings/type';

type Props = {
  listingDetail: BusinessListing | undefined;
  listingType: string;
};

const useBusinessListingForm = ({ listingType, listingDetail }: Props) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<BusinessListing>({
    defaultValues: {
      _id: null,
      businesstype: listingType as string,
      listingType: null,
      image: null,
      coverPhoto: null,
      email: '',
      address: '',
      websiteLink: '',
      phoneNumber: '',
      title: null,
      overview: null,
      link: null,
      isActive: null,
      author: null,
      pages: null,
      isbn: null,
      yearReleased: null,
      countryOfOrigin: null,
      durationInMinutes: null,
      officialRatingReceived: null,
      trailerLinks: null,
      casts: [
        {
          _id: uuidv4(),
          castImage: null,
          name: '',
          characterName: '',
        },
      ],
    },
  });

  const [editedCastsState, setEditedCastsState] = useState<EditCastsState[]>([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'casts',
  });

  const casts = useWatch({
    control,
    name: 'casts',
  }) ?? [];

  const handleRemoveCast = async (index: number) => {
    const cast = casts[index];
    remove(index);

    const updatedCastList = editedCastsState.map((elem) => (elem.cast._id === cast._id ? {
      ...elem,
      isRemoved: true,
      cast,
    } : elem));

    setEditedCastsState(updatedCastList);
  };

  const getEditedCastsList = () => editedCastsState;

  useEffect(() => {
    if (!listingDetail || !isDirty) {
      return;
    }

    casts.forEach((cast) => {
      const editCastIndex = editedCastsState.findIndex((elem) => elem.cast._id === cast._id);
      if (editCastIndex !== -1) {
        if (JSON.stringify(editedCastsState[editCastIndex].cast) !== JSON.stringify(cast)) {
          const updatedCastList = editedCastsState.map((elem) => (elem.cast._id === cast._id ? {
            ...elem,
            isUpdated: true,
            cast,
          } : elem));

          setEditedCastsState(updatedCastList);
        }
      } else {
        setEditedCastsState([
          ...editedCastsState,
          {
            isNew: true,
            isUpdated: false,
            isRemoved: false,
            cast,
          },
        ]);
      }
    });
  }, [listingDetail, isDirty, casts]);

  useEffect(() => {
    if (listingDetail) {
      setEditedCastsState(listingDetail.movieRef?.casts?.map((cast) => ({
        isNew: false,
        isUpdated: false,
        isRemoved: false,
        cast,
      })) as EditCastsState[]);
    }
  }, [listingDetail]);

  useEffect(() => {
    if (listingDetail && listingType) {
      switch (listingType) {
        case BusinessType.BOOKS:
          setValue('_id', listingDetail._id);
          setValue('businesstype', listingDetail.businesstype);
          setValue('image', listingDetail.bookRef?.coverImage.image_path);
          setValue('listingType', listingDetail.listingType);
          setValue('title', listingDetail.bookRef?.name);
          setValue('overview', listingDetail.bookRef?.description);
          setValue('link', listingDetail.bookRef?.buyUrl as string);
          setValue('isActive', listingDetail.isActive);
          setValue('author', listingDetail.bookRef?.author[0]);
          setValue('pages', listingDetail.bookRef?.numberOfPages);
          setValue('isbn', listingDetail.bookRef?.isbnNumber[0]);
          setValue(
            'yearReleased',
            new Date(listingDetail.bookRef?.publishDate as string).getFullYear(),
          );
          setValue(
            'coverPhoto',
            listingDetail.bookRef?.coverImage?.image_path || null,
          );
          break;

        case BusinessType.MOVIES:
          setValue('_id', listingDetail._id);
          setValue('businesstype', listingDetail.businesstype);
          setValue('image', listingDetail.movieRef?.movieImage);
          setValue('listingType', listingDetail.listingType);
          setValue('title', listingDetail.movieRef?.name);
          setValue('overview', listingDetail.movieRef?.descriptions);
          setValue('link', listingDetail.movieRef?.watchUrl as string);
          setValue('isActive', listingDetail.isActive);
          setValue(
            'yearReleased',
            new Date(
              listingDetail.movieRef?.releaseDate as string,
            ).getFullYear(),
          );
          setValue('countryOfOrigin', listingDetail.movieRef?.countryOfOrigin);
          setValue(
            'durationInMinutes',
            listingDetail.movieRef?.durationInMinutes,
          );
          setValue(
            'officialRatingReceived',
            listingDetail.movieRef?.rating.toString(),
          );
          setValue('trailerLinks', {
            main: listingDetail.movieRef?.trailerUrls
              ? listingDetail.movieRef?.trailerUrls[0]
              : '',
            trailer2: listingDetail.movieRef?.trailerUrls
              ? listingDetail.movieRef?.trailerUrls[1]
              : '',
            trailer3: listingDetail.movieRef?.trailerUrls
              ? listingDetail.movieRef?.trailerUrls[2]
              : '',
          });
          setValue(
            'casts',
            listingDetail.movieRef?.casts || [
              {
                castImage: null,
                name: '',
                characterName: '',
              },
            ],
          );
          setValue('coverPhoto', listingDetail.movieRef?.movieImage || null);
          break;

        default:
          setValue('_id', listingDetail._id);
          setValue('businesstype', listingDetail.businesstype);
          setValue('image', listingDetail.businessLogo);
          setValue('coverPhoto', listingDetail.coverPhoto);
          setValue('listingType', listingDetail.listingType);
          setValue('email', listingDetail.email);
          setValue('phoneNumber', listingDetail.phoneNumber);
          setValue('title', listingDetail.title);
          setValue('overview', listingDetail.overview);
          setValue('websiteLink', listingDetail.websiteLink);
          setValue('address', listingDetail.address);
          break;
      }
    }
  }, [listingDetail, listingType, setValue]);

  return {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    fields,
    append,
    remove: handleRemoveCast,
    reset,
    getEditedCastsList,
  };
};

export default useBusinessListingForm;
