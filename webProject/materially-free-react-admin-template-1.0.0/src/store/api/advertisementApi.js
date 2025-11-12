import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, ADVERTISEMENT_ENDPOINTS } from './apiConfig';

export const advertisementApi = createApi({
  reducerPath: 'advertisementApi',
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
  tagTypes: ['AdvertisementMaster'],
  endpoints: (builder) => ({
    // Master endpoints
    getMasters: builder.query({
      query: () => ADVERTISEMENT_ENDPOINTS.GET_ALL_MASTERS,
      providesTags: ['AdvertisementMaster'],
    }),
    
    getMasterById: builder.query({
      query: (id) => ADVERTISEMENT_ENDPOINTS.GET_MASTER_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'AdvertisementMaster', id }],
    }),
    
    createMaster: builder.mutation({
      query: (data) => ({
        url: ADVERTISEMENT_ENDPOINTS.CREATE_MASTER,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AdvertisementMaster'],
    }),
    
    updateMaster: builder.mutation({
      query: ({ id, ...data }) => ({
        url: ADVERTISEMENT_ENDPOINTS.UPDATE_MASTER(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdvertisementMaster', id },
        'AdvertisementMaster',
      ],
    }),
    
    deleteMaster: builder.mutation({
      query: (id) => ({
        url: ADVERTISEMENT_ENDPOINTS.DELETE_MASTER(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['AdvertisementMaster'],
    }),
    
    checkVNoExists: builder.query({
      query: ({ vNo, excludeId = null }) => 
        ADVERTISEMENT_ENDPOINTS.CHECK_VNO(vNo, excludeId),
    }),
    
    // Client endpoints
    getClients: builder.query({
      query: () => ADVERTISEMENT_ENDPOINTS.GET_ALL_CLIENTS,
    }),
    
    searchClients: builder.query({
      query: (term) => ADVERTISEMENT_ENDPOINTS.SEARCH_CLIENTS(term),
    }),
  }),
});

export const {
  useGetMastersQuery,
  useGetMasterByIdQuery,
  useCreateMasterMutation,
  useUpdateMasterMutation,
  useDeleteMasterMutation,
  useLazyCheckVNoExistsQuery,
  useGetClientsQuery,
  useLazySearchClientsQuery,
} = advertisementApi;