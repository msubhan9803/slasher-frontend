import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommentSection from '../components/CommentSection/CommentSection';

interface Props {
  id: number;
  profileImage: string;
  userName: string;
  profileDateTime: string;
  userMessage: string;
  commentReplySection: Values[];
}
interface Values {
  id: number;
  image: string;
  name: string;
  time: string;
  commentMention: string;
  commentMsg: string;
  commentImg?: string;
}
const commentSection = [
  {
    id: 1,
    profileImage: 'https://i.pravatar.cc/300?img=30',
    userName: 'Mari Ferrer',
    profileDateTime: '06/19/2022 12:10 AM',
    userMessage: 'It is a long established fact that a reader will be distracted bythe readable content of a page.',
    commentReplySection:
      [
        {
          id: 2,
          image: 'https://i.pravatar.cc/300?img=45',
          name: 'Austin Joe',
          time: '06/19/2022 12:10 AM',
          commentMention: '@Mari Ferrer',
          commentMsg: 'eque porro quisquam est qui dolorem ipsum',
        },
        {
          id: 3,
          image: 'https://i.pravatar.cc/300?img=25',
          name: 'Rohma Mxud',
          time: '06/19/2022 12:10 AM',
          commentMention: '@Austin Joe',
          commentMsg: 'Lorem Ipsum has been the industry standard dummy',
          commentImg: 'https://i.pravatar.cc/100?img=56',
        },
      ],
  },
  {
    id: 4,
    profileImage: 'https://i.pravatar.cc/300?img=30',
    userName: 'Mari Ferrer',
    profileDateTime: '06/19/2022 12:10 AM',
    userMessage: 'It is a long established fact that a reader will be distracted bythe readable content of a page.',
    commentReplySection:
      [
        {
          id: 5,
          image: 'https://i.pravatar.cc/300?img=45',
          name: 'Austin Joe',
          time: '06/19/2022 12:10 AM',
          commentMention: '@Mari Ferrer ',
          commentMsg: 'eque porro quisquam est qui dolorem ipsum',
        },
        {
          id: 6,
          image: 'https://i.pravatar.cc/300?img=25',
          name: 'Rohma Mxud',
          time: '06/19/2022 12:10 AM',
          commentMention: '@Austin Joe ',
          commentMsg: 'Lorem Ipsum has been the industry standard dummy',
          commentImg: 'https://i.pravatar.cc/100?img=56',
        },
      ],
  },
];
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

function NewsPartnerComments() {
  return (
    <>
      <Row className="ps-3 order-last order-sm-0">
        <Col xs="auto" className="pe-0">
          <UserProfileImage src="https://i.pravatar.cc/300?img=56" className="me-3 rounded-circle bg-secondary" />
        </Col>
        <Col className="ps-0 pe-4">
          <StyledCommentInputGroup className="mb-3">
            <Form.Control
              placeholder="Write a comment ..."
              className="border-end-0"
            />
            <InputGroup.Text>
              <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" className="pe-3" />
            </InputGroup.Text>
          </StyledCommentInputGroup>
        </Col>
      </Row>
      {commentSection.map((data: Props) => (
        <Row className="ps-3" key={data.id}>
          <Col>
            <Row className="flex-start ms-3">
              <Col className="ps-0 pe-4">
                <CommentSection
                  id={data.id}
                  image={data.profileImage}
                  name={data.userName}
                  time={data.profileDateTime}
                  commentMsg={data.userMessage}
                />
                {data.commentReplySection.map((comment: Values) => (
                  <div key={comment.id} className="ms-5">
                    <CommentSection
                      id={comment.id}
                      image={comment.image}
                      name={comment.name}
                      time={comment.time}
                      commentMsg={comment.commentMsg}
                      commentMention={comment.commentMention}
                      commentImg={comment.commentImg}
                    />
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
export default NewsPartnerComments;
