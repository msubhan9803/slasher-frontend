import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import ProfileHeader from '../ProfileHeader';
import RoundButton from '../../../components/ui/RoundButton';
import { User } from '../../../types';
import { useAppSelector } from '../../../redux/hooks';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import { updateUserAbout } from '../../../api/users';
import useProgressButton from '../../../components/ui/ProgressButton';

const CustomDiv = styled.div`
  white-space: pre;
`;
interface Props {
  user: User
}
function ProfileAbout({ user }: Props) {
  const [isEdit, setEdit] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(user?.aboutMe || '');
  const [charCount, setCharCount] = useState<number>(0);
  const loginUserId = useAppSelector((state) => state.user.user.id);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setMessage(e.target.value);
  };
  const handleUserAbout = (id: string) => {
    updateUserAbout(id, message).then((res) => {
      setMessage(res.data.aboutMe);
      setProgressButtonStatus('loading');
      setEdit(!isEdit);
    });
  };
  return (
    <div>
      <ProfileHeader tabKey="about" user={user} />
      <div className="bg-dark rounded p-4 my-3">
        <div className="d-flex justify-content-between">
          <h2 className="mb-4">About me</h2>
          {loginUserId === user?._id
            /* eslint no-underscore-dangle: 0 */
            && <FontAwesomeIcon icon={solid('pen')} className="me-1 mt-1" size="lg" />
            && (
              <Button variant="link" onClick={() => setEdit(!isEdit)}>
                <FontAwesomeIcon icon={solid('pen')} className="me-1 mt-1" size="lg" />
              </Button>
            )}
        </div>
        {isEdit
          ? (
            <div>
              <Row>
                <Col>
                  <Form.Control
                    maxLength={1000}
                    rows={10}
                    as="textarea"
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Write here..."
                    style={{ resize: 'none' }}
                    className="fs-4"
                  />
                  <CharactersCounter
                    counterClass="float-end fs-4"
                    charCount={charCount}
                    totalChar={1000}
                    marginTop="-1.43rem"
                    marginRight=".5rem"
                  />
                </Col>
              </Row>
              <Row className="justify-content-center mt-4">
                <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
                  <Row>
                    <Col xs={6}>
                      <RoundButton className="w-100 bg-black" variant="dark" onClick={() => setEdit(!isEdit)}>
                        Cancel
                      </RoundButton>
                    </Col>
                    <Col xs={6}>
                      <ProgressButton label="Save" className="py-2 w-100  fs-3 fw-bold" onClick={() => handleUserAbout(user?._id)} />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )
          : (
            <CustomDiv>
              {message}
            </CustomDiv>
          )}
      </div>
    </div>
  );
}

export default ProfileAbout;
