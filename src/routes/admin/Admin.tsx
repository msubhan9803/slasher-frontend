import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TestTable1 from './test/TestTable1';
import TestTable1Dense from './test/TestTable1Dense';
import TestTable2 from './test/TestTable2';
import HashtagTable from './HashtagTable';

function Admin() {
  return (
    <div>
      Admin

      <Routes>
        <Route path="/" element={<Navigate to="test-table2" replace />} />
        <Route path="/test-table1" element={<TestTable1 />} />
        <Route path="/test-table1d" element={<TestTable1Dense />} />
        <Route path="/test-table2" element={<TestTable2 />} />
        <Route path="/test-table3" element={<HashtagTable />} />
      </Routes>

    </div>
  );
}

export default Admin;
