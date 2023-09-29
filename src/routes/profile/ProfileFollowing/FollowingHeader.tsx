import React, { useEffect, useRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import { enableDevFeatures } from '../../../env';
import { BREAK_POINTS, topToDivHeight } from '../../../constants';
import { useAppSelector } from '../../../redux/hooks';

const tabs = [
  { value: 'people', label: 'People' },
  { value: 'hashtags', label: 'Hashtags', devOnly: true },
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
  const loginUserName = useAppSelector((state) => state.user.user.userName);
  const positionRef = useRef<HTMLDivElement>(null);
  const allTabs = enableDevFeatures ? tabs : tabs.filter((t) => !t.devOnly);
  useEffect(() => {
    if (userName !== loginUserName) {
      navigate(`/${userName}/posts`);
    }
  }, [loginUserName, userName, navigate]);

  const handleSearch = (value: any) => {
    setSearch(value);
  };
  useEffect(() => {
    const element = positionRef.current as any;
    window.scrollTo({
      // eslint-disable-next-line max-len
      top: element.offsetTop - (window.innerWidth >= BREAK_POINTS.lg ? (topToDivHeight - 10) : 0) + 20,
      behavior: 'instant' as any,
    });
  }, [positionRef]);
  return (
    <div className="">
      <Row className="mt-3 mt-md-0 mb-3">
        <Col md={4} lg={5} xl={4}>
          <CustomSearchInput label="Search..." setSearch={handleSearch} search={search} />
        </Col>
      </Row>
      <div ref={positionRef}>
        <TabLinks tabLink={allTabs} toLink={`/${userName}/following`} selectedTab={tabKey} />
      </div>
    </div>
  );
}

export default FollowingHeader;
