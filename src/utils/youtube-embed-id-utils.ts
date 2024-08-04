const getYouTubeEmbedId = (urlVal: string) => {
  if (urlVal.includes('youtube.com') || urlVal.includes('youtu.be')) {
    const regex = /(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = urlVal.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  return urlVal;
};

export default getYouTubeEmbedId;
