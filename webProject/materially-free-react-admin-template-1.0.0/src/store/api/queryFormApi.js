import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';

export const queryFormApi = createApi({
  reducerPath: 'queryFormApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['QueryForm'],
  endpoints: (builder) => ({
    getQueryForms: builder.query({
      query: () => '/QueryForm',
      providesTags: ['QueryForm'],
    }),
    
    getQueryFormById: builder.query({
      query: (id) => `/QueryForm/${id}`,
      providesTags: ['QueryForm'],
    }),
    
    createQueryForm: builder.mutation({
      query: (queryFormData) => ({
        url: '/QueryForm',
        method: 'POST',
        body: queryFormData,
      }),
      invalidatesTags: ['QueryForm'],
    }),
    
    updateQueryForm: builder.mutation({
      query: ({ id, ...queryFormData }) => ({
        url: `/QueryForm/${id}`,
        method: 'PUT',
        body: queryFormData,
      }),
      invalidatesTags: ['QueryForm'],
    }),
    
    deleteQueryForm: builder.mutation({
      query: (id) => ({
        url: `/QueryForm/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QueryForm'],
    }),
  }),
});

export const {
  useGetQueryFormsQuery,
  useGetQueryFormByIdQuery,
  useCreateQueryFormMutation,
  useUpdateQueryFormMutation,
  useDeleteQueryFormMutation,
} = queryFormApi;