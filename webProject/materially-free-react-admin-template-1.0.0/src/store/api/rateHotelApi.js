import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, RATE_HOTEL_ENDPOINTS } from './apiConfig';

export const rateHotelApi = createApi({
  reducerPath: 'rateHotelApi',
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
  tagTypes: ['RateHotel'],
  endpoints: (builder) => ({
    getRateHotels: builder.query({
      query: () => RATE_HOTEL_ENDPOINTS.GET_ALL,
      providesTags: ['RateHotel'],
    }),
    getRateHotelById: builder.query({
      query: (id) => RATE_HOTEL_ENDPOINTS.GET_BY_ID(id),
      providesTags: ['RateHotel'],
    }),
    getRateHotelByComposite: builder.query({
      query: ({ cityID, hotelID }) => RATE_HOTEL_ENDPOINTS.GET_BY_COMPOSITE(cityID, hotelID),
      providesTags: ['RateHotel'],
    }),
    createRateHotel: builder.mutation({
      query: (rateHotel) => ({
        url: RATE_HOTEL_ENDPOINTS.CREATE,
        method: 'POST',
        body: rateHotel,
      }),
      invalidatesTags: ['RateHotel'],
    }),
    updateRateHotel: builder.mutation({
      query: ({ id, ...rateHotel }) => ({
        url: RATE_HOTEL_ENDPOINTS.UPDATE(id),
        method: 'PUT',
        body: rateHotel,
      }),
      invalidatesTags: ['RateHotel'],
    }),
    deleteRateHotel: builder.mutation({
      query: (id) => ({
        url: RATE_HOTEL_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['RateHotel'],
    }),
  }),
});

export const {
  useGetRateHotelsQuery,
  useGetRateHotelByIdQuery,
  useGetRateHotelByCompositeQuery,
  useCreateRateHotelMutation,
  useUpdateRateHotelMutation,
  useDeleteRateHotelMutation,
} = rateHotelApi;