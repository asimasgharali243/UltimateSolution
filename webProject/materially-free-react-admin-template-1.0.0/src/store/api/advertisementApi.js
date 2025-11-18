// src/store/api/advertisementApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';

export const advertisementApi = createApi({
  reducerPath: 'advertisementApi',
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
  tagTypes: ['Advertisement'],
  endpoints: (builder) => ({
    getMasters: builder.query({
      query: () => '/advertisement/masters',
      providesTags: ['Advertisement'],
    }),
    getMasterById: builder.query({
      query: (id) => `/advertisement/masters/${id}`,
      providesTags: (result, error, id) => [{ type: 'Advertisement', id }],
    }),
    getAccounts: builder.query({
      query: () => '/advertisement/accounts',
    }),
    searchAccounts: builder.query({
      query: (term) => `/advertisement/accounts/search?term=${term}`,
    }),
    checkVNoExists: builder.query({
      query: (vNo) => `/advertisement/masters/check-vno/${vNo}`,
    }),
    createMaster: builder.mutation({
      query: (data) => ({
        url: '/advertisement/masters',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Advertisement'],
    }),
    updateMaster: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/advertisement/masters/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Advertisement', id },
        'Advertisement',
      ],
    }),
    deleteMaster: builder.mutation({
      query: (id) => ({
        url: `/advertisement/masters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Advertisement'],
    }),
  }),
});

export const {
  useGetMastersQuery,
  useGetMasterByIdQuery,
  useGetAccountsQuery,
  useLazySearchAccountsQuery,
  useLazyCheckVNoExistsQuery,
  useCreateMasterMutation,
  useUpdateMasterMutation,
  useDeleteMasterMutation,
} = advertisementApi;