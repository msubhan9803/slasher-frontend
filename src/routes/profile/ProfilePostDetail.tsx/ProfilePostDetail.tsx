import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { feedPostDetail } from '../../../api/feedpost';
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
type LocationState = {
  state: {
    post: UserPostData;
  };
};
function ProfilePostDetail() {
  const [searchParams] = useSearchParams();
  const { id } = useParams<string>();
  const location = useLocation();
  const { post } = (location as LocationState).state;

  const queryParam = searchParams.get('view');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [postData, setPostData] = useState<UserPostData[]>([]);

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
    if (id && location) {
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
              userName: post.userName,
              firstName: post.firstName,
              profileImage: post.profileImage,
            },
          ]);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    }
  }, [id, location]);
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
