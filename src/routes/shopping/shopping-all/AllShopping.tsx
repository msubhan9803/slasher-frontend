import React from 'react';
import styled from 'styled-components';
import { Col, Image, Row } from 'react-bootstrap';
import ShoppingHeader from '../ShoppingHeader';
import SlasherShoppingBanner from '../../../images/shopping-banner.png';
import ShoppingFeaturePoster from '../components/ShoppingFeaturePoster';
import ShoppingPhotos from '../../../images/shopping-photos.png';
import ShoppingSelect from '../components/ShoppingSelect';
import ShoppingCardList from '../components/ShoppingCardList';
import RoundButtonLink from '../../../components/ui/RoundButtonLink';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import ShoppingRightSidebar from '../ShoppingRightSidebar';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import SticyBannerAdSpaceCompensation from '../../../components/SticyBannerAdSpaceCompensation';

const ShoppingBanner = styled.div`
  aspect-ratio: 3.56;
  img {
    width: 10.938rem;
    height: 5rem;
  }
`;
const featuredVendors = [
  {
    id: 1, image: `${ShoppingPhotos}`, name: 'The Half Moon', feature: 'Clothing & Accessories', rating: '3.0',
  },
  {
    id: 2, image: `${ShoppingPhotos}`, name: 'Kinky Blossom', feature: 'Makeup & FX', rating: '3.0',
  },
  {
    id: 3, image: `${ShoppingPhotos}`, name: 'Endless Ink Tattoo & Piercing', feature: 'Tattoos & Piercing', rating: '3.0',
  },
  {
    id: 4, image: `${ShoppingPhotos}`, name: 'Horror Buzz', feature: 'Toys & Games', rating: '3.0',
  },
];
const allShopping = [
  {
    id: 1, image: `${ShoppingPhotos}`, rating: '3.0', name: 'The Half Moon | Clothing Company', discount: '50% discount on new orders / buy now this is!', offerCode: 'T48VZHMLD3RV94', expireDate: '05/06/2022', description: 'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain There is no one who loves pain itself, who seeks after it.', location: '3500 Lemp Avenue St. Louis, MO USA',
  },
  {
    id: 2, image: `${ShoppingPhotos}`, rating: '3.0', name: 'Scream Addicts', description: 'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain There is no one who loves pain itself, who seeks after it.', location: '40 King St. S Waterloo, Ontario N2J 1N8',
  },
  {
    id: 3, image: `${ShoppingPhotos}`, rating: '3.0', name: 'Cavity Colors', discount: '50% discount on new orders / buy now this is!', offerCode: 'T48VZHMLD3RV94', expireDate: '05/06/2022', description: 'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain There is no one who loves pain itself, who seeks after it.', location: '40 King St. S Waterloo, Ontario N2J 1N8',
  },
];
function AllShopping() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="d-flex flex-column">
          <ShoppingHeader tabKey="all" />
          <Row className="justify-content-center mt-4 d-lg-none">
            <Col md={6}>
              <RoundButtonLink to="/shopping/all" className="w-100" variant="primary">
                Become a vendor
              </RoundButtonLink>
            </Col>
          </Row>
          <ShoppingBanner id="banner" className="order-3 order-lg-1 mt-4 rounded">
            <Image src={SlasherShoppingBanner} alt="Shopping Banner" className="w-100 h-100" />
          </ShoppingBanner>
          <div id="featured" className="order-2 order-lg-2 bg-dark mt-4 p-4 rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="fw-bold m-0">
                Featured vendors
              </h2>
              <p className="fs-4 fw-bold text-primary m-0">
                Get featured
              </p>
            </div>
            <Row>
              {featuredVendors.map((featureDetails: any) => (
                <Col xs={6} md={3} lg={6} xl={3} key={featureDetails.id} className="mt-3">
                  <ShoppingFeaturePoster
                    featureImage={featureDetails.image}
                    rating={featureDetails.rating}
                  />
                  <h3 className="fw-bold mt-3 mb-0">{featureDetails.name}</h3>
                  <p className="fs-5 text-primary">{featureDetails.feature}</p>
                </Col>
              ))}
            </Row>
          </div>
          <div className="order-4 my-4">
            <ShoppingSelect />
          </div>
          <div className="order-last bg-dark p-4 rounded">
            <h2 className="fw-bold mb-4">Clothing &#38; Accessories</h2>
            <ShoppingCardList shoppingList={allShopping} />
          </div>

        </div>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      <RightSidebarWrapper>
        <ShoppingRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default AllShopping;
