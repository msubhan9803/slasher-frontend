import React, { useState, useEffect } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { addHashtags } from '../../../api/users';
import { getOnboardingSuggestedHashtag } from '../../../api/onboarding';

export const HashtagButton = styled(Button)`
  border : 0.125rem solid #383838
`;
const SelectedHashtagButton = styled(Button)`
  background-color: #383838;
  border: none;
  &:hover {
    background-color: #383838;
  }
`;
const SelectedHashtagContainer = styled.div`
  background-color: #1B1B1B;
  border: 1px solid #3A3B46;
  min-height: 6.5rem;
`;
const HashtagText = styled.p`
  color: #CCCCCC
`;

function OnboardingHashtag() {
  const navigate = useNavigate();
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string[]>([]);

  useEffect(() => {
    getOnboardingSuggestedHashtag().then((res) => {
      setSuggestedHashtags(res.data);
    });
  }, []);

  const addHashtag = (tag: string) => {
    if (selectedHashtag.indexOf(tag) === -1) {
      setSelectedHashtag([...selectedHashtag, tag]);
    }
  };

  const removeHashtag = (removeTag: string) => {
    const removeHashtags = selectedHashtag.filter((tag) => tag !== removeTag);
    setSelectedHashtag(removeHashtags);
  };

  const completeSignUp = () => {
    addHashtags(selectedHashtag).then(() => { navigate('/app/home'); });
  };

  return (
    <>
      <h1 className="mt-5 mb-3 h2">Suggested hashtags:</h1>
      <Row>
        <Col>
          {suggestedHashtags
            && suggestedHashtags.length > 0
            && suggestedHashtags.map((hashtag: string) => (
              <HashtagButton
                key={`${hashtag}-1`}
                as="input"
                type="button"
                value={hashtag}
                className="m-1 px-3 py-1 text-light rounded-pill bg-secondary"
                onClick={() => addHashtag(hashtag)}
              />
            ))}
        </Col>
      </Row>
      <h2 className="mt-5 mb-3 h2">Hashtags you selected:</h2>
      <Row>
        <Col>
          <SelectedHashtagContainer className={`rounded ${selectedHashtag.length === 0 ? 'py-4' : ''}`}>
            {selectedHashtag.map((tag: string) => (
              <SelectedHashtagButton key={`${tag}-1`} type="button" className="p-1 m-2 px-3 text-light rounded-pill text-white">
                {tag}
                <FontAwesomeIcon icon={solid('times')} size="lg" className="text-light ms-2" onClick={() => removeHashtag(tag)} />
              </SelectedHashtagButton>
            ))}
          </SelectedHashtagContainer>
        </Col>
      </Row>
      <h3 className="h2 mt-5 mb-1">What are hashtags?</h3>
      <HashtagText className="mt-1">
        Hashtags are a way for people to categorize their posts,
        so people who may enjoy them can find them more easily.
        For example, if you like movies, you’d want to follow the hashtag “#movies”.
        When someone creates a post with “#movies” in it,
        that post will show on your timeline, since you follow “#movies”.
      </HashtagText>
      <Row className="justify-content-center my-5">
        <Col xs={9} sm={7} md={5} lg={4} xxl={3}>
          <Row>
            <Col xs={6}>
              <RoundButtonLink to="/" className="w-100" variant="dark">
                Skip
              </RoundButtonLink>
            </Col>
            <Col xs={6}>
              <RoundButtonLink to="/app/onboarding/hashtag" handleClick={completeSignUp} className="w-100" variant="primary">
                Finish
              </RoundButtonLink>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

export default OnboardingHashtag;
