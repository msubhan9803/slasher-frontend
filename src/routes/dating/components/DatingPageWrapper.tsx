import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import TopNavLink from '../../../components/layout/main-site-wrapper/authenticated/TopNavLink';
import Image1 from '../../../images/slasher-logo.svg';

interface Props {
  children: React.ReactNode;
}

function DatingPageWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper>
      <Row>
        <Col md={9}>
          {' '}
          {children}
        </Col>
        <Col>
          <Row>
            <h4 className="fs-4">Dating Menu</h4>
          </Row>
          <Row>
            <Col className="">
              <TopNavLink label="My Profile" icon={regular('user')} to="/" />
            </Col>
            <Col className="">
              <TopNavLink label="Profiles" icon={regular('id-badge')} to="/" />
            </Col>
            <Col className="">
              <TopNavLink label="Messages" icon={regular('comments')} to="/" />
            </Col>
          </Row>
          <Row>
            <Col className="">
              <TopNavLink label="Likes" icon={regular('heart')} to="/" />
            </Col>
            <Col className="">
              <TopNavLink label="Preferences" icon={solid('sliders')} to="/" />
            </Col>
            <Col />
          </Row>
          <Row>
            <Col md={9} className="">
              <p>Recent Messages</p>
            </Col>
            <Col md={3} className="px-0">
              <p style={{ fontSize: '14px' }} className="text-primary text-end">View All</p>
            </Col>
          </Row>
          <Row className="d-flex justify-content-between">
            <Col className="position-relative mt-auto mb-auto" md="auto">
              <div
                className="position-absolute bg-success rounded-circle"
                style={{
                  height: '8px',
                  width: '8px',
                  right: '12px',
                  bottom: '6px',
                  zIndex: '9999',
                }}
              />
              <div className="">
                <Image src={Image1} className="rounded-circle bg-secondary position-relative" style={{ height: '45px', width: '45px' }} />
              </div>
            </Col>
            <Col md="auto" className="mt-3 p-0">
              <p className="mb-0">Maureen Biologist</p>
              <p style={{ fontSize: '12px' }}>We ask only to be reassured</p>
            </Col>
            <Col md="auto" className="mt-4 p-0 ms-2">
              <p className="bg-primary rounded-circle  px-2">6</p>
            </Col>

          </Row>
          <Row style={{ border: '1px solid #171718' }} />
          <Row className="mt-3">
            <h4 className="fs-4">Advertisment</h4>
          </Row>
          <Row>
            <Col className="ms-3" style={{ height: '180px', width: '150px', backgroundColor: '#3A3B46' }} />
          </Row>
        </Col>
      </Row>

      {/* TODO: Add dating sidebar */}
    </AuthenticatedPageWrapper>
  );
}

export default DatingPageWrapper;
