/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import styled from '@emotion/styled';
import {
  DataGrid, GridColDef, GridPagination,
  useGridApiContext,
} from '@mui/x-data-grid';
import { DateTime } from 'luxon';
import { TablePaginationProps, debounce } from '@mui/material';
import MuiPagination from '@mui/material/Pagination';
import { FormControl, InputGroup } from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Switch from '../../components/ui/Switch';
import { findAllHashtagAdmin, updateHashtagStatusAdmin } from '../../api/hashtag-admin';
import { HashtagActiveStatus } from '../../types';
import { getPageCount } from '../../utils/number.utils';

/* Snippet: Generating hashtags in bulk by creating a post with below text:
let tags = ''
for (let i = 1; i <= 10; i++){
  tags += `#myhashtag${i} `
}
*/

const StyledSearchInput = styled(InputGroup)`
  z-index:0;
  input[type=text] {
    padding-left: 40px;
    box-sizing: border-box;
  }
  .input-group-text {
    background-color: var(--bs-dark);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    color: var(--bs-primary);
    min-width: 1.875rem;
    right: 12px;
    z-index: 9;
  }
`;

const commonHeaderClass = 'hashtag-common--header';
const statusCellClass = 'status__cell';
const StyledContainer = styled.div`
  width: 100%;
  /* No need to use padding bottom when we are setting height of table using "vh" */
  /* padding-bottom: 115px; */

  .MuiDataGrid-root, .MuiDataGrid-main{
    border-radius: 10px;
  }

  .hashtag--header {
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

  .MuiTablePagination-selectLabel {
    /* Fix position of "Rows per page" label on table bottom */
    margin: auto;
  }
  *::-webkit-scrollbar-track {
    /* Fix background of scrollbar in the table */
    background: white;
  }
  .MuiTablePagination-displayedRows {
    /* Fix position of "Page number" on table bottom */
    margin: auto;
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

type StatusCompProps = { params: { row: CellType; } };
function StatusComp({ params }: StatusCompProps) {
  const { row } = params;
  const [switchState, setSwitchState] = useState(row.status);
  const hashTagId = row?.id;

  const handleChange: any = async (e: any) => {
    const newStatus = switchState ? HashtagActiveStatus.Inactive : HashtagActiveStatus.Active;
    setSwitchState(e.target.checked);
    try {
      await updateHashtagStatusAdmin(hashTagId, newStatus);
    } catch (error) {
      // Revert optimistic update on api failure
      setSwitchState(!e.target.checked);
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center">
      <span className="fw-bold" style={{ color: switchState ? '#00F20A' : 'black' }}>{switchState ? 'Active' : 'Inactive'}</span>
      <Switch
        id={`switch-${hashTagId}`}
        className="ms-0 ms-md-3"
        onSwitchToggle={handleChange}
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

/* This is number of items per page */
const PAGE_SIZE = 10;
// We give static `tableHeight` so that when there are less items than `rowsPerPage`
// then we shw full size table too. Also, 10 * 63px = 630px on desktop
// const tableHeight = (PAGE_SIZE * 63) + 0.5;
// This works better on mobile and desktop both!
const tableHeight = '75vh';

function Pagination({
  page,
  onPageChange,
  className,
}: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) {
  const apiRef = useGridApiContext();
  // Note: We can get compelte `data-grid` state via `apiRef.current.state`

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
    pageSize: PAGE_SIZE,
  });
  const [searchValue, setSearchValue] = useState('');
  const isFirstMount = useRef(true);

  const getPageItems = useCallback(async (page: number, pageSize: number, searchText?: string) => {
    setIsLoading(true);
    const { data } = await findAllHashtagAdmin({
      page,
      perPage: pageSize,
      sortBy: 'name',
      nameContains: searchText,
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
    if (isFirstMount.current) {
      const page = paginationModel.page + 1;
      getPageItems(page, paginationModel.pageSize);
      isFirstMount.current = false;
    }
  }, [getPageItems, paginationModel]);

  // Load any other page when pagination click is done
  const onPaginationModelChange = (data: PaginationModel) => {
    setPaginationModel(data); // necessary

    const { pageSize } = data;
    const page = data.page + 1;
    getPageItems(page, pageSize);
  };

  const fetchHashtagsDebounced = useMemo(
    () => debounce((searchText: string) => {
      getPageItems(
        paginationModel.page + 1,
        paginationModel.pageSize,
        searchText,
      );
    }, 300),
    [getPageItems, paginationModel.page, paginationModel.pageSize],
  );

  const handleSearch = (e: any) => {
    const searchText = e.target.value;
    setSearchValue(searchText);
    fetchHashtagsDebounced(searchText);
  };

  return (
    <StyledContainer>
      <h1 className="mb-3">Hashtag Admin</h1>
      <StyledSearchInput
        className="position-relative align-items-center"
        style={{ marginBottom: 30 }}
      >
        <FontAwesomeIcon
          role="button"
          icon={solid('magnifying-glass')}
          className="text-primary position-absolute ps-2"
          style={{ left: 0 }}
          size="lg"
          onClick={handleSearch}
        />
        <FormControl
          placeholder="Search hashtag"
          addon-label="search"
          aria-describedby="search"
          type="text"
          value={searchValue}
          onChange={handleSearch}
          aria-label="search"
          className="rounded-pill"
        />

      </StyledSearchInput>

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
        pageSizeOptions={[PAGE_SIZE, 50]}
        // Note: Use below instruction if you want to show only one option
        // pageSizeOptions={[10]}
        // Note: We can enable/disable below `checkboxSelection` feature via below prop:
        // checkboxSelection
        // Note: By default, the pagination is handled on the client. This means you have to give
        // the rows of all pages to the data grid. If your dataset is too big, and you only want to
        // fetch the current page, you can use server-side pagination.
        paginationMode="server"
      />
    </StyledContainer>
  );
}
export default HashtagAdmin;
