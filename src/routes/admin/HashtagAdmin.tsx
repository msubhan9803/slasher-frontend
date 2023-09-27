/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import {
  DataGrid, GridColDef, GridPagination,
  useGridApiContext,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { TablePaginationProps } from '@mui/material';
import MuiPagination from '@mui/material/Pagination';
import Switch from '../../components/ui/Switch';
import { findAllHashtagAdmin } from '../../api/hashtag-admin';
import { HashtagActiveStatus } from '../../types';
import { getPageCount } from '../../utils/number.utils';

const commonHeaderClass = 'hashtag-common--header';

const statusCellClass = 'status__cell';
const StyledContainer = styled.div`
height: 400;
width: 100%;

.MuiDataGrid-root, .MuiDataGrid-main{
  border-radius: 10px;
}

.hashtag--header {
  /* Background color of a column (not needed as we use columnHeaders instead) */
  /* background-color: green; */
  border-right: 1px solid black;
}
.MuiDataGrid-columnHeaders {
  background-color: var(--bs-primary);
}
.MuiDataGrid-columnHeaderTitle{
  font-weight: bold;
}

/* Set outline to none so mouse click does not highlight the cell */
.MuiDataGrid-cell{
  outline: none !important;
}
.${statusCellClass}{
  justify-content: end !important;
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
  [ColumnField.id]: string,
  [ColumnField.hashtagName]: string,
  [ColumnField.createdDate]: string,
  [ColumnField.status]: boolean,
};

// Common header class

type StatusCompProps = {
  params: {
    row: CellType;
  }
};
function StatusComp({ params }: StatusCompProps) {
  const { row } = params;
  const [switchState, setSwitchState] = useState(row.status);
  const hashTagId = row?.id;

  const handleChange = (e: any) => {
    setSwitchState(e.target.checked);
  };
  return (
    <div className="d-flex justify-content-between align-items-center">
      <span className="fw-bold" style={{ color: switchState ? '#00F20A' : 'black' }}>{switchState ? 'Active' : 'Inactive'}</span>
      <Switch
        id={`switch-${hashTagId}`}
        className="ms-0 ms-md-3"
        onSwitchToggle={(e: any) => handleChange(e)}
        isChecked={switchState}
      />
    </div>
  );
}

const columns: GridColDef[] = [
  { field: ColumnField.id, headerName: 'ID', width: 10 },
  {
    field: ColumnField.hashtagName,
    headerName: 'HASHTAG NAME',
    width: 160,
    headerClassName: commonHeaderClass,
    renderCell: (params: any) => <strong className="text-black">{(params.row as CellType).hashtagName}</strong>,
  },
  {
    field: ColumnField.createdDate, headerName: 'CREATED DATE', width: 180, headerClassName: commonHeaderClass,
  },
  {
    field: ColumnField.status,
    headerName: 'STATUS',
    width: 150,
    headerClassName: commonHeaderClass,
    cellClassName: statusCellClass,
    renderCell: (params: any) => <StatusComp params={params} />,
  },
];

// ### MOCK DATA FOR TABLE ###
// const sampleRows: Array<CellType> = [
//   {
//     id: '1',
//     hashtagName: '#hashtag01',
//     createdDate: '15/12/2022 03:33 PM',
//     status: false,
//   },
// ];
//
// const NUMBER_OF_DUMMY_ROWS = 24; // Using `NUMBER_OF_ROWS=1` will add one more row.
// const padZeroToLeftIfSingleDigit = (i: number) => ((i <= 9) ? `0${i}` : String(i));
// for (let i = 2; i < (NUMBER_OF_DUMMY_ROWS + 2); i += 1) {
//   sampleRows.push({
//     id: String(i),
//     hashtagName: `#hashtag${padZeroToLeftIfSingleDigit(i)}`,
//     createdDate: `18/12/202${i} 0${i}:${i}${i} PM`,
//     status: true,
//   });
// }

const rowsPerPage = 10;
// We give static `tableHeight` so that when there are less items than `rowsPerPage`
// then we shw full size table too. Also, 10 * 63px = 630px on desktop
const tableHeight = (rowsPerPage * 63) + 0.5;

function Pagination({
  page,
  onPageChange,
  className,
}: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) {
  const apiRef = useGridApiContext();

  // Get compelte `data-grid` state
  // console.log('apiRef.current.state?', apiRef.current.state);

  // Not working for some unknown reason
  //  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const { totalRowCount } = apiRef.current.state.rows;
  const { pageSize } = apiRef.current.state.pagination.paginationModel;
  const newPageCount = getPageCount(totalRowCount, pageSize);

  return (
    <MuiPagination
      color="primary"
      className={className}
      // count={pageCount}
      count={newPageCount}
      page={page + 1}
      onChange={(event: any, newPage: number) => {
        onPageChange(event as any, newPage - 1);
      }}
    />
  );
}

function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />;
}

type PaginationModel = { page: number, pageSize: number };

// Docs: https://mui.com/material-ui/react-table/
// Docs: https://mui.com/x/react-data-grid
function HashtagAdmin() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<Array<CellType>>([]);
  // `rowCount` is total number of search results, we set this from API
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<PaginationModel>({
    page: 0,
    pageSize: rowsPerPage,
  });

  const getPageItems = useCallback(async (pageSize: number, after?: string) => {
    setIsLoading(true);
    const { data } = await findAllHashtagAdmin({
      sortBy: 'name',
      limit: pageSize,
      after,
    });
    setRowCount(data.allItemsCount);
    setRows(data.items.map((hashtag) => ({
      id: hashtag._id,
      hashtagName: `#${hashtag.name}`,
      createdDate: DateTime.fromISO(hashtag.createdAt).toFormat('MM/dd/yyyy t'),
      status: HashtagActiveStatus.Active === hashtag.status,
    })));
    setIsLoading(false);
  }, []);

  // Load page1 on component load
  useEffect(() => {
    getPageItems(rowsPerPage);
  }, [getPageItems]);

  // Load any other page when pagination click is done
  const onPaginationModelChange = (data: PaginationModel) => {
    // eslint-disable-next-line no-alert
    alert(`Page: ${data.page + 1}`);
    setPaginationModel(data);
    const after = rows.length === 0 ? undefined : rows[rows.length - 1].id;
    // TODO: Implement proper page based pagination instead of cursor based
    // i.e, remove the `after` field
    getPageItems(paginationModel.pageSize, after);
  };

  return (
    <StyledContainer>
      <h1 className="mb-3">Hashtag Admin</h1>
      <DataGrid
        slots={{ pagination: CustomPagination }}
        loading={isLoading}
        style={{
          background: 'white',
          height: tableHeight,
          border: '1px solid black',
        }}
        rows={rows}
        rowCount={rowCount}
        columns={columns}
        // Note: None of below settings work good enough.
        // autoHeight
        // autoPageSize
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        initialState={{
          // pagination: {
          //   paginationModel,
          // },
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

      TODO: Make search UI component
    </StyledContainer>
  );
}
export default HashtagAdmin;
