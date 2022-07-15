import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Dropdown, Image, Row,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CustomDropDown } from '../../../components/ui/UserMessageList/UserMessageListItem';
import userImage from '../../../placeholder-images/placeholder-user.jpg';
import ReportDialog from '../../../components/ui/Reportdialog';

const ProfileImage = styled(Image)`
  height:3.313rem;
  width:3.313rem;
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
  return (
    <>
      <Row className="align-items-center">
        <Col xs={11}>
          <Row>
            <Col className="my-auto rounded-circle" xs="auto">
              <Link className="text-white d-flex align-items-center" to="/news/partner/1">
                <div className="rounded-circle">
                  <ProfileImage src={userImage} className="rounded-circle bg-secondary" onClick={() => { onProfileDetailClick(); }} />
                </div>
                <div className="ps-3">
                  <h1 className="mb-0 h6">{userName}</h1>
                  <small className="mb-0 text-light">{postDate}</small>
                </div>
              </Link>
            </Col>
          </Row>
        </Col>
        <Col xs={1} className="d-none d-md-block">
          <CustomDropDown onSelect={handleNewsOption}>
            <Dropdown.Toggle className="d-flex justify-content-end bg-transparent pt-1">
              <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="bg-black">
              <Dropdown.Item eventKey="report" className="text-light">Report</Dropdown.Item>
            </Dropdown.Menu>
          </CustomDropDown>
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
