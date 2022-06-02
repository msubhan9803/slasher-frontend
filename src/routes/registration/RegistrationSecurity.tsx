import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import RoundButton from '../../components/ui/RoundButton';

function RegistrationSecurity({ changeStep }: any) {
  const navigate = useNavigate();
  const handleStep = () => {
    navigate('/registration/terms');
    changeStep(2);
  };
  return (
    <div className="registration-security">
      <h1>Registration Security</h1>
      <p>This is the registration security page!</p>
      <Row>
        <Col sm={2}>
          <RoundButton onClick={() => { changeStep(0); navigate('/registration/identity'); }} className="w-100" variant="secondary" type="submit">
            Previous step
          </RoundButton>
        </Col>
        <Col sm={2}>
          <RoundButton onClick={handleStep} className="w-100" type="submit">
            Next step
          </RoundButton>
        </Col>
      </Row>
    </div>
  );
}

export default RegistrationSecurity;
