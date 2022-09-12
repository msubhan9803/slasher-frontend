import React from 'react';
import PostFeed from './components/PostFeed/PostFeed';

function PodcastEpisodes({ episodeData }: any) {
  return (
    episodeData.map((episode: any) => (
      <div key={episode.id} className="mt-4">
        <PostFeed episode={episode} />
      </div>
    ))
  );
}

export default PodcastEpisodes;
