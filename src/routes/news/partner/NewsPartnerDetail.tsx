import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getRssFeedProviderDetail } from '../../../api/rss-feed-providers';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import NewsPostData from '../components/NewsPostData';
import NewsRightSideNav from '../components/NewsRightSideNav';

const CustomButton = styled(RoundButton)`
  border: 1px solid #3A3B46;
  &:focus {
    border: 1px solid #3A3B46;
  }
  &:hover {
    border: 1px solid #3A3B46;
  }
`;
function NewsPartnerDetail() {
  const { partnerId } = useParams<string>();
  const [rssFeedProviderDetail, setRssFeedProviderDetail] = useState<any>();
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    if (partnerId) {
      getRssFeedProviderDetail(partnerId)
        .then((res) => {
          setRssFeedProviderDetail(res.data);
        });
    }
  }, [partnerId]);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="bg-dark rounded-3 p-4 mb-3">
          <Row>
            <Col md="auto">
              <div className="d-flex justify-content-center">
                <UserCircleImage size="11.25rem" src={rssFeedProviderDetail?.logo} alt="user picture" className="rounded-4" />
              </div>
            </Col>
            <Col md={7} lg={6} xl={7} className="pt-md-4 pt-md-2 pt-0 pb-lg-4">
              <h2 className="text-center text-md-start mt-3 mt-lg-0 mt-xl-3">{rssFeedProviderDetail?.title}</h2>
              <p className="text-center text-md-start m-2 m-md-0 fs-4 text-light">
                {rssFeedProviderDetail?.description}
              </p>
            </Col>
            <Col className="d-md-none">
              <div className="mt-3 mb-4">
                <CustomButton
                  variant={following ? 'black' : 'primary'}
                  onClick={() => setFollowing(!following)}
                  className="w-100 rounded-pill shadow-none"
                >
                  {following ? 'Unfollow' : 'Follow'}
                </CustomButton>
              </div>
              <div className="my-4 lh-lg d-flex justify-content-center">
                <span>Push notifications</span>
                <Switch id="pushNotificationSwitches" className="ms-3" />
              </div>
            </Col>
          </Row>
        </div>
        <NewsPostData partnerId={partnerId!} />
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <NewsRightSideNav />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}
export default NewsPartnerDetail;
