import React from 'react';

interface BasicPodcastsIndexProps {
  podcasts: []
}
function BasicPodcastsList({ podcasts }: BasicPodcastsIndexProps) {
  return (
    <div>
      <div>
        {podcasts.map((podcast: any) => (
          <div className="py-3 fw-bold" key={podcast._id} style={{ borderBottom: '1px solid var(--stroke-and-line-separator-color)' }}>
            {podcast.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BasicPodcastsList;
