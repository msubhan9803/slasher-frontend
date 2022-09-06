import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReportModal from '../../../components/ui/ReportModal';
import CommentSection from '../../../components/ui/PostCommentSection/CommentSection';
import UserCircleImage from '../../../components/ui/UserCircleImage';

interface Props {
  id: number;
  profileImage: string;
  userName: string;
  profileDateTime: string;
  like: number;
  userMessage: string;
  commentReplySection: Values[];
  onIconClick: (value: number) => void;
  likeIcon: boolean;
  popoverOption: string[];
  onPopoverClick: (value: string) => void;
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
  popoverOption: string;
  onPopoverClick: (value: string) => void;

}
const commentSection = [
  {
    id: 1,
    profileImage: 'https://i.pravatar.cc/300?img=30',
    userName: 'Mari Ferrer',
    profileDateTime: '06/19/2022 12:10 AM',
    like: 24,
    likeIcon: false,
    userMessage: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has this text here that will go to the end of the line.',
    commentReplySection:
      [
        {
          id: 2,
          image: 'https://i.pravatar.cc/300?img=45',
          name: 'Austin Joe',
          time: '06/19/2022 12:10 AM',
          like: 24,
          likeIcon: false,
          commentMention: '@Mari Ferrer',
          commentMsg: ' eque porro quisquam est qui dolorem ipsum',
        },
        {
          id: 3,
          image: 'https://i.pravatar.cc/300?img=25',
          name: 'Rohma Mxud',
          time: '06/19/2022 12:10 AM',
          like: 8,
          likeIcon: false,
          commentMention: '@Austin Joe',
          commentMsg: ' Lorem Ipsum has been the industry standard dummy',
          commentImg: 'https://i.pravatar.cc/100?img=56',
        },
      ],
  },
  {
    id: 4,
    profileImage: 'https://i.pravatar.cc/300?img=30',
    userName: 'Mari Ferrer',
    likeIcon: false,
    profileDateTime: '06/19/2022 12:10 AM',
    userMessage: ' It is a long established fact that a reader will be distracted bythe readable content of a page.',
    commentReplySection: [],
  },
];
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
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [postData, setPostData] = useState<any[]>(commentSection);
  const popoverOptions = ['Report', 'Block user'];

  const handlePopover = (selectedOption: string) => {
    setShow(true);
    setDropDownValue(selectedOption);
  };
  const handleLikeIcon = (likeId: number) => {
    const tempData = [...postData];
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
    setPostData(tempData);
  };
  return (
    <>
      <Row className="ps-3 pt-2 order-last order-sm-0">
        <Col xs="auto" className="pe-0">
          <UserCircleImage src="https://i.pravatar.cc/300?img=56" className="me-3 bg-secondary" />
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
      {postData.map((data: Props) => (
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
                  popoverOptions={popoverOptions}
                  onPopoverClick={handlePopover}
                />
                {data.commentReplySection.map((comment: Values) => (
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
                        popoverOptions={popoverOptions}
                        onPopoverClick={handlePopover}
                      />
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
          </Col>
        </Row>
      ))}
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </>
  );
}
export default NewsPartnerComments;
