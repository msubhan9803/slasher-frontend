import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import { reviewPost } from './review-data';
import CreatePostComponent from '../../../components/ui/CreatePostComponent';
import { FormatMentionProps } from '../../posts/create-post/CreatePost';

const loginUserPopoverOptions = ['Edit Review', 'Delete Rview'];
const otherUserPopoverOptions = ['Report', 'Block user'];

function MovieReviews() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [postContent, setPostContent] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [titleContent, setTitleContent] = useState<string>('');
  const [containSpoiler, setContainSpoiler] = useState<boolean>(false);
  const [rating, setRating] = useState(0);
  const [goreFactor, setGoreFactor] = useState(0);
  const liked = true;
  const handlePopoverOption = (value: string) => value;
  const handleCreateInput = () => {
    setShowReviewForm(true);
  };
  const mentionReplacementMatchFunc = (match: string) => {
    if (match) {
      const finalString: any = formatMention.find(
        (matchMention: FormatMentionProps) => match.includes(matchMention.value),
      );
      return finalString.format;
    }
    return undefined;
  };
  const addPost = () => {
    /* eslint no-useless-escape: 0 */
    const postContentWithMentionReplacements = (postContent.replace(/\@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    const groupPostData = {
      title: titleContent,
      message: postContentWithMentionReplacements,
      spoiler: containSpoiler,
      rate: rating,
      goreFactorRate: goreFactor,
      worthIt: liked,
    };
    setShowReviewForm(false);
    return groupPostData;
  };
  return (
    <div>
      {
        showReviewForm
          ? (
            <CreatePostComponent
              setPostMessageContent={setPostContent}
              defaultValue={postContent}
              formatMention={formatMention}
              setFormatMention={setFormatMention}
              postType="review"
              titleContent={titleContent}
              setTitleContent={setTitleContent}
              createUpdatePost={addPost}
              containSpoiler={containSpoiler}
              setContainSpoiler={setContainSpoiler}
              rating={rating}
              setRating={setRating}
              goreFactor={goreFactor}
              setGoreFactor={setGoreFactor}
              liked={liked}
            />
          ) : (
            <CustomCreatePost
              label="Write a review"
              iconClass="text-primary"
              icon={solid('paper-plane')}
              handleCreateInput={handleCreateInput}
            />
          )
      }
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
