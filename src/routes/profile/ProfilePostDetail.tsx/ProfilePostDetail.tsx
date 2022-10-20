import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { feedPostDetail } from '../../../api/feedpost';
import { userProfilePost } from '../../../api/users';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';

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
  createdAt: string,
  images: string,
  message: string,
}
interface UserData {
  userName: string;
  profilePic: string;
}

function ProfilePostDetail() {
  const [searchParams] = useSearchParams();
  const { id, userName } = useParams<string>();
  const queryParam = searchParams.get('view');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [postData, setPostData] = useState<UserPostData[]>([]);
  const [userData, setUserData] = useState<UserData>();

  let popoverOptions = ['Report', 'Block user'];
  if (queryParam === 'self') {
    popoverOptions = ['Edit', 'Delete'];
  }
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  useEffect(() => {
    if (id && userData) {
      feedPostDetail(id)
        .then((res) => {
          setPostData([
            {
              ...res.data,
              /* eslint no-underscore-dangle: 0 */
              id: res.data._id,
              postDate: res.data.createdAt,
              content: res.data.message,
              postUrl: res.data.images,
              userName: userData.userName,
              profileImage: userData.profilePic,
            },
          ]);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    }
  }, [id, userData]);

  useEffect(() => {
    if (userName) {
      userProfilePost(userName)
        .then((res) => setUserData(res.data));
    }
  }, [userName]);

  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      {errorMessage && errorMessage.length > 0 && (
        <div className="mt-3 text-start">
          <ErrorMessageList errorMessages={errorMessage} className="m-0" />
        </div>
      )}
      <PostFeed
        postFeedData={postData}
        popoverOptions={popoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePostDetail;
