import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, PACKAGE_ENDPOINTS } from './apiConfig';

export const packageApi = createApi({
  reducerPath: 'packageApi',
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
  tagTypes: ['Package'],
  endpoints: (builder) => ({
    getPackages: builder.query({
      query: () => PACKAGE_ENDPOINTS.GET_ALL,
      providesTags: ['Package'],
    }),
    getPackageById: builder.query({
      query: (id) => PACKAGE_ENDPOINTS.GET_BY_ID(id),
      providesTags: ['Package'],
    }),
    checkPackageNameExists: builder.query({
      query: ({ packgeTitle, excludeId }) => {
        const params = new URLSearchParams();
        params.append('packgeTitle', packgeTitle);
        if (excludeId) {
          params.append('excludeId', excludeId.toString());
        }
        return {
          url: `${PACKAGE_ENDPOINTS.CHECK_NAME}`,
          params: Object.fromEntries(params),
        };
      },
    }),
    createPackage: builder.mutation({
      query: (packageData) => ({
        url: PACKAGE_ENDPOINTS.CREATE,
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: ['Package'],
    }),
    updatePackage: builder.mutation({
      query: ({ packgeID, ...packageData }) => ({
        url: PACKAGE_ENDPOINTS.UPDATE(packgeID),
        method: 'PUT',
        body: packageData,
      }),
      invalidatesTags: ['Package'],
    }),
    deletePackage: builder.mutation({
      query: (id) => ({
        url: PACKAGE_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Package'],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  useCheckPackageNameExistsQuery,
  useLazyCheckPackageNameExistsQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageApi;