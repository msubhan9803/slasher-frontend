import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { userPhotos } from '../../../../api/users';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';
import { useAppSelector } from '../../../../redux/hooks';

interface PhotoList {
  id: string,
  imageId: string,
  image: string
}
interface ImageList {
  image_path: string;
  _id: string;
}

function Photos() {
  const [photos, setPhotos] = useState<PhotoList[]>([]);
  const userData = useAppSelector((state) => state.userNameSlice);

  useEffect(() => {
    if (userData.userId) {
      userPhotos(userData.userId, '', '6')
        .then((res) => {
          const newPhotoList: PhotoList[] = [];
          res.data.map((photosData: any) => {
            photosData.images.forEach((photo: ImageList) => {
              if (newPhotoList.length < 6) {
                /* eslint no-underscore-dangle: 0 */
                newPhotoList.push({
                  id: photosData._id,
                  imageId: photo._id,
                  image: photo.image_path,
                });
              }
            });
            return null;
          });
          setPhotos(newPhotoList);
        });
    }
  }, []);
  return (
    <>
      <SidebarHeaderWithLink headerLabel="Photos" linkLabel="See All" linkTo={`/${userData?.userName}/photos`} />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {photos.map((photo, photoIndex) => {
            return (
              <Col xs="4" key={`${photo.id}_${photo.imageId}`}>
                <Link to={`/${userData?.userName}/posts/${photo.id}?imageId=${photo.imageId}`}>
                  <img
                    alt={`${photoIndex}`}
                    src={photo.image}
                    className={`img-fluid rounded-3 ${photoIndex > 2 ? 'mt-3' : ''}`}
                  />
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
