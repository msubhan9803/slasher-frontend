import { findFirstYouTubeLinkVideoId } from './text-utils';

const FormatImageVideoList = (postImageList: any, postMessage: string) => {
  const youTubeVideoId = findFirstYouTubeLinkVideoId(postMessage);
  if (youTubeVideoId) {
    postImageList.splice(0, 0, {
      videoKey: youTubeVideoId,
    });
  }
  return postImageList;
};

export default FormatImageVideoList;
