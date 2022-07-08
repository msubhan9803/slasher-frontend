import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Container, Dropdown, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import DatingPageWrapper from '../components/DatingPageWrapper';
import SwitchButtonGroup from '../../../components/ui/SwitchButtonGroup';
import DatingLikesDialog from './DatingLikeDialog';

const DatingLikeUserCircleImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;
const UnsubscribeLikeUserImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
  filter: opacity(0.6) drop-shadow(0 0 0 rgba(0, 0, 0, 0.85)) blur(2px);
`;
const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    border: none;
    &:hover {
      box-shadow: none;
    }
    &:focus {
      box-shadow: none;
    }
    &:active {
      box-shadow: none;
    }
    &:after {
      display: none;
    }
  }
  .dropdown-toggle[aria-expanded="true"] {
    svg {
      color: var(--bs-primary);
    }
  }
  .dropdown-menu {
    inset: -30px 20px auto auto !important;
  }
  .dropdown-item {
    &:hover {
      background-color: var(--bs-primary) !important;
    }
    &:active {
      background-color: var(--bs-primary) !important;
    }
  }
`;
function Likes() {
  const navigate = useNavigate();
  const subscriberOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];
  const [subscriberValue, setSubscriberValue] = useState('yes');
  const datingLikes = [
    {
      id: 1, profileImage: 'https://i.pravatar.cc/300?img=12', name: 'Rayna Workman', userID: '@RaynaWorkman001',
    },
    {
      id: 2, profileImage: 'https://i.pravatar.cc/300?img=11', name: 'Lydia Lipshutz', userID: '@lydialipshutz102',
    },
    {
      id: 3, profileImage: 'https://i.pravatar.cc/300?img=15', name: 'Haylie Bothman', userID: '@HaylieBothman126',
    },
    {
      id: 4, profileImage: 'https://i.pravatar.cc/300?img=13', name: 'Lydia Lipshutz', userID: '@lydialipshutz102',
    },
    {
      id: 5, profileImage: 'https://i.pravatar.cc/300?img=19', name: 'Haylie Bothman', userID: '@HaylieBothman126',
    },
    {
      id: 6, profileImage: 'https://i.pravatar.cc/300?img=17', name: 'Lydia Lipshutz', userID: '@lydialipshutz102',
    },
    {
      id: 7, profileImage: 'https://i.pravatar.cc/300?img=21', name: 'Haylie Bothman', userID: '@HaylieBothman126',
    },
    {
      id: 8, profileImage: 'https://i.pravatar.cc/300?img=23', name: 'Lydia Lipshutz', userID: '@lydialipshutz102',
    },
    {
      id: 9, profileImage: 'https://i.pravatar.cc/300?img=22', name: 'Haylie Bothman', userID: '@HaylieBothman126',
    },
    {
      id: 10, profileImage: 'https://i.pravatar.cc/300?img=20', name: 'Lydia Lipshutz', userID: '@lydialipshutz102',
    },
    {
      id: 11, profileImage: 'https://i.pravatar.cc/300?img=18', name: 'Haylie Bothman', userID: '@HaylieBothman126',
    },
    {
      id: 12, profileImage: 'https://i.pravatar.cc/300?img=12', name: 'Lydia Lipshutz', userID: '@lydialipshutz102',
    },
  ];
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');

  const handleLikesOption = (likeValue: string) => {
    if (likeValue === 'message') {
      navigate('/dating/conversation');
    } else {
      setShow(true);
    }
    setDropDownValue(likeValue);
  };

  return (
    <DatingPageWrapper>
      <Container className="my-5 my-md-0 py-5 py-md-0">
        <Row className="align-items-center mb-4 mt-5 mt-md-0">
          <Col xl={5}>
            <h1 className="h3 mb-0">{subscriberValue === 'yes' ? 'Likes received' : 'Dating Likes'}</h1>
          </Col>
          <Col xl={7} className="p-xl-0">
            <div className="d-flex justify-content-between align-items-end">
              <h2 className="h4">Subscriber? </h2>
              <SwitchButtonGroup
                firstOption={subscriberOptions[0]}
                secondOption={subscriberOptions[1]}
                value={subscriberValue}
                onChange={(subscribe) => setSubscriberValue(subscribe)}
              />
            </div>
          </Col>
        </Row>
        {subscriberValue === 'yes' ? (
          <Row>
            {datingLikes.map((likeDetails) => (
              <Col key={likeDetails.id} lg={6} className="pb-4 px-4">
                <Row className="bg-dark p-3 rounded">
                  <Col xs={2} className="p-0">
                    <DatingLikeUserCircleImage src={likeDetails.profileImage} className="rounded-circle me-3" />
                  </Col>
                  <Col xs={9} className="ps-0 ps-md-4 align-self-center">
                    <h2 className="h6 mb-0 rounded-circle">
                      {likeDetails.name}
                    </h2>
                    <p className="mb-0 small">{likeDetails.userID}</p>
                  </Col>
                  <Col xs={1} className="p-0 py-1 align-self-baseline">
                    <CustomDropDown onSelect={handleLikesOption}>
                      <Dropdown.Toggle className="d-flex justify-content-end bg-transparent">
                        <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="bg-black">
                        <Dropdown.Item eventKey="message" className="text-light">Message</Dropdown.Item>
                        <Dropdown.Item eventKey="unmatch" className="text-light">Unmatch</Dropdown.Item>
                        <Dropdown.Item eventKey="report" className="text-light">Block &#38; Report</Dropdown.Item>
                      </Dropdown.Menu>
                    </CustomDropDown>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        ) : (
          <Row className="px-4">
            {datingLikes.map((likeDetails) => (
              <Col key={likeDetails.id} xs={12} className="mb-2" onClick={() => setShow(true)}>
                <Row className="align-items-center border-bottom border-dark pb-3">
                  <Col xs={1} className="p-0">
                    <UnsubscribeLikeUserImage src={likeDetails.profileImage} className="rounded-circle me-3" />
                  </Col>
                  <Col xs={11} className="ps-4">
                    <h2 className="h6 mb-0 rounded-circle">
                      You’ve got a new match
                    </h2>
                    <p className="mb-0 small">Just now</p>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        )}
        <DatingLikesDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
      </Container>
    </DatingPageWrapper>
  );
}

export default Likes;
