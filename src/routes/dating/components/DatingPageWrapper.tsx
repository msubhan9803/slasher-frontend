import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import React from 'react';
import {
  Col, Container, Image, Row,
} from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import TopNavLink from '../../../components/layout/main-site-wrapper/authenticated/TopNavLink';
import Image1 from '../../../images/slasher-logo.svg';

interface Props {
  children: React.ReactNode;
}

function DatingPageWrapper({ children }: Props) {
  return (
    <AuthenticatedPageWrapper>
      <Container>
        <Row className="mb-5">
          <Col md={8}>
            {children}
          </Col>
          {/* -----------------dating menu for large screen----------- */}
          <Col className="d-none d-md-block">
            <Row>
              <h4 className="fs-4">Dating Menu</h4>
            </Row>
            <Row>
              <Col>
                <TopNavLink label="My Profile" icon={regular('user')} to="/" />
              </Col>
              <Col>
                <TopNavLink label="Profiles" icon={regular('id-badge')} to="/" />
              </Col>
              <Col>
                <TopNavLink label="Messages" icon={regular('comments')} to="/" badge={{ top: '-7px', right: '28px' }} />
              </Col>
            </Row>
            <Row className="mt-1">
              <Col>
                <TopNavLink label="Likes" icon={regular('heart')} to="/" badge={{ top: '0px', right: '25px' }} />
              </Col>
              <Col>
                <TopNavLink label="Preferences" icon={solid('sliders')} to="/" />
              </Col>
              <Col />
            </Row>
            <Row className="mt-3">
              <Col md={9}>
                <h4>Recent Messages</h4>
              </Col>
              <Col md={3} className="px-0">
                <p style={{ fontSize: '14px' }} className="text-primary text-end">View All</p>
              </Col>
            </Row>
            <Row className="d-flex">
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
                  <Image src={Image1} className="rounded-circle bg-secondary position-relative" style={{ height: '53px', width: '53px' }} />
                </div>
              </Col>
              <Col md={7} className="mt-3">
                <p className="mb-0">Maureen Biologist</p>
                <p style={{ fontSize: '12px', color: '#CCCCCC' }}>We ask only to be reassured</p>
              </Col>
              <Col md="auto" className="mt-4  ms-2">
                <p className="bg-primary rounded-circle  p-1" style={{ fontSize: 'xx-small' }}>99+</p>
              </Col>
            </Row>
            <Row style={{ border: '1px solid #171718' }} />
            <Row className="d-flex">
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
                  <Image src={Image1} className="rounded-circle bg-secondary position-relative" style={{ height: '53px', width: '53px' }} />
                </div>
              </Col>
              <Col md={7} className="mt-3">
                <p className="mb-0">Teri Dactyl</p>
                <p style={{ fontSize: '12px', color: '#CCCCCC' }}>There was a knock on the door…</p>
              </Col>
              <Col md="auto" className="mt-4  ms-2">
                <p className="bg-primary rounded-circle  p-1" style={{ fontSize: 'xx-small' }}>9+</p>
              </Col>
            </Row>
            <Row className="mt-3">
              <h4 className="fs-4">Advertisment</h4>
            </Row>
            <Row>
              <Col className="ms-3" style={{ height: '180px', width: '150px', backgroundColor: '#3A3B46' }} />
            </Row>
          </Col>
        </Row>
        {/* ---------------dating menu for small screen--------------- */}
        <Row className="mt-3 m-1 bg-dark position-fixed d-md-none" style={{ bottom: '0', left: '0', right: '0' }}>
          <Col className="my-2">
            <TopNavLink label="My Profile" icon={regular('user')} to="/" />
          </Col>
          <Col className="my-2">
            <TopNavLink label="Profiles" icon={regular('id-badge')} to="/" />
          </Col>
          <Col className="my-2">
            <TopNavLink label="Messages" icon={regular('comments')} to="/" />
          </Col>
          <Col className="my-2">
            <TopNavLink label="Likes" icon={regular('heart')} to="/" />
          </Col>
          <Col className="my-2">
            <TopNavLink label="Preferences" icon={solid('sliders')} to="/" />
          </Col>
        </Row>
      </Container>
      {/* TODO: Add dating sidebar */}
    </AuthenticatedPageWrapper>
  );
}

export default DatingPageWrapper;
