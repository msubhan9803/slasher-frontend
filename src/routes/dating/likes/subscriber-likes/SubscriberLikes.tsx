import React from 'react';
import { Col, Row } from 'react-bootstrap';
import LikesUserCard from './LikesUserCard';

interface SubscriberLikesProps {
  MatchesList: LikesListProps[];
  LikesList: LikesListProps[];
  handleLikesOption: (value: string) => void;
}
interface LikesListProps {
  id: number;
  imageUrl: string;
  name: string;
  email: string;
}

const matchesOptions = ['View profile', 'Message', 'Unmatch', 'Block user', 'Report'];
const likesOptions = ['View profile', 'Message', 'Block user', 'Report'];

function SubscriberLikes({ MatchesList, LikesList, handleLikesOption }: SubscriberLikesProps) {
  return (
    <>
      <div className="bg-dark bg-mobile-transparent py-4 p-lg-4 pb-lg-3 rounded-3">
        <h1 className="h2 fw-semibold mb-3">Matches</h1>
        <Row>
          {MatchesList.map((likesDetail: LikesListProps) => (
            <Col sm={6} md={4} lg={6} xl={4} key={likesDetail.id}>
              <LikesUserCard
                likesDetail={likesDetail}
                popoverOptions={matchesOptions}
                handlePopover={handleLikesOption}
              />
            </Col>
          ))}
        </Row>
      </div>
      <div className="mt-lg-4 bg-dark bg-mobile-transparent p-lg-4 pb-lg-3 rounded-3">
        <h1 className="h2 fw-semibold mb-3">Likes</h1>
        <Row>
          {LikesList && LikesList.length > 0 && LikesList.map((likesDetail: any) => (
            <Col sm={6} md={4} lg={6} xl={4} key={likesDetail.id}>
              <LikesUserCard
                likesDetail={likesDetail}
                popoverOptions={likesOptions}
                handlePopover={handleLikesOption}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default SubscriberLikes;
