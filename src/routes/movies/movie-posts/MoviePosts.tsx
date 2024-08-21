import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import CreatePostInput from '../../../components/ui/post/CreatePostInput';
import postImage from '../../../images/movie-post.jpg';
import ReportModal from '../../../components/ui/ReportModal';
import BusinessListingPosts from '../../../components/ui/BusinessListing/BusinessListingPosts';
import { MovieData, MovieType } from '../../../types';

const selfPostData = [
  {
    id: 1,
    userName: 'The Curse of La Patasola',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    message:
      'Samuel Goldwyn Films presents Dreamcatcher, a new horror movie written and directed by Jacob Johnston and coming to On-Demand and Digital on March 5, 2021.',
    postUrl: postImage,
    likeIcon: false,
  },
  {
    id: 2,
    userName: 'The Curse of La Patasola',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/11/2022 11:10 PM',
    message: 'Hell is empty and all the devils are here. \n',
    hashTag: ['horrorday', 'horrorcommunity', 'slasher', 'horror'],
    likeIcon: true,
  },
];
const viewerPostData = [
  {
    id: 1,
    userName: 'The Curse of La Patasola',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    message:
      'Samuel Goldwyn Films presents Dreamcatcher, a new horror movie written and directed by Jacob Johnston and coming to On-Demand and Digital on March 5, 2021.',
    postUrl: postImage,
    likeIcon: false,
  },
];

const selfOptions = ['Edit', 'Delete'];
const viewerOptions = ['Report'];

type Props = {
  movieData: MovieData
};

function MoviePosts({ movieData }: Props) {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const popoverOptions = queryParam === 'self' ? selfOptions : viewerOptions;
  const postData = queryParam === 'self' ? selfPostData : viewerPostData;
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  return (
    <>
      {queryParam === 'self' && <CreatePostInput />}
      {/* <PostFeed
        postFeedData={postData}
        popoverOptions={popoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
      /> */}

      {movieData.type === MovieType.UserDefined
        && movieData.businessListingRef && (
          <BusinessListingPosts
            businessListingRef={movieData.businessListingRef as string}
          />
      )}

      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
      />
    </>
  );
}

export default MoviePosts;
