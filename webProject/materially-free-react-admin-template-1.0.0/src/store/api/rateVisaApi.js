import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, RATE_VISA_ENDPOINTS } from './apiConfig';

export const rateVisaApi = createApi({
  reducerPath: 'rateVisaApi',
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
  tagTypes: ['RateVisa'],
  endpoints: (builder) => ({
    getRateVisas: builder.query({
      query: () => RATE_VISA_ENDPOINTS.GET_ALL,
      providesTags: ['RateVisa'],
    }),
    getRateVisaById: builder.query({
      query: (id) => RATE_VISA_ENDPOINTS.GET_BY_ID(id),
      providesTags: ['RateVisa'],
    }),
    createRateVisa: builder.mutation({
      query: (rateVisa) => ({
        url: RATE_VISA_ENDPOINTS.CREATE,
        method: 'POST',
        body: rateVisa,
      }),
      invalidatesTags: ['RateVisa'],
    }),
    updateRateVisa: builder.mutation({
      query: ({ id, ...rateVisa }) => ({
        url: RATE_VISA_ENDPOINTS.UPDATE(id),
        method: 'PUT',
        body: rateVisa,
      }),
      invalidatesTags: ['RateVisa'],
    }),
    deleteRateVisa: builder.mutation({
      query: (id) => ({
        url: RATE_VISA_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['RateVisa'],
    }),
  }),
});

export const {
  useGetRateVisasQuery,
  useGetRateVisaByIdQuery,
  useCreateRateVisaMutation,
  useUpdateRateVisaMutation,
  useDeleteRateVisaMutation,
} = rateVisaApi;