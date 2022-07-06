import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Button,
  Col, Dropdown, Form, Image, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface LinearIconProps {
  uniqueId?: string
}

const RecentMessageImage = styled.img`
  height:50px;
  width:50px;
`;
const StyledChatInputGroup = styled(InputGroup)`
.form-control {
  border-radius: 1.875rem;
  border-bottom-right-radius: 0rem;
  border-top-right-radius: 0rem;
}
.input-group-text {
  background-color: rgb(31, 31, 31);
  border-color: #3a3b46;
  border-radius: 1.875rem;
}
svg {
  min-width: 1.875rem;
}
`;

const dropdownBgColor = '#171717';

const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    background-color: ${dropdownBgColor};
    border: none;
    &:hover {
      background-color: ${dropdownBgColor};
      box-shadow: none
    }
    &:focus {
      color:red;
      background-color: ${dropdownBgColor};
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
    background-color: ${dropdownBgColor};
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
const SmallText = styled.p`
  font-size: small;
  color: #CCCCCC;
`;
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const SelectedHashtagButton = styled(Button)`
  background-color: #383838;
  border: none;
  &:hover {
    background-color: #383838; 
  }
`;
function NewsPartnerComments() {
  return (
    <>
      <Row className="ps-3">
        <Col xs="auto" className="pe-0">
          <RecentMessageImage src="https://i.pravatar.cc/300?img=56" className="me-3 rounded-circle bg-secondary" />
        </Col>
        <Col className="ps-0 pe-4">
          <StyledChatInputGroup className="mb-3">
            <Form.Control
              placeholder="Write a comment ..."
              className="border-end-0"
            />
            <InputGroup.Text>
              <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" className="pe-3" />
            </InputGroup.Text>
          </StyledChatInputGroup>
        </Col>
      </Row>

      <Row className="ps-3">
        <Col>
          <Row class=" flex-start">
            <Col xs="auto" className="pe-0">
              <RecentMessageImage src="https://i.pravatar.cc/300?img=30" className="me-3 rounded-circle bg-secondary" />
            </Col>
            <Col className="ps-0 pe-4">

              <div className="p-3 rounded " style={{ backgroundColor: '#171717' }}>
                <div className="d-flex justify-content-between align-items-center ">
                  <Col xs="auto" className="ps-0 align-self-center ">
                    <h6 className="mb-0 ">Mari Ferrer</h6>
                    <SmallText className="mb-0">06/19/2022 12:10 AM</SmallText>
                  </Col>
                  <Col xs={1} className="d-none d-md-block">
                    <CustomDropDown>
                      <Dropdown.Toggle className="d-flex justify-content-end">
                        <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item eventKey="1" className="text-light">Report</Dropdown.Item>
                        <Dropdown.Item eventKey="2" className="text-light">Block user</Dropdown.Item>
                      </Dropdown.Menu>
                    </CustomDropDown>
                  </Col>
                </div>
                <p className="small mb-0">
                  It is a long established fact that a reader will be distracted by
                  the readable content of a page.
                </p>
              </div>
              <div className="rounded d-flex justify-content-end" style={{ marginTop: '-23px' }}>
                <SelectedHashtagButton key="like-1" type="button" style={{ bottom: '38px', right: '18px' }} className="p-1 m-2 px-2 text-light rounded-pill text-white">
                  <LinearIcon uniqueId="like-button">
                    <FontAwesomeIcon role="button" icon={solid('heart')} size="lg" className="me-2" />
                    24
                  </LinearIcon>
                </SelectedHashtagButton>
                <svg width="0" height="0">
                  <linearGradient id="like-1" x1="00%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                  </linearGradient>
                </svg>
              </div>
              <Row className="d-flex m-2">
                <Col className="p-0" xs={3}>
                  <FontAwesomeIcon role="button" icon={regular('heart')} size="lg" className="me-2" />
                  Like
                </Col>
                <Col className="text-center p-0" xs={3}>
                  <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2" />
                  Reply
                </Col>
              </Row>

              <Row>
                <Col xs="auto" className="pe-0">
                  <Image src="https://i.pravatar.cc/300?img=45" style={{ height: '40px', width: '40px' }} className="me-3 rounded-circle bg-secondary " />
                </Col>
                <Col className="ps-0 pe-4">
                  <div className="p-3 rounded" style={{ backgroundColor: '#171717' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <Col xs="auto" className="ps-0 align-self-center ">
                        <h6 className="mb-0 ">Austin Joe</h6>
                        <SmallText className="mb-0">06/19/2022 12:10 AM</SmallText>
                      </Col>
                      <Col xs={1} className="d-none d-md-block">
                        <CustomDropDown>
                          <Dropdown.Toggle className="d-flex justify-content-end">
                            <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item eventKey="1" className="text-light">Report</Dropdown.Item>
                            <Dropdown.Item eventKey="2" className="text-light">Block user</Dropdown.Item>
                          </Dropdown.Menu>
                        </CustomDropDown>
                      </Col>
                    </div>
                    <span className="text-primary">@Mari Ferrer </span>
                    <span className="small mb-0">
                      eque porro quisquam est qui dolorem ipsum
                    </span>
                  </div>
                  <div className="rounded d-flex justify-content-end" style={{ marginTop: '-23px' }}>
                    <SelectedHashtagButton key="like-1" type="button" style={{ bottom: '38px', right: '18px' }} className="p-1 m-2 px-2 text-light rounded-pill text-white">
                      <LinearIcon uniqueId="like-button">
                        <FontAwesomeIcon role="button" icon={solid('heart')} size="lg" className="me-2" />
                        24
                      </LinearIcon>
                    </SelectedHashtagButton>
                    <svg width="0" height="0">
                      <linearGradient id="like-1" x1="00%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                        <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                      </linearGradient>
                    </svg>
                  </div>
                  <Row className="d-flex m-2">
                    <Col className="p-0" xs={3}>
                      <FontAwesomeIcon role="button" icon={regular('heart')} size="lg" className="me-2" />
                      Like
                    </Col>
                    <Col className="text-center p-0" xs={3}>
                      <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2" />
                      Reply
                    </Col>
                  </Row>
                </Col>

              </Row>

              <Row>
                <Col xs="auto" className="pe-0">
                  <Image src="https://i.pravatar.cc/300?img=25" style={{ height: '40px', width: '40px' }} className="me-3 rounded-circle bg-secondary" />
                </Col>
                <Col className="ps-0 pe-4">
                  <div className="p-3 rounded " style={{ backgroundColor: '#171717' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <Col xs="auto" className="ps-0 align-self-center ">
                        <h6 className="mb-0 ">Rohma Mxud</h6>
                        <SmallText className="mb-0">06/19/2022 12:10 AM</SmallText>
                      </Col>
                      <Col xs={1} className="d-none d-md-block">
                        <CustomDropDown>
                          <Dropdown.Toggle className="d-flex justify-content-end">
                            <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item eventKey="1" className="text-light">Report</Dropdown.Item>
                            <Dropdown.Item eventKey="2" className="text-light">Block user</Dropdown.Item>
                          </Dropdown.Menu>
                        </CustomDropDown>
                      </Col>
                    </div>
                    <span className="text-primary">@Austin Joe </span>
                    <span className="small mb-0">
                      Lorem Ipsum has been the industry standard dummy
                    </span>
                    <div>
                      <Image src="https://i.pravatar.cc/100?img=56" alt="profile-image" />
                    </div>
                  </div>
                  <Row className="d-flex m-2">
                    <Col className="p-0" xs={3}>
                      <FontAwesomeIcon role="button" icon={regular('heart')} size="lg" className="me-2" />
                      Like
                    </Col>
                    <Col className="text-center p-0" xs={3}>
                      <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2" />
                      Reply
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

export default NewsPartnerComments;
