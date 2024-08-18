/* eslint-disable no-nested-ternary */
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Switch } from '@mui/material';
import moment from 'moment';
import styled from 'styled-components';
import { useMemo, useState } from 'react';
import { ListingType } from '../business-listings/type';
import useListingsAdmin from '../../hooks/businessListing/useListingsAdmin';
import useToggleListingStatus from '../../hooks/businessListing/useToggleListingStatus';

const statusCellClass = 'status__cell';
const StyledContainer = styled.div`
  width: 100%;

  .MuiDataGrid-root,
  .MuiDataGrid-main {
    border-radius: 10px;
  }

  .hashtag--header {
    border-right: 1px solid black;
  }

  .MuiDataGrid-columnHeaders {
    background-color: var(--bs-primary);
  }

  .MuiDataGrid-columnHeaderTitle {
    font-weight: bold;
  }

  .MuiDataGrid-cell {
    outline: none !important;
  }

  width: 100%;
  /* No need to use padding bottom when we are setting height of table using "vh" */
  /* padding-bottom: 115px; */

  .MuiDataGrid-root,
  .MuiDataGrid-main {
    border-radius: 10px;
  }

  .hashtag--header {
    border-right: 1px solid black;
  }
  .MuiDataGrid-columnHeaders {
    background-color: var(--bs-primary);
  }
  .MuiDataGrid-columnHeaderTitle {
    font-weight: bold;
  }

  /* Set outline to none so mouse click does not highlight the cell */
  .MuiDataGrid-cell {
    outline: none !important;
  }
  .${statusCellClass} {
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

const toProperCase = (str: string) => str
  .toLowerCase()
  .split(' ')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

export default function LisitingManagementAdmin() {
  const [businessType, setBusinessType] = useState<ListingType | null>(null);
  const {
    listings, loadingListings, listingError, refetch: refetchListings,
  } = useListingsAdmin(
    businessType,
  );
  const {
    toggleStatus, loading, errorMessages, success,
  } = useToggleListingStatus();

  const rows = useMemo(() => listings.map((listing) => ({
    id: listing._id,
    _id: listing._id,
    businessType: listing.businesstype,
    title: listing.title ?? listing.bookRef?.name ?? listing.movieRef?.name,
    createdAt: moment(listing.createdAt).format('ll'),
    userName: listing.userRef?.userName,
    isActive: listing.isActive,
  })), [listings]);

  const handleSwitchChange = async (listingId: string, businessTypeVal: ListingType) => {
    await toggleStatus(listingId, businessTypeVal);
    refetchListings();
  };

  const columns: GridColDef[] = [
    {
      field: 'businessType',
      headerName: 'Business Type',
      flex: 1,
      renderCell: (params) => {
        const { value } = params;
        if (!value) {
          return value;
        }
        return toProperCase(value);
      },
    },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'createdAt', headerName: 'Created At', flex: 1 },
    { field: 'userName', headerName: 'User Name', flex: 1 },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={() => handleSwitchChange(params.row.id, params.row.businessType)}
          inputProps={{ 'aria-label': 'active switch' }}
        />
      ),
    },
  ];

  return (
    <StyledContainer>
      <DataGrid
        rows={rows}
        columns={columns}
        sx={{
          '& .MuiDataGrid-root': {
            borderRadius: '16px',
            overflow: 'hidden',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'red',
          },
          '& .MuiTablePagination-root': {
            marginBottom: '0px',
          },
          background: 'white',
          border: '1px solid black',
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: {
            sortModel: [{ field: 'isActive', sort: 'desc' }],
          },
        }}
        pageSizeOptions={[10, 25, 50]}
      />
    </StyledContainer>
  );
}
