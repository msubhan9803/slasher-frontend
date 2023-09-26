import React, { useState } from 'react';
import styled from '@emotion/styled';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Switch from '../../components/ui/Switch';

const StyledContainer = styled.div`
height: 400;
width: 100%;

.hashtag--header {
  /* Background color of a column */
  /* background-color: green; */
  border-right: 1px solid black;
}
.MuiDataGrid-columnHeaders {
  background-color: var(--bs-primary);
}
`;

// Types
enum ColumnField {
  id = 'id',
  hashtagName = 'hashtagName',
  createdDate = 'createdDate',
  status = 'status',
}
type CellType = {
  [ColumnField.id]: number,
  [ColumnField.hashtagName]: string,
  [ColumnField.createdDate]: string,
  [ColumnField.status]: boolean,
};

// Common header class
const headerClassName = 'hashtag--header';

// Dummy data for table
const columns: GridColDef[] = [
  { field: ColumnField.id, headerName: 'ID', width: 10 },
  {
    field: ColumnField.hashtagName, headerName: 'HASHTAG NAME', width: 160, headerClassName,
  },
  {
    field: ColumnField.createdDate, headerName: 'CREATED DATE', width: 180, headerClassName,
  },
  {
    field: ColumnField.status, headerName: 'STATUS', width: 130, headerClassName,
  },
];

const rows: Array<CellType> = [
  {
    id: 1,
    hashtagName: '#hashtag01',
    createdDate: '15/12/2022 03:33 PM',
    status: false,
  },
];

const NUMBER_OF_DUMMY_ROWS = 24; // Using `NUMBER_OF_ROWS=1` will add one more row.
const padZeroToLeftIfSingleDigit = (i: number) => ((i <= 9) ? `0${i}` : String(i));
for (let i = 2; i < (NUMBER_OF_DUMMY_ROWS + 2); i += 1) {
  rows.push({
    id: i,
    hashtagName: `#hashtag${padZeroToLeftIfSingleDigit(i)}`,
    createdDate: `18/12/202${i} 0${i}:${i}${i} PM`,
    status: true,
  });
}

const rowsPerPage = 10;
// We give static `tableHeight` so that when there are less items than `rowsPerPage`
// then we shw full size table too. Also, 10 * 63px = 630px on desktop
const tableHeight = (rowsPerPage * 63) + 0.5;

// Reference - `TestTable2`
// Docs: https://mui.com/material-ui/react-table/
// Docs: https://mui.com/x/react-data-grid
function HashtagTable() {
  const [switchState, setSwitchState] = useState(!!0);
  const handleChange = (e: any, name: string) => {
    // eslint-disable-next-line no-console
    console.log('name?', name);
    setSwitchState(e.target.checked);
  };

  return (
    <StyledContainer>
      <Switch
        id="some-id-here"
        className="ms-0 ms-md-3"
        onSwitchToggle={(e: any) => handleChange(e, 'item1')}
        isChecked={switchState}
      />
      <DataGrid
        style={{ background: 'white', height: tableHeight, border: '1px solid black' }}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: rowsPerPage },
          },
          columns: {
            columnVisibilityModel: {
              // Hide columns `status`, the other columns will remain visible
              [ColumnField.id]: false,
            },
          },
          sorting: {
            // Set sort ascending for `hashtagName` column
            sortModel: [{ field: ColumnField.hashtagName, sort: 'asc' }],
          },
        }}
        // pageSizeOptions={[5, 10]}
        pageSizeOptions={[10]}
      // We can enable/disable checkbox selection feature via:
      // checkboxSelection
      />
    </StyledContainer>
  );
}
export default HashtagTable;
