import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, ITEM_ENDPOINTS } from './apiConfig';

export const itemApi = createApi({
  reducerPath: 'itemApi',
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
  tagTypes: ['Item'],
  endpoints: (builder) => ({
    getItems: builder.query({
      query: () => ITEM_ENDPOINTS.GET_ALL,
      providesTags: ['Item'],
      transformResponse: (response) => {
        console.log('Items Raw Response:', response);
        return response?.data || response || [];
      },
    }),
    
    getItemById: builder.query({
      query: (id) => ITEM_ENDPOINTS.GET_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Item', id }],
      transformResponse: (response) => {
        return response?.data || response || null;
      },
    }),
    
    checkItemCodeExists: builder.query({
      query: ({ itemCode, excludeId }) => {
        const params = excludeId ? `?excludeId=${excludeId}` : '';
        return `${ITEM_ENDPOINTS.CHECK_CODE(itemCode)}${params}`;
      },
      transformResponse: (response) => {
        console.log('Check Item Code Raw Response:', response);
        return response?.data || { exists: false, message: '' };
      },
    }),
    
    createItem: builder.mutation({
      query: (data) => ({
        url: ITEM_ENDPOINTS.CREATE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Item'],
      transformResponse: (response) => {
        return response?.data || response || null;
      },
    }),
    
    updateItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: ITEM_ENDPOINTS.UPDATE(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Item', id },
        'Item',
      ],
      transformResponse: (response) => {
        return response?.data || response || null;
      },
    }),
    
    deleteItem: builder.mutation({
      query: (id) => ({
        url: ITEM_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Item'],
      transformResponse: (response) => {
        return response?.data || response || null;
      },
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemByIdQuery,
  useLazyCheckItemCodeExistsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemApi;