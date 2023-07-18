import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';
import linkifyHtml from 'linkify-html';
import ProfileHeader from '../ProfileHeader';
import RoundButton from '../../../components/ui/RoundButton';
import { useAppSelector } from '../../../redux/hooks';
import CharactersCounter from '../../../components/ui/CharactersCounter';
import { updateUserAbout } from '../../../api/users';
import useProgressButton from '../../../components/ui/ProgressButton';
import {
  decryptMessage, escapeHtmlSpecialCharacters, newLineToBr,
} from '../../../utils/text-utils';
import { defaultLinkifyOpts } from '../../../utils/linkify-utils';
import ProfileTabContent from '../../../components/ui/profile/ProfileTabContent';
import { User } from '../../../types';
import ScrollToTop from '../../../components/ScrollToTop';

interface Props {
  user: User
}
function ProfileAbout({ user }: Props) {
  const [isEdit, setEdit] = useState<boolean>(false);
  const [aboutMeText, setAboutMeText] = useState<string>(user?.aboutMe || '');
  const [updatedAboutMeText, setUpdatedAboutMeText] = useState('');
  const [charCount, setCharCount] = useState<number>(0);
  const loginUserId = useAppSelector((state) => state.user.user.id);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();

  useEffect(() => {
    setAboutMeText(user.aboutMe);
  }, [user]);

  useEffect(() => {
    setUpdatedAboutMeText(aboutMeText);
    setAboutMeText(aboutMeText);
    setCharCount(aboutMeText.length);
  }, [aboutMeText]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedAboutMeText(e.target.value);
    setCharCount(e.target.value.length);
  };
  const handleUserAbout = (id: string) => {
    setProgressButtonStatus('loading');
    updateUserAbout(id, updatedAboutMeText).then((res) => {
      setAboutMeText(res.data.aboutMe);
      setCharCount(updatedAboutMeText.length);
      setProgressButtonStatus('success');
      setEdit(!isEdit);
    }).catch(() => {
      setProgressButtonStatus('failure');
    });
  };

  const handleCancel = () => {
    setAboutMeText(aboutMeText);
    setUpdatedAboutMeText(aboutMeText);
    setCharCount(aboutMeText.length);
  };
  const renderAboutMeText = (text: string) => {
    if (text && text.length > 0) {
      const safeAboutMeText = newLineToBr(
        linkifyHtml(decryptMessage(escapeHtmlSpecialCharacters(text)), defaultLinkifyOpts),
      );

      return (
        // eslint-disable-next-line react/no-danger
        <div className="text-break text-start" dangerouslySetInnerHTML={{ __html: safeAboutMeText }} />
      );
    }
    if (loginUserId === user?._id) {
      return (
        <div className="text-light">
          To add some info about yourself, click on the
          {' '}
          <FontAwesomeIcon icon={solid('pen')} className="me-1 mt-1" size="sm" />
          {' '}
          to the right.
        </div>
      );
    }
    return false;
  };

  return (
    <div>
      <ScrollToTop />
      <ProfileHeader tabKey="about" user={user} />
      <ProfileTabContent>
        <div className="bg-dark rounded p-4 my-3">
          <div className="d-flex justify-content-between">
            <h2 className="mb-4">About me</h2>
            {loginUserId === user?._id
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
                      value={updatedAboutMeText}
                      onChange={handleMessageChange}
                      placeholder="Write here..."
                      style={{ resize: 'none' }}
                      className="fs-4"
                    />
                    <CharactersCounter
                      counterClass="float-end fs-4 me-3"
                      charCount={charCount}
                      totalChar={1000}
                    />
                  </Col>
                </Row>
                <Row className="justify-content-center mt-4">
                  <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
                    <Row>
                      <Col xs={6}>
                        <RoundButton className="w-100 bg-black" variant="dark" onClick={() => { setEdit(!isEdit); handleCancel(); }}>
                          Cancel
                        </RoundButton>
                      </Col>
                      <Col xs={6}>
                        <ProgressButton label="Save" className="w-100" onClick={() => handleUserAbout(user?._id)} />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            )
            : (
              <>
                {renderAboutMeText(aboutMeText)}
              </>
            )}
        </div>
      </ProfileTabContent>
    </div>
  );
}

export default ProfileAbout;
