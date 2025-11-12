// store/api/sectorApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, SECTOR_ENDPOINTS } from './apiConfig';

export const sectorApi = createApi({
  reducerPath: 'sectorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Sector'],
  endpoints: (builder) => ({
    getSectors: builder.query({
      query: () => SECTOR_ENDPOINTS.GET_ALL,
      providesTags: ['Sector'],
    }),

    getActiveSectors: builder.query({
      query: () => SECTOR_ENDPOINTS.GET_ACTIVE,
      providesTags: ['Sector'],
    }),

    getSectorById: builder.query({
      query: (id) => `${SECTOR_ENDPOINTS.GET_BY_ID}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sector', id }],
    }),

    checkSectorNameExists: builder.query({
      query: (sectorName) => `${SECTOR_ENDPOINTS.CHECK_NAME}/${encodeURIComponent(sectorName)}`,
      providesTags: ['Sector'],
    }),

    createSector: builder.mutation({
      query: (sectorData) => ({
        url: SECTOR_ENDPOINTS.CREATE,
        method: 'POST',
        body: sectorData,
      }),
      invalidatesTags: ['Sector'],
    }),

    // FIXED: Update sector with proper data structure
    updateSector: builder.mutation({
      query: ({ id, data }) => ({
        url: `${SECTOR_ENDPOINTS.UPDATE}/${id}`,
        method: 'PUT',
        body: data, // Send the entire data object
      }),
      invalidatesTags: ['Sector'],
    }),

    // FIXED: Patch sector with proper data structure
    patchSector: builder.mutation({
      query: ({ id, data }) => ({
        url: `${SECTOR_ENDPOINTS.PATCH}/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Sector'],
    }),

    deleteSector: builder.mutation({
      query: (id) => ({
        url: `${SECTOR_ENDPOINTS.DELETE}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sector'],
    }),
  }),
});

export const {
  useGetSectorsQuery,
  useGetActiveSectorsQuery,
  useGetSectorByIdQuery,
  useCheckSectorNameExistsQuery,
  useCreateSectorMutation,
  useUpdateSectorMutation,
  usePatchSectorMutation,
  useDeleteSectorMutation,
} = sectorApi;