import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { userPhotos } from '../../../../api/users';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';
import { User } from '../../../../types';
import LoadingIndicator from '../../../ui/LoadingIndicator';
import { scrollToTop } from '../../../../utils/scrollFunctions';

const ProfilePhoto = styled.div`
  aspect-ratio:1;
  img {
    object-fit: cover;
  }
`;
interface PhotoList {
  id: string,
  imageId: string,
  image: string
}
interface ImageList {
  image_path: string;
  _id: string;
}

type PhotosProps = { user: User };

function Photos({ user }: PhotosProps) {
  const [photos, setPhotos] = useState<PhotoList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user._id) { return; }
    userPhotos(user._id, '', '3')
      .then((res) => {
        const newPhotoList: PhotoList[] = [];
        res.data?.forEach((photosData: any) => {
          photosData.images.forEach((photo: ImageList) => {
            if (newPhotoList.length < 3) {
              newPhotoList.push({
                id: photosData._id,
                imageId: photo._id,
                image: photo.image_path,
              });
            }
          });
        });
        setPhotos(newPhotoList);
        setLoading(false);
      });
  }, [user]);

  if (!user._id) { return null; }

  return (
    <>
      <SidebarHeaderWithLink headerLabel="Photos" headerLabelCount={user.imagesCount} linkLabel="See All" linkTo={`/${user?.userName}/photos`} />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {!loading && photos.length === 0 && <div>No photos yet.</div>}
          {loading ? <LoadingIndicator />
            : photos.map((photo, photoIndex) => {
              return (
                <Col xs="4" key={`${photo.id}_${photo.imageId}`}>
                  <Link onClick={() => scrollToTop('instant')} to={`/${user?.userName}/posts/${photo.id}?imageId=${photo.imageId}`}>
                    <ProfilePhoto>
                      <img
                        alt={`${photoIndex}`}
                        src={photo.image}
                        className={`w-100 h-100 img-fluid rounded-3 ${photoIndex > 2 ? 'mt-3' : ''}`}
                      />
                    </ProfilePhoto>
                  </Link>
                </Col>
              );
              return null;
            })}
        </Row>
      </div>
    </>
  );
}

export default Photos;
