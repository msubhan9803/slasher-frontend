import React from 'react';
import { CustomTable, TableRow } from '../../components/ui/customTable';

interface BasicArtsIndexProps {
  arts: []
}

function BasicArtistsIndexList({ arts }: BasicArtsIndexProps) {
  return (
    <div>
      <CustomTable>
        {arts.map((art: any) => (
          <TableRow key={art._id}>
            {art.name}
          </TableRow>
        ))}
      </CustomTable>
    </div>
  );
}

export default BasicArtistsIndexList;
