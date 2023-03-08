import React from 'react';

interface BasicArtsIndexProps {
  artists: []
}

function BasicArtistsIndexList({ artists }: BasicArtsIndexProps) {
  return (
    <div>
      <div>
        {artists.map((art: any) => (
          <div className="py-3 fw-bold" key={art._id} style={{ borderBottom: '1px solid var(--stroke-and-line-separator-color)' }}>
            {art.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BasicArtistsIndexList;
