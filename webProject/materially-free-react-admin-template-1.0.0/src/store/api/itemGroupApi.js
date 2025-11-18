// src/store/api/itemGroupApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';

export const itemGroupApi = createApi({
  reducerPath: 'itemGroupApi',
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
  tagTypes: ['ItemGroup'],
  endpoints: (builder) => ({
    getItemGroups: builder.query({
      query: () => '/itemgroup',
      providesTags: ['ItemGroup'],
    }),
    getItemGroupById: builder.query({
      query: (id) => `/itemgroup/${id}`,
      providesTags: (result, error, id) => [{ type: 'ItemGroup', id }],
    }),
    checkGroupCodeExists: builder.query({
      query: ({ groupCode, excludeId }) => 
        `/itemgroup/check-code/${groupCode}${excludeId ? `?excludeId=${excludeId}` : ''}`,
    }),
    createItemGroup: builder.mutation({
      query: (data) => ({
        url: '/itemgroup',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ItemGroup'],
    }),
    updateItemGroup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/itemgroup/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ItemGroup', id },
        'ItemGroup',
      ],
    }),
    deleteItemGroup: builder.mutation({
      query: (id) => ({
        url: `/itemgroup/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ItemGroup'],
    }),
  }),
});

export const {
  useGetItemGroupsQuery,
  useGetItemGroupByIdQuery,
  useLazyCheckGroupCodeExistsQuery,
  useCreateItemGroupMutation,
  useUpdateItemGroupMutation,
  useDeleteItemGroupMutation,
} = itemGroupApi;