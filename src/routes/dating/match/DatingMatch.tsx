import React, { useState } from 'react';
import { Button, Row } from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import DatingPageWrapper from '../components/DatingPageWrapper';
import DatingMatchModal from './DatingMatchModal';
import passIcon from '../../../images/dating/dating-pass-icon.svg';
import undoIcon from '../../../images/dating/dating-undo-icon.svg';
import monsterLikeIcon from '../../../images/dating/dating-monster-like-icon.svg';
import likeIcon from '../../../images/dating/dating-like-icon.svg';
import sampleProfilePhoto from '../../../images/dating/dating-sample-profile-image.png';
import mapPinIcon from '../../../images/dating/dating-map-pin.svg';

type RoundBtnPropsType = {
  className?: string;
  onClick: () => void;
  src: string;
  alt: string;
  label: string;
};

function FullRoundButtonWithImage({
  onClick,
  src,
  alt,
  className,
  label,
}: RoundBtnPropsType) {
  return (
    <div className={className}>
      <Button onClick={onClick} type="submit">
        <img src={src} alt={alt} />
      </Button>
      <div className="icon-label">{label}</div>
    </div>
  );
}
FullRoundButtonWithImage.defaultProps = {
  className: '',
};

const FullRoundButtonWithImageStyled = styled(FullRoundButtonWithImage)`
text-align: center;

button{
  width: 60px;
  aspect-ratio: 1;
  background: white;
  border-radius: 100%;
  &:hover{
    background: #000 !important;
  }
}

.icon-label{
  font-weight: bold;
  margin-top: 18px;
}
`;

function DatingMatch() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nameAge, setNameAge] = useState('Eliza Williams 23');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [location, setLocation] = useState('25mi / 40km California');
  const [subscriberMatchShow, setSubscriberMatchShow] = useState<boolean>(false);
  const [subscriber, setSubscriber] = useState<string>('');

  const handleMatch = (type: string) => {
    setSubscriberMatchShow(!subscriberMatchShow);
    setSubscriber(type);
  };

  return (
    <DatingPageWrapper>
      <div className="mt-5 pt-5 mt-md-0 pt-md-0">
        <img className="rounded-4 d-block m-auto" src={sampleProfilePhoto} alt="Profile Here" />
        <Row className="col-12  col-sm-4 text-center m-auto">
          <div className="fs-3 fw-bold mt-4 mb-3 text-nowrap">{nameAge}</div>
          <div className="d-flex justify-content-center">
            <span className=""><img style={{}} src={mapPinIcon} alt="Map Icon Here" /></span>
            <div className="text-muted ms-1">{location}</div>
          </div>
          <RoundButton className="mx-2 text-white bg-black border-white my-4" onClick={() => { }}>View Profile</RoundButton>
        </Row>

        <Row className="d-flex justify-content-center">
          <FullRoundButtonWithImageStyled className="col-3 col-md-2" label="Pass" onClick={() => {}} src={passIcon} alt="Pass Button Here" />
          <FullRoundButtonWithImageStyled className="col-3 col-md-2" label="Undo" onClick={() => {}} src={undoIcon} alt="Undo Button Here" />
          <FullRoundButtonWithImageStyled className="col-3 col-md-2" label="Monster Like" onClick={() => {}} src={monsterLikeIcon} alt="Monster Like Button Here" />
          <FullRoundButtonWithImageStyled className="col-3 col-md-2" label="Like" onClick={() => {}} src={likeIcon} alt="Like Button Here" />
        </Row>

        <Row className="col-6 m-auto mt-5">
          <RoundButton className="mx-2" onClick={() => handleMatch('Subscriber')}>Subscriber match</RoundButton>
          <RoundButton className="mx-2 mt-3" onClick={() => handleMatch('Non-Subscriber')}>Non-subscriber match</RoundButton>
        </Row>
        <DatingMatchModal
          show={subscriberMatchShow}
          setShow={setSubscriberMatchShow}
          isSubscriber={subscriber}
        />
      </div>
    </DatingPageWrapper>
  );
}

export default DatingMatch;
