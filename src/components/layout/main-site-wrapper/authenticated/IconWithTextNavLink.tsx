import React, { useEffect, useRef } from 'react';
import { IconDefinition, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { Link, useLocation } from 'react-router-dom';
import IconWithTextNavItemInnerElement from './IconWithTextNavItemInnerElement';
import { deletePageStateCache } from '../../../../pageStateCache';
import { scrollToTop } from '../../../../utils/scrollFunctions';
import { setScrollToTabsPosition } from '../../../../redux/slices/scrollPositionSlice';
import { useAppDispatch } from '../../../../redux/hooks';

interface Props {
  label: string;
  userProfileIcon?: string;
  userProfileIconSize?: string;
  icon?: IconDefinition;
  iconSize?: SizeProp;
  to: string;
  badge?: number;
  badgeIconClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

function IconWithTextNavLink({
  label, userProfileIcon, userProfileIconSize, icon, iconSize,
  to, badge, badgeIconClassName, className, children,
}: Props) {
  const { pathname } = useLocation();
  const linkRef = useRef<any>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handlePopstate = () => {
      if (linkRef.current === document.activeElement) {
        linkRef.current.blur();
      }
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);
  const handleRefresh = () => {
    // Similarly we clear pageStateCache on mobile navItem `onClick` too: file:///./../../sidebar-nav/MobileOnlySidebarContent.tsx
    deletePageStateCache(to);

    const isProfileFriendsPage = to.endsWith('/friends');
    if (isProfileFriendsPage) {
      dispatch(setScrollToTabsPosition(true));
    } else {
      scrollToTop('instant');
    }
  };
  return (
    <Link to={to} onClick={handleRefresh} ref={linkRef} className={`text-decoration-none pb-1 mb-1 ${className}`}>
      <IconWithTextNavItemInnerElement
        label={label}
        userProfileIcon={userProfileIcon}
        userProfileIconSize={userProfileIconSize}
        icon={icon}
        iconSize={iconSize}
        badge={badge}
        badgeIconClassName={badgeIconClassName}
        active={pathname.startsWith(label === 'Home' ? '/app/home' : to)}
      />
      {children}
    </Link>
  );
}

IconWithTextNavLink.defaultProps = {
  badgeIconClassName: '',
  className: '',
  badge: null,
  children: null,
  icon: null,
  iconSize: null,
  userProfileIcon: null,
  userProfileIconSize: null,
};

export default IconWithTextNavLink;
