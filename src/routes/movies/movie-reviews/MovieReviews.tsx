import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useSearchParams } from 'react-router-dom';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import CreatePost from '../../posts/create-post/CreatePost';

export const reviewPost = [
  {
    _id: 'post01',
    id: 'post01',
    postDate: '2022-06-18T17:40:12.000Z',
    contentHeading: 'An incredible movie. One that lives with you..',
    content: "It is no wonder that the film has such a high rating, it is quite literally breathtaking. What can I say that hasn't said before? Not much, it's the story, the acting, the premise, but most of all, this movie is about how it makes you feel. Sometimes you watch a film, and can't remember it days later, this film loves with you, once you've seen it, you don't forget.",
    userName: 'Nathaniel Lewis',
    profileImage: 'https://i.pravatar.cc/300?img=14',
    userId: 'user01',
    likes: 12,
    likeIcon: false,
    likeCount: 12,
    commentCount: 10,
    rating: 4.5,
    goreFactor: 5,
    worthWatching: true,
  },
  {
    _id: 'post02',
    id: 'post02',
    postDate: '2022-06-18T17:40:12.000Z',
    contentHeading: 'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain.',
    content: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters',
    userName: 'Aly Khan',
    profileImage: 'https://i.pravatar.cc/300?img=15',
    userId: 'user01',
    likes: 20,
    likeIcon: false,
    likeCount: 20,
    commentCount: 10,
    rating: 4.5,
    goreFactor: 5,
    worthWatching: false,
  },
  {
    _id: 'post03',
    id: 'post03',
    postDate: '2022-06-18T17:40:12.000Z',
    contentHeading: 'An incredible movie. One that lives with you.',
    userName: 'Nathaniel Lewis',
    profileImage: 'https://i.pravatar.cc/300?img=14',
    userId: 'user01',
    likes: 20,
    likeIcon: false,
    likeCount: 20,
    commentCount: 10,
    spoiler: true,
  },
];

const loginUserPopoverOptions = ['Edit Review', 'Delete Rview'];
const otherUserPopoverOptions = ['Report', 'Block user'];

function MovieReviews() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const handlePopoverOption = (value: string) => value;
  const handleCreateInput = () => {
    setShowReviewForm(true);
  };
  return (
    <div>
      {queryParam === 'self'
        && !showReviewForm
        ? (
          <CustomCreatePost
            label="Write a review"
            iconClass="text-primary"
            icon={solid('paper-plane')}
            handleCreateInput={handleCreateInput}
          />
        )
        : <CreatePost />}
      <h1 className="h2 my-3">
        Reviews
        <span className="fw-normal text-light">(999k)</span>
      </h1>
      <PostFeed
        postFeedData={reviewPost}
        postType="review"
        popoverOptions={loginUserPopoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
        otherUserPopoverOptions={otherUserPopoverOptions}
      />
    </div>
  );
}

export default MovieReviews;
