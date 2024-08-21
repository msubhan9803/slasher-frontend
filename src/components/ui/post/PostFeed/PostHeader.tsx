import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { Button, Col, Row } from 'react-bootstrap';
import { HashLink } from 'react-router-hash-link';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import CustomPopover, { PopoverClickProps } from '../../CustomPopover';
import UserCircleImage from '../../UserCircleImage';
import BorderButton from '../../BorderButton';
import { BusinessListing, BusinessType } from '../../../../routes/business-listings/type';

interface PostHeaderProps {
  userName: string;
  id: string;
  postDate: string;
  profileImage: string;
  popoverOptions?: string[];
  onPopoverClick?: (value: string, popoverClickProps: PopoverClickProps) => void,
  isSinglePost: boolean | undefined;
  message?: string;
  userId?: string;
  rssfeedProviderId?: string;
  onSelect?: (value: string) => void;
  postImages?: string[];
  postType?: string;
  businessListingRef?: BusinessListing;
}
interface StyledSavedProps {
  saved: boolean;
}
const StyledSaveButton = styled(Button) <StyledSavedProps>`
  width: 85px;
  height: 28px;
  svg {
    ${(props) => (props.saved ? 'color: var(--bs-yellow)' : '')};
  }
`;

type BusinessListingDetails = {
  id: string | undefined | null;
  name: string | undefined;
  isMovie: boolean | undefined | null;
  isBook: boolean | undefined | null;
  logo: string | undefined;
};

function PostHeader({
  id, userName, postDate, profileImage, popoverOptions, onPopoverClick, isSinglePost,
  message, userId, rssfeedProviderId, onSelect, postImages, postType, businessListingRef,
}: PostHeaderProps) {
  const [notificationOn, setNotificationOn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bgColor, setBgColor] = useState<boolean>(false);
  const [businessListingDetail, setBusinessListingDetail] = useState<BusinessListingDetails>();

  const getRedirectionLink = () => {
    if (businessListingDetail) {
      if (businessListingDetail.isBook) {
        return `/app/books/${businessListingDetail.id}`;
      }
      if (businessListingDetail.isMovie) {
        return `/app/movies/${businessListingDetail.id}`;
      }

      return `/app/business-listings/detail/${businessListingDetail.id}`;
    }

    return rssfeedProviderId
      ? `/app/news/partner/${rssfeedProviderId}`
      : `/${userName}`;
  };

  useEffect(() => {
    console.log('🔥🔥🔥🔥 businessListingRef: ', businessListingRef);

    if (businessListingRef) {
      const detailId = businessListingRef.bookRef?._id
      ?? businessListingRef.movieRef?._id
      ?? businessListingRef._id;

      const name = businessListingRef.title
      ?? businessListingRef.bookRef?.name
      ?? businessListingRef.movieRef?.name;

      const logo = businessListingRef.bookRef?.coverImage.image_path
      ?? businessListingRef.movieRef?.movieImage
      ?? businessListingRef.businessLogo;

      const temp = {
        id: detailId,
        name,
        isMovie: !!businessListingRef.movieRef,
        isBook: !!businessListingRef.bookRef,
        logo,
      };

      setBusinessListingDetail(temp);
    }
  }, [businessListingRef]);

  return (
    <Row className="justify-content-between">
      <Col xs="auto">
        <Row className="d-flex">
          <Col className="my-auto rounded-circle" xs="auto">
            <Link
              onClick={() => onSelect?.(rssfeedProviderId || id)}
              to={getRedirectionLink()}
              className="d-block text-decoration-none rounded-circle"
            >
              <div className="rounded-circle">
                <UserCircleImage size="3.313rem" src={businessListingDetail?.logo ?? profileImage} alt={`${userName} profile picture`} className="bg-secondary d-flex" />
              </div>
            </Link>
          </Col>
          <Col xs="auto" className="ps-0 align-self-center">
            <Link
              onClick={() => onSelect!(rssfeedProviderId || id)}
              to={getRedirectionLink()}
              className="text-decoration-none d-block"
            >
              <h2 className="mb-0 h3">{businessListingDetail ? businessListingDetail.name : userName}</h2>
            </Link>
            {
              isSinglePost ? (
                <p className="mb-0 fs-6 text-light">
                  {DateTime.fromISO(postDate).toFormat('MM/dd/yyyy t')}
                </p>
              ) : (
                <HashLink
                  onClick={() => onSelect!(rssfeedProviderId || id)}
                  to={rssfeedProviderId
                    ? `/app/news/partner/${rssfeedProviderId}/posts/${id}`
                    : `/${userName}/posts/${id}`}
                  className="text-decoration-none d-block"
                >
                  <p className="mb-0 fs-6 text-light">
                    {DateTime.fromISO(postDate).toFormat('MM/dd/yyyy t')}
                  </p>
                </HashLink>
              )
            }
          </Col>
        </Row>
      </Col>
      <Col xs="auto" className="d-block">
        <div className="d-flex align-items-center">
          {postType === 'group-post' && (
            <div className="d-flex align-items-center">
              <Button aria-label="notificatio bell" size="sm" className="me-2 pe-2" variant="link" onClick={() => setNotificationOn(!notificationOn)}>
                <FontAwesomeIcon size="lg" className={`${notificationOn ? 'me-0' : 'me-1'} `} icon={notificationOn ? regular('bell-slash') : regular('bell')} />
              </Button>
              <div className="d-none d-md-flex d-lg-none d-xl-flex align-items-center">
                <BorderButton
                  customButtonCss="width: 125px;"
                  buttonClass={`${bgColor ? 'text-black' : 'text-white'}`}
                  variant="sm"
                  toggleBgColor={bgColor}
                  handleClick={() => setBgColor(!bgColor)}
                  toggleButton
                />
                <StyledSaveButton aria-label="save button" saved={saved} size="sm" className="mx-2 pe-2 d-flex align-items-center" variant="link" onClick={() => setSaved(!saved)}>
                  <FontAwesomeIcon size="lg" icon={saved ? solid('bookmark') : regular('bookmark')} />
                  <p className="m-0 ms-2 fs-3">{saved ? 'Unsave' : 'Save'}</p>
                </StyledSaveButton>
              </div>
            </div>
          )}
          <CustomPopover
            popoverOptions={popoverOptions!}
            onPopoverClick={onPopoverClick!}
            message={message}
            id={id}
            userId={userId}
            postImages={postImages}
            rssfeedProviderId={rssfeedProviderId}
          />
        </div>
      </Col>
    </Row>
  );
}

PostHeader.defaultProps = {
  message: null,
  userId: null,
  rssfeedProviderId: null,
  // Remove after Podcast popover implementation
  onPopoverClick: undefined,
  popoverOptions: null,
  onSelect: undefined,
  postImages: [],
  postType: '',
  businessListingRef: '',
};

export default PostHeader;
