import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, CITY_ENDPOINTS, HOTEL_ENDPOINTS, SECTOR_ENDPOINTS } from './apiConfig';

export const masterApi = createApi({
  reducerPath: 'masterApi',
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
  tagTypes: ['City', 'Hotel', 'Sector'],
  endpoints: (builder) => ({
    // Cities
    getCities: builder.query({
      query: () => CITY_ENDPOINTS.GET_ALL,
      providesTags: ['City'],
    }),
    
    // Hotels by City
    getHotelsByCity: builder.query({
      query: (cityId) => `${HOTEL_ENDPOINTS.GET_BY_CITY}/${cityId}`,
      providesTags: ['Hotel'],
    }),
    
    // All Hotels
    getAllHotels: builder.query({
      query: () => HOTEL_ENDPOINTS.GET_ALL,
      providesTags: ['Hotel'],
    }),
    
    // Sectors
    getSectors: builder.query({
      query: () => SECTOR_ENDPOINTS.GET_ALL,
      providesTags: ['Sector'],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useGetHotelsByCityQuery,
  useGetAllHotelsQuery,
  useGetSectorsQuery,
} = masterApi;