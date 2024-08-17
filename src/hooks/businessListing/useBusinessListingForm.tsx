import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { BusinessListing, BusinessType } from '../../routes/business-listings/type';

type Props = {
  listingDetail: BusinessListing | undefined;
  listingType: string;
};

const useBusinessListingForm = ({ listingType, listingDetail }: Props) => {
  const {
    control, register, handleSubmit, setValue, watch, reset,
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
          castImage: null,
          name: '',
          characterName: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'casts',
  });

  useEffect(() => {
    if (listingDetail && listingType) {
      switch (listingType) {
        case BusinessType.BOOKS:
          setValue('_id', listingDetail._id);
          setValue('businesstype', listingDetail.businesstype);
          setValue('image', listingDetail.bookRef?.coverImage.image_path);
          setValue('listingType', listingDetail.listingType);
          setValue('title', listingDetail.title);
          setValue('overview', listingDetail.overview);
          setValue('link', listingDetail.bookRef?.buyUrl as string);
          setValue('isActive', listingDetail.isActive);
          setValue('author', listingDetail.bookRef?.author[0]);
          setValue('pages', listingDetail.bookRef?.numberOfPages);
          setValue('isbn', listingDetail.bookRef?.isbnNumber[0]);
          setValue('yearReleased', parseInt(listingDetail.bookRef?.publishDate as string, 10));
          setValue('coverPhoto', listingDetail.bookRef?.coverImage?.image_path || null);
          break;

        case BusinessType.MOVIES:
          setValue('_id', listingDetail._id);
          setValue('businesstype', listingDetail.businesstype);
          setValue('image', listingDetail.movieRef?.movieImage);
          setValue('listingType', listingDetail.listingType);
          setValue('title', listingDetail.title);
          setValue('overview', listingDetail.overview);
          setValue('isActive', listingDetail.isActive);
          setValue('yearReleased', new Date(listingDetail.movieRef?.releaseDate as string).getFullYear());
          setValue('countryOfOrigin', listingDetail.movieRef?.countryOfOrigin);
          setValue('durationInMinutes', listingDetail.movieRef?.durationInMinutes);
          setValue('officialRatingReceived', listingDetail.movieRef?.rating.toString());
          setValue('trailerLinks', {
            main: listingDetail.movieRef?.trailerUrls ? listingDetail.movieRef?.trailerUrls[0] : '',
            trailer2: listingDetail.movieRef?.trailerUrls ? listingDetail.movieRef?.trailerUrls[1] : '',
            trailer3: listingDetail.movieRef?.trailerUrls ? listingDetail.movieRef?.trailerUrls[2] : '',
          });
          setValue('casts', listingDetail.movieRef?.casts || [{
            castImage: null,
            name: '',
            characterName: '',
          }]);
          setValue('coverPhoto', listingDetail.movieRef?.movieImage || null);
          break;

        case BusinessType.PODCASTER:
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

        default:
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
    remove,
    reset,
  };
};

export default useBusinessListingForm;
