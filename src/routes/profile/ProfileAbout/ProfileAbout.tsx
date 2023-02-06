import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Form, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import ProfileHeader from '../ProfileHeader';
import RoundButton from '../../../components/ui/RoundButton';
import { User } from '../../../types';
import { useAppSelector } from '../../../redux/hooks';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import RightSidebarViewer from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarViewer';

const CustomSpan = styled(Form.Text)`
  margin-top: -1.43rem;
  margin-right: .5rem;
`;

interface Props {
  user: User
}
function ProfileAbout({ user }: Props) {
  const [isEdit, setEdit] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(user?.aboutMe || '');
  const [charCount, setCharCount] = useState<number>(0);
  const loginUserId = useAppSelector((state) => state.user.user.id);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setMessage(e.target.value);
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <ProfileHeader tabKey="about" user={user} />
        <div className="bg-dark rounded p-4 my-3">
          <div className="d-flex justify-content-between">
            <h2 className="mb-4">About me</h2>
            {loginUserId === user?.id
              && <FontAwesomeIcon icon={solid('pen')} className="me-1 mt-1" size="lg" onClick={() => setEdit(!isEdit)} />}
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
                    <CustomSpan className="float-end fs-4">{`${charCount}/${1000} characters`}</CustomSpan>
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
                        <RoundButton className="w-100" variant="primary" onClick={() => setEdit(!isEdit)}>
                          Save
                        </RoundButton>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            )
            : (
              <div>
                {user.aboutMe}
              </div>
            )}
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        {loginUserId === user?.id ? <RightSidebarSelf /> : <RightSidebarViewer />}
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default ProfileAbout;
