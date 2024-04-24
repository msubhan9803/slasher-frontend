import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import copy from 'copy-to-clipboard';
import React from 'react';
import {
  Button, Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { LinearIcon } from '../../../ui/FavoriteLinearIcon';
import Slasher from '../../../../images/slasher-logo-small.svg';
import SupportSlasher from '../../../../images/support-slasher.svg';
import { WORDPRESS_SITE_URL } from '../../../../constants';

const StyledShareButton = styled(Button)`
  font-weight: 400;
`;

const QuickLinksButton = styled(Image)`
  height: 20px;
  object-fit: cover;
`;

const StyledRow = styled(Row)`
 .col-4 {
  text-decoration: none;
  font-weight: 400;
  font-size: 14px;
  aspect-ratio: 1;
 }
`;

const links: any = {
  shop: `${WORDPRESS_SITE_URL}/shop/`,
  support: 'https://www.patreon.com/theslasherapp',
  advertise: `${WORDPRESS_SITE_URL}/advertise`,
};

function QuickLinks() {
  const redirectClick = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    window.open(links[type], '_blank');
  };

  return (
    <>
      <h2 className="mb-0">
        Quick links
      </h2>

      <StyledRow className="mt-2 px-1">
        <Col xs={4} className="p-1">
          <Link to="https://pages.slasher.tv/shop/" onClick={(e) => redirectClick(e, 'shop')} className="bg-dark p-1 d-flex rounded-3 h-100 flex-column justify-content-center">
            <div className="d-flex justify-content-center">
              <QuickLinksButton src={Slasher} alt="Slasher icon" />
            </div>

            <div className="text-center mt-2">
              Slasher Shop
            </div>
          </Link>
        </Col>

        <Col xs={4} className="p-1">
          <Link to="https://www.patreon.com/theslasherapp" onClick={(e) => redirectClick(e, 'support')} className="bg-dark p-1 d-flex rounded-3 h-100 flex-column justify-content-center">
            <div className="d-flex justify-content-center">
              <QuickLinksButton src={SupportSlasher} alt="Slasher icon" />
            </div>

            <div className="text-center mt-2">
              Support Slasher
            </div>
          </Link>
        </Col>

        <Col xs={4} className="p-1">
          <Link to="https://pages.slasher.tv/advertise" onClick={(e) => redirectClick(e, 'advertise')} className="bg-dark p-1 d-flex rounded-3 h-100 flex-column justify-content-center">
            <div className="d-flex justify-content-center">
              <LinearIcon uniqueId="icon-0">
                <FontAwesomeIcon color="#FF1800" icon={solid('bullhorn')} size="lg" className="mb-1" />
                <svg width="0" height="0">
                  <linearGradient id="icon-0" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#B412AE', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#E25ED2', stopOpacity: '1' }} />
                  </linearGradient>
                </svg>
              </LinearIcon>
            </div>

            <div className="text-center mt-2">
              Advertise
            </div>
          </Link>
        </Col>
      </StyledRow>

      <StyledShareButton className="btn btn-dark text-decoration-none my-2 w-100 h6" onClick={() => copy("I found the best app for horror fans and thought you'd be into it! Check it out! https://www.slasher.tv")}>
        <span className="me-2">
          <FontAwesomeIcon icon={solid('share-alt')} className="text-primary " />
        </span>
        Share Slasher with friends
      </StyledShareButton>
    </>
  );
}

export default QuickLinks;
