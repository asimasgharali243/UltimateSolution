import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, HOTEL_ENDPOINTS } from './apiConfig';

export const hotelApi = createApi({
  reducerPath: 'hotelApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Hotel'],
  endpoints: (builder) => ({
    // Get all hotels
    getHotels: builder.query({
      query: () => HOTEL_ENDPOINTS.GET_ALL,
      providesTags: ['Hotel'],
    }),

    // Get hotel by ID
    getHotelById: builder.query({
      query: (id) => `${HOTEL_ENDPOINTS.GET_BY_ID}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Hotel', id }],
    }),

    // Get hotels by city ID
    getHotelsByCity: builder.query({
      query: (cityId) => `${HOTEL_ENDPOINTS.GET_BY_CITY}/${cityId}`,
      providesTags: ['Hotel'],
    }),

    // Create new hotel
    createHotel: builder.mutation({
      query: (hotelData) => ({
        url: HOTEL_ENDPOINTS.CREATE,
        method: 'POST',
        body: hotelData,
      }),
      invalidatesTags: ['Hotel'],
    }),

    // Update hotel
    updateHotel: builder.mutation({
      query: ({ id, data }) => ({
        url: `${HOTEL_ENDPOINTS.UPDATE}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Hotel'],
    }),

    // Delete hotel
    deleteHotel: builder.mutation({
      query: (id) => ({
        url: `${HOTEL_ENDPOINTS.DELETE}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Hotel'],
    }),
  }),
});

export const {
  useGetHotelsQuery,
  useGetHotelByIdQuery,
  useGetHotelsByCityQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
} = hotelApi;