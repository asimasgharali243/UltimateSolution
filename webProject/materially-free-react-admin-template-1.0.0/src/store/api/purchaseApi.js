import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';

export const purchaseApi = createApi({
  reducerPath: 'purchaseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/purchase`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Purchase'],
  endpoints: (builder) => ({
    getPurchases: builder.query({
      query: () => '',
      providesTags: ['Purchase']
    }),
    getPurchase: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['Purchase']
    }),
    createPurchase: builder.mutation({
      query: (purchaseData) => ({
        url: '',
        method: 'POST',
        body: purchaseData
      }),
      invalidatesTags: ['Purchase']
    }),
    deletePurchase: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Purchase']
    }),
    getVoucherNumbers: builder.query({
      query: () => '/voucher-numbers'
    })
  })
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseQuery,
  useCreatePurchaseMutation,
  useDeletePurchaseMutation,
  useGetVoucherNumbersQuery
} = purchaseApi;