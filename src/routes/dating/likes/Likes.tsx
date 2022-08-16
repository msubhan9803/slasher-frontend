import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Button, Col, Image, OverlayTrigger, Popover, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import DatingPageWrapper from '../components/DatingPageWrapper';
import likesList from './LikesData';
import DatingLikesDialog from './DatingLikeDialog';

const ProfileImage = styled(Image)`
  height: 2.667rem;
  width: 2.667rem;
`;
const UnsubscribeProfileImage = styled.div`
  height: 3.867rem;
  width: 3.867rem;
`;
const StyledPopover = styled.div`
  .btn[aria-describedby="popover-basic"]{
    svg{
      color: var(--bs-primary);
    }
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: red;
  }
`;
const CustomPopover = styled(Popover)`
  z-index :1;
  background:rgb(27,24,24);
  border: 1px solid rgb(56,56,56);
  position:absolute;
  top: 0px !important;
  .popover-arrow{
    &:after{
      border-left-color:rgb(56,56,56);
    }
  }
`;
const Container = styled.div`
  background: #171717;
  @media (max-width: 991px) {
    background: #1B1B1B;
  }
`;
const StyledBorder = styled.div`
  border-bottom: 1px solid #1F1F1F;
`;
function Likes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('user');
  const options = ['Message', 'Unmatch', 'Block & Report'];
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handleLikesOption = (likeValue: string) => {
    if (likeValue === 'Message') {
      navigate('/dating/conversation');
    } else {
      setShow(true);
    }
    setDropDownValue(likeValue);
  };

  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      {queryParam === 'subscriber'
        && options.map((option) => (
          <PopoverText key={option} onClick={() => handleLikesOption(option)} className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">{option}</PopoverText>
        ))}
    </CustomPopover>
  );
  return (
    <DatingPageWrapper>
      <div className="mt-5 pt-5 mt-lg-0 pt-lg-0">
        {queryParam === 'subscriber' ? (
          <>
            <div className="mt-3 mt-lg-0 d-flex align-items-center justify-content-center justify-content-lg-between">
              <h1 className="h2 fw-bold">Likes received</h1>
              <Button className="bg-transparent border-0 text-white d-none d-lg-flex align-items-center">
                <FontAwesomeIcon icon={solid('sliders')} size="lg" className="me-2" />
                <h2 className="m-0">Settings</h2>
              </Button>
            </div>
            <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-4 pb-md-1 my-4 mt-lg-3 mt-md-2">
              <Row>
                {likesList.map((likesDetail) => (
                  <Col md={4} lg={6} xl={4} key={likesDetail.id}>
                    <Container className="d-flex p-3 justify-content-between w-100 rounded mb-3">
                      <div className="d-flex align-items-center">
                        <ProfileImage src={likesDetail.imageUrl} className="rounded-circle me-2" />
                        <div>
                          <h3 className="mb-0">{likesDetail.name}</h3>
                          <p className="fs-6 mb-0 text-light">{likesDetail.email}</p>
                        </div>
                      </div>
                      <div className="d-flex align-self-center">
                        <StyledPopover>
                          <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                            <Button className="bg-transparent shadow-none border-0 pe-0 text-white">
                              <FontAwesomeIcon icon={solid('ellipsis-vertical')} size="lg" />
                            </Button>
                          </OverlayTrigger>
                        </StyledPopover>
                      </div>
                    </Container>
                  </Col>
                ))}
              </Row>
            </div>
          </>
        ) : (
          <Row className="justify-content-end">
            <Col lg={10}>
              <div className="mb-0 mt-lg-3 mt-2">
                <h1 className="h2 text-center text-lg-start fw-bold">Dating Likes</h1>
                {likesList.slice(1, 9).map((likesDetail) => (
                  <StyledBorder key={likesDetail.id} className="d-flex justify-content-between p-3 mb-3">
                    <div className="d-flex align-items-center">
                      <UnsubscribeProfileImage className="text-white d-flex justify-content-center align-items-center bg-dark rounded-circle me-2">
                        {/* <h3 className="mb-0 h1">?</h3> */}
                        <FontAwesomeIcon role="button" icon={solid('question')} size="2x" />
                      </UnsubscribeProfileImage>
                      <div>
                        <h3 className="h4 mb-0">You’ve got a new match</h3>
                        <p className="fs-5 mb-0 text-light">Just now</p>
                      </div>
                    </div>
                  </StyledBorder>
                ))}
              </div>
            </Col>
          </Row>
        )}
        <DatingLikesDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
      </div>
    </DatingPageWrapper>
  );
}

export default Likes;
