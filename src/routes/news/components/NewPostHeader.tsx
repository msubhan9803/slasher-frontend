import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, OverlayTrigger, Popover, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ReportDialog from '../../../components/ui/Reportdialog';

const ProfileImage = styled(Image)`
  height:3.125rem;
  width:3.125rem;
`;
const PopoverText = styled.p`
  &:hover {
    background: red;
  }
`;
const StyledPopover = styled.div`
  .btn[aria-describedby="popover-basic"]{
    svg{
      color: var(--bs-primary);
    }
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
interface Props {
  userName: string;
  postDate: string;
}
function NewPostHeader({ userName, postDate }: Props) {
  const navigate = useNavigate();
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');

  const handleNewsOption = (newsValue: string) => {
    setShow(true);
    setDropDownValue(newsValue);
  };
  const onProfileDetailClick = () => {
    navigate('/news/partner/1');
  };
  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0" role="button" onClick={() => handleNewsOption('report')}>Report</PopoverText>
    </CustomPopover>
  );
  return (
    <>
      <Row className="justify-content-between">
        <Col xs="auto">
          <Row className="d-flex">
            <Col className="my-auto rounded-circle" xs="auto">
              <div className="rounded-circle">
                <ProfileImage src="https://i.pravatar.cc/300?img=11" onClick={() => { onProfileDetailClick(); }} className="rounded-circle bg-secondary" />
              </div>
            </Col>
            <Col xs="auto" className="ps-0 align-self-center">
              <h1 className="mb-0 h3">{userName}</h1>
              <p className="mb-0 fs-6 text-light">{postDate}</p>
            </Col>
          </Row>
        </Col>
        <Col xs="auto" className="d-block">
          <StyledPopover>
            <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
              <Button className="bg-transparent shadow-none border-0 pe-1">
                <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
              </Button>
            </OverlayTrigger>
          </StyledPopover>
        </Col>
      </Row>
      {
        dropDownValue === 'report'
        && <ReportDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
      }
    </>
  );
}

export default NewPostHeader;
