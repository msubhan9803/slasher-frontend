import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import ReportModal from '../../../components/ui/ReportModal';
import CustomPopover from '../../../components/ui/CustomPopover';
import UserCircleImage from '../../../components/ui/UserCircleImage';

interface Props {
  logo: string;
  userName: string;
  postDate: string;
  postId: string;
  partnerId: string;
}

function NewPostHeader({
  logo, userName, postDate, postId, partnerId,
}: Props) {
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
              <Link to={`/news/partner/${partnerId}/posts/${postId}`} className="rounded-circle">
                <UserCircleImage src={logo} className="bg-secondary" />
              </Link>
            </Col>
            <Col xs="auto" className="ps-0 align-self-center">
              <h1 className="mb-0 h3">{userName}</h1>
              <p className="mb-0 fs-6 text-light">{DateTime.fromISO(postDate).toFormat('MM/dd/yyyy t')}</p>
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
