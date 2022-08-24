import React, { useState } from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ReportModal from '../../../components/ui/ReportModal';
import CustomPopover from '../../../components/ui/CustomPopover';

const ProfileImage = styled(Image)`
  height:3.125rem;
  width:3.125rem;
`;
interface Props {
  userName: string;
  postDate: string;
}
function NewPostHeader({ userName, postDate }: Props) {
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const PopoverOption = ['Report'];

  const handleNewsOption = (newsValue: string) => {
    setShow(true);
    setDropDownValue(newsValue);
  };

  return (
    <>
      <Row className="justify-content-between">
        <Col xs="auto">
          <Row className="d-flex">
            <Col className="my-auto rounded-circle" xs="auto">
              <Link to="/news/partner/1" className="rounded-circle">
                <ProfileImage src="https://i.pravatar.cc/300?img=11" className="rounded-circle bg-secondary" />
              </Link>
            </Col>
            <Col xs="auto" className="ps-0 align-self-center">
              <h1 className="mb-0 h3">{userName}</h1>
              <p className="mb-0 fs-6 text-light">{postDate}</p>
            </Col>
          </Row>
        </Col>
        <Col xs="auto" className="d-block">
          <CustomPopover popoverOptions={PopoverOption} onPopoverClick={handleNewsOption} />
        </Col>
      </Row>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </>
  );
}

export default NewPostHeader;
