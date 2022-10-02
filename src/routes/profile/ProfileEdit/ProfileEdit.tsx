import React, { ChangeEvent, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';
import RoundButton from '../../../components/ui/RoundButton';

function ProfileEdit() {
  const userData = {
    id: 1, name: 'Aly Khan', username: 'aly-khan', email: 'aly@slasher.tv',
  };
  const [updateUserData, setUpdateUserData] = useState(userData);
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Form>
        <div className="bg-dark p-4 rounded bg-mobile-transparent">
          <Row>
            <Col md={6} lg={12} xl={6}>
              <div className="d-block d-md-flex align-items-center">
                <PhotoUploadInput
                  className="mx-auto mx-md-0 me-md-3"
                  height="10rem"
                  variant="outline"
                // onChange={(file) => {
                //   // TODO
                // }}
                />
                <div className="text-center text-md-start mt-4 mt-md-0">
                  <h1 className="h3 mb-2 fw-bold">Change profile photo</h1>
                  <div className="d-block justify-content-center">
                    <p className="fs-5 text-light mb-0">
                      Recommended size: 180x180 pixels
                    </p>
                    <p className="fs-5 text-light mb-0">
                      (jpg, png)
                    </p>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6} lg={12} xl={6} className="mt-5 mt-md-0 mt-lg-5 mt-xl-0">
              <div className="d-block d-md-flex align-items-center">
                <PhotoUploadInput
                  className="mx-auto mx-md-0 me-md-3"
                  height="10rem"
                  variant="outline"
                // onChange={(file) => {
                //   // TODO
                // }}
                />
                <div className="text-center text-md-start mt-4 mt-md-0">
                  <h1 className="h3 mb-2 fw-bold">Change cover photo</h1>
                  <div className="d-block justify-content-center">
                    <p className="fs-5 text-light mb-0">
                      Recommended size: 830x467 pixels
                    </p>
                    <p className="fs-5 text-light mb-0">
                      (jpg, png)
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className="bg-dark p-4 mt-4 rounded bg-mobile-transparent">
          <h1 className="h2 fw-bold mb-4">Edit information</h1>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="h3">Name</Form.Label>
                <Form.Control type="text" placeholder="Name" value={updateUserData.name} onChange={(changeData: ChangeEvent<HTMLInputElement>) => setUpdateUserData({ ...updateUserData, name: changeData.target.value })} className="my-3 fs-5" />
                <div className="d-flex pe-5">
                  <Form.Text className="text-muted fs-4">
                    This is how your first name will appear in your profile.
                  </Form.Text>
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="h3">Username</Form.Label>
                <Form.Control type="text" placeholder="Username" value={updateUserData.username} onChange={(changeData: ChangeEvent<HTMLInputElement>) => setUpdateUserData({ ...updateUserData, username: changeData.target.value })} className="my-3 fs-5" />
                <Form.Text className="text-muted fs-4">
                  This is how people will see you post and comment on Slasher.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="h3">Email address</Form.Label>
                <Form.Control type="email" placeholder="Email" value={updateUserData.email} onChange={(changeData: ChangeEvent<HTMLInputElement>) => setUpdateUserData({ ...updateUserData, email: changeData.target.value })} className="my-3 fs-5" />
                <Form.Text className="text-muted fs-4">
                  In order to edit your email address, we will ask your
                  security question.
                </Form.Text>
                <Form.Text className="text-muted d-flex my-3 fs-4">
                  When you change your email address, we will send an email to that
                  address with an update button.
                </Form.Text>
                <Form.Text className="text-muted fs-4">
                  Be sure to click the button in the email to activate your new email address.
                  If you do not, this can cause issues with your account, such as your ability
                  to login.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md={3} lg={4} xl={3}>
              <RoundButton className="py-2 w-100  fs-3 fw-bold">
                Update profile
              </RoundButton>
            </Col>
          </Row>
        </div>
      </Form>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileEdit;
