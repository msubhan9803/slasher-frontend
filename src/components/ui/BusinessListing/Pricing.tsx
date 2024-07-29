import styled from 'styled-components';
import { Col } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import CustomText from '../CustomText';

const listing = [
  'Listing in our movies database',
  'Appear in "Suggested" section',
  'Appear in our newsletter',
];

const StyledCard = styled(Card)`
  width: 20rem;
  margin-top: 12px;
  border: 1px solid #3A3B46;
  padding: 12px 20px;
  background-color: transparent;
  border-color: #3A3B46;

  @media (max-width: 576px) {
    width: 100%;
    background-color: #141414;
  }
`;

const CardHeader = styled(Card.Header)`
  background: transparent;
  border-bottom: 1px solid #3A3B46;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

function Pricing() {
  return (
    <Col xs="12" className="my-4">
      <h2 className="fw-bold my-2">Pricing</h2>

      <StyledCard>
        <CardHeader>
          <h2>
            <span className="fw-bold fs-1" style={{ color: '#FF1800', marginRight: '4px' }}>$30</span>
            / month
          </h2>
        </CardHeader>
        <Card.Body>
          <CustomText
            text="Includes"
            textColor="#DBDBDB"
            textClass="mb-0 fs-4 mb-2 fw-bold"
          />

          <div>
            {listing.map((notes) => (
              <ListItem key={notes}>
                <FontAwesomeIcon
                  role="button"
                  icon={solid('check')}
                  size="sm"
                  className="text-primary pe-2"
                />
                <p className="text-light mb-0">{notes}</p>
              </ListItem>
            ))}
          </div>
        </Card.Body>
      </StyledCard>
    </Col>
  );
}

export default Pricing;
