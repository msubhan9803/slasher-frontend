import React, { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Helmet, HelmetData } from 'react-helmet-async';
import {
  disableRssFeedProviderNotification, enableRssFeedProviderNotification,
  followRssFeedProvider, getRssFeedProviderDetail, getRssFeedProviderFollowUnfollow,
  unfollowRssFeedProvider,
} from '../../../api/rss-feed-providers';
import { ContentPageWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import { useAppSelector } from '../../../redux/hooks';
import { NewsPartnerAndPostsCache, RssFeedProviderFollowNotificationsEnabled } from '../../../types';
import NewsPostData from '../components/NewsPostData';
import NewsRightSideNav from '../components/NewsRightSideNav';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { getPageStateCache, hasPageStateCache, setPageStateCache } from '../../../pageStateCache';
import SticyBannerAdSpaceCompensation from '../../../components/SticyBannerAdSpaceCompensation';

const helmetData = new HelmetData({});
const CustomButton = styled(RoundButton)`
  border: 1px solid #3A3B46;
  &:focus {
    border: 1px solid #3A3B46;
  }
  &:hover {
    border: 1px solid #3A3B46;
  }
`;
type RssFeedProviderType = {
  description: string;
  logo: string;
  title: string;
  _id: string;
  feed_url: string;
};
function NewsPartnerDetail() {
  const { partnerId } = useParams<string>();
  const location = useLocation();
  // eslint-disable-next-line max-len
  const newsPartnerCache = getPageStateCache<NewsPartnerAndPostsCache>(location)?.newsPartner;
  const [rssFeedProviderDetail, setRssFeedProviderDetail] = useState<RssFeedProviderType>(
    hasPageStateCache(location) ? newsPartnerCache : undefined,
  );
  const [following, setFollowing] = useState<boolean>(false);
  const [notificationToggle, setNotificationToggle] = useState<boolean>(false);
  const userData = useAppSelector((state) => state.user);

  const callGetFollowUnfollowDetail = useCallback(() => {
    if (userData?.user) {
      getRssFeedProviderFollowUnfollow(partnerId!, userData.user.id).then((res: any) => {
        if (res.data) {
          setFollowing(true);
          if (res.data.notification === RssFeedProviderFollowNotificationsEnabled.NotEnabled) {
            setNotificationToggle(false);
          } else if (res.data.notification === RssFeedProviderFollowNotificationsEnabled.Enabled) {
            setNotificationToggle(true);
          }
        }
      }).catch((error) => {
        if (error.response.status === 404) {
          setFollowing(false);
          setNotificationToggle(false);
        }
      });
    }
  }, [partnerId, userData.user]);

  useEffect(() => {
    if (userData && userData.user) {
      callGetFollowUnfollowDetail();
    }
  }, [partnerId, userData, callGetFollowUnfollowDetail]);

  const followUnfollowClick = () => {
    if (!following) {
      followRssFeedProvider(partnerId!, userData.user.id).then(() => {
        callGetFollowUnfollowDetail();
      });
    } else {
      unfollowRssFeedProvider(partnerId!, userData.user.id).then(() => {
        callGetFollowUnfollowDetail();
      });
    }
  };

  const onOffNotificationClick = () => {
    if (!notificationToggle) {
      enableRssFeedProviderNotification(partnerId!, userData.user.id).then(() => {
        callGetFollowUnfollowDetail();
      });
    } else {
      disableRssFeedProviderNotification(partnerId!, userData.user.id).then(() => {
        callGetFollowUnfollowDetail();
      });
    }
  };

  useEffect(() => {
    // Done fetch - a.) no `partnerId` b.) rssFeedDetails already fetched from `pageStateCache`
    if (!partnerId || rssFeedProviderDetail) { return; }

    getRssFeedProviderDetail(partnerId)
      .then((res) => {
        setRssFeedProviderDetail(res.data);
        setPageStateCache<NewsPartnerAndPostsCache>(location, {
          ...(getPageStateCache(location) ?? {}),
          newsPartner: res.data,
        });
      });
  }, [location, partnerId, rssFeedProviderDetail]);

  return (
    <>
      <Helmet helmetData={helmetData}>
        <link rel="canonical" href={rssFeedProviderDetail?.feed_url} />
      </Helmet>
      <ContentPageWrapper>
        {
          rssFeedProviderDetail
            ? (
              <div>
                <h1 className="sr-only">{rssFeedProviderDetail?.title}</h1>
                {/* This is top header on news-partner-posts page */}
                <div className="bg-dark rounded-3 p-4 mb-3">
                  <Row>
                    <Col md="auto">
                      <div className="d-flex justify-content-center">
                        <UserCircleImage size="11.25rem" src={rssFeedProviderDetail?.logo} alt="news partner logo" className="rounded-4" />
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
                          onClick={followUnfollowClick}
                          className="w-100 rounded-pill shadow-none"
                        >
                          {following ? 'Unfollow' : 'Follow'}
                        </CustomButton>
                      </div>
                      {following
                        && (
                          <div className="my-4 lh-lg d-flex justify-content-center">
                            <span>Push notifications</span>
                            <Switch id="pushNotificationSwitches" className="ms-3" onSwitchToggle={onOffNotificationClick} isChecked={notificationToggle} />
                          </div>
                        )}
                    </Col>
                  </Row>
                </div>
                <NewsPostData partnerId={partnerId!} />
              </div>
            )
            : <LoadingIndicator />
        }
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <NewsRightSideNav
          onOffNotificationClick={onOffNotificationClick}
          followUnfollowClick={followUnfollowClick}
          following={following}
          notificationToggle={notificationToggle}
        />
      </RightSidebarWrapper>
    </>
  );
}
export default NewsPartnerDetail;
