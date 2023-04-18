import { findFirstYouTubeLinkVideoId } from './text-utils';

const FormatImageVideoList = (postImageList: any, postMessage: string) => {
  const postImageListCopy = [...postImageList];
  const youTubeVideoId = findFirstYouTubeLinkVideoId(postMessage);
  if (youTubeVideoId) {
    postImageListCopy.splice(0, 0, {
      videoKey: youTubeVideoId,
    });
  }
  return postImageListCopy;
};

export default FormatImageVideoList;
