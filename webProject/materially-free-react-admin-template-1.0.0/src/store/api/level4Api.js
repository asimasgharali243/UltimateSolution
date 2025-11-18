// src/store/api/level4Api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';

export const level4Api = createApi({
  reducerPath: 'level4Api',
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
  tagTypes: ['Level4'],
  endpoints: (builder) => ({
    getLevel4Dropdown: builder.query({
      query: () => '/level4/dropdown',
      providesTags: ['Level4'],
      transformResponse: (response) => {
        console.log('Level4 Dropdown Raw Response:', response);
        return response?.data || response || [];
      },
    }),
    
    // Use the dropdown endpoint for all accounts
    getAllAccounts: builder.query({
      query: () => '/level4/dropdown', // This returns all Level4 data
      providesTags: ['Level4'],
      transformResponse: (response) => {
        console.log('All Accounts Raw Response:', response);
        return response?.data || response || [];
      },
    }),
    
    // Keep the old endpoint if you still need it for specific cases
    getAccountsByType: builder.query({
      query: (accountType) => `/level4/accounts/${accountType}`,
      providesTags: ['Level4'],
      transformResponse: (response) => {
        return response?.data || response || [];
      },
    }),
  }),
});

export const {
  useGetLevel4DropdownQuery,
  useGetAllAccountsQuery,
  useGetAccountsByTypeQuery,
} = level4Api;