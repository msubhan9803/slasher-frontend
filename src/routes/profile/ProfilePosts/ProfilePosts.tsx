import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ProfileHeader from '../ProfileHeader';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import ReportModal from '../../../components/ui/ReportModal';
import { userProfilePost, userProfilePostById } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';

const popoverOptions = ['Edit', 'Delete'];
function ProfilePosts() {
  const { userName } = useParams<string>();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [userData, setUserData] = useState<any>();
  const [userPostData, setUserPostData] = useState([]);

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  useEffect(() => {
    if (userName) {
      userProfilePost(userName)
        .then((res) => {
          setUserData(res.data);
          setErrorMessage([]);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    }
  }, []);

  useEffect(() => {
    if (userData) {
      userProfilePostById(userData.id)
        .then((res) => {
          const entities = res.data.map((data: any) => (
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
          setUserPostData(entities);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    }
  }, [userData]);

  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="posts" />
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
      {userPostData.length !== 10 && <p className="text-center">No more posts</p>}
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}
export default ProfilePosts;
