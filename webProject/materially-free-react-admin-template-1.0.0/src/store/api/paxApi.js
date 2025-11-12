import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, PAX_ENDPOINTS } from './apiConfig';

export const paxApi = createApi({
  reducerPath: 'paxApi',
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
  tagTypes: ['Pax'],
  endpoints: (builder) => ({
    getPaxes: builder.query({
      query: () => PAX_ENDPOINTS.GET_ALL,
      providesTags: ['Pax'],
    }),
    getPaxById: builder.query({
      query: (id) => `${PAX_ENDPOINTS.GET_ALL}/${id}`,
      providesTags: ['Pax'],
    }),
    checkPaxNameExists: builder.query({
      query: ({ paxTitle, excludeId }) => {
        const params = new URLSearchParams();
        params.append('paxTitle', paxTitle);
        if (excludeId) {
          params.append('excludeId', excludeId.toString());
        }
        return {
          url: `${PAX_ENDPOINTS.CHECK_NAME}`,
          params: Object.fromEntries(params),
        };
      },
    }),
    createPax: builder.mutation({
      query: (pax) => ({
        url: PAX_ENDPOINTS.CREATE,
        method: 'POST',
        body: pax,
      }),
      invalidatesTags: ['Pax'],
    }),
    updatePax: builder.mutation({
      query: ({ paxID, ...pax }) => ({
        url: `${PAX_ENDPOINTS.UPDATE}/${paxID}`,
        method: 'PUT',
        body: pax,
      }),
      invalidatesTags: ['Pax'],
    }),
    deletePax: builder.mutation({
      query: (id) => ({
        url: `${PAX_ENDPOINTS.DELETE}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pax'],
    }),
  }),
});

export const {
  useGetPaxesQuery,
  useGetPaxByIdQuery,
  useCheckPaxNameExistsQuery,
  useLazyCheckPaxNameExistsQuery,
  useCreatePaxMutation,
  useUpdatePaxMutation,
  useDeletePaxMutation,
} = paxApi;