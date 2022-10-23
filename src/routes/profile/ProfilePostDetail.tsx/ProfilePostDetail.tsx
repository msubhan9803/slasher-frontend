import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  userId: {
    userName: string;
    profilePic: string;
  }
}

function ProfilePostDetail() {
  const [searchParams] = useSearchParams();
  const { id, userName } = useParams<string>();
  const navigate = useNavigate();

  const queryParam = searchParams.get('view');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [postData, setPostData] = useState<UserPostData[]>([]);
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');

  let popoverOptions = ['Report', 'Block user'];

  if (queryParam === 'self') {
    popoverOptions = ['Edit', 'Delete'];
  }

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  const decryptMessage = (content: string) => {
    const found = content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '');
    return found;
  };

  useEffect(() => {
    if (id) {
      feedPostDetail(id)
        .then((res) => {
          if (res.data.userId.userName !== userName) {
            navigate(`/${res.data.userId.userName}/posts/${id}`);
          }
          setPostData([
            {
              ...res.data,
              /* eslint no-underscore-dangle: 0 */
              id: res.data._id,
              postDate: res.data.createdAt,
              content: decryptMessage(res.data.message),
              postUrl: res.data.images,
              userName: res.data.userId.userName,
              profileImage: res.data.userId.profilePic,
            },
          ]);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    }
  }, [id]);

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
