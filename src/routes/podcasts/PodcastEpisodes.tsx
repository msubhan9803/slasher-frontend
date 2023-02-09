import React from 'react';
import PostcastPostFeed from '../../components/ui/PostFeed/PostcastPostFeed';

function PodcastEpisodes({ episodeData }: any) {
  return (
    episodeData.map((episode: any) => (
      <div key={episode.id} className="mt-4">
        <PostcastPostFeed episode={episode} />
      </div>
    ))
  );
}

export default PodcastEpisodes;
