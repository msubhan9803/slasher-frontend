import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSearchParams } from 'react-router-dom';
import { Col, Form, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ProfileHeader from '../ProfileHeader';
import RoundButton from '../../../components/ui/RoundButton';
import { User } from '../../../types';

const CustomSpan = styled(Form.Text)`
  margin-top: -1.43rem;
  margin-right: .5rem;
`;
const AboutMessage = 'Hi, i am Aly, i am 26 years old and  worked as a UI/UX design in  Slasher Corp. In my spare time, I enjoy going to the gym and regularly partake in charity runs around the UK in order to help the community and to stay fit and healthy.  Skills: NodeJS, Python, Interface, GTK Lipsum Rails, .NET Groovy Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. ';

interface Props {
  user: User
}
function ProfileAbout({ user }: Props) {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [isEdit, setEdit] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(AboutMessage);
  const [charCount, setCharCount] = useState<number>(0);
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    setMessage(e.target.value);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="about" user={user} />
      <div className="bg-dark rounded p-4 my-3">
        <div className="d-flex justify-content-between">
          <h2 className="mb-4">About me</h2>
          {queryParam === 'self'
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
    </AuthenticatedPageWrapper>
  );
}

export default ProfileAbout;
