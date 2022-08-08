import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommentSection from './CommentSection';

interface Props {
  id: number;
  profileImage: string;
  userName: string;
  profileDateTime: string;
  like: number;
  userMessage: string;
  commentReplySection?: Values[];
  onIconClick: (value: number) => void;
  likeIcon: boolean;
}
interface Values {
  id: number;
  image: string;
  name: string;
  time: string;
  like: number;
  likeIcon: boolean;
  commentMention: string;
  commentMsg: string;
  commentImg?: string;
  onIconClick: (value: number) => void;
}

const UserProfileImage = styled.img`
  height:3.125rem;
  width:3.125rem;
`;
const StyledCommentInputGroup = styled(InputGroup)`
  .form-control {
    border-radius: 1.875rem;
    border-bottom-right-radius: 0rem;
    border-top-right-radius: 0rem;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    min-width: 1.875rem;
  }
`;

function PostCommentSection({ commentSectionData, commentImage, popoverOption }: any) {
  const [commentData, setCommentData] = useState<any[]>(commentSectionData);
  const handleLikeIcon = (likeId: number) => {
    const tempData = [...commentData];
    tempData.map((data: any) => {
      const temp = data;
      if (temp.id === likeId) {
        temp.likeIcon = !temp.likeIcon;
      }
      data.commentReplySection.map((like: any) => {
        const tempLike = like;
        if (tempLike.id === likeId) {
          tempLike.likeIcon = !tempLike.likeIcon;
        }
        return true;
      });
      return tempData;
    });
    setCommentData(tempData);
  };
  return (
    <>
      <Row className="ps-3 pt-2 order-last order-sm-0">
        <Col xs="auto" className="pe-0">
          <UserProfileImage src={commentImage} className="me-3 rounded-circle bg-secondary" />
        </Col>
        <Col className="ps-0 pe-4">
          <StyledCommentInputGroup className="mb-4">
            <Form.Control
              placeholder="Write a comment"
              className="fs-5 border-end-0"
            />
            <InputGroup.Text>
              <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" className="" />
            </InputGroup.Text>
          </StyledCommentInputGroup>
        </Col>
      </Row>
      {commentData.map((data: Props) => (
        <Row className="ps-md-4 pt-md-1" key={data.id}>
          <Col>
            <Row className="mx-auto">
              <Col className="ps-md-0">
                <CommentSection
                  id={data.id}
                  image={data.profileImage}
                  name={data.userName}
                  time={data.profileDateTime}
                  likes={data.like}
                  likeIcon={data.likeIcon}
                  commentMsg={data.userMessage}
                  onIconClick={() => handleLikeIcon(data.id)}
                  popoverOptions={popoverOption}
                />
                {data.commentReplySection && data.commentReplySection.map((comment: Values) => (
                  <div key={comment.id} className="ms-5 ps-2">
                    <div className="ms-md-4">
                      <CommentSection
                        id={comment.id}
                        image={comment.image}
                        name={comment.name}
                        likes={comment.like}
                        time={comment.time}
                        likeIcon={comment.likeIcon}
                        commentMsg={comment.commentMsg}
                        commentMention={comment.commentMention}
                        commentImg={comment.commentImg}
                        onIconClick={() => handleLikeIcon(comment.id)}
                        popoverOptions={popoverOption}
                      />
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
          </Col>
        </Row>
      ))}
    </>
  );
}
PostCommentSection.defaultProps = {
  commentReplySection: undefined,
};
export default PostCommentSection;
