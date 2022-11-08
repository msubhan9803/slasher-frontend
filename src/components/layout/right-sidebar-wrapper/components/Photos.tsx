import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { userPhotos } from '../../../../api/users';
import { ImageList, UserPhotos } from '../../../../routes/profile/ProfilePhotos/ProfilePhotos';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

const photo = [
  { image: 'https://i.pravatar.cc/300?img=10' },
  { image: 'https://i.pravatar.cc/300?img=11' },
  { image: 'https://i.pravatar.cc/300?img=25' },
  { image: 'https://i.pravatar.cc/300?img=16' },
  { image: 'https://i.pravatar.cc/300?img=17' },
];

function Photos() {
  const id = Cookies.get('userId');
  const [photos, setPhotos] = useState<UserPhotos[]>([]);
  useEffect(() => {
    if (id) {
      userPhotos(id, '', '6')
        .then((res) => {
          const newPhotoList = res.data.map((data: any) => {
            const obj = data.images.map((images: any) => ({
              /* eslint no-underscore-dangle: 0 */
              id: data._id,
              imageId: images._id,
              image: images.image_path
            }))
            return obj;
          });
          setPhotos(newPhotoList);
        })
    }
  }, [])
  console.log("photos", photos)
  return (
    <>
      <SidebarHeaderWithLink headerLabel="Photos" linkLabel="See All" linkTo="/" />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {photo.map((photo, i) => (
            <Col xs="4" key={photo.image}>
              <img
                alt={`${i}`}
                src={photo.image}
                className={`img-fluid rounded-3 ${i > 2 ? 'mt-3' : ''}`}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default Photos;
