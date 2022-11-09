import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { userPhotos } from '../../../../api/users';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';
import { useAppSelector } from '../../../../redux/hooks';

interface NewPhotoList {
  id: string,
  imageId: string,
  image: string
}
interface ImageList {
  image_path: string;
  _id: string;
}

function Photos() {
  const [photos, setPhotos] = useState<NewPhotoList[]>([]);
  const userData = useAppSelector((state) => state.otherUser);

  useEffect(() => {
    if (userData.userId) {
      userPhotos(userData.userId, '', '6')
        .then((res) => {
          const newPhotoList: NewPhotoList[] = [];
          res.data.map((data: any) => {
            data.images.forEach((element: ImageList) => {
              /* eslint no-underscore-dangle: 0 */
              newPhotoList.push({
                id: data._id,
                imageId: element._id,
                image: element.image_path,
              });
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
          {photos.map((photo, i) => {
            if (i < 6) {
              return (
                <Col xs="4" key={`${photo.id}_${photo.imageId}`}>
                  <Link to={`/${userData?.userName}/posts/${photo.id}?imageId=${photo.imageId}`}>
                    <img
                      alt={`${i}`}
                      src={photo.image}
                      className={`img-fluid rounded-3 ${i > 2 ? 'mt-3' : ''}`}
                    />
                  </Link>
                </Col>
              );
            }
            return null;
          })}
        </Row>
      </div>
    </>
  );
}

export default Photos;
