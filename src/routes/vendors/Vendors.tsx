import { Route, Routes } from 'react-router-dom';
import BasicVendorIndex from './BasicVendorIndex';

function Vendors() {
  return (
    <Routes>
      <Route path="/" element={<BasicVendorIndex />} />
    </Routes>
  );
}

export default Vendors;
