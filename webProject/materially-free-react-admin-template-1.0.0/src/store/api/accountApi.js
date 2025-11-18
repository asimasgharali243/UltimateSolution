// src/store/api/accountApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';

export const accountApi = createApi({
  reducerPath: 'accountApi',
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
  tagTypes: ['Account'],
  endpoints: (builder) => ({
    getAccounts: builder.query({
      query: () => '/account',
      providesTags: ['Account'],
    }),
    getAccountById: builder.query({
      query: (id) => `/account/${id}`,
      providesTags: ['Account'],
    }),
    checkAccountTitleExists: builder.query({
      query: (accountTitle) => `/account/check-name/${encodeURIComponent(accountTitle)}`,
    }),
    createAccount: builder.mutation({
      query: (account) => ({
        url: '/account',
        method: 'POST',
        body: account,
      }),
      invalidatesTags: ['Account'],
    }),
    updateAccount: builder.mutation({
      query: ({ id, ...account }) => ({
        url: `/account/${id}`,
        method: 'PUT',
        body: account,
      }),
      invalidatesTags: ['Account'],
    }),
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `/account/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Account'],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useCheckAccountTitleExistsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} = accountApi;