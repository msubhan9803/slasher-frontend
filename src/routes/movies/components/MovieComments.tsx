import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import CommentSection from '../../../components/ui/PostCommentSection/CommentSection';
import ReportModal from '../../../components/ui/ReportModal';
import CommentInput from './CommentInput';

interface Props {
  id: string;
  profileImage: string;
  userName: string;
  profileDateTime: string;
  like: number;
  userMessage: string;
  commentReplySection: Values[];
  onIconClick: (value: number) => void;
  likeIcon: boolean;
}
interface Values {
  id: string;
  image: string;
  name: string;
  time: string;
  like: number;
  likeIcon: boolean;
  commentMention: string;
  commentMsg: string;
  commentImg?: ImageList[];
  onIconClick: (value: number) => void;
}
interface ImageList {
  image_path: string;
  _id: string;
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
    commentReplySection:
      [
        {
          id: 5,
          image: 'https://i.pravatar.cc/300?img=45',
          name: 'Austin Joe',
          time: '06/19/2022 12:10 AM',
          like: 20,
          likeIcon: false,
          commentMention: '@Mari Ferrer ',
          commentMsg: ' eque porro quisquam est qui dolorem ipsum',
        },
        {
          id: 6,
          image: 'https://i.pravatar.cc/300?img=25',
          name: 'Rohma Mxud',
          time: '06/19/2022 12:10 AM',
          likeIcon: false,
          commentMention: '@Austin Joe ',
          commentMsg: ' Lorem Ipsum has been the industry standard dummy',
          commentImg: 'https://i.pravatar.cc/100?img=56',
        },
      ],
  },
];

function MovieComments() {
  const [postData, setPostData] = useState<any[]>(commentSection);
  const popoverOption = ['Report', 'Delete'];
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const handleLikeIcon = (likeId: string) => {
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
  const handlePopover = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };
  return (
    <div className="bg-dark p-3 rounded-2 mt-3">
      <h1 className="h2 fw-bold ps-3 py-2">Comments (28)</h1>
      <CommentInput />
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
                  likeIcon={data.likeIcon}
                  commentMsg={data.userMessage}
                  onIconClick={() => handleLikeIcon(data.id)}
                  popoverOptions={popoverOption}
                  onPopoverClick={handlePopover}
                />
                {data.commentReplySection.map((comment: Values) => (
                  <div key={comment.id} className="ms-5 ps-2">
                    <div className="ms-md-4">
                      <CommentSection
                        id={comment.id}
                        image={comment.image}
                        name={comment.name}
                        time={comment.time}
                        likeIcon={comment.likeIcon}
                        commentMsg={comment.commentMsg}
                        commentMention={comment.commentMention}
                        commentImg={comment.commentImg}
                        onIconClick={() => handleLikeIcon(comment.id)}
                        popoverOptions={popoverOption}
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
    </div>
  );
}
export default MovieComments;
