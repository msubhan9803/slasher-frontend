import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';
import CustomPopover from '../../../components/ui/CustomPopover';
import ReportModal from '../../../components/ui/ReportModal';
import { User } from '../../../types';
import { userPhotos } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';

const ProfilePhoto = styled.div`
  aspect-ratio:1;
  img {
    object-fit: cover;
  }
`;
const StyledPopover = styled.div`
  top: 25px;
  right: 8px;
`;
interface UserPhotos {
  id: string;
  imagesList: ImageList[]
}
interface ImageList {
  image_path: string;
  _id: string;
}
interface Props {
  user: User
}
function ProfilePhotos({ user }: Props) {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [requestAdditionalPhotos, setRequestAdditionalPhotos] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [userPhotosList, setUserPhotosList] = useState<UserPhotos[]>([]);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const viewerOptions = ['Unfriend', 'Block user', 'Report'];
  const selfOptions = ['Edit post', 'Delete Image'];
  const popoverOption = queryParam === 'self' ? selfOptions : viewerOptions;

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  useEffect(() => {
    if (requestAdditionalPhotos && !loadingPhotos) {
      setLoadingPhotos(true);
      userPhotos(
        user.id,
        userPhotosList.length > 1 ? userPhotosList[userPhotosList.length - 1].id : undefined,
      )
        .then((res) => {
          const newPhotoList = res.data.map((data: any) => (
            {
              /* eslint no-underscore-dangle: 0 */
              id: data._id,
              imagesList: data.images,
            }
          ));
          setUserPhotosList((prev: UserPhotos[]) => [
            ...prev,
            ...newPhotoList,
          ]);
          if (res.data.length === 0) { setNoMoreData(true); }
        })
        .catch(
          (error) => {
            setNoMoreData(true);
            setErrorMessage(error.response.data.message);
          },
        ).finally(
          () => { setRequestAdditionalPhotos(false); setLoadingPhotos(false); },
        );
    }
  }, [requestAdditionalPhotos, loadingPhotos]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        userPhotosList.length === 0
          ? 'No photos available'
          : 'No more photos'
      }
    </p>
  );

  const renderLoadingIndicator = () => (
    <p className="text-center">Loading...</p>
  );
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="photos" user={user} />
      <div className="bg-dark rounded px-md-4 pb-md-4 bg-mobile-transparent mt-3">
        {errorMessage && errorMessage.length > 0 && (
          <div className="mt-3 text-start">
            <ErrorMessageList errorMessages={errorMessage} className="m-0" />
          </div>
        )}
        <InfiniteScroll
          pageStart={0}
          initialLoad
          loadMore={() => { setRequestAdditionalPhotos(true); }}
          hasMore={!noMoreData}
        >
          <Row>
            {userPhotosList.map((data: UserPhotos) => (
              data.imagesList && data.imagesList.map((images: ImageList) => (
                <Col xs={4} md={3} key={images._id}>
                  <Link to={`/${user.userName}/posts/${data.id}?imageId=${images._id}`}>
                    <ProfilePhoto className="position-relative">
                      <Image src={images.image_path} className="rounded mt-4 w-100 h-100" key={images._id} />
                      <StyledPopover className="position-absolute">
                        <CustomPopover
                          popoverOptions={popoverOption}
                          onPopoverClick={handlePopoverOption}
                        />
                      </StyledPopover>
                    </ProfilePhoto>
                  </Link>
                </Col>
              ))
            ))}
          </Row>
        </InfiniteScroll>
        {loadingPhotos && renderLoadingIndicator()}
        {noMoreData && renderNoMoreDataMessage()}
      </div>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePhotos;
