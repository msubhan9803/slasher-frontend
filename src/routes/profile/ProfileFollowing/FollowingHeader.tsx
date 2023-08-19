import React, { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { enableDevFeatures } from '../../../env';

const tabs = [
  { value: 'people', label: 'People', devOnly: true },
  { value: 'hashtags', label: 'Hashtags' },
  { value: 'posts', label: 'Posts', devOnly: true },
  { value: 'news', label: 'News', devOnly: true },
  { value: 'events', label: 'Events', devOnly: true },
  { value: 'movies', label: 'Movies', devOnly: true },
];

function FollowingHeader({
  tabKey, setSearch, search,
}: any) {
  const { userName } = useParams();
  const navigate = useNavigate();
  const loginUserName = Cookies.get('userName');
  const allTabs = enableDevFeatures ? tabs : tabs.filter((t) => !t.devOnly);
  useEffect(() => {
    if (userName !== loginUserName) {
      navigate(`/${userName}/posts`);
    }
  }, [loginUserName, userName, navigate]);

  const handleSearch = (value: any) => {
    setSearch(value);
  };

  return (
    <div className="">
      <Row className="mt-3 mt-md-0 mb-3">
        <Col md={4} lg={5} xl={4}>
          <CustomSearchInput label="Search..." setSearch={handleSearch} search={search} />
        </Col>
      </Row>
      <div className="mt-3">
        <TabLinks tabLink={allTabs} toLink={`/${userName}/following`} selectedTab={tabKey} />
      </div>
    </div>
  );
}

export default FollowingHeader;
