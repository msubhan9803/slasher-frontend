import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Container, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NoNavigationPageWrapper from '../../../components/layout/main-site-wrapper/no-navigation/NoNavigationPageWrapper';

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
  background-color: #1f1F1F;
  border : .063rem solid #3A3B46;
`;
const SkipButton = styled(Button)`
  background-color: #383838;
  border: 0.063rem solid #1f1f1f;
`;
const HashtagText = styled.p`
  color: #CCCCCC
`;

function OnboardingHashtag() {
  const navigate = useNavigate();
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
  const routeChange = () => {
    navigate('/');
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
        {selectedHashtag.length > 0
          && (
            <>
              <p className="fw-bold mt-3">Hashtags you selected:</p>
              <Row>
                <Col>
                  <SelectedHashtagContainer className="rounded">
                    {selectedHashtag.map((tag: string) => (
                      <SelectedHashtagButton key={`${tag}-1`} type="button" className="p-1 m-2 px-2 text-light rounded-pill text-white">
                        {tag}
                        <FontAwesomeIcon icon={solid('times')} size="lg" className="text-light ms-2" onClick={() => romoveHashtag(tag)} />
                      </SelectedHashtagButton>
                    ))}
                  </SelectedHashtagContainer>
                </Col>
              </Row>
            </>
          )}
        <p className="fw-bold mt-4 mb-1">What are hashtags?</p>
        <HashtagText className="mt-1">
          Hashtags are a way for people to categorize their posts,
          so people who may enjoy them can find them more easily.
          For example, if you like movies, you’d want to follow the hashtag “#movies”.
          When someone creates a post with “#movies” in it,
          that post will show on your timeline, since you follow “#movies”.
        </HashtagText>
        <Row className="d-flex justify-content-center text-center h-auto my-5">
          <Col>
            <SkipButton as="input" type="button" value="Skip" className="mx-1 rounded-pill text-white px-5 py-2" onClick={routeChange} />
            <Button as="input" type="button" value="Next step" className="mx-1 rounded-pill px-4 py-2" onClick={routeChange} />
          </Col>
        </Row>
      </Container>
    </NoNavigationPageWrapper>
  );
}

export default OnboardingHashtag;
