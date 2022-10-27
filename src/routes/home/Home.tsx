import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomCreatePost from '../../components/ui/CustomCreatePost';
import PostFeed from '../../components/ui/PostFeed/PostFeed';
import SuggestedFriend from './SuggestedFriend';
import ReportModal from '../../components/ui/ReportModal';
import { getHomeFeedPosts } from '../../api/feed-posts';
import ErrorMessageList from '../../components/ui/ErrorMessageList';
import { Post } from '../../types';

const popoverOptions = ['Edit', 'Delete'];

function Home() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const handlePopoverOption = (value: string) => {
    if (value === 'Delete') {
      setShow(true);
      setDropDownValue(value);
    }
  };

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      setLoadingPosts(true);
      getHomeFeedPosts(
        posts.length > 1 ? posts[posts.length - 1]._id : undefined,
      ).then((res) => {
        const newPosts = res.data.map((data: any) => {
          if (data.userId) {
            // Regular post
            return {
              /* eslint no-underscore-dangle: 0 */
              _id: data._id,
              id: data._id,
              postDate: data.createdAt,
              content: data.message,
              postUrl: data.images,
              userName: data.userId.userName,
              profileImage: data.userId.profilePic,
            };
          }

          // RSS feed post
          return {
            /* eslint no-underscore-dangle: 0 */
            _id: data._id,
            id: data._id,
            postDate: data.createdAt,
            content: data.message,
            postUrl: data.images,
            userName: data.rssfeedProviderId?.title,
            profileImage: data.rssfeedProviderId?.logo,
          };
        });
        setPosts((prev: Post[]) => [
          ...prev,
          ...newPosts,
        ]);
        if (res.data.length === 0) { setNoMoreData(true); }
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
      );
    }
  }, [requestAdditionalPosts, loadingPosts]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        posts.length === 0
          ? 'No posts available'
          : 'No more posts'
      }
    </p>
  );

  const renderLoadingIndicator = () => (
    <p className="text-center">Loading...</p>
  );

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <CustomCreatePost imageUrl="https://i.pravatar.cc/300?img=12" />
      <h1 className="h2 mt-2 ms-3 ms-md-0">Suggested friends</h1>
      <SuggestedFriend />
      {errorMessage && errorMessage.length > 0 && (
        <div className="mt-3 text-start">
          <ErrorMessageList errorMessages={errorMessage} className="m-0" />
        </div>
      )}
      <InfiniteScroll
        pageStart={0}
        initialLoad
        loadMore={() => { setRequestAdditionalPosts(true); }}
        hasMore={!noMoreData}
      >
        {
          posts.length > 0
          && (
            <PostFeed
              postFeedData={posts}
              popoverOptions={popoverOptions}
              isCommentSection={false}
              onPopoverClick={handlePopoverOption}
            />
          )
        }
      </InfiniteScroll>
      {loadingPosts && renderLoadingIndicator()}
      {noMoreData && renderNoMoreDataMessage()}
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default Home;
