/* eslint-disable max-len */
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import useListingDetail from '../../../hooks/businessListing/useListingDetail';
import defaultCoverImage from '../../../images/default-cover-image.jpg';
import UserCircleImage from '../UserCircleImage';
import LoadingIndicator from '../LoadingIndicator';
import { StyledBorder } from '../StyledBorder';
import TabLinks from '../Tabs/TabLinks';
import { setScrollToTabsPosition } from '../../../redux/slices/scrollPositionSlice';
import { useAppDispatch } from '../../../redux/hooks';

const ProfileCoverImage = styled.img`
  width: 100%;
  object-fit: cover;
`;

const CustomCol = styled(Col)`
  margin-top: -3.938rem;
`;

const AboutProfileImage = styled(UserCircleImage)`
  border: 0.25rem solid #1B1B1B;
`;

const InfoContainer = styled.div`
  font-size: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 8px;
`;

const InfoItem = styled.h3`
  font-weight: 300;
  color: #fff;
`;

const ReadMoreLink = styled.span`
  cursor: pointer;
  text-decoration: underline;
`;

const tabs = [
  { value: 'posts', label: 'Posts' },
];

type Props = {
  businessListingRef: string;
};

export default function BusinessListingHeader({ businessListingRef }: Props) {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const positionRef = useRef<HTMLDivElement>(null);
  const { listingDetail, loadingListingDetail, listingDetailError } = useListingDetail(businessListingRef as string);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const handleScrollToTab = () => dispatch(setScrollToTabsPosition(true));

  if (loadingListingDetail) {
    return <LoadingIndicator />;
  }

  return (
    <div className="bg-dark bg-mobile-transparent rounded mb-4">
      <div className="p-md-4 g-0">
        <div>
          <ProfileCoverImage
            src={listingDetail?.coverPhoto as string || defaultCoverImage}
            alt="Cover picture"
            className="mt-3 mt-md-0 w-100 rounded"
            onClick={() => {}}
          />
        </div>

        <Row className="d-flex ps-md-4 md:ps-md-2 lg:ps-md-4">
          <CustomCol
            md={3}
            lg={12}
            xl="auto"
            className="text-center text-lg-center text-xl-start  position-relative"
          >
            {
              !listingDetailError && (
                <AboutProfileImage
                  size="11.25rem"
                  src={listingDetail?.businessLogo}
                  alt="user picture"
                  onClick={() => {}}
                />
              )
            }
          </CustomCol>

          <Col className="w-100 mt-md-4">
            <Row className="d-flex justify-content-between mb-4">
              <Col
                xs={12}
                md={6}
                lg={12}
                xl={6}
                className="text-center text-md-start text-lg-center text-xl-start mt-4 mt-md-0 ps-md-0"
              >
                <h1 className="mb-md-0 text-break">{listingDetail?.title}</h1>

                <InfoContainer>
                  {listingDetail?.websiteLink && (
                  <InfoItem>
                    <FontAwesomeIcon icon={solid('globe')} className="me-2 text-primary align-self-center" />
                    {listingDetail.websiteLink}
                  </InfoItem>
                  )}
                  {listingDetail?.email && (
                  <InfoItem>
                    <FontAwesomeIcon icon={solid('envelope')} className="me-2 text-primary align-self-center" />
                    {listingDetail.email}
                  </InfoItem>
                  )}
                  {listingDetail?.address && (
                  <InfoItem>
                    <FontAwesomeIcon icon={solid('location-dot')} className="me-2 text-primary align-self-center" />
                    {listingDetail.address}
                  </InfoItem>
                  )}
                  {listingDetail?.phoneNumber && (
                  <InfoItem>
                    <FontAwesomeIcon icon={solid('phone')} className="me-2 text-primary align-self-center" />
                    {listingDetail.phoneNumber}
                  </InfoItem>
                  )}
                </InfoContainer>

              </Col>
            </Row>
          </Col>
        </Row>

        <StyledBorder className="d-md-block d-none" />

        {
          !listingDetailError && (
          <>
            <h1 className="mb-md-0 text-break fs-1 my-4">About</h1>
            <p className="text-gray-100 my-4">
              {isExpanded ? listingDetail?.overview : `${listingDetail?.overview?.substring(0, 300)}...`}
              {listingDetail?.overview && listingDetail?.overview?.length > 300 && (
              <ReadMoreLink className="text-primary" onClick={toggleReadMore}>
                {isExpanded ? ' Read less' : ' Read more'}
              </ReadMoreLink>
              )}
            </p>
          </>
          )
        }

        {
          listingDetailError && (
            <p className="py-4 text-center fw-bold">No Data Found</p>
          )
        }

        <StyledBorder className="d-md-block d-none" />

        <div ref={positionRef} aria-hidden="true">
          <TabLinks
            tabLink={tabs}
            // toLink={`/${user?.userName}`}
            toLink="/"
            selectedTab="posts"
            overrideOnClick={handleScrollToTab}
          />
        </div>
      </div>
    </div>
  );
}
