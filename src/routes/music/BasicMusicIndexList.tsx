import React from 'react';
import { CustomTable, TableRow } from '../../components/ui/customTable';

interface BasicMusicIndexProps {
  music: []
}
function BasicMusicIndexList({ music }: BasicMusicIndexProps) {
  return (
    <div>
      <CustomTable>
        {music.map((item: any) => (
          <TableRow key={item._id}>
            {item.name}
          </TableRow>
        ))}
      </CustomTable>
    </div>
  );
}

export default BasicMusicIndexList;
