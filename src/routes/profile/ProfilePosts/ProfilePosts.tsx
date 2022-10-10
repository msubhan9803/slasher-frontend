import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ProfileHeader from '../ProfileHeader';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import ReportModal from '../../../components/ui/ReportModal';
import { getProfilePosts } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';

interface UserData {
  id: string;
  firstName: string;
  userName: string;
  profilePic: string;
}
interface UserPostData {
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
function ProfilePosts() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [userData, setUserData] = useState<UserData>();
  const [userPostData, setUserPostData] = useState<UserPostData[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  useEffect(() => {
    if (userData) {
      getProfilePosts(userData.id)
        .then((res) => {
          const userPostList = res.data.map((data: any) => (
            {
              ...data,
              /* eslint no-underscore-dangle: 0 */
              id: data._id,
              postDate: data.createdAt,
              content: data.message,
              postUrl: data.images,
              userName: userData.userName,
              firstName: userData.userName,
              profileImage: userData.profilePic,
            }
          ));
          setUserPostData(userPostList);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    }
  }, [userData]);

  const fetchMorePost = () => {
    if (userData) {
      getProfilePosts(userData.id, userPostData[userPostData.length - 1]._id)
        .then((res) => {
          const userPostList = res.data.map((data: any) => (
            {
              ...data,
              /* eslint no-underscore-dangle: 0 */
              id: data._id,
              postDate: data.createdAt,
              content: data.message,
              postUrl: data.images,
              userName: userData.userName,
              firstName: userData.userName,
              profileImage: userData.profilePic,
            }
          ));
          setUserPostData((prev: any) => [
            ...prev,
            ...userPostList,
          ]);
          if (res.data.length === 0) {
            setNoMoreData(true);
          }
        })
        .catch((error) => setErrorMessage(error.response.data.message));
    }
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="posts" userDetail={setUserData} />
      {queryParam === 'self'
        && (
          <div className="mt-4">
            <CustomCreatePost imageUrl="https://i.pravatar.cc/300?img=12" />
          </div>
        )}

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
        {userPostData && userPostData.length > 0
          ? (
            <PostFeed
              postFeedData={userPostData}
              popoverOptions={popoverOptions}
              isCommentSection={false}
              onPopoverClick={handlePopoverOption}
            />
          )
          : 'No posts available'}
      </InfiniteScroll>
      {noMoreData && <p className="text-center">No more posts</p>}
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}
export default ProfilePosts;
