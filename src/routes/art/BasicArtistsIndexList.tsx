import React from 'react';

interface BasicArtsIndexProps {
  arts: []
}

function BasicArtistsIndexList({ arts }: BasicArtsIndexProps) {
  return (
    <div>
      <div>
        {arts.map((art: any) => (
          <div className="py-3 fw-bold" key={art._id} style={{ borderBottom: '1px solid var(--stroke-and-line-separator-color)' }}>
            {art.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BasicArtistsIndexList;
