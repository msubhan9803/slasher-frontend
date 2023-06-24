/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation } from 'react-router-dom';
import { getRssFeedProviderPosts } from '../../../api/rss-feed-providers';
import { NewsPartnerAndPostsCache, NewsPartnerPostProps } from '../../../types';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import ReportModal from '../../../components/ui/ReportModal';
import { reportData } from '../../../api/report';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import {
  getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../../pageStateCache';

interface Props {
  partnerId: string;
}

function NewsPostData({ partnerId }: Props) {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const userId = useAppSelector((state) => state.user.user.id);
  const popoverOption = ['Report'];
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const newsPostsCache = getPageStateCache<NewsPartnerAndPostsCache>(location)?.newsPosts ?? [];
  const [postData, setPostData] = useState<NewsPartnerPostProps[]>(
    hasPageStateCache(location)
      ? newsPostsCache : [],
  );

  useEffect(() => {
    if (partnerId && requestAdditionalPosts && !loadingPosts) {
      if (!hasPageStateCache(location)
        || postData.length >= newsPostsCache.length
        || postData.length === 0
      ) {
        setLoadingPosts(true);
        getRssFeedProviderPosts(
          partnerId,
          postData.length > 0 ? postData[postData.length - 1]._id : undefined,
        ).then((res) => {
          const newPosts = res.data.map((data: any) => ({
            _id: data._id,
            id: data._id,
            postDate: data.createdAt,
            message: data.message,
            images: data.images,
            userName: data.rssfeedProviderId?.title,
            rssFeedProviderLogo: data.rssfeedProviderId?.logo,
            likeIcon: data.likedByUser,
            likeCount: data.likeCount,
            commentCount: data.commentCount,
            rssfeedProviderId: data.rssfeedProviderId._id,
          }));
          setPostData((prev: NewsPartnerPostProps[]) => [
            ...prev,
            ...newPosts,
          ]);
          if (res.data.length === 0) { setNoMoreData(true); }
        }).catch(
          () => {
            setNoMoreData(true);
          },
        ).finally(
          () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
        );
      }
    }
  }, [partnerId, requestAdditionalPosts, loadingPosts, userId, postData, dispatch,
    location.pathname, location, newsPostsCache.length]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        postData.length === 0
          ? 'No posts available'
          : 'No more posts'
      }
    </p>
  );

  const callLatestFeedPost = () => {
    getRssFeedProviderPosts(partnerId).then((res) => {
      const newPosts = res.data.map((data: any) => ({
        _id: data._id,
        id: data._id,
        postDate: data.createdAt,
        message: data.message,
        images: data.images,
        userName: data.rssfeedProviderId?.title,
        rssFeedProviderLogo: data.rssfeedProviderId?.logo,
        likeIcon: data.likedByUser,
        likeCount: data.likeCount,
        commentCount: data.commentCount,
        rssfeedProviderId: data.rssfeedProviderId._id,
      }));
      setPostData(newPosts);
    });
  };

  const onLikeClick = (likeId: string) => {
    const checkLike = postData.some((post: any) => post.id === likeId
      && post.likeIcon);
    if (checkLike) {
      unlikeFeedPost(likeId).then((res) => {
        if (res.status === 200) {
          const unLikePostData = postData.map(
            (unLikePost: NewsPartnerPostProps) => {
              if (unLikePost._id === likeId) {
                return {
                  ...unLikePost,
                  likeIcon: false,
                  likedByUser: false,
                  likeCount: unLikePost.likeCount - 1,
                };
              }
              return unLikePost;
            },
          );
          setPostData(unLikePostData);
        }
      });
    } else {
      likeFeedPost(likeId).then((res) => {
        if (res.status === 201) {
          const likePostData = postData.map((likePost: NewsPartnerPostProps) => {
            if (likePost._id === likeId) {
              return {
                ...likePost,
                likeIcon: true,
                likedByUser: true,
                likeCount: likePost.likeCount + 1,
              };
            }
            return likePost;
          });
          setPostData(likePostData);
        }
      });
    }
  };

  const handlePopoverOption = (selectedOption: string, popoverClickProps: PopoverClickProps) => {
    setShow(true);
    setDropDownValue(selectedOption);
    setPopoverClick(popoverClickProps);
  };

  const reportNewsPost = (reason: string) => {
    const reportPayload = {
      targetId: popoverClick?.id,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res.status === 200) { callLatestFeedPost(); }
      setShow(false);
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const persistScrollPosition = () => {
    setPageStateCache<NewsPartnerAndPostsCache>(location, {
      ...getPageStateCache<NewsPartnerAndPostsCache>(location),
      newsPosts: postData,
    });
  };
  return (
    <>
      <InfiniteScroll
        pageStart={0}
        initialLoad
        loadMore={() => { setRequestAdditionalPosts(true); }}
        hasMore={!noMoreData}
        threshold={3000}
      >
        {
          postData.length > 0
          && (
            <PostFeed
              postFeedData={postData}
              popoverOptions={popoverOption}
              isCommentSection={false}
              onPopoverClick={handlePopoverOption}
              onLikeClick={onLikeClick}
              onSelect={persistScrollPosition}
            />
          )
        }
      </InfiniteScroll>
      {loadingPosts && <LoadingIndicator />}
      {noMoreData && renderNoMoreDataMessage()}
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
        handleReport={reportNewsPost}
      />
    </>
  );
}
export default NewsPostData;
