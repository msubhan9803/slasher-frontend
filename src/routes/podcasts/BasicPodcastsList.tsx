import React from 'react';
import { CustomTable, TableRow } from '../../components/ui/customTable';

interface BasicPodcastsIndexProps {
  podcasts: []
}
function BasicPodcastsList({ podcasts }: BasicPodcastsIndexProps) {
  return (
    <div>
      <CustomTable>
        {podcasts.map((podcast: any) => (
          <TableRow key={podcast._id}>
            {podcast.name}
          </TableRow>
        ))}
      </CustomTable>
    </div>
  );
}

export default BasicPodcastsList;
