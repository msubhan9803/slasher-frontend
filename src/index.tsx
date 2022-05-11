import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter, Navigate, Route, Routes,
} from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Home from './routes/home/Home';
import Registration from './routes/registration/Registration';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home/*" element={<Home />} />
        <Route path="/registration/*" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
