import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomCreatePost from '../../components/ui/CustomCreatePost';
import PostFeed from '../../components/ui/PostFeed/PostFeed';
import SuggestedFriend from './SuggestedFriend';
import ReportModal from '../../components/ui/ReportModal';
import { getHomeFeedPosts } from '../../api/feed-posts';
import ErrorMessageList from '../../components/ui/ErrorMessageList';

interface PostProps {
  _id: string;
  createdAt: string;
  message: string;
  images: string;
  userName: string;
  firstName: string;
  profilePic: string;
  userId: {
    userName: string;
    profilePic: string;
  };
}
interface PostFeedProps {
  _id: string;
  postDate: string;
  content: string;
  postUrl: string;
  userName: string;
  firstName: string;
  profileImage: string;
  commentCount: number;
  likeCount: number;
  sharedList: number;
  id: number;
  likeIcon: boolean;
}
const popoverOptions = ['Edit', 'Delete'];

function Home() {
  const [show, setShow] = useState(false);
  const [postFeedData, setPostFeedData] = useState<PostFeedProps[]>([]);
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
    getHomeFeedPosts()
      .then((res) => {
        const postFeedList = res.data.map((data: PostProps) => (
          {
            ...data,
            /* eslint no-underscore-dangle: 0 */
            id: data._id,
            postDate: data.createdAt,
            content: data.message,
            postUrl: data.images,
            userName: data.userId.userName,
            firstName: data.userId.userName,
            profileImage: data.userId.profilePic,
          }
        ));
        setPostFeedData(postFeedList);
        if (res.data.length < 10) {
          setNoMoreData(true);
        }
      })
      .catch((error) => {
        setErrorMessage(error.response.data.message);
      });
  }, []);

  const fetchMorePost = () => {
    if (!noMoreData) {
      getHomeFeedPosts(postFeedData[postFeedData.length - 1]._id)
        .then((res) => {
          const postFeedList = res.data.map((data: PostProps) => (
            {
              ...data,
              /* eslint no-underscore-dangle: 0 */
              id: data._id,
              postDate: data.createdAt,
              content: data.message,
              postUrl: data.images,
              userName: data.userId.userName,
              firstName: data.userId.userName,
              profileImage: data.userId.profilePic,
            }
          ));
          setPostFeedData((prev: PostFeedProps[]) => [
            ...prev,
            ...postFeedList,
          ]);
          if (res.data.length === 0) {
            setNoMoreData(true);
          }
        })
        .catch((error) => setErrorMessage(error.response.data.message));
    }
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <div>
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
          initialLoad={false}
          loadMore={fetchMorePost}
          hasMore
        >
          {postFeedData && postFeedData.length > 0
            ? (
              <PostFeed
                postFeedData={postFeedData}
                popoverOptions={popoverOptions}
                isCommentSection={false}
                onPopoverClick={handlePopoverOption}
              />
            )
            : <p className="text-center">No posts available</p>}
        </InfiniteScroll>
        {noMoreData && <p className="text-center">No more posts</p>}
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default Home;
