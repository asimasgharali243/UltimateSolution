import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, CITY_ENDPOINTS } from './apiConfig';

export const cityApi = createApi({
  reducerPath: 'cityApi',
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
  tagTypes: ['City'],
  endpoints: (builder) => ({
    // Get all cities
    getCities: builder.query({
      query: () => CITY_ENDPOINTS.GET_ALL,
      providesTags: ['City'],
    }),

    // Get city by ID
    getCityById: builder.query({
      query: (id) => `${CITY_ENDPOINTS.GET_BY_ID}/${id}`,
      providesTags: (result, error, id) => [{ type: 'City', id }],
    }),

    // Check if city name exists - FIXED
    checkCityNameExists: builder.query({
      query: (cityName) => {
        if (!cityName || cityName.trim().length < 2) {
          // Return a dummy endpoint that will be skipped
          return 'dummy-endpoint';
        }
        return `${CITY_ENDPOINTS.CHECK_NAME}/${encodeURIComponent(cityName.trim())}`;
      },
      // Skip the query if cityName is invalid
      skip: (cityName) => !cityName || cityName.trim().length < 2,
      providesTags: ['City'],
    }),

    // Get hotels by city ID - FIXED endpoint
    getCityHotels: builder.query({
      query: (id) => `${CITY_ENDPOINTS.GET_BY_ID}/${id}/hotels`,
      providesTags: ['City'],
    }),

    // Create new city
    createCity: builder.mutation({
      query: (cityData) => ({
        url: CITY_ENDPOINTS.CREATE,
        method: 'POST',
        body: cityData,
      }),
      invalidatesTags: ['City'],
    }),

    // Update city
    updateCity: builder.mutation({
      query: ({ id, data }) => ({
        url: `${CITY_ENDPOINTS.UPDATE}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['City'],
    }),

    // Delete city
    deleteCity: builder.mutation({
      query: (id) => ({
        url: `${CITY_ENDPOINTS.DELETE}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['City'],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useGetCityByIdQuery,
  useCheckCityNameExistsQuery,
  useGetCityHotelsQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = cityApi;