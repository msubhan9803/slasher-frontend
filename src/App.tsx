import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/header/Header';
import SidebarNavContent from './components/layout/sidebar-nav/SidebarNavContent';
import Home from './routes/home/Home';
import NotFound from './routes/NotFound';
import Registration from './routes/registration/Registration';

function App() {
  return (
    <>
      <Header />
      <Container>
        <Row>
          <Col xs={3} className="py-2">
            <SidebarNavContent />
          </Col>
          <Col className="py-2">
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home/*" element={<Home />} />
                <Route path="/registration/*" element={<Registration />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </Col>
        </Row>
      </Container>
    </>
  );
}
export default App;
