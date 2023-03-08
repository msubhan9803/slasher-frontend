import React from 'react';

interface BasicMusicIndexProps {
  music: []
}
function BasicMusicIndexList({ music }: BasicMusicIndexProps) {
  return (
    <div>
      <div>
        {music.map((item: any) => (
          <div className="py-3 fw-bold" key={item._id} style={{ borderBottom: '1px solid var(--stroke-and-line-separator-color)' }}>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BasicMusicIndexList;
