// src/store/api/itemCategoryApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';

export const itemCategoryApi = createApi({
  reducerPath: 'itemCategoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ItemCategory'],
  endpoints: (builder) => ({
    getItemCategories: builder.query({
      query: () => '/itemcategory',
      providesTags: ['ItemCategory'],
      transformResponse: (response) => {
        console.log('Item Categories Raw Response:', response);
        return response?.data || [];
      },
    }),
    
    getItemCategoryById: builder.query({
      query: (id) => `/itemcategory/${id}`,
      providesTags: (result, error, id) => [{ type: 'ItemCategory', id }],
      transformResponse: (response) => {
        return response?.data || null;
      },
    }),
    
    getCategoriesByGroup: builder.query({
      query: (groupId) => `/itemcategory/by-group/${groupId}`,
      providesTags: ['ItemCategory'],
      transformResponse: (response) => {
        return response?.data || [];
      },
    }),
    
    checkCategoryCodeExists: builder.query({
      query: ({ categoryCode, excludeId }) => {
        const params = excludeId ? `?excludeId=${excludeId}` : '';
        return `/itemcategory/check-code/${encodeURIComponent(categoryCode)}${params}`;
      },
      transformResponse: (response) => {
        console.log('Check Code Raw Response:', response);
        return response?.data || { exists: false, message: '' };
      },
    }),
    
    createItemCategory: builder.mutation({
      query: (data) => ({
        url: '/itemcategory',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ItemCategory'],
      transformResponse: (response) => {
        return response?.data || null;
      },
    }),
    
    updateItemCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/itemcategory/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ItemCategory', id },
        'ItemCategory',
      ],
      transformResponse: (response) => {
        return response?.data || null;
      },
    }),
    
    deleteItemCategory: builder.mutation({
      query: (id) => ({
        url: `/itemcategory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ItemCategory'],
      transformResponse: (response) => {
        return response?.data || null;
      },
    }),
  }),
});

export const {
  useGetItemCategoriesQuery,
  useGetItemCategoryByIdQuery,
  useGetCategoriesByGroupQuery,
  useLazyCheckCategoryCodeExistsQuery,
  useCreateItemCategoryMutation,
  useUpdateItemCategoryMutation,
  useDeleteItemCategoryMutation,
} = itemCategoryApi;