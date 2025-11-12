import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, AUTH_ENDPOINTS } from './apiConfig';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: AUTH_ENDPOINTS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: AUTH_ENDPOINTS.REGISTER,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: AUTH_ENDPOINTS.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    getProfile: builder.query({
      query: () => AUTH_ENDPOINTS.PROFILE,
      providesTags: ['Auth'],
    }),
    validateUsername: builder.mutation({
      query: (username) => ({
        url: AUTH_ENDPOINTS.VALIDATE_USERNAME,
        method: 'POST',
        body: { username },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useValidateUsernameMutation,
} = authApi;