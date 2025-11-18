import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, ITEM_UNIT_ENDPOINTS } from './apiConfig';

export const itemUnitApi = createApi({
  reducerPath: 'itemUnitApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ItemUnit'],
  endpoints: (builder) => ({
    getItemUnits: builder.query({
      query: () => ITEM_UNIT_ENDPOINTS.GET_ALL,
      providesTags: ['ItemUnit'],
      transformResponse: (response) => {
        return response?.data || response || [];
      },
    }),
    
    getItemUnitById: builder.query({
      query: (id) => ITEM_UNIT_ENDPOINTS.GET_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'ItemUnit', id }],
      transformResponse: (response) => {
        return response?.data || response || null;
      },
    }),
    
    getItemUnitsDropdown: builder.query({
      query: () => ITEM_UNIT_ENDPOINTS.DROPDOWN,
      providesTags: ['ItemUnit'],
      transformResponse: (response) => {
        return response?.data || response || [];
      },
    }),
    
    createItemUnit: builder.mutation({
      query: (data) => ({
        url: ITEM_UNIT_ENDPOINTS.CREATE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ItemUnit'],
      transformResponse: (response) => {
        return response?.data || response || null;
      },
    }),
    
    updateItemUnit: builder.mutation({
      query: ({ id, ...data }) => ({
        url: ITEM_UNIT_ENDPOINTS.UPDATE(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ItemUnit', id },
        'ItemUnit',
      ],
      transformResponse: (response) => {
        return response?.data || response || null;
      },
    }),
    
    deleteItemUnit: builder.mutation({
      query: (id) => ({
        url: ITEM_UNIT_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['ItemUnit'],
      transformResponse: (response) => {
        return response?.data || response || null;
      },
    }),
  }),
});

export const {
  useGetItemUnitsQuery,
  useGetItemUnitByIdQuery,
  useGetItemUnitsDropdownQuery,
  useCreateItemUnitMutation,
  useUpdateItemUnitMutation,
  useDeleteItemUnitMutation,
} = itemUnitApi;