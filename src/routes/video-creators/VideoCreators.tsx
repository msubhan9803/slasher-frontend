import { Route, Routes } from 'react-router-dom';
import BasicVideoCreatorsIndex from './BasicVideoCreatorsIndex';

function VideoCreators() {
  return (
    <Routes>
      <Route path="/" element={<BasicVideoCreatorsIndex />} />
    </Routes>
  );
}

export default VideoCreators;
