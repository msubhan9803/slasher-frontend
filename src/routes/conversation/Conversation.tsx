/* eslint-disable max-lines */
import React, {
  useCallback,
  useEffect,
} from 'react';
import {
  useLocation, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import { createOrFindConversation } from '../../api/messages';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import { useAppSelector } from '../../redux/hooks';
import Chat from '../../components/chat/Chat';

function Conversation() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.user.user.id);

  /**
   * Redirects to the appropriate conversation url for a conversation with the given targetUserId.
   * If a previous conversation does not exist, one will be created.
   * If the userId is invalid, redirects instead to the main Messages page.
   */
  const redirectToNewConversation = useCallback((targetUserId: string | null) => {
    if (targetUserId) {
      createOrFindConversation(targetUserId).then((res) => {
        navigate(location.pathname.replace('/new', `/${res.data._id}`), { replace: true });
      }).catch((e) => { throw e; });
    } else {
      navigate('/app/messages', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (conversationId === 'new' || !conversationId) { redirectToNewConversation(searchParams.get('userId')); }
  }, [conversationId, redirectToNewConversation, searchParams]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Chat key={conversationId} viewerUserId={userId} conversationId={conversationId!} />
      </ContentPageWrapper>

      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Conversation;
