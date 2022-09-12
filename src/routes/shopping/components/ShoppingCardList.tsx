import React from 'react';
import styled from 'styled-components';
import ShoppingCard from './ShoppingCard';

interface ShoppingListProps {
  shoppingList: ShoppingData[];
}
interface ShoppingData {
  id: number;
  image: string;
  name: string;
  discount?: string;
  offerCode?: string;
  expireDate?: string;
  description: string;
  location: string;
  rating: string;
}
const StyledShoppingCard = styled.div`
  border-bottom: 1px solid #3A3B46 !important;
  &:last-of-type {
    border-bottom: none !important;
  }
`;
function ShoppingCardList({ shoppingList }: ShoppingListProps) {
  return (
    <div>
      {shoppingList.map((listDetail: ShoppingData) => (
        <StyledShoppingCard key={listDetail.id} className="py-3">
          <ShoppingCard listDetail={listDetail} />
        </StyledShoppingCard>
      ))}
    </div>
  );
}

export default ShoppingCardList;
