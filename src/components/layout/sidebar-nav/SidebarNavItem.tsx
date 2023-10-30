import React from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { deletePageStateCache } from '../../../pageStateCache';

interface Props {
  label: string;
  icon: IconDefinition;
  to: string;
  iconColor?: string;
  className?: string;
  id: number;
  comingSoon: boolean;
  onToggleCanvas?: () => void;
}

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
 svg * {
  fill: url(#${(props) => props.uniqueId});
}
`;

const LinkContentWrapper = styled.div`
  padding-top: 0.2em;
`;

const NavItemContainer = styled.div`
  height: 3.35em;
  margin-bottom: 0.75rem;

  .nav-item-label {
    line-height: 1.2em;
  }
`;

const StyledIcon = styled(FontAwesomeIcon)`
  font-size: 1.25rem;
`;

const shouldHighlight = (to: string, pathname: string) => {
  if (pathname.includes(to)) { return true; }

  if (to === '/app/movies/all' && pathname.includes('/movies/')) {
    return true;
  }

  if (to === '/app/books/all' && pathname.includes('/books/')) {
    return true;
  }

  return false;
};

function SidebarNavItem({
  label, icon, iconColor: color, to, className, id, comingSoon, onToggleCanvas,
}: Props) {
  const { pathname } = useLocation();
  const handleRefresh = () => {
    deletePageStateCache(to);
  };

  const renderInnerNavItemContent = () => (
    <LinkContentWrapper className="d-flex align-items-center justify-content-start">
      <LinearIcon uniqueId={`icon-${id}`}>
        <StyledIcon icon={icon} size="lg" className="me-1 fa-fw" />
        <svg width="0" height="0">
          <linearGradient id={`icon-${id}`} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: `${color}`, stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: 'var(--bs-link-color)', stopOpacity: '1' }} />
          </linearGradient>
        </svg>
      </LinearIcon>
      <div className="ms-2 text-start nav-item-label fs-5 fw-bold text-light">
        {label}
      </div>
    </LinkContentWrapper>
  );
  const onClickHandler = (e: React.MouseEvent, link_label: string) => {
    if (comingSoon) {
      e.preventDefault();
      return;
    }
    onToggleCanvas!(); handleRefresh();
    if (link_label === 'Help') {
      e.preventDefault();
      window.open('https://pages.slasher.tv/help/', '_blank');
    }
  };
  const commonClasses = 'h-100 w-100 rounded-3 px-3 py-2 d-flex align-items-center';

  return (
    <NavItemContainer className={`d-flex align-items-center w-100 ${className}`}>
      {
        comingSoon
          ? (
            <div className={`${commonClasses} bg-dark cursor-default`}>
              {renderInnerNavItemContent()}
            </div>
          )
          : (
            <Link
              className={
                `${commonClasses} btn btn-dark text-decoration-none
            ${shouldHighlight(to, pathname) ? 'btn-filter' : ''}`
              }
              to={to}
              onClick={(e) => onClickHandler(e, label)}
            >
              {renderInnerNavItemContent()}
            </Link>
          )
      }
    </NavItemContainer>
  );
}

SidebarNavItem.defaultProps = {
  className: '',
  iconColor: '',
  onToggleCanvas: () => { },
};

export default SidebarNavItem;
