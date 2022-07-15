import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Container, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import NoNavigationPageWrapper from '../../../components/layout/main-site-wrapper/no-navigation/NoNavigationPageWrapper';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';

const hashtagList: string[] = [
  'horrorfilm', 'monsters', 'vintagehorror', 'horror', 'art', 'scary',
  'ghost', 'horrorfan', 'onlinedating', 'thriller', 'horrorlover',
  'story', 'darkart', 'datenight',
];

const HashtagButton = styled(Button)`
  border : .125rem solid #1F1F1F
`;
const SelectedHashtagButton = styled(Button)`
  background-color: #383838;
  border: none;
  &:hover {
    background-color: #383838;
  }
`;
const SelectedHashtagContainer = styled.div`
  background-color: #1F1F1F;
  border : .063rem solid #3A3B46;
`;
const HashtagText = styled.p`
  color: #CCCCCC
`;

function OnboardingHashtag() {
  const [selectedHashtag, setSelectedHashtag] = useState<string[]>([]);

  const addHashtag = (tag: string) => {
    if (selectedHashtag.indexOf(tag) === -1) {
      setSelectedHashtag([...selectedHashtag, tag]);
    }
  };

  const romoveHashtag = (removeTag: string) => {
    const removeHashtags = selectedHashtag.filter((tag) => tag !== removeTag);
    setSelectedHashtag(removeHashtags);
  };
  return (
    <NoNavigationPageWrapper>
      <Container>
        <p className="fw-bold mb-1">Suggested hashtags:</p>
        <Row>
          <Col>
            {hashtagList.map((hashtag: string) => (
              <HashtagButton
                key={`${hashtag}-1`}
                as="input"
                type="button"
                value={hashtag}
                className="m-1 px-2 text-light rounded-pill bg-secondary"
                onClick={() => addHashtag(hashtag)}
              />
            ))}
          </Col>
        </Row>
        <p className="fw-bold mt-3">Hashtags you selected:</p>
        <Row>
          <Col>
            <SelectedHashtagContainer className={`rounded ${selectedHashtag.length === 0 ? 'py-4' : ''}`}>
              {selectedHashtag.map((tag: string) => (
                <SelectedHashtagButton key={`${tag}-1`} type="button" className="p-1 m-2 px-2 text-light rounded-pill text-white">
                  {tag}
                  <FontAwesomeIcon icon={solid('times')} size="lg" className="text-light ms-2" onClick={() => romoveHashtag(tag)} />
                </SelectedHashtagButton>
              ))}
            </SelectedHashtagContainer>
          </Col>
        </Row>
        <p className="fw-bold mt-4 mb-1">What are hashtags?</p>
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
                <RoundButtonLink to="/" className="w-100" variant="primary">
                  Finish
                </RoundButtonLink>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </NoNavigationPageWrapper>
  );
}

export default OnboardingHashtag;
