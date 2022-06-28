import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Col, Container, Dropdown, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import DatingPageWrapper from '../components/DatingPageWrapper';
import SwitchButtonGroup from '../../../components/ui/SwitchButtonGroup';
import DatingLikesModal from './DatingLikesModal';

const UserCircleImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;

const UnsubscribeUserCircleImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
  filter: opacity(0.4) drop-shadow(0 0 0 rgba(0, 0, 0, 0.85)) blur(2px);
`;

const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    border: none;
    &:hover {
      box-shadow: none
    }
    &:focus {
      box-shadow: none
    }
    &:active&:focus {
      box-shadow: none
    }
    &:after {
      display: none;
    }
  }

  .dropdown-menu {
    inset: -30px 10px auto auto !important;
  }

  .dropdown-item {
    &:hover {
      background-color: var(--bs-primary) !important;
    }
    &:active {
      background-color: var(--bs-primary) !important;
    }import SwitchButtonGroup from './../../../components/ui/SwitchButtonGroup';

  }
`;

function Likes() {
  const likes = [
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
  const subscriberOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];
  const [subscriberValue, setSubscriberValue] = useState('yes');
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');
  const handleSelect = (e: any) => {
    console.log('hi', e);
    setShow(true);
    setValue(e);
  };
  return (
    <DatingPageWrapper>
      <Container>
        <Row className="align-items-center mb-4">
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
                onChange={(subs) => setSubscriberValue(subs)}
              />
            </div>
          </Col>
        </Row>
        {subscriberValue === 'yes' ? (
          <Row>
            {likes.map((like) => (
              <Col key={like.id} lg={6} className="pb-4 px-4">
                <Row className="bg-dark p-3 rounded">
                  <Col xs={2} className="p-0">
                    <UserCircleImage src={like.profileImage} className="rounded-circle me-3" />
                  </Col>
                  <Col xs={9} className="ps-0 ps-md-4 align-self-center">
                    <h2 className="h6 mb-0 rounded-circle">
                      {like.name}
                    </h2>
                    <p className="mb-0 small">{like.userID}</p>
                  </Col>
                  <Col xs={1} className="p-0 py-1 align-self-baseline">
                    <CustomDropDown onSelect={handleSelect}>
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
            {likes.map((like) => (
              <Col key={like.id} xs={12} className="mb-2" onClick={() => setShow(true)}>
                <Row className="align-items-center border-bottom border-dark pb-3">
                  <Col xs={1} className="p-0">
                    <UnsubscribeUserCircleImage src={like.profileImage} className="rounded-circle me-3" style={{ filter: 'opacity(0.6) drop-shadow(0 0 0 rgba(0, 0, 0, 0.85)) blur(2px)' }} />
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
        <DatingLikesModal show={show} setShow={setShow} values={value} />
      </Container>
    </DatingPageWrapper>
  );
}

export default Likes;
