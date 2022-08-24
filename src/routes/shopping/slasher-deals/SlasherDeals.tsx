import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import ShoppingCardList from '../components/ShoppingCardList';
import ShoppingSelect from '../components/ShoppingSelect';
import ShoppingHeader from '../ShoppingHeader';
import ShoppingPhotos from '../../../images/shopping-photos.png';

const slasherDeals = [
  {
    id: 1, image: `${ShoppingPhotos}`, rating: '3.0', name: 'The Half Moon | Clothing Company', discount: '50% discount on new orders / buy now this is!', offerCode: 'T48VZHMLD3RV94', expireDate: '04/06/2022', description: 'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain There is no one who loves pain itself, who seeks after it.', location: '40 King St. S Waterloo, Ontario N2J 1N8',
  },
  {
    id: 2, image: `${ShoppingPhotos}`, rating: '3.0', name: 'Cavity Colors', discount: '50% discount on new orders / buy now this is!', offerCode: 'T48VZHMLD3RV94', expireDate: '05/06/2022', description: 'There is no one who loves pain itself, who seeks after it and wants to have it, simply because it is pain There is no one who loves pain itself, who seeks after it.', location: '40 King St. S Waterloo, Ontario N2J 1N8',
  },
];
function SlasherDeals() {
  const navigate = useNavigate();
  const changeTab = (tab: string) => {
    navigate(`/shopping/${tab}`);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="shopping">
      <ShoppingHeader tabKey="slasher-deals" changeTab={changeTab} />
      <RoundButton className="mt-4 mt-0 py-2 d-lg-none w-100">Become a vendor</RoundButton>
      <div className="order-4 my-4">
        <ShoppingSelect />
      </div>
      <div className="order-last bg-dark p-4 rounded">
        <h2 className="fw-bold mb-4">Clothing &#38; Accessories</h2>
        <ShoppingCardList shoppingList={slasherDeals} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default SlasherDeals;
