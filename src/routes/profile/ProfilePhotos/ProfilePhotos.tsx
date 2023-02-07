import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import ProfileHeader from '../ProfileHeader';
import { User } from '../../../types';
import { userPhotos } from '../../../api/users';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { useAppSelector } from '../../../redux/hooks';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import RightSidebarViewer from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';

const ProfilePhoto = styled.div`
  aspect-ratio:1;
  img {
    object-fit: cover;
  }
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
  const [requestAdditionalPhotos, setRequestAdditionalPhotos] = useState<boolean>(false);
  const [userPhotosList, setUserPhotosList] = useState<UserPhotos[]>([]);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const loginUserId = useAppSelector((state) => state.user.user.id);

  useEffect(() => {
    if (requestAdditionalPhotos && !loadingPhotos) {
      setLoadingPhotos(true);
      userPhotos(
        user.id,
        userPhotosList.length > 0 ? userPhotosList[userPhotosList.length - 1].id : undefined,
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
  return (

    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <ProfileHeader tabKey="photos" user={user} />
        <div className="bg-dark rounded px-md-4 pb-md-4 bg-mobile-transparent mt-3">
          <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
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
                    <ProfilePhoto className="position-relative">
                      <Link to={`/${user.userName}/posts/${data.id}?imageId=${images._id}`}>
                        <Image src={images.image_path} alt={`${images._id} post pictures`} className="rounded mt-4 w-100 h-100" key={images._id} />
                      </Link>
                    </ProfilePhoto>
                  </Col>
                ))
              ))}
            </Row>
          </InfiniteScroll>
          {loadingPhotos && <LoadingIndicator />}
          {noMoreData && renderNoMoreDataMessage()}
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        {loginUserId === user?.id ? <RightSidebarSelf /> : <RightSidebarViewer />}
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default ProfilePhotos;
